import { Widget } from "./widget";
import { createElement } from "./util";

export class ProgressBar extends Widget {
    private progressElement: HTMLElement;
    private _progress: number;

    constructor() {
        super(createElement("div", "progressBar"));

        this.progressElement = createElement("div", "progress");
        this.progressElement.style.height = "100%";

        this.progress = 0;

        this.appendChild(this.progressElement);
    }

    // 0 to 1 //
    public set progress(progress: number) {
        this._progress = progress;
        this.progressElement.style.width = (progress * 100) + "%";
    }

    public get progress(): number {
        return this._progress;
    }
}