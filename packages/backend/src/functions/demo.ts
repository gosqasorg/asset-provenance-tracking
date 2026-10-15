#!/usr/bin/env node

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


