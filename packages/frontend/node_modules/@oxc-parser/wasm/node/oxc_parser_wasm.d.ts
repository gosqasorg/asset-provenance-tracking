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
