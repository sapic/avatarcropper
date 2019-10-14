import { ClosableDialog } from "./closabledialog";
import { createElement } from "./util";
import { PRIVACYPOLICY } from "./privacypolicy";

export class TutorialDialog extends ClosableDialog {
    constructor() {
        super();
        this.dialog.classList.add("dialog-tutorial");
    }

    show() {
        this.innerHTML = "";
        this.contentContainer.style.userSelect = "";
        let h1 = createElement("h1");
        h1.innerText = "Tutorial..";

        let learnMore = createElement("span", "link");
        learnMore.addEventListener("click", () => {
            this.contentContainer.style.userSelect = "text";
            this.innerText = PRIVACYPOLICY;
            this.contentContainer.scrollTop = 0;
        });
        learnMore.innerText = "learn more";

        let body = createElement("div");
        body.innerHTML =
            "Hello, you can resize the cropping area by dragging on the "
            + "\"corners\" of the circle/square.<br>"
            + "<img src='" + require('../images/tut.png') + "' class='image'><br>"
            + "Thank you, this has been the tutorial.<br>"
            + "Please leave feedback or donate with the links at the bottom!";

        body.innerHTML += "<br><br>" +
            "<b>also this site use cookie if u use it u agree to cookie ";

        body.appendChild(learnMore);

        this.appendChild(h1, body);

        super.show();
    }
}