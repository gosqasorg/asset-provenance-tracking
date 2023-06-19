import { CreateRecordOptions, ProvenanceAttachment, ProvenanceRecord } from "./types";

export function calculateDeviceID(key: string | Uint8Array): bigint {
    // if key is a string, convert it to a buffer 
    key = typeof key === 'string' ? Buffer.from(key, 'hex') : key;
    return fnv1(key);
}

// simple FNV implementation from https://github.com/namralkeeg/fnvjs/
// https://github.com/tjwebb/fnv-plus may be faster, but it only works on strings

const fnvPrime = 1099511628211n
const fnvOffset = 14695981039346656037n

export function fnv1(input: Uint8Array): bigint {
    let hash =  fnvOffset;
    for (let i = 0; i < input.length; i++) {
        hash = BigInt.asUintN(64, hash * fnvPrime)
        hash ^= BigInt(input[i])
    }
    return hash;
}

function fnv1a(input: Uint8Array) {
    let hash =  fnvOffset;
    for (let i = 0; i < input.length; i++) {
        hash ^= BigInt(input[i])
        hash = BigInt.asUintN(64, hash * fnvPrime)
    }
    return hash;
}
