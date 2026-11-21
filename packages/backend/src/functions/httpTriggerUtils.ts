// Todo: rename this "general utils"

import bs58 from 'bs58';

export function decodeKey(key: string): Uint8Array<ArrayBuffer> {
    const theKey = bs58.decode(key);

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