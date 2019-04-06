import { array_remove } from "./util";

export class EventClass
{
    private events : Map<string, { fn : Function, id : string }[]> = new Map<string, { fn : Function, id : string }[]>();

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

        this.events.get(event).forEach(o => o.fn(...args));
    }

    public on(event : string, fn : Function, id : string = "[unidentified]")
    {
        if (!this.events.has(event))
        {
            console.warn("event not yet created: " + event);
            this.events.set(event, []);
        }

        this.events.get(event).push({ fn, id });
    }

    public once(event : string, fn : Function, id : string = "[unidentified oneshot]")
    {
        if (!this.events.has(event))
        {
            console.warn("event not yet created: " + event);
            this.events.set(event, []);
        }

        let wrapper = 
        {
            fn: () =>
            {
                fn();
                array_remove(this.events.get(event), wrapper);
            },
            id
        };
        
        this.events.get(event).push(wrapper);
    }

    public debugEvent(event : string)
    {
        if (!this.events.has(event))
        {
            console.warn("event not yet created: " + event);
            this.events.set(event, []);
        }

        console.log("ids registered to event `" + event + "`:");
        this.events.get(event).forEach(o => console.log(o.id));
    }
}

export let GlobalEvents = new EventClass();