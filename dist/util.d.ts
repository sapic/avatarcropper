export declare type SortFunction<T> = (a: T, b: T) => boolean;
export declare function createElement(type: string, className?: string): HTMLElement;
export declare function getIEVersion(): boolean | number;
export declare function makePixelated(e: HTMLImageElement | HTMLCanvasElement, pixelate?: boolean): void;
export declare function createOptionElement(text: string, value: string): HTMLOptionElement;
export declare function hideElement(element: HTMLElement): void;
export declare function showElement(element: HTMLElement): void;
export declare function element_isScrolledTo(element: HTMLElement, allowPartial?: boolean): boolean;
export declare function element_scrollIntoView(element: HTMLElement, align: "top" | "center" | "bottom"): void;
export declare function element_scrollIntoViewIfNeeded(element: HTMLElement, align: "top" | "center" | "bottom", allowPartial: boolean): void;
export declare function endsWith(str: string, endsWith: string): boolean;
export declare function emptyFn(): void;
export declare function array_contains<T>(array: T[], item: T): boolean;
export declare function array_remove<T>(array: T[], item: T): {
    item: T;
    index: number;
    existed: boolean;
};
export declare function array_remove_all<T>(array: T[], item: T): {
    item: T;
    indexes: number[];
    existed: boolean;
};
export declare function array_item_at<T>(array: T[], index: number): T;
export declare function array_remove_at<T>(array: T[], index: number): {
    item: T;
    index: number;
    existed: boolean;
};
export declare function array_insert<T>(array: T[], item: T, index_or_fn: number | SortFunction<T>): {
    item: T;
    index: number;
};
export declare function array_copy<T>(array: T[]): T[];
export declare function array_shuffle<T>(array: T[]): void;
export declare function array_insert_random<T>(array: T[], item: T): {
    index: number;
    item: T;
};
export declare function array_last<T>(array: T[]): T;
export declare function array_swap<T>(array: T[], a: number | T, b: number | T): void;
export declare function stopProp(e: MouseEvent): void;
export declare function getRainbowColor(n: number): string;
export declare function getCurrentMs(): number;
export declare function sign(n: number): number;
//# sourceMappingURL=util.d.ts.map