import { VNode } from 'vue';

type PositionInfo = [
    source: string,
    line: number,
    column: number
];
/**
 * @internal
 */
declare function recordPosition(source: string, line: number, column: number, node: VNode): VNode;
declare class ElementTraceInfo {
    pos: PositionInfo;
    vnode: VNode | undefined;
    el: Element | undefined;
    constructor(pos: PositionInfo, el?: Element, vnode?: VNode);
    get filepath(): string;
    get fullpath(): string;
    get rect(): DOMRect | undefined;
    getElementsSameFile(): Element[] | undefined;
    getParent(): ElementTraceInfo | undefined;
    getElementsSamePosition(): Element[] | undefined;
}
declare function findTraceFromElement(el?: Element | null): ElementTraceInfo | undefined;
declare function findTraceFromVNode(vnode?: VNode, el?: Element): ElementTraceInfo | undefined;
declare function findTraceAtPointer(e: {
    x: number;
    y: number;
}): ElementTraceInfo | undefined;
declare function hasData(): boolean;

export { ElementTraceInfo, type PositionInfo, findTraceAtPointer, findTraceFromElement, findTraceFromVNode, hasData, recordPosition };
