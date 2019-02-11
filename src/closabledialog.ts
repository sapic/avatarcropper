import { Dialog } from "./dialog";
import { createElement } from "./util";

export class ClosableDialog extends Dialog
{
    constructor()
    {
        super();
        let close = createElement("div", "close");
        close.innerText = "❌";
        close.addEventListener("click", this.hide.bind(this));

        this.appendChild(close);
    }
}