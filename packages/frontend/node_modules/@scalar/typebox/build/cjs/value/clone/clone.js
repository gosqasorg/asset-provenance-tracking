"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.Clone = Clone;
// ------------------------------------------------------------------
// ValueGuard
// ------------------------------------------------------------------
const index_1 = require("../guard/index");
// ------------------------------------------------------------------
// Clonable
// ------------------------------------------------------------------
function FromObject(value, cache) {
    if (cache.has(value))
        return cache.get(value);
    const Acc = {};
    cache.set(value, Acc);
    for (const key of Object.getOwnPropertyNames(value)) {
        Acc[key] = Clone(value[key], cache);
    }
    for (const key of Object.getOwnPropertySymbols(value)) {
        Acc[key] = Clone(value[key], cache);
    }
    return Acc;
}
function FromArray(value, cache) {
    if (cache.has(value))
        return cache.get(value);
    const Acc = [];
    cache.set(value, Acc);
    for (let i = 0; i < value.length; i++) {
        Acc.push(Clone(value[i], cache));
    }
    return Acc;
}
function FromTypedArray(value) {
    return value.slice();
}
function FromMap(value) {
    return new Map(Clone([...value.entries()]));
}
function FromSet(value) {
    return new Set(Clone([...value.entries()]));
}
function FromDate(value) {
    return new Date(value.toISOString());
}
function FromValue(value) {
    return value;
}
// ------------------------------------------------------------------
// Clone
// ------------------------------------------------------------------
/** Returns a clone of the given value */
function Clone(value, cache = new WeakMap()) {
    if ((0, index_1.IsArray)(value))
        return FromArray(value, cache);
    if ((0, index_1.IsDate)(value))
        return FromDate(value);
    if ((0, index_1.IsTypedArray)(value))
        return FromTypedArray(value);
    if ((0, index_1.IsMap)(value))
        return FromMap(value);
    if ((0, index_1.IsSet)(value))
        return FromSet(value);
    if ((0, index_1.IsObject)(value))
        return FromObject(value, cache);
    if ((0, index_1.IsValueType)(value))
        return FromValue(value);
    throw new Error('ValueClone: Unable to clone value');
}
