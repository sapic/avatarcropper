import { hideElement } from "./util";
import { EventClass } from "./eventclass";

export class ImagePasted extends EventClass {
    private tempText: string = null;

    constructor(overlay: HTMLElement) {
        super();

        let imgpasted = this; // Setting "imgpasted" to "this" so that we can use it in the onpaste and other events, since "this" would mean something else there.

        imgpasted.createEvent("imagepasted");

        document.onpaste = function (e) {

            var files = (e.clipboardData).files; // Check to see if there are files in the clipboard data

            if (files) { // If there are files, emit the first file
                imgpasted.emitEvent("imagepasted", files[0])
            }

            e.preventDefault();
            e.stopPropagation();
            
            hideElement(overlay);
            overlay.innerText = imgpasted.tempText;
            overlay.style.zIndex = "";
            imgpasted.tempText = null;
            
        };
    }
}
