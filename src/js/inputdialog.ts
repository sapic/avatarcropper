import { Dialog } from "./dialog";
import { emptyFn } from "./util";

export abstract class InputDialog<T> extends Dialog {
    constructor(onreturn?: (input: T) => void) {
        super();
        this.container.classList.add("input");

        this.createEvent("return");

        if (onreturn) {
            this.on("return", onreturn);
        }

        this.container.addEventListener("click", () => {
            this.emitEvent("return", null);
        });
    }
}