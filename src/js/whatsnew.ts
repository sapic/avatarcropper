import { createElement } from "./util";
import { ClosableDialog } from "./closabledialog";

export class WhatsNewDialog extends ClosableDialog {
    private list =
        {
            "October 2022":
                [
                    "Holy heck, a brand new feature! You can now crop Discord profile banners right here! Isn't that just sooo cool!?",
                    "Thank you to @Barocena!!!"
                ],
            "Sepetmber 2022":
                [
                    "Massive site redesign! Thank you @The Oddball!~"
                ],
            "Feburary 2022":
                [
                    "Bug fixes and preformance improvements",
                    "wow, such update"
                ],
            "October 2019":
                [
                    "Added borders for LGBT frends... more/custom borders coming soon",
                    "Added support for custom colored borders, import/export feature coming soon",
                    "Updated some styling"
                ],
            "July 2019":
                [
                    "Added functionality for centering, setting size manually, and resize locking",
                    "Bug fixes and performance improvements"
                ],
            "May 2019":
                [
                    "Made it so you can move the crop area pixel-by-pixel using arrow keys",
                    "Also I can't make it so you can just put a url of a pic without having a dedicated server which i don't got the munz for sorry"
                ],
            "April 2019":
                [
                    "Changed mask to be pixel-accurate",
                    "Added option to show guidelines"
                ],
            "February 2019":
                [
                    "rewrote the whole dang thing so its not all in one file anymore lol",
                    "flip image horizontally or vertically (gifs soon)",
                    "antialias toggle (won't affect rendering, which just crops the image directly)",
                    "online indicator preview for discord",
                    "bugfixes and quality of life improvements",
                    "please tell me if you find bugs they probably exist and please tell me how you made them happen"
                ],
            "December 2018":
                [
                    "You can remove preview sizes now by clicking in the bottom-right area. The web site will also magically remember your preview sizes between visits.",
                    "Zoom-fit should be imperceptibly faster... also shouldn't show phantom scroll bars anymore"
                ],
            "November 2018":
                [
                    "Rotation! Please let me know if u find any bugs with this."
                ],
            "August 2018":
                [
                    "Helpful tutorial",
                    "Better Mask Outline",
                    "Updated Canvas Backend",
                    "Updated Preview Image Backend",
                    "So tell me if you find any weird bugs",
                    "Loading screen so you can't open a file before it's ready for you to"
                ],
            "July 2018":
                [
                    "Drag & Drop support - thanx TheRebelG0d",
                    "New rendering where you can pick circle or square after rendering... revolutionary...",
                    "Zoom functionality",
                    "Other stuff probaly"
                ],
            "June 2018":
                [
                    "bugfixes cool"
                ],
            "May 2018":
                [
                    "GIF support!! wow did you know GIFs work on this ??? at least i hope they do"
                ],
            "Earlier":
                [
                    "other stuff"
                ]
        };

    constructor() {
        super();

        this.dialog.classList.add("dialog-whatsNew");

        let es: HTMLElement[] = [];

        let h1 = createElement("h1");
        h1.innerText = "What's New...";
        es.push(h1);

        for (let month in this.list) {
            let h2 = createElement("h2");
            h2.innerText = month;

            let ul = createElement("ul");

            this.list[month].forEach((thing: string) => {
                let li = createElement("li");
                li.innerText = thing;
                ul.appendChild(li);
            });

            es.push(h2);
            es.push(ul);
        }

        this.appendChild(...es);
    }
}