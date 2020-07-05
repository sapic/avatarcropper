import { showElement, hideElement } from "./util";
import { EventClass } from "./eventclass";

export class DragDrop extends EventClass {
    private tempText: string = null;

    constructor(overlay: HTMLElement) {
        super();

        this.createEvent("drop");
        this.createEvent("dragleave");

        document.addEventListener("dragover", (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        document.addEventListener("dragend", (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        document.addEventListener("dragenter", (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (!this.tempText) {
                this.tempText = overlay.innerText;
            }

            showElement(overlay);
            overlay.innerText = "Drop file";
            overlay.style.zIndex = "9999";

            console.log(this.tempText);
        });

        document.addEventListener("dragleave", (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (e.target === overlay) {
                hideElement(overlay);
                overlay.innerText = this.tempText;
                overlay.style.zIndex = "";
                this.tempText = null;
                this.emitEvent("dragleave");
            }
        });

        document.addEventListener("drop", (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (e.dataTransfer.files.length) {
                this.emitEvent("drop", e.dataTransfer.files[0]);
            }

            hideElement(overlay);
            overlay.innerText = this.tempText;
            overlay.style.zIndex = "";
            this.tempText = null;
        });
    }
}