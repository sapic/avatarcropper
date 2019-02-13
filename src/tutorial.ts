import { ClosableDialog } from "./closabledialog";
import { createElement } from "./util";

export class TutorialDialog extends ClosableDialog
{
    constructor()
    {
        super();
        this.dialog.classList.add("dialog-tutorial");

        let h1 = createElement("h1");
        h1.innerText = "Tutorial..";

        let body = createElement("div");
        body.innerHTML =
            "Hello, you can resize the cropping area by dragging on the "
            + "\"corners\" of the circle/square.<br>"
            + "<img src='img/tut.png' class='image'><br>"
            + "Thank you, this has been the tutorial.<br>"
            + "Please leave feedback or donate with the links at the bottom!";

        this.appendChild(h1, body);
    }
}