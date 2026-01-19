import { IsObject, IsArray, IsString, IsNumber, IsNull } from '../guard/index.mjs';
import { TypeBoxError } from '../../type/error/index.mjs';
import { Kind } from '../../type/symbols/index.mjs';
import { Create } from '../create/index.mjs';
import { Check } from '../check/index.mjs';
import { Clone } from '../clone/index.mjs';
import { Deref, Pushref } from '../deref/index.mjs';
// ------------------------------------------------------------------
// Errors
// ------------------------------------------------------------------
export class ValueCastError extends TypeBoxError {
    constructor(schema, message) {
        super(message);
        this.schema = schema;
    }
}
// ------------------------------------------------------------------
// The following logic assigns a score to a schema based on how well
// it matches a given value. For object types, the score is calculated
// by evaluating each property of the value against the schema's
// properties. To avoid bias towards objects with many properties,
// each property contributes equally to the total score. Properties
// that exactly match literal values receive the highest possible
// score, as literals are often used as discriminators in union types.
// ------------------------------------------------------------------
function ScoreUnion(schema, references, value) {
    if (schema[Kind] === 'Object' && typeof value === 'object' && !IsNull(value)) {
        const object = schema;
        const keys = Object.getOwnPropertyNames(value);
        const entries = Object.entries(object.properties);
        return entries.reduce((acc, [key, schema]) => {
            const literal = schema[Kind] === 'Literal' && schema.const === value[key] ? 100 : 0;
            const checks = Check(schema, references, value[key]) ? 10 : 0;
            const exists = keys.includes(key) ? 1 : 0;
            return acc + (literal + checks + exists);
        }, 0);
    }
    else if (schema[Kind] === 'Union') {
        const schemas = schema.anyOf.map((schema) => Deref(schema, references));
        const scores = schemas.map((schema) => ScoreUnion(schema, references, value));
        return Math.max(...scores);
    }
    else {
        return Check(schema, references, value) ? 1 : 0;
    }
}
function SelectUnion(union, references, value) {
    const schemas = union.anyOf.map((schema) => Deref(schema, references));
    let [select, best] = [schemas[0], 0];
    for (const schema of schemas) {
        const score = ScoreUnion(schema, references, value);
        if (score > best) {
            select = schema;
            best = score;
        }
    }
    return select;
}
function CastUnion(union, references, value, cache) {
    if ('default' in union) {
        return typeof value === 'function' ? union.default : Clone(union.default);
    }
    else {
        const schema = SelectUnion(union, references, value);
        return Cast(schema, references, value, cache);
    }
}
// ------------------------------------------------------------------
// Default
// ------------------------------------------------------------------
function DefaultClone(schema, references, value) {
    return Check(schema, references, value) ? Clone(value) : Create(schema, references);
}
function Default(schema, references, value) {
    return Check(schema, references, value) ? value : Create(schema, references);
}
// ------------------------------------------------------------------
// Cast
// ------------------------------------------------------------------
function FromArray(schema, references, value, cache) {
    if (Check(schema, references, value))
        return Clone(value);
    const created = IsArray(value) ? value : Create(schema, references);
    const minimum = IsNumber(schema.minItems) && created.length < schema.minItems ? [...created, ...Array.from({ length: schema.minItems - created.length }, () => null)] : created;
    const maximum = IsNumber(schema.maxItems) && minimum.length > schema.maxItems ? minimum.slice(0, schema.maxItems) : minimum;
    const casted = maximum.map((value) => Visit(schema.items, references, value, cache));
    if (schema.uniqueItems !== true)
        return casted;
    const unique = [...new Set(casted)];
    if (!Check(schema, references, unique))
        throw new ValueCastError(schema, 'Array cast produced invalid data due to uniqueItems constraint');
    return unique;
}
function FromConstructor(schema, references, value, cache) {
    if (Check(schema, references, value))
        return Create(schema, references);
    const required = new Set(schema.returns.required || []);
    const result = function () { };
    for (const [key, property] of Object.entries(schema.returns.properties)) {
        if (!required.has(key) && value.prototype[key] === undefined)
            continue;
        result.prototype[key] = Visit(property, references, value.prototype[key], cache);
    }
    return result;
}
function FromImport(schema, references, value, cache) {
    const definitions = globalThis.Object.values(schema.$defs);
    const target = schema.$defs[schema.$ref];
    return Visit(target, [...references, ...definitions], value, cache);
}
// ------------------------------------------------------------------
// Intersect
// ------------------------------------------------------------------
function IntersectAssign(correct, value) {
    // trust correct on mismatch | value on non-object
    if ((IsObject(correct) && !IsObject(value)) || (!IsObject(correct) && IsObject(value)))
        return correct;
    if (!IsObject(correct) || !IsObject(value))
        return value;
    return globalThis.Object.getOwnPropertyNames(correct).reduce((result, key) => {
        const property = key in value ? IntersectAssign(correct[key], value[key]) : correct[key];
        return { ...result, [key]: property };
    }, {});
}
function FromIntersect(schema, references, value) {
    if (Check(schema, references, value))
        return value;
    const correct = Create(schema, references);
    const assigned = IntersectAssign(correct, value);
    return Check(schema, references, assigned) ? assigned : correct;
}
function FromNever(schema, references, value) {
    throw new ValueCastError(schema, 'Never types cannot be cast');
}
function FromObject(schema, references, value, cache) {
    if (cache.has(value))
        return cache.get(value);
    if (Check(schema, references, value))
        return value;
    if (value === null || typeof value !== 'object')
        return Create(schema, references);
    const required = new Set(schema.required || []);
    const result = {};
    cache.set(value, result);
    for (const [key, property] of Object.entries(schema.properties)) {
        if (!required.has(key) && value[key] === undefined)
            continue;
        result[key] = Visit(property, references, value[key], cache);
    }
    // additional schema properties
    if (typeof schema.additionalProperties === 'object') {
        const propertyNames = Object.getOwnPropertyNames(schema.properties);
        for (const propertyName of Object.getOwnPropertyNames(value)) {
            if (propertyNames.includes(propertyName))
                continue;
            result[propertyName] = Visit(schema.additionalProperties, references, value[propertyName], cache);
        }
    }
    return result;
}
function FromRecord(schema, references, value, cache) {
    if (Check(schema, references, value))
        return Clone(value);
    if (value === null || typeof value !== 'object' || Array.isArray(value) || value instanceof Date)
        return Create(schema, references);
    const subschemaPropertyName = Object.getOwnPropertyNames(schema.patternProperties)[0];
    const subschema = schema.patternProperties[subschemaPropertyName];
    const result = {};
    for (const [propKey, propValue] of Object.entries(value)) {
        result[propKey] = Visit(subschema, references, propValue, cache);
    }
    return result;
}
function FromRef(schema, references, value, cache) {
    return Visit(Deref(schema, references), references, value, cache);
}
function FromThis(schema, references, value, cache) {
    return Visit(Deref(schema, references), references, value, cache);
}
function FromTuple(schema, references, value, cache) {
    if (Check(schema, references, value))
        return Clone(value);
    if (!IsArray(value))
        return Create(schema, references);
    if (schema.items === undefined)
        return [];
    return schema.items.map((schema, index) => Visit(schema, references, value[index], cache));
}
function FromUnion(schema, references, value, cache) {
    return Check(schema, references, value) ? Clone(value) : CastUnion(schema, references, value, cache);
}
function Visit(schema, references, value, cache) {
    const references_ = IsString(schema.$id) ? Pushref(schema, references) : references;
    const schema_ = schema;
    switch (schema[Kind]) {
        // --------------------------------------------------------------
        // Structural
        // --------------------------------------------------------------
        case 'Array':
            return FromArray(schema_, references_, value, cache);
        case 'Constructor':
            return FromConstructor(schema_, references_, value, cache);
        case 'Import':
            return FromImport(schema_, references_, value, cache);
        case 'Intersect':
            return FromIntersect(schema_, references_, value);
        case 'Never':
            return FromNever(schema_, references_, value);
        case 'Object':
            return FromObject(schema_, references_, value, cache);
        case 'Record':
            return FromRecord(schema_, references_, value, cache);
        case 'Ref':
            return FromRef(schema_, references_, value, cache);
        case 'This':
            return FromThis(schema_, references_, value, cache);
        case 'Tuple':
            return FromTuple(schema_, references_, value, cache);
        case 'Union':
            return FromUnion(schema_, references_, value, cache);
        // --------------------------------------------------------------
        // DefaultClone
        // --------------------------------------------------------------
        case 'Date':
        case 'Symbol':
        case 'Uint8Array':
            return DefaultClone(schema, references, value);
        // --------------------------------------------------------------
        // Default
        // --------------------------------------------------------------
        default:
            return Default(schema_, references_, value);
    }
}
/** Casts a value into a given type. The return value will retain as much information of the original value as possible. */
export function Cast(...args) {
    if (args.length === 2 || (args.length === 3 && args[2] instanceof WeakMap)) {
        return Visit(args[0], [], args[1], args[2] ?? new WeakMap());
    }
    return Visit(args[0], args[1], args[2], args[3] ?? new WeakMap());
}
