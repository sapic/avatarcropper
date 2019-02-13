export declare class EventClass {
    private events;
    constructor();
    protected createEvent(event: string): void;
    emitEvent(event: string, ...args: any[]): void;
    on(event: string, fn: Function): void;
    once(event: string, fn: Function): void;
}
export declare let GlobalEvents: EventClass;
//# sourceMappingURL=eventclass.d.ts.map