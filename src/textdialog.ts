import { ClosableDialog } from "./closabledialog";
import { createElement } from "./util";

export class TextDialog extends ClosableDialog {
    private textContent: HTMLElement;

    constructor() {
        super();
        this.dialog.classList.add("text");

        this.textContent = createElement("div", "text");
        this.appendChild(this.textContent);

        this.contentContainer = this.textContent;
    }
}