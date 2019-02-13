import { array_remove } from "./util";

export class EventClass
{
    private events : Map<string, Function[]> = new Map<string, Function[]>();

    constructor()
    {
        // poopie
    }

    protected createEvent(event : string)
    {
        if (!this.events.has(event))
        {
            this.events.set(event, []);
        }
    }

    public emitEvent(event : string, ...args : any[]) : void
    {
        if (!this.events.has(event))
        {
            console.warn("event not yet created: " + event);
            this.events.set(event, []);
        }

        this.events.get(event).forEach(fn => fn(...args));
    }

    public on(event : string, fn : Function)
    {
        if (!this.events.has(event))
        {
            console.warn("event not yet created: " + event);
            this.events.set(event, []);
        }

        this.events.get(event).push(fn);
    }

    public once(event : string, fn : Function)
    {
        let wrapperFn = () =>
        {
            fn();
            array_remove(this.events.get(event), wrapperFn);
        };

        this.on(event, wrapperFn);
    }
}

export let GlobalEvents = new EventClass();