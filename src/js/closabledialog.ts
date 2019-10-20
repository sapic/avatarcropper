import { Dialog } from "./dialog";
import { createElement } from "./util";

export class ClosableDialog extends Dialog {
    private innerContent: HTMLElement;

    constructor() {
        super();

        this.dialog.classList.add("closable");

        let close = createElement("div", "close");
        close.innerText = "❌";
        close.addEventListener("click", () => {
            this.hide();
        });
        this.appendChild(close);

        this.innerContent = createElement("div", "innerContent");
        this.appendChild(this.innerContent);
        this.contentContainer = this.innerContent;
    }

    public dismiss(): void {
        this.hide();
    }
}