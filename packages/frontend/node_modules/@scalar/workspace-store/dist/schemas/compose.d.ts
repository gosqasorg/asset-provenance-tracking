import { type TSchema, Type } from '@scalar/typebox';
/**
 * Work around for: https://github.com/sinclairzx81/typebox/issues/1264
 */
export declare const compose: <A extends TSchema[]>(...args: A) => ReturnType<typeof Type.Intersect<A>>;
//# sourceMappingURL=compose.d.ts.map