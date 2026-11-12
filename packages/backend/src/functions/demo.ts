#!/usr/bin/env node

import { start } from 'node:repl';

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



import fs from 'node:fs';
function writeBundle(theObj) {
    fs.writeFileSync('./tagBundle.json', JSON.stringify(theObj, null, 2));
}

function readBundle() {
    return JSON.parse(fs.readFileSync('./tagBundle.json', 'utf8'))
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

function removeTagSpecificDataFromBundle(the_bundle, theEmail, theTags) {
    if(!theEmail || !theTags.length) {
        console.dir("No email or tags provided.")
        // console.dir("This record does not contain any tag-specific data.")
        return the_bundle
    }

    // let subscribedTags = getTagsFromSignupBundle(theEmail, the_bundle)
    // if(!subscribedTags) {
    //     console.dir("This user has not subscribed to any tags.")
    // }

    // for(let tag in theTags) {
    //     if(!(tag in subscribedTags)){
    //         console.dir("This user has not requested notifications from this tag")
    //         continue
    //     }

    //     for() {}
    // }

    for(let i = 0; i < theTags.length; i ++) {
        let currTag = theTags[i]
        
        // try Object.hasOwn(the_bundle, currTag) as property check
        if(!(currTag in the_bundle)) {
            console.log("This tag has not received any subscriptions.")
            continue
        }

        // if(email ){}
        // !!! .filter() for duplicates !!!
        for(let n in the_bundle[currTag]){
            let emailPair = the_bundle[currTag][n]
            console.log(emailPair)

            let x = []
            if(theEmail == emailPair.email) {
                x.push(n)
                // (tags.indexOf(tag) < 0)
                // toSpliced() could possibly be used for deep copies
                console.log("hit:", theEmail, emailPair.email)
            } else {
                console.log("This user has not requested notifications from this tag")
                continue
            }
        }
    }
    return the_bundle
}

removeTagSpecificDataFromBundle(bundle, "2", ["no_tag"])