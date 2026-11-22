import { HttpResponseInit, InvocationContext } from "@azure/functions";
import { BlockBlobClient, ContainerClient } from "@azure/storage-blob";
import { encode as base58encode } from '@urlpack/base58';
import { calculateDeviceID } from "./httpTriggerUtils";
import * as httpTrigger from './httpTrigger';
import * as z from 'zod'

const { sendEmail } = await import('./sendEmail.js'); //  This prevents the top-level code in sendEmail.ts from running at startup.

const NOTIFICATION_TYPE = 'notificationSignups';
const FROM_ADDRESS = process.env['SENDER_EMAIL'];
const SUBJECT = 'GDT Tracking update';
const BASE_URL = process.env['frontend_url']; // for unsubscribe page


/* Notes + Status

    Status:
    * Subscribe: working
    * NotifySubscribers: working

    Next:
    * Remove
    * Unsubscribe
    * Tests: integration test for postVerifyCode

    Todo:
    * Create ticket: Move calculateDeviceID into its own file, generalUtils.ts, import it here, change the signatures, and also import it in httpTrigger and all others that use it (if any)
*/

// ---vvv--- Utiities Functions Section: Begin ---vvv--- //

// TODO: move this into generalUtils.ts, import here and httpTrigger.
export async function setupBlobClient(
    containerClient: ContainerClient, 
    deviceKey: string,
    context: InvocationContext) 
{
    // https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-download-javascript?tabs=javascript

    context.log('setupBlobClient: Called')
    // 0: Setup id         // Transitively throws error originating in decodeKey
    const deviceID = await calculateDeviceID(deviceKey, context);

    // 1: Setup blob name & client
    const blobName = `${NOTIFICATION_TYPE}/${deviceID}`
    context.log('setupBlobClient: attempting to get BlockBlobClient')
    const blobClient = containerClient.getBlockBlobClient(blobName);
    context.log('setupBlobClient: got BlockBlobClient')

    // 2: Return blob content (so we can read existing content, merge email list, write back)
    context.log('setupBlobClient: success. Returning.')
    return [blobName, blobClient] as const;
}

async function uploadBlob(
    containerClient: ContainerClient, 
    blobName: string, 
    tagBundle,
    context
) {
    context.log('uploadBlob: Called')

    // Setup data to upload
    const data = JSON.stringify(tagBundle);

    const uploadOptions = {
        tier: "Cool",
        blobHTTPHeaders: { blobContentType: "application/json; charset=utf-8" }
    };

    // Note: do not reformat; leave as commented
    let status = (await containerClient.uploadBlockBlob(
                    blobName,        // 1. Blob name
                    data,           // 2. body (can be a string)
                    data.length,   // 3. length of body in bytes (or Buffer.byteLength(data))
                    uploadOptions // 4. optional options
    )).response._response.status

    if (status < 300 && status >= 200) {
        context.log('Returning without error from uploadBlob')
        return { 
            jsonBody: { message: "Success", name: blobName },
            status: 200 
        }
    } else {
        context.log('uploadBlob: throwing new error')
        throw new Error('Internal Server Error', {cause: 500})
    }
}

async function streamToString(readableStream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on("data", (data) => {
            chunks.push(data.toString());
        });
        readableStream.on("end", () => {
            resolve(chunks.join(""));
        });
        readableStream.on("error", reject);
    });
}

async function createNewEmailId() {
    const uniqueString = await crypto.subtle.generateKey(
        { name: "AES-CBC", length: 256 },
        true,
        ['encrypt', 'decrypt']
    );

    const buffer = await crypto.subtle.exportKey("raw", uniqueString);
    const uniqueEmailString = base58encode(new Uint8Array(buffer));

    return uniqueEmailString
}

function signupIsLegacyFormat(parsed, context) {
    context.log(`signupIsLegacyFormat: called with: ${parsed}`)
    let result: boolean = false

    // If tag-specific, we're done
    // 'email', 'email_id' could be tags a user chooses
    if('no_tag' in parsed) {
        return false
    }

    // If we don't have 
    // email, email_id, length 2, arrays nonempty, arrays not of strings, then
    // something has gone wrong. Throw error to original API caller.
    let keys = Object.keys(parsed)
    let condition = (
        'email' in keys &&
        'email_id' in keys &&
        keys.length == 2 &&
        parsed.email.length > 0 &&
        parsed.email_id.length > 0 &&
        typeof([parsed.email[0]]) == 'string' &&  // Just checking one
        typeof([parsed.email_id[0]]) == 'string'
    )

    if( !condition ) {
        let message = (
            'emailNotificationUtils.ts:signupIsLegacyFormat: ' +
            'variable "parsed" evaluating as neither legacy nor modern format.' +
            'Called with: --- vvv ---\n' +
            `${JSON.stringify(parsed)}` +
            '             --- ^^^ ---\n' 
        )
        context.error(message)
        throw new Error(message, {cause: 500})
    }

    context.log('Returning without error from signupIsLegacyFormat')
    return condition
}

function addTagSpecificSignupDataToBundle(the_bundle, theEmail, theEmailId, theTags) {
    console.log('AddTagSpecificSignupDataToBundle: Called')

    if(!theTags.length) {
        the_bundle.no_tag.push({
            email: theEmail,
            id: theEmailId
        })

        console.log('AddTagSpecificSignupDataToBundle: Returning successfully: user selected: no tag filtering')
        return the_bundle
    }

    for(let i = 0; i < theTags.length; i++) {
        if(!(theTags[i] in the_bundle)) {
            the_bundle[theTags[i]] = [{
                email: theEmail,
                id: theEmailId
            }]
        } else {
            the_bundle[theTags[i]].push({
                email: theEmail,
                id: theEmailId
            })
        }
    }

    console.log('AddTagSpecificSignupDataToBundle: Returning with success: tag filtering applied')
    return the_bundle 
}

export async function getExistingEmails(
    blobClient: BlockBlobClient,
    context: InvocationContext
) {
    context.log('GetExistingEmails: Called')

    let theTagBundle = { no_tag: [] }

    // No blob may yet exist for this record: someone must be the first signup.
    if(!(await blobClient.exists())) { 
        context.log('getExistingEmails: blob does not exist. Returning initial / default tag bundle')
        return theTagBundle 
    }


    let buffer;
    context.log('getExistingEmails: attempting to get blob')
    try{
        buffer = await blobClient.downloadToBuffer();
    } catch(error) { 
        context.error('getExistingEmails: downloadToBuffer failed. Error is:')
        context.error(error)
        context.error(JSON.stringify(error))
        throw new Error('Internal Server Error', {cause:500})
    }
    context.log('getExistingEmails: got blob')


    const text = buffer.toString("utf8");
    if(!text) { 
        context.log('getExistingEmails: blob is null, returning default signup tag bundle')
        return theTagBundle 
    }
    

    context.log('getExistingEmails: calling detectAndConvertLegacyEmailSignup')
    let signups = detectAndConvertLegacyEmailSignup(JSON.parse(text), context)
    context.log('getExistingEmails: returned from detectAndConvertLegacyEmailSignup')

    signups = 'no_tag' in signups? signups : {...theTagBundle, ...signups}
    context.log('getExistingEmails: success. Returning.')
    return signups
}

// Todo: to be called ~line 391 and 485 in subscribe and unsubscribe.
function removeEmailFromTagBundle(tagBundle) {
    // this should take the entire tag bundle, not just the no tags only one
}

function getTagsFromSignupBundle(email, bundle) {

    let tags = []
    for(let tag in bundle) {

        // signup: {email: "foo@bar.baz", id: 12345}
        for(let a_signup of bundle[tag]) {

            if(a_signup.email != email) {
                continue
            }

            if(tags.indexOf(tag) < 0) {
                tags.push(tag)
            }
        }
    }
    
    return tags
}

function getEmailGivenEmailID(id, bundle) {

    for(let tag in bundle) {
        for(let someSignup of bundle[tag]) {
            if(id == someSignup.id) {
                return someSignup.email
            }
        }
    }

    return true
}

function emailIsSignedUp(email, bundle) {

    for(let tag in bundle) {
        for(let a_signup of bundle[tag]) {
            if(email == a_signup.email) {
                return true
            }
        }
    }

    return false
}

function getSubscribedEmailsForTheseTags(the_bundle, tags) {
    let pairs = [...the_bundle.no_tag]  // They start as [{ email: ..., id: ... } ...], ie, pairs

    for(let tag in the_bundle) {
        if( ! tags.includes(tag)) { continue }
        pairs = [...pairs, ...the_bundle[tag]]
    }

    return [...(new Set(pairs))]
}

function convertLegacyEmailSignup(theEmailSet, theEmailIdSet) {
    /*
        Does this: emailset, emailidset --> { no_tag: [{pair}, {pair}, ... ] }
    */

    let theTagBundle = { no_tag: [] }

    for(let i = 0; i < theEmailSet.length; i++) {
        let pair = { email: theEmailSet[i], id: theEmailIdSet[i] }
        theTagBundle['no_tag'].push(pair)
    }

    return theTagBundle
}

function detectAndConvertLegacyEmailSignup(parsed, context) {
    /*
     * Before tag specific signup, data was: { email: [email_array], email_id: [email_id_array] }
     */
    
    return signupIsLegacyFormat(parsed, context) ? convertLegacyEmailSignup(parsed.email, parsed.email_id) : parsed
}


// ---^^^--- Utiities Functions Section: End ---^^^--- //


// -------vvv------- Core operations -------vvv------- //    


// Status: Ready for removeEmailFromTagBundle. Working otherwise.
export async function subscribeToNotifications(
    containerClient: ContainerClient, 
    deviceKey: string, 
    email: string, 
    tags: string[] = [],
    context
) {
    /*
       Note: this is not a general-purpose function. This proof-of-concept exclusively adds new key-value pairs where no key yet exists.
       We look up the blob using the devicekey, and the blobid, which is just a hash of the data. So we can hash the email.

       Master docs here:
       // https://learn.microsoft.com/en-us/javascript/api/@azure/storage-blob/containerclient?view=azure-node-latest#@azure-storage-blob-containerclient-uploadblockblob

       * The BlockBlobUploadOptions Interface is where storage tier is set.
         - https://learn.microsoft.com/en-us/javascript/api/%40azure/storage-blob/blockblobuploadoptions?view=azure-node-latest
    */

    context.log('SubscribeToNotifications: Called.')

    try {
        // Tested
        context.log('subscribeToNotifications: Is email malformed?')
        const emailValidationResult = z.email().safeParse(email)
        if(!emailValidationResult.success) {
            context.error('subscribeToNotifications: got invalid email')
            return {
                jsonBody: { message: emailValidationResult.error.issues },
                status: 400
            }
        }
        context.log('subscribeToNotifications: No.')

        // Tested
        context.log('subscribeToNotifications: Can we get the blob client?')
        // Step 1: Setup the blobClient, return API response
        let blobName: string;
        let blobClient: BlockBlobClient;
        try {
            [blobName, blobClient] = await setupBlobClient(containerClient, deviceKey, context);
        } catch (error) {
            context.error('subscribeToNotifications: returning with error')
            let message = `subscribeToNotifications setup failed: ${error.message}`
            context.error(message)

            if('cause' in error && error.cause == 400) {
                return {
                    jsonBody: { message: error.message },
                    status: 400
                }
            }

            context.error('subscribeToNotifications: unidentified error detected')
            context.error(error)
            return {
                jsonBody: { message: 'Internal Server Error'},
                status: 500
            }
        }
        context.log('subscribeToNotifications: Yes.')

        // Tested
        context.log('subscribeToNotifications: Does the key correspond to a record?')
        let response = await httpTrigger.getProvenance({ params: { deviceKey: deviceKey } }, context)
        context.log('subscribeToNotifications: getProv returned with: ')
        context.log(response)
        context.log(response.status)
        if(response.status == 404) {
            return {
                jsonBody: { message: 'Valid key has no corresponding record'},
                status: 404
            }
        }
        if(response.status != 200) {
            return {
                jsonBody: { message: 'Internal Server Error'},
                status: 500
            }

        }
        context.log('subscribeToNotifications: Yes.')


        // Step 1/3: Get. Converts legacy in background. Returns at least this: { no_tag: [] }
        context.log('subscribeToNotifications: Getting existing signup data...')
        let tagSpecificSignupBundle = await getExistingEmails(blobClient, context); 
        context.log('subscribeToNotifications: Got existing signup data.')
        context.log(JSON.stringify(tagSpecificSignupBundle))


        // If email is already stored return success
        if( (await blobClient.exists()) && tags.concat(['no_tag']) == getTagsFromSignupBundle(tagSpecificSignupBundle, email)) {
            context.log('subscribeToNotifications: email is already signed up for this exact set of tags. Nothing to do. 304 success')
            return {
                jsonBody: { message: "Already signed up with this collection of tags (including none)", name: blobName },
                status: 304,
            };
        }
        context.log('subscribeToNotifications: Existing data retrieved or default created.')


        context.log('subscribeToNotifications: cleaning the slate of the present email signup, if any')
        // Step 2/3: Remove
        // Note: this call should be moved into addTagSpecificSignupDataToBundle()
        // tagBundle = removeEmailFromTagBundle(tagSpecificSignupBundle, email)
        context.log('subscribeToNotifications: email removed from signup data')
        

        // Step 3/3: Add
        context.log('subscribeToNotifications: preparing to add user to email signup tag bundle')
        const uniqueEmailString = await createNewEmailId()
        tagSpecificSignupBundle = addTagSpecificSignupDataToBundle(tagSpecificSignupBundle, email, uniqueEmailString, tags)


        try {
            context.log('subscribeToNotifications: Attempting to store')

            // Update our stored emails to include the new email/id
            await uploadBlob(containerClient, blobName, tagSpecificSignupBundle, context)

            context.log('subscribeToNotifications: Success. Returning without error')
            return { 
                jsonBody: { message: "Success" }, 
                status: 200 
            };

        } catch(error) {
            context.error('subscribeToNotifications: Returning with error:')
            context.error(error.message)
            context.error(JSON.stringify(error))

            return {
                jsonBody: { message: 'Failed to subscribe to email notifications' },
                status: 500,
            }
        }

    } catch(error) {
        context.error('subscribeToNotifications: Returning with error from subscribeToNotifications')
        context.error(error.message)
        context.error(JSON.stringify(error))
        return {
            jsonBody: { message: 'Failed to subscribe to email notifications' },
            status: 500,
        }
    }
}


// Todo: update call to uploadBlob, follow example in subscribe
// Todo: Convert to new return type of getExistingEmails
export async function unsubscribeFromNotifications(
    containerClient: ContainerClient, 
    deviceKey: string, 
    emailID: string, 
    tags: string[] = [],
    context
) {

    // Step 1: Ensure we're being called correctly
    let blobName: string;
    let blobClient: BlockBlobClient;
    try {
        [blobName, blobClient] = await setupBlobClient(containerClient, deviceKey, context);
    } catch (error) {
        return {
            jsonBody: { message: `unsubscribeFromNotifications setup failed: ${error.message}` },
            status: 400
        }
    }
    const exists = await blobClient.exists();

    // WORKING ON
    // Edit this, and what follows, to take the tagBundle ie { no_tag: [emails], tag1: [], ... }
    //let [emailSet, emailIDSet] = await getExistingEmails(exists, blobClient);
    let bundle = await getExistingEmails(blobClient, context); 

    // Confirm the emailID exists and convert it to an email
    //const emailIndex = Array.from(emailIDSet).indexOf(emailID);
    //if (emailIndex < 0) {
    let email;
    if( email = getEmailGivenEmailID(emailID, bundle) ) {
        return { 
            jsonBody: { message: "Already unsubscribed: Email not found in the database." }, 
            status: 304 
        };
    } // So we have the email
    const normalized = (email ?? "").trim().toLowerCase();

    // Step 2: Remove
    // let bundleAfterRemoving = removeEmailFromTagBundle(tagBundleNoTagsOnly)


    // Remove the specified email from the set
    if(emailIsSignedUp(normalized, bundleAfterRemoving)) {
        context.error('unsubscribeFromNotifications: Error: Failed to unsubscribe!')
        return {
            jsonBody: {message: 'Internal Server Error'},
            status: 500,
        }
    }

    // Step 3: Upload
    try {
        // Update our stored emails to no longer include the specified email/id
        context.log('Attempting upload')
        await uploadBlob(containerClient, blobName, bundleAfterRemoving, context);
        context.log('Returning without error from unSubscribeFromNotifications')
        return {
            jsonBody: { message: "Success. Email has been unsubscribed." },
            status: 200,
        };
    } catch(error) {
        return {
            jsonBody: {message: 'Internal Server Error'},
            status: 500,
        }
    }
}


export async function notifySubscribers(
    containerClient: ContainerClient, 
    deviceKey: string,
    formData: any, 
    context: InvocationContext
): Promise<HttpResponseInit> {
    context.log('notifySubscribers: called')

    const record = JSON.parse(formData.get('provenanceRecord'));
    context.log('notifySubscribers: Provenance record is:')
    context.log(JSON.stringify(record))
    const description = record ? record.description : "";

    context.log('notifySubscribers: Attempting to setup blob client')
    const [blobName, blobClient] = await setupBlobClient(containerClient, deviceKey, context)
    context.log('notifySubscribers: Blob client set up')

    context.log('notifySubscribers: Attempting to get existing signup data.')
    const emailSignups = await getExistingEmails(blobClient, context) // TODO: left off here: try it. Will need this function to be updated to tag-specificity
    context.log(`notifySubscribers: Got existing signup data: ${JSON.stringify(emailSignups)}`)

    if(Object.keys(emailSignups).length == 1 && emailSignups['no_tag'].length == 0) {
        context.log("notifySubscribers: No subscribers found for this record.");
        return { status: 204 };
    }

    if (!process.env['COMMUNICATION_SERVICES_CONNECTION_STRING'] && !process.env['backend_url'].includes('local')) {
        context.log("notifySubscribers: COMMUNICATION_SERVICES_CONNECTION_STRING not set. Skipping sendEmail.");
        return;
    }

    context.log(JSON.stringify(record.tags))  // either list of strings, or empty.
    let emailsAndIds = getSubscribedEmailsForTheseTags(emailSignups, record.tags)

    context.log('notifySubscribers: Attempting to send email.')

    let result;
    let email_body: string;
    let unsubscribe_page: string;
    let message_for_blank_description = `<div>Hello GDT User,<br><br>You are receiving this message because you are signed up for updates to the following record:<br><a href="${BASE_URL}/history/${deviceKey}">${BASE_URL}/history/${deviceKey}</a><br><br>This record has received an update. To see it, visit the record by clicking the link above.</div><br><div>Click <a href="${unsubscribe_page}">here</a> if you wish to unsubscribe.<br><br>Best regards,<br>Global Distributed Tracking</div>`;
    let message_for_non_blank_description = `<div>Hello GDT User,<br><br>You are receiving this message because you are signed up for updates to the following record:<br><a href="${BASE_URL}/history/${deviceKey}">${BASE_URL}/history/${deviceKey}</a><br><br>This record has received an update: ${description}.</div><br><div>Click <a href="${unsubscribe_page}">here</a> if you wish to unsubscribe.<br><br>Best regards,<br>Global Distributed Tracking</div>`;

    for (const pair of emailsAndIds) {

        unsubscribe_page = `${BASE_URL}/history/unsubscribe/${deviceKey}?id=${pair.id}`;
        email_body = description ? message_for_non_blank_description : message_for_blank_description

        try {
            context.log('notifySubscribers: calling sendEmail')
            result = await sendEmail(
                FROM_ADDRESS, 
                pair.email, 
                SUBJECT + ` for record ${deviceKey}`, 
                email_body, 
                FROM_ADDRESS, 
                context
            );
            context.log('notifySubscribers: returned from sendEmail')
        } catch (error) {
            context.error("notifySubscribers: call to sendEmail threw error: ", 
                error.statusCode, error.message, error, JSON.stringify(error));
            throw new Error('Internal Server Error', {cause: 500})
        }

        if (result.status !== "Succeeded") {
            context.error(`notifySubscribers: result.status is not success, rather it is: ${result.status}`)
            context.error(JSON.stringify(result))
            throw new Error(result.message, { cause: 500 })
        }
    }

    context.log('notifySubscribers: Returning successfully')
    return { status: 200 };
}
