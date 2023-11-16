import { CreateRecordOptions, ProvenanceAttachment, ProvenanceRecord } from "./types";
import base58 from 'bs58';

export function calculateDeviceID(key: string | Uint8Array): bigint {
    // if key is a string, convert it to a buffer 
    key = typeof key === 'string' ? decodeKey(key) : key;
    return fnv1(key);
}

// simple FNV implementation from https://github.com/namralkeeg/fnvjs/
// https://github.com/tjwebb/fnv-plus may be faster, but it only works on strings

const fnvPrime = 1099511628211n
const fnvOffset = 14695981039346656037n

export function fnv1(input: Uint8Array): bigint {
    let hash = fnvOffset;
    for (let i = 0; i < input.length; i++) {
        hash = BigInt.asUintN(64, hash * fnvPrime)
        hash ^= BigInt(input[i])
    }
    return hash;
}

function fnv1a(input: Uint8Array) {
    let hash = fnvOffset;
    for (let i = 0; i < input.length; i++) {
        hash ^= BigInt(input[i])
        hash = BigInt.asUintN(64, hash * fnvPrime)
    }
    return hash;
}

// from/to hex functions from https://stackoverflow.com/a/69585881/1179731
const HEX_STRINGS = "0123456789abcdef";
const MAP_HEX: Record<string, number> = {
    0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6,
    7: 7, 8: 8, 9: 9, a: 10, b: 11, c: 12, d: 13,
    e: 14, f: 15, A: 10, B: 11, C: 12, D: 13,
    E: 14, F: 15
};

export function encodeKey(key: Uint8Array): string { return base58.encode(key); }
export function decodeKey(key: string): Uint8Array { return base58.decode(key); }