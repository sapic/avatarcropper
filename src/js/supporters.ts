import { ClosableDialog } from "./closabledialog";

export class SupportersDialog extends ClosableDialog {
    private patrons =
        [
            "henby",
            "Jenny",
            "xPraisexAphroditex"
        ];

    private donors =
        [
            "Glen Cathey",
            "Betty Glez",
            "Max Abbot",
            "MetalSonicDash",
            "Almxg Levi",
            "Tenkay",
            "PanPan",
            "wtx",
            "Néć[Ř]ø /A/",
            "HabLover22",
            "Anna X. Young",
            "and 4 anons:)"
        ];

    constructor() {
        super();
        this.dialog.classList.add("dialog-supporters");

        this.innerHTML = "<h1>Supporters</h1>";

        this.innerHTML += "Thanks to these people for donating and contributing to my work!!<br><br>";
        this.innerHTML += this.patrons.concat(this.donors).join("<br>");

        this.innerHTML += "<br><br>I always ask before publishing a name so just let me know if you'd prefer to stay anonymous!<br>ok thx love u";
    }
}