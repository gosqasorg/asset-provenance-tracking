#!/usr/bin/env node --no-warnings

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


function addTagSpecificSignupDataToBundle(
    the_bundle, theEmail, theEmailId, theTags) {

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


bundle = addTagSpecificSignupDataToBundle(
    baz,
    'foo@bar.com',
    '12345',
    ['bamboo', 'observer', 'wizard']
)

writeBundle(bundle)
console.dir(bundle)
