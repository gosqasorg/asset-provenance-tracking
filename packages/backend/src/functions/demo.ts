#!/usr/bin/env node

import { start } from 'node:repl';
import fs from 'node:fs';

function writeBundle(theObj) {
    fs.writeFileSync('./tagBundle.json', JSON.stringify(theObj, null, 2));
}

function readBundle() {
    return JSON.parse(fs.readFileSync('./tagBundle.json', 'utf8'))
}


function convertEmailSetsToTagBundle(theEmailSet, theEmailIdSet) {
    let theTagBundle = { no_tag: [] }

    for(let i = 0; i < theEmailSet.length; i++) {
        let pair = { email: theEmailSet[i], id: theEmailIdSet[i] }
        theTagBundle['no_tag'].push(pair)
    }

    return theTagBundle
}

let fizz = [1, 2, 3]
let buzz = ['a', 'b', 'c']
let baz = convertEmailSetsToTagBundle(fizz, buzz)
console.dir(baz)

function addTagSpecificSignupDataToBundle(the_bundle, theEmail, theEmailId, theTags) {

    if(!theTags.length) {
        the_bundle.no_tag.push({
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


let bundle = addTagSpecificSignupDataToBundle(
    baz,
    'foo@bar.com',
    '12345',
    ['bamboo', 'observer', 'wizard']
)
console.log("intial bundle:\n", bundle)
console.log("bundle type: ", typeof bundle)
console.log("bamboo type: ", typeof bundle.bamboo, bundle.bamboo, Array.isArray(bundle.bamboo))
console.log("pair type: ", typeof bundle.bamboo[0], bundle.bamboo[0], Array.isArray(bundle.bamboo[0]))
console.log("email type: ", typeof bundle.bamboo[0].email, bundle.bamboo[0].email)
console.log("id type: ", typeof bundle.bamboo[0].id, bundle.bamboo[0].id)

bundle = addTagSpecificSignupDataToBundle(
    baz,
    'foo@bar.com',
    '12345',
    ['bamboo', 'observer', 'wizard']
)

writeBundle(bundle)
console.dir(bundle)

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

console.dir(getTagsFromSignupBundle(1, bundle))
console.dir(getTagsFromSignupBundle('foo@bar.com', bundle))
console.dir(getTagsFromSignupBundle("X", bundle))


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

console.log('is foo@bar.com signed up?')
console.log(emailIsSignedUp('foo@bar.com', bundle))
console.log('is bar@foo.com signed up?')
console.log(emailIsSignedUp('bar@foo.com', bundle))

function emailIDIsNotSignedUp(id, bundle) {

    for(let tag in bundle) {
        for(let someSignup of bundle[tag]) {
            if(id == someSignup.id) {
                return false
            }
        }
    }

    return true
}


console.log('is 12345 not signed up?')
console.log(emailIDIsNotSignedUp(12345, bundle))
console.log("is '12345', as a string, not signed up?")
console.log(emailIDIsNotSignedUp('12345', bundle))
console.log('is 00000 not signed up?')
console.log(emailIDIsNotSignedUp('00000', bundle))


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

console.log("is the email for id 12345 foo@bar.com?")
console.log(getEmailGivenEmailID(12345, bundle))

function getEmailsForTheseTags(the_bundle, tags) {
    let pairs = [...the_bundle.no_tag]  // They start as [{ email: ..., id: ... } ...], ie, pairs

    for(let tag in the_bundle) {
        if( ! tags.includes(tag)) { continue }
        pairs = [...pairs, ...the_bundle[tag]]
    }

    let sendTo = []
    for(let pair of pairs) {
        console.log(pair)
        sendTo.push(pair.email)
    }

    return [...(new Set(sendTo))]
}

console.log()
console.log('\n\n--- getEmailsForTheseTags test ---\n')
console.log(bundle)
let these_emails = getEmailsForTheseTags(bundle, ['wizard', 'bamboo', 'foobar'])
console.log(these_emails)

function cleanupEmptyTagsFromSignupData(signups) {
    for(let tag in signups) {
        if(tag != 'no_tag' && !signups[tag].length) {
            // Do not permit the signup data to be polluted with chaff
            delete signups[tag]
        }
    }

    return signups
} 

function removeTagSpecificDataFromBundle(the_bundle, theEmail) {

    // We may want to remove this, depending on the context.
    if(!theEmail) {
        console.dir("No email provided.")
        // console.dir("This record does not contain any tag-specific data.")
        return the_bundle
        throw new Error('removeTagSpecificDataFromBundle: received no email', {cause: 500})
    }

    for(let tag in the_bundle) {
        let currTag = the_bundle[tag]
        currTag = currTag.filter((pair) => pair.email !== theEmail)
        the_bundle[tag] = currTag
    }

    return cleanupEmptyTagsFromSignupData(the_bundle)
}

console.log('\n\n--- removeEmail test ---\n')
console.log('Removing email foo@bar.com from: \n')
console.log(bundle)
console.log('\n\nResult:\n')
bundle = removeTagSpecificDataFromBundle(bundle, "foo@bar.com")
console.log(bundle)



console.log('\n\n--- cleanupEmptyTags test ---\n')
console.log('Cleaning up empty tags from: \n')
console.log(bundle)
console.log('\n\nResult:\n')
bundle = cleanupEmptyTagsFromSignupData(bundle)
console.log(bundle)