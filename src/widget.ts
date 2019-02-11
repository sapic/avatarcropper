import { createElement } from "./util";
import { EventClass } from "./eventclass";

export class Widget extends EventClass
{
    public container : HTMLElement;
    protected contentContainer : HTMLElement;

    constructor(className_or_container? : string | HTMLElement)
    {
        super();
        
        if (className_or_container)
        {
            if (typeof(className_or_container) === "string")
            {
                this.container = createElement("div", className_or_container);
            }
            else
            {
                this.container = className_or_container;
            }
        }
        else
        {
            this.container = createElement("div");
        }

        this.contentContainer = this.container;
    }

    public show() : void
    {
        this.container.style.display = "";
    }

    public hide() : void
    {
        this.container.style.display = "none";
    }

    public set innerHTML(innerHTML : string)
    {
        this.contentContainer.innerHTML = innerHTML;
    }

    public get innerHTML() : string
    {
        return this.contentContainer.innerHTML;
    }

    public set innerText(innerText : string)
    {
        this.contentContainer.innerText = innerText;
    }

    public get innerText() : string
    {
        return this.contentContainer.innerText;
    }

    public appendChild(...children : (HTMLElement | Widget | null)[]) : void
    {
        if (children.length === 1)
        {
            this.appendHelper(this.contentContainer, children[0]);
        }
        else
        {
            let frag = document.createDocumentFragment();
    
            children.forEach(child =>
            {
                this.appendHelper(frag, child);
            });
    
            this.contentContainer.appendChild(frag);
        }
    }

    private appendHelper(parent : Node, child : (HTMLElement | Widget)) : void
    {
        if (child instanceof HTMLElement)
        {
            parent.appendChild(child);
        }
        else if (child)
        {
            parent.appendChild(child.container);
        }
    }

    public removeChild(child : HTMLElement | Widget) : boolean
    {
        if (!this.hasChild(child))
        {
            return false;
        }

        if (child instanceof HTMLElement)
        {
            this.contentContainer.removeChild(child);
        }
        else
        {
            this.contentContainer.removeChild(child.container);
        }

        return true;
    }

    public hasChild(child : HTMLElement | Widget)
    {
        if (child instanceof HTMLElement)
        {
            return this.contentContainer.contains(child);
        }
        else
        {
            return this.contentContainer.contains(child.container);
        }
    }
}