import { z } from 'zod';
/**
 * The Schema Object allows the definition of input and output data types.
 * These types can be objects, but also primitives and arrays.
 */
export declare const SchemaObjectSchema: z.ZodType<Record<string, any>>;
export type SchemaObject = z.infer<typeof SchemaObjectSchema>;
//# sourceMappingURL=schema-object.d.ts.map