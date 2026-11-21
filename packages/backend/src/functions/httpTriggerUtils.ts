// Todo: rename this "general utils"

import bs58 from 'bs58';

export function decodeKey(key: string): Uint8Array<ArrayBuffer> {
    // Can throw 'Non-base58 character'
    let theKey;
    try {
        theKey = bs58.decode(key);
    } catch(error) {
        console.error('decodeKey: encountered error')
        console.error(error)
        if(error.message.includes('Non-base58 character')) {
            throw new Error('Non-base58 character passed as deviceKey', {cause: 400})
        } else {
            console.error('decodeKey: unidentified error occurred')
            console.error(error)
            throw new Error('Internal Server Error', {cause: 500})
        }
    }

    switch (theKey.length) {
        case 16:
        case 24:
        case 32:
            return theKey as Uint8Array<ArrayBuffer>
        default:
            throw new Error(`Invalid Key Length ${theKey.length}`, { cause: 400 });
    }
}

export async function calculateDeviceID(key: string | Uint8Array<ArrayBuffer>): Promise<string> {
    // if key is a string, convert it to a buffer
    key = typeof key === 'string' ? decodeKey(key) : key;
    const hash = await sha256(key);
    return toHex(hash);
}