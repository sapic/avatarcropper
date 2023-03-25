import { hideElement } from "./util";
import { EventClass } from "./eventclass";

export class ImagePasted extends EventClass {

    private tempText: string = null;

    private async fetch_image_from_link(link: string, callback: Function) {
        try {
            let fetched_link = await fetch(link).catch(e => {}) // Fetch the link
            if (!fetched_link) return; // It might get rejected because CORS. Return.
            let blobbed_link = await fetched_link.blob(); // Try converting it to a blob.
            if (!blobbed_link.type.includes("image")) return; // If it's not an image, return.
            callback( new File([blobbed_link], 'avatarcropper.png', {type: "image/png"}) ) // Convert that blob to a png file and use the callback function.
        }
        catch (e) { console.log(e) }
    }

    constructor(overlay: HTMLElement) {
        super();

        let imgpasted = this; // Setting "imgpasted" to "this" so that we can use it in the onpaste and other events, since "this" would mean something else there.

        imgpasted.createEvent("imagepasted");

        document.onpaste = function (e) {

            function change_element() { 
                e.preventDefault();
                e.stopPropagation();
                hideElement(overlay);
                overlay.innerText = imgpasted.tempText;
                overlay.style.zIndex = "";
                imgpasted.tempText = null;
            }

            var files: FileList = (e.clipboardData).files; // Check to see if there are files in the clipboard data
            var link: string = (e.clipboardData).getData("text") // Check to see if there is text in the clipboard data

            if (files.length) { // If there are files, paste the first file.
                let file: File = files[0];
                if (!file?.type.includes("image")) return; // If it's not an image, return.
                imgpasted.emitEvent("imagepasted", files[0])
                change_element();
            }
            
            if (link) { // If there's text in the clipboard
                ( async () =>
                    await imgpasted.fetch_image_from_link( link, file => { // Assuming the text is a link, try to fetch the link
                        if (file) { // If the file is valid, paste the file.
                            imgpasted.emitEvent("imagepasted", file);
                            change_element();
                        }
                    })
                )();

            }
            
        };

    }
}
