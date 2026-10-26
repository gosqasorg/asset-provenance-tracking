import { HttpResponseInit, InvocationContext } from "@azure/functions";
import { BlockBlobClient, ContainerClient } from "@azure/storage-blob";
import { encode as base58encode } from '@urlpack/base58';

const NOTIFICATION_TYPE = 'notificationSignups';
const FROM_ADDRESS = process.env['SENDER_EMAIL'];
const SUBJECT = 'GDT Tracking update';
const BASE_URL = process.env['frontend_url']; // for unsubscribe page

/*

Notes from Weds pair programming session 14 Oct 26
* Frontend to send tags in the payload of the call to notificationSubscription endpoint
* Endpoint handler to store tags in table, temporarily, until user has verified
* On verification, postVerifyCode will:
  1. Retrieve tags
  2. Sign the user up
  3. Delete the row in the table

Vincent to create issue: 
* Carve off what you can of the frontend sending tags and / or storing in the table

Converting to the new format
-----------------------------------

Old and busted: A pair of lists of strings; cannot handle tags
New hotness: key-value pair keyed by tags, values as arrays of email address - email id pairs

Converting to the new format involves altering:
* getExistingEmails, and its two calls (one in subscribe, one in unsubscribe)

In subscribeToNotifications
* Done: First major function
  - Name: convertEmailSetsToTagBundle
    > Done: We at the present moment have enough to take what's returned from getExistingEmails and produce a { no_tag: [list of pairs] }
    > Done: If tags are passed in, we get the whole data object, for that one email, eg { no_tag: [list], newly_selected_tag: [other list] }
    > Done: So writing that function is one key item. 

* Second major function:
    > Another function we may want to write is:
    > Pass in the data object described above, an email, and a list of tags, and get back the data object with the email added to the lists under the given tags
      - This is the data that I expect we'll want to store

Coming full circle: 
> Data object gets handed to upload blob. This at present builds a single object and stores it. 
> Then we come full circle with getExistingEmails, that retrieves that data object, which we just need to hand back, further meaning that altering this fn will be easy. 

Note: convertEmailSetsToTagBundle is a stepping stone that allows us to get the right data format into the db at all. It will later be used for
converting legacy signups (signups before tag-specificity)
*/

/*
Sub-tasks:
* In NotifySubscribers, alter extractEmailsFromResponse to take the new format, and output the same pair of lists
* [Vincent] in extractEmailsFromResponse, call a new function that converts the old format to the new format
* [Jara] in SubscribeToNotifications, update to new format
* update UnsubscribeFromNotifications to the new format
* Update uploadBlob to new format
* Convert getExistingEmails to new format
*/

/* Vincent's todo

    Working on:
    * Edit calls to getExistingEmails to accept new format
      * Next: Create function: checkIfSignedUpAndWithTheseTags()
    
    Todo:
    * Create cleanup ticket for the todos below
    * Create cleanup ticket: use checkIfAlreadySignedUpWithTheseTags() to drop before / after size checking
*/


// ---vvv--- Utiities Functions Section: Begin ---vvv--- //

// Todo: Consider moving blobClient.exists() check into here.
async function setupBlobClient(
    containerClient: ContainerClient, 
    calculateDeviceID: (key: string | Uint8Array) => Promise<string>, 
    deviceKey: string) 
{
    // https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-download-javascript?tabs=javascript

    // 0: Setup id
    const deviceID = await calculateDeviceID(deviceKey);

    // 1: Setup blob name & client
    const blobName = `${NOTIFICATION_TYPE}/${deviceID}`
    const blobClient = containerClient.getBlockBlobClient(blobName);

    // 2: Return blob content (so we can read existing content, merge email list, write back)
    return [blobName, blobClient] as const;
}

async function uploadBlob(
    containerClient: ContainerClient, 
    blobName: string, 
    emailSet: Set<string>, 
    emailIDSet: Set<string>, 
    tags: string[],
    context
) {
    context.log('Entering uploadBlob')

    // Setup data to upload
    const payloadObj = { email: Array.from(emailSet), email_id: Array.from(emailIDSet), tags};
    const data = JSON.stringify(payloadObj);

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
        // TODO: have frontend display in snackbar for status 4xx
        // This means nothing for now since we're not validating that what we're being handed is an email.
    } else {
        context.log('Throwing error from uploadBlob')
        throw new Error()
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

function createNewEmailId() {
    const uniqueString = await crypto.subtle.generateKey(
        { name: "AES-CBC", length: 256 },
        true,
        ['encrypt', 'decrypt']
    );

    const buffer = await crypto.subtle.exportKey("raw", uniqueString);
    const uniqueEmailString = base58encode(new Uint8Array(buffer));

    return uniqueEmailString
}

function detectAndConvertLegacyEmailSignup(context, parsed) {
    /*
     * Before tag specific signup, data was: { email: [email_array], email_id: [email_id_array] }
     */
    try {
        detectLegacyEmailSignup(context, parsed)
    } catch(error) {
        // Already logged
        // To be handled by endpoint handler
        throw(error)
    }

    return convertLegacyEmailSignup(parsed.email, parsed.email_id)
}

function convertLegacyEmailSignup(theEmailSet, theEmailIdSet) {
    /*
        Does this: emailset, emailidset --> { no_tag: [{pair}, {pair}, ... ] }
    */

    /* Code for writing a unit test later
        let fizz = [1, 2, 3]
        let buzz = ['a', 'b', 'c']
        let baz = convertEmailSetsToTagBundle(fizz, buzz)
        console.dir(baz)
    */

    let theTagBundle = { no_tag: [] }

    for(let i = 0; i < theEmailSet.length; i++) {
        let pair = { email: theEmailSet[i], id: theEmailIdSet[i] }
        theTagBundle['no_tag'].push(pair)
    }

    return theTagBundle
}

// Todo: Ensure 500 is handled by all callers. 
// Todo: Redo the condition check in Zod
function detectLegacyEmailSignup(context, parsed) {
    // If tag-specific, we're done
    // 'email', 'email_id' could be tags a user chooses
    if('no_tag' in parsed) {
        return
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
            'emailNotificationUtils.ts:detectAndConvertLegacyEmailSignup: ' +
            'variable "parsed" evaluating as neither legacy nor modern format.' +
            'Called with: --- vvv ---\n' +
            `${parsed}` + 
            '             --- ^^^ ---\n' 
        )
        context.error(message)
        throw new Error(message, {cause: 500})
    }
}

/* TODO: check before adding. This will add duplicates. Do not use a set type data structure, instead, check before adding */
function addTagSpecificSignupDataToBundle(the_bundle, theEmail, theEmailId, theTags) {

    if(!theTags.length) {
        the_bundle.no_tags.push({
            email: theEmail,
            id: theEmailId
        })

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

    return the_bundle 
}

// Todo: this function needs context passed to it. 
// Todo: exists should be evaluated outside this function. 
async function getExistingEmails(
    exists: boolean, 
    blobClient: BlockBlobClient
) {
    // Todo: This should happen in the caller
    let theTagBundle = { no_tag: [] }
    if(!exists) { return theTagBundle }

    const buffer = await blobClient.downloadToBuffer();
    const text = buffer.toString("utf8");
    if(!text) { return theTagBundle }
    
    const parsed = JSON.parse(text)// as any;

    // Just logging. Console.error for border highlighting. No true error. 
    context.error('---vvv---')
    context.dir(text)
    context.error('---^^^---\n')
    context.error('---vvv---')
    context.dir(parsed)
    context.error('---^^^---\n')

    return detectAndConvertLegacyEmailSignup(parsed)
}

function removeEmailFromTagBundle(tagBundle) {
    // To be implemented by Jara
    // Jara: note: this should take the entire tag bundle, not just the no tags only one
}

// Todo: extractEmailsFromResponse needs to be updated
export function extractEmailsFromResponse(response: any, context) {
    const emailSet = new Set<string>();
    const emailIDArray = new Array<string>();
    if (!response || (response.status !== 200) || !response.jsonBody || !response.jsonBody.message) {
        return [emailSet, emailIDArray];
    }
    try {
        const parsed = JSON.parse(response.jsonBody.message);
        let emails = parsed.email
        let emailIDs = parsed.email_id
        emails.forEach((e: string) => emailSet.add(e));
        emailIDs.forEach((e: string) => emailIDArray.push(e));
    } catch (error) {
        context.error("Failed to extract emails:", error.message)
    }
    return [emailSet, emailIDArray];
}

// Todo: check this
// Todo: this isn't an endpoint. It's called once, in this function. Why are we returning like it's an endpoint?
export async function retrieveNotifEmails(
    containerClient: ContainerClient, 
    calculateDeviceID: (key: string | Uint8Array) => Promise<string>, 
    deviceKey: string, 
    context
) {
    context.log('Entering retrieveNotifEmails')

    try {
        let [blobName, blobClient] = await setupBlobClient(containerClient, calculateDeviceID, deviceKey);
        const downloadResponse = await blobClient.download();
        const downloaded = await streamToString(downloadResponse.readableStreamBody); // Possibly does not return a string?
        context.log('Downloaded blob content:', downloaded.toString());  // Alternatively: surely already a string?

        context.log('Returning without error from retrieveNotifEmails')
        return {
            jsonBody: { message: downloaded },
            status: 200
        }
    } catch(error) {
        context.error('Returning with error from retrieveNotifEmails')
        context.error(error)
        return {
            jsonBody: { message: "Internal Server Error" },
            status: 500,
        }
    }
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


// ---^^^--- Utiities Functions Section: End ---^^^--- //


// -------vvv------- Core operations -------vvv------- //    

// Status: untested update in place
export async function subscribeToNotifications(
    containerClient: ContainerClient, 
    calculateDeviceID: (key: string | Uint8Array) => Promise<string>, 
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

    context.log('Entering subscribeToNotifications')

    // Confirm the email exists
    const normalized = (email ?? "").trim().toLowerCase();
    if (!normalized) {
        return { jsonBody: { message: "Email not provided or email malformed" }, status: 400 };
    }

    // Begin Block_1
    // Setup the blobClient
    let [blobName, blobClient] = await setupBlobClient(containerClient, calculateDeviceID, deviceKey);
    const exists = await blobClient.exists();
    if(!exists) {}

    // Step 1/3: Get
    // Todo: Call conditional on exists. Do not pass exists. 
    // Converts legacy in background. Returns at least this: { no_tag: [] }
    let tagSpecificSignupBundle = await getExistingEmails(exists, blobClient); 

    // If email is already stored return success
    if (exists && tags.concat(['no_tag']) == getTagsFromSignupBundle(bundle, email)) {
        return {
            jsonBody: { message: "Already signed up with this collection of tags (including none)", name: blobName },
            status: 304,
        };
    }

    // Step 2/3: Remove
    // Jara is writing this
    // Note: this call should be moved into addTagSpecificSignupDataToBundle()
    // tagBundle = removeEmailFromTagBundle(tagBundleNoTagsOnly)
    
    // Step 3/3: Add
    const uniqueEmailString = createNewEmailId()
    tagSpecificSignupBundle = addTagSpecificSignupDataToBundle(tagBundle, email, uniqueEmailString, tags)

    try {
        console.log('Attempting to store')
        // Update our stored emails to include the new email/id
        uploadBlob(containerClient, blobName, emailSet, emailIDSet, tags, context)
        context.log('Returning without error from subscribeToNotifications')
        return {
            jsonBody: { message: "Success", name: blobName },
            status: 200,
        };
    } catch(error) {
        context.error('Returning with error from subscribeToNotifications')
        return {
            jsonBody: { message: 'Failed to subscribe to email notifications' },
            status: 500,
        }
    }
}

/*
All this does is:
- Gets handed an ID
- Grabs both lists
- Looks up the index of the id in the id list
- Uses that index to grab the email in the email list
- Delete both from each list
- Store back in blob store

The next question for this is:
* What modifications do we need to make to uploadBlob to convert it from taking a pair of lists to taking a json object

*/
export async function unsubscribeFromNotifications(
    containerClient: ContainerClient, 
    calculateDeviceID: (key: string | Uint8Array) => Promise<string>, 
    deviceKey: string, 
    emailID: string, 
    tags: string[] = [],
    context
) {
    // Setup the blobClient
    let [blobName, blobClient] = await setupBlobClient(containerClient, calculateDeviceID, deviceKey);
    const exists = await blobClient.exists();

    let [emailSet, emailIDSet] = await getExistingEmails(exists, blobClient);

    // Confirm the emailID exists and convert it to an email
    const emailIndex = Array.from(emailIDSet).indexOf(emailID);
    if (emailIndex < 0) {
        return { jsonBody: { message: "Email not found in the database" }, status: 200 };
    }
    const existingEmails = Array.from(emailSet);
    const email = existingEmails[emailIndex];
    const normalized = (email ?? "").trim().toLowerCase();

    // Remove the specified email from the set
    const sizeBeforeAdding = emailSet.size;
    emailSet.delete(normalized);
    emailIDSet.delete(emailID);

    // If the email wasn't stored originally return success
    if (exists && emailSet.size === sizeBeforeAdding) {
        return {
            jsonBody: { message: "Success", name: blobName },
            status: 200,
        };
    }

    try {
        // Update our stored emails to no longer include the specified email/id
        uploadBlob(containerClient, blobName, emailSet, emailIDSet, tags, context);
    } catch(error) {
        return {
            jsonBody: {message: 'Failed to unsubscribe from email notifications'},
            status: 500,
        }
    }
}


// Todo: left off here: see line 521 (or therabouts, containing TODO: left off here)
// Todo: extractEmailsFromResponse needs to be updated
// Todo: calculateDeviceId should be moved to a generalUtils file and imported here and in httpTrigger
export async function notifySubscribers(
    containerClient: ContainerClient, 
    calculateDeviceID: (key: string | Uint8Array) => Promise<string>, 
    deviceKey: string, formData: any, context: InvocationContext): Promise<HttpResponseInit> {
    context.log('Entered notifySubscribers')
    const record = JSON.parse(formData.get('provenanceRecord'));
    const description = record ? record.description : "";


    //===  vvv Is this section not equivalent to getExistingEmails? vvv === //
    // Notify users who subscribed to this record.
    // 1. RetrieveNotifEmails hands back blob contents as string
    //const retrieveNotifEmailResponse = await retrieveNotifEmails(containerClient, calculateDeviceID, deviceKey, context);
    // 2. Parse the object and hand back a pair of lists of emails and email IDs
    //const [ emailSet, emailIDArray ] = extractEmailsFromResponse(retrieveNotifEmailResponse, context);
    //const emailSignups = getExistingEmails() // TODO: left off here: try it. Will need this function to be updated to tag-specificity
    //=== ^^^ is this section not equivalent to getExistingEmails? ^^^ === //

    if (emailSet.size === 0) {
        context.log("No subscribers found for this record.");
        return { status: 204 };
    }

    if (!process.env['COMMUNICATION_SERVICES_CONNECTION_STRING']) {
        context.log("COMMUNICATION_SERVICES_CONNECTION_STRING not set. Skipping sendEmail.");
        return;
    }

    const displayName: string = FROM_ADDRESS;
    let index = 0;
    try {
        const { sendEmail } = await import('./sendEmail.js'); //  This prevents the top-level code in sendEmail.ts from running at startup.
        for (const to_email of emailSet) {
            const unsubscribe_page: string = `${BASE_URL}/history/unsubscribe/${deviceKey}?id=${emailIDArray[index]}`;
            let email_body: string;
            if(description) {
                // Non-blank description
                email_body = `<div>Hello GDT User,<br><br>You are receiving this message because you are signed up for updates to the following record:<br><a href="${BASE_URL}/history/${deviceKey}">${BASE_URL}/history/${deviceKey}</a><br><br>This record has received an update: ${description}.</div><br><div>Click <a href="${unsubscribe_page}">here</a> if you wish to unsubscribe.<br><br>Best regards,<br>Global Distributed Tracking</div>`;
            } else {
                // Blank description
                email_body = `<div>Hello GDT User,<br><br>You are receiving this message because you are signed up for updates to the following record:<br><a href="${BASE_URL}/history/${deviceKey}">${BASE_URL}/history/${deviceKey}</a><br><br>This record has received an update. To see it, visit the record by clicking the link above.</div><br><div>Click <a href="${unsubscribe_page}">here</a> if you wish to unsubscribe.<br><br>Best regards,<br>Global Distributed Tracking</div>`;
            }
            index++
            let result = await sendEmail(FROM_ADDRESS, to_email, SUBJECT + ` for record ${deviceKey}`, email_body, displayName, context);

            if (result.status !== "Succeeded") {
                throw result.message
            }
        }
        return { status: 200 };
    } catch (error) {
        context.error("Error sending email: ", error.statusCode, error);
        throw error
    }
}