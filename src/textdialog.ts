import { ClosableDialog } from "./closabledialog";
import { createElement } from "./util";

export class TextDialog extends ClosableDialog
{
    private textContent : HTMLElement;

    constructor()
    {
        super();
        this.textContent = createElement("div", "text");
        
        this.contentContainer = this.textContent;
    }
}