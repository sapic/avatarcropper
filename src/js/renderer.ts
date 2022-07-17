import { CropView } from "./cropview";
import { Dialog } from "./dialog";
import { createElement, hideElement, showElement, makePixelated } from "./util";
import { FractionalProgressBar } from "./fractionalprogressbar";
import { Canvas } from "./canvas";
import { ClosableDialog } from "./closabledialog";
import { Point } from "./point";
import { Border } from "./borders";

import SuperGif from './supergif.js'
import GIF from './gif.js'
import { Rectangle } from "./rectangle";

interface CropOption {
    label: string;
    url: string;
}

export class Renderer extends ClosableDialog {
    private readonly renderedString = "Rendered! yayy";
    private readonly renderingString = "Rendering...";
    private readonly cropView: CropView;
    private shouldStopRendering: boolean = false;
    private currentlyRendering: boolean = false;
    private progressBar: FractionalProgressBar;
    private readonly imageElement: HTMLImageElement;
    private optionBar: HTMLElement;
    private headerElement: HTMLElement;
    private noteElement: HTMLElement;
    private pleaseWaitElement: HTMLElement;
    private saveButton: HTMLElement;
    private loadGif: any;
    private readonly initialized: boolean = false;

    constructor(cropView: CropView) {
        super();

        this.dialog.classList.add("dialog-render");

        this.createEvent("close");

        this.cropView = cropView;

        this.headerElement = createElement("h1", "header");
        this.headerElement.innerText = this.renderingString;

        this.progressBar = new FractionalProgressBar();

        this.imageElement = <HTMLImageElement>createElement("img", "image");

        this.noteElement = createElement("div", "note");
        this.noteElement.innerText = "Save as a square for Discord!!";

        this.pleaseWaitElement = createElement("div", "pleaseWait");
        this.pleaseWaitElement.innerText = "Aborting render... please wait...";

        this.optionBar = createElement("div", "optionBar");

        this.saveButton = createElement("a", "save");
        this.saveButton.innerText = "Save";
        this.saveButton.addEventListener("mouseover", () => {
            (<HTMLAnchorElement>this.saveButton).href = this.imageElement.src;
        });

        this.appendChild(
            this.headerElement,
            this.progressBar,
            this.imageElement,
            this.noteElement,
            this.pleaseWaitElement,
            this.optionBar,
            this.saveButton
        );

        this.initialized = true;
    }

    public render(banner) {
        this.currentlyRendering = true;
        this.shouldStopRendering = false;
        this.show();

        if (this.cropView.currentFileType === "gif") {
            this.renderGif(banner);
        }
        else {
            this.getFrameURLs(this.cropView.image, false, true, banner, this.display.bind(this));
            this.currentlyRendering = false;
        }
    }

    private renderGif(banner): void {
        let gif = new SuperGif({
            gif: this.cropView.image.cloneNode()
        });

        this.loadGif = gif;

        let onload = () => {
            this.loadGif = null;

            if (this.shouldStopRendering) {
                this.currentlyRendering = false;
                this.tryClose();
            }
            const circle = this.cropView.Circle
            const bannerRect = new Rectangle(new Point(circle.left - (circle.width / 5 + circle.width / 13.33), circle.cy - (circle.width * 1.5)), new Point(circle.width * 3.75, circle.width * 1.5))
            let saveGif = new GIF({
                workers: 3,
                quality: 1,
                dither: false,
                width: !banner ? this.cropView.cropArea.width : bannerRect.width ,
                height: !banner ? this.cropView.cropArea.height : bannerRect.height,
                debug: false,
                copy: true
            });

            let len = gif.get_length();
            this.progressBar.addFractionPart(1 / 6, len);

            let renderFrame = (i: number) => {
                gif.move_to(i);

                this.getFrameURLs(gif.get_canvas(), true, false, banner, (options) => {
                    let img = new Image();
                    img.addEventListener("load", () => {
                        if (this.shouldStopRendering) {
                            this.currentlyRendering = false;
                            this.tryClose();
                            return;
                        }

                        saveGif.addFrame(img, {
                            delay: gif.get_frames()[i].delay * 10 || 10
                        });

                        this.progressBar.step();

                        i++;
                        if (i === len) {
                            saveGif.render();
                        }
                        else {
                            renderFrame(i);
                        }
                    });
                    img.src = options[0].url;
                });
            };

            saveGif.on("finished", (blob: Blob) => {
                let url = URL.createObjectURL(blob);
                this.display([
                    {
                        label: "GIF",
                        url: url
                    }
                ]);

                this.currentlyRendering = false;
            });

            saveGif.on("abort", () => {
                this.currentlyRendering = false;
                this.tryClose();
            });

            saveGif.on("progress", (progress: number) => {
                this.progressBar.progress = 1 / 6 + progress * 5 / 6;

                if (this.shouldStopRendering) {
                    saveGif.abort();
                }
            });

            renderFrame(0);
        };

        gif.load(onload, undefined, () => {
            this.loadGif = null;
            this.currentlyRendering = false;
            this.tryClose();
        });
    }

    private getFrameURLs(frame: Canvas | HTMLImageElement | HTMLCanvasElement, pixelated: boolean, getCircle: boolean, banner: boolean, callback: (options: CropOption[]) => void): void {
        let ret: CropOption[] = [];
        let expectedLength = getCircle ? 2 : 1;
        let counter = 0;

        let check = (url: string, label: string, index: number) => {
            counter++;
            ret[index] = { url, label };
            if (counter === expectedLength) {
                callback(ret);
            }
        };

        let borderCanvas = new Canvas({
            size: this.cropView.cropArea.size,
            pixelated: pixelated
        });

        Border.apply(borderCanvas);

        let rc = new Canvas({
            size: this.cropView.outerSize,
            pixelated: pixelated
        });

        rc.drawRotatedImage(
            frame,
            this.cropView.rotation / 180 * Math.PI,
            this.cropView.outerSize.dividedBy(2).minus(this.cropView.innerSize.dividedBy(2))
        );

        var circle = this.cropView.Circle

        let squareCrop = new Canvas({
            size: banner? new Point(circle.width * 3.75, circle.width * 1.5) : this.cropView.cropArea.size,
            pixelated: pixelated
        });

        if (banner == true) {
            squareCrop.drawCroppedImage(
                rc,
                new Point(0),
                new Rectangle(new Point(circle.left - (circle.width / 5 + circle.width / 13.33), circle.cy - (circle.width * 1.5)), new Point(circle.width * 3.75, circle.width * 1.5))
                //new Rectangle(new Point(this.circle.left - (this.circle.width / 5 + this.circle.width / 13.33), this.circle.cy - (this.circle.width * 1.5)), new Point(this.circle.width * 3.75, this.circle.width * 1.5))
            );
        } else {
            squareCrop.drawCroppedImage(
                rc,
                new Point(0),
                this.cropView.cropArea
            );
        }
        squareCrop.drawImage(borderCanvas, new Point(0));

        squareCrop.createBlob((blob: Blob) => {
            check(URL.createObjectURL(blob), "Square", 0);
        });

        if (getCircle) {
            let circleCrop = new Canvas({
                size: this.cropView.cropArea.size,
                pixelated: pixelated
            });

            circleCrop.drawCroppedImage(
                rc,
                new Point(0),
                this.cropView.cropArea
            );

            circleCrop.drawImage(borderCanvas, new Point(0));

            circleCrop.blendMode = "destination-in";
            circleCrop.fillCircleInSquare(new Point(0), circleCrop.width, "white");

            circleCrop.createBlob((blob: Blob) => {
                check(URL.createObjectURL(blob), "Circle", 1);
            });
        }
    }

    private display(cropOptions: CropOption[]): void {
        this.progressBar.hide();
        showElement(this.optionBar);
        showElement(this.saveButton);
        this.headerElement.innerText = this.renderedString;
        this.optionBar.innerHTML = "";
        let firstButton: HTMLElement;

        cropOptions.forEach((option, i) => {
            let b = createElement("button", "option");
            b.style.width = (1 / cropOptions.length * 100) + "%";
            b.innerText = option.label;
            (<any>b).url = option.url;
            b.addEventListener("click", () => {
                this.imageElement.src = option.url;

                let bs = this.optionBar.children;
                for (let i = 0; i < bs.length; i++) {
                    bs[i].classList.remove("toggled");
                }

                b.classList.add("toggled");
            });

            this.optionBar.appendChild(b);

            if (i === 0) {
                firstButton = b;
            }
        });

        this.imageElement.onload = () => {
            this.contentContainer.scrollTop = this.contentContainer.scrollHeight;
            this.imageElement.onload = null;
        };

        firstButton.click();
    }

    public show() {
        this.progressBar.show();
        this.progressBar.reset();
        this.headerElement.innerText = this.renderingString;
        hideElement(this.optionBar);
        hideElement(this.saveButton);
        hideElement(this.pleaseWaitElement);
        this.imageElement.src = "";
        this.saveButton.setAttribute("download", this.cropView.filename);
        makePixelated(this.imageElement, !this.cropView.antialias);
        super.show();
    }

    public hide(force: boolean = false) {
        if (force || !this.initialized) {
            super.hide();
        }
        else {
            this.tryClose();
        }
    }

    public tryClose(): boolean {
        if (this.currentlyRendering) {
            this.shouldStopRendering = true;
            this.loadGif && this.loadGif.abort();
            showElement(this.pleaseWaitElement);
            return false;
        }

        let bs = this.optionBar.children;
        for (let i = 0; i < bs.length; i++) {
            (<any>bs[i]).url && URL.revokeObjectURL((<any>bs[i]).url);
        }

        this.emitEvent("close");
        this.hide(true);
        return true;
    }
}