// Todo: rename this "general utils"

/*
 * This file is for functions that are imported in at least two files
 */

import bs58 from 'bs58';

export async function calculateDeviceID(key: string | Uint8Array<ArrayBuffer>, context): Promise<string> {
    context.log('calculateDeviceID: Called.')
    // if key is a string, convert it to a buffer
    key = typeof key === 'string' ? decodeKey(key, context) : key;
    context.log('calculateDeviceID: key decoded')
    const hash = await sha256(key, context);
    return toHex(hash);
}

export function decodeKey(key: string, context): Uint8Array<ArrayBuffer> {
    context.log('decodeKey: Called.')
    // Can throw 'Non-base58 character'
    let theKey;
    try {
        theKey = bs58.decode(key);
    } catch(error) {
        context.error('decodeKey: encountered error')
        context.error(error)
        if(error.message.includes('Non-base58 character')) {
            throw new Error('Non-base58 character passed as deviceKey', {cause: 400})
        } else {
            context.error('decodeKey: unidentified error occurred')
            context.error(error)
            throw new Error('Internal Server Error', {cause: 500})
        }
    }

    switch (theKey.length) {
        case 16:
        case 24:
        case 32:
            context.log('decodeKey: success. Returning.')
            return theKey as Uint8Array<ArrayBuffer>
        default:
            context.error('decodeKey: invalid key length')
            throw new Error(`Invalid Key Length ${theKey.length}. 'deviceKey' should be 22 chars in length.`, { cause: 400 });
    }
}

export async function sha256(data: NodeJS.BufferSource, context) {
    context.log('sha256: Called.')
    const buffer = await crypto.subtle.digest("SHA-256", data);
    return new Uint8Array(buffer);
}

export function toHex(data: Uint8Array<ArrayBuffer>): string {
    return Buffer.from(data).toString("hex");
}