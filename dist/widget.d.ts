import { EventClass } from "./eventclass";
export declare class Widget extends EventClass {
    container: HTMLElement;
    protected contentContainer: HTMLElement;
    constructor(className_or_container?: string | HTMLElement);
    show(): void;
    hide(): void;
    innerHTML: string;
    innerText: string;
    appendChild(...children: (HTMLElement | Widget | null)[]): void;
    private appendHelper;
    removeChild(child: HTMLElement | Widget): boolean;
    hasChild(child: HTMLElement | Widget): boolean;
}
//# sourceMappingURL=widget.d.ts.map