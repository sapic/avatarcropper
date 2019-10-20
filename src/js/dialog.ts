import { Widget } from "./widget";
import { createElement, stopProp } from "./util";

export abstract class Dialog extends Widget {
    protected dialog: HTMLElement;

    constructor() {
        super("dialog-backdrop");

        this.dialog = createElement("div", "dialog");
        this.dialog.addEventListener("click", stopProp);
        this.container.appendChild(this.dialog);
        this.contentContainer = this.dialog;

        this.container.addEventListener("click", () => {
            this.dismiss();
        });

        this.hide();
    }

    public show(): void {
        super.show();
        this.contentContainer.scrollTop = 0;
    }
    
    public abstract dismiss(): void;
}