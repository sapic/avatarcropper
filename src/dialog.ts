import { Widget } from "./widget";
import { createElement, stopProp } from "./util";

export class Dialog extends Widget
{
    protected dialog : HTMLElement;

    constructor()
    {
        super("dialog-backdrop");

        this.dialog = createElement("div", "dialog");
        this.dialog.addEventListener("click", stopProp);
        this.container.appendChild(this.dialog);
        this.contentContainer = this.dialog;

        this.container.addEventListener("click", () =>
        {
            this.hide();
        });

        this.hide();
    }
}