/* tslint:disable */
/* eslint-disable */
/**
 * # Errors
 *
 * * wasm bindgen serialization failed
 *
 * # Panics
 *
 * * File extension is invalid
 * * Serde JSON serialization
 */
export function parseSync(source_text: string, options?: ParserOptions | null): ParseResult;

import type { Program } from "@oxc-project/types";
export * from "@oxc-project/types";


export interface ParserOptions {
    sourceType?: "script" | "module";
    sourceFilename?: string;
}

export interface ParseResult {
    program: Program;
    programJson: string;
    comments: Comment[];
    errors: Diagnostic[];
}

export interface Diagnostic {
    start: number;
    end: number;
    severity: string;
    message: string;
}

export interface Comment {
    type: CommentType;
    value: string;
    start: number;
    end: number;
}

export type CommentType = "Line" | "Block";


export type NodeId = number;
export type NodeFlags = {
    JSDoc: 1,
    Class: 2,
    HasYield: 4
    Parameter: 8
};



export type ReferenceId = number;
export type ReferenceFlags = {
    None: 0,
    Read: 0b1,
    Write: 0b10,
    Type: 0b100,
    Value: 0b11
}



export type ScopeId = number;



export type SymbolId = number;
export type SymbolFlags = unknown;
export type RedeclarationId = unknown;


export class ParseResult {
  private constructor();
  free(): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_parseresult_free: (a: number, b: number) => void;
  readonly __wbg_get_parseresult_programJson: (a: number, b: number) => void;
  readonly __wbg_get_parseresult_comments: (a: number, b: number) => void;
  readonly __wbg_get_parseresult_errors: (a: number, b: number) => void;
  readonly parseSync: (a: number, b: number, c: number, d: number) => void;
  readonly __wbindgen_export_0: (a: number) => void;
  readonly __wbindgen_export_1: (a: number, b: number) => number;
  readonly __wbindgen_export_2: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_export_3: (a: number, b: number, c: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
