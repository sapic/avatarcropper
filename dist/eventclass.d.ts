export declare class EventClass {
    private events;
    constructor();
    protected createEvent(event: string): void;
    protected emitEvent(event: string, ...args: any[]): void;
    on(event: string, fn: Function): void;
    once(event: string, fn: Function): void;
}
//# sourceMappingURL=eventclass.d.ts.map