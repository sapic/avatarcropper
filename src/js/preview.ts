import { Widget } from "./widget";
import { createElement, showElement, hideElement, makePixelated } from "./util";
import { Canvas } from "./canvas";
import { CropView } from "./cropview";
import { Point } from "./point";
import { Rectangle } from "./rectangle";
import { Border } from "./borders";
import { GlobalEvents } from "./eventclass";
import { Drawer } from "./drawer";
import { AvatarCropper } from "./avatarcropper";

export class Preview extends Drawer {
    private mask: Canvas;
    private border: Canvas;
    private image: HTMLImageElement;
    private onlineIndicator: Canvas;
    private bottomBar: HTMLElement;
    private sizeDisplay: HTMLElement;
    private removeButton: HTMLElement;
    private _size: Point;
    private cropView: CropView;
    private lastMode: "square" | "circle" | "none" = "none";
    private antialiased: boolean;

    constructor(size: Point, cropView: CropView) {
        super(createElement("div", "preview"));

        this.createEvent("requestremove");

        GlobalEvents.on("borderchange", () => this.applyGradient());

        this.cropView = cropView;
        this.cropView.on("update", (source: string) => {
            this.update("preview: " + source);
        });
        this.cropView.on("imagechange", (src: string) => {
            this.image.src = src;
        });
        this.cropView.on("antialiaschange", (aa: boolean) => {
            this.antialias = aa;
        });
        /*this.cropView.on("actionstart", () => {
            this.image.style.willChange = "left, top, transform";
        });
        this.cropView.on("actionend", () => {
            this.image.style.willChange = "";
        });*/

        this._size = size;

        this.container.style.width = size.x + "px";
        this.container.style.height = (size.y + 2) + "px";
        this.container.style.zIndex = (-size).toString();

        this.mask = new Canvas({
            size: size.plus(new Point(0, 2))
        });
        this.mask.canvas.className = "mask";
        this.mask.canvas.style.zIndex = "2";
        this.mask.canvas.style.position = "absolute";

        this.border = new Canvas({
            size: size
        });
        this.border.canvas.className = "border";
        this.mask.canvas.style.zIndex = "1";
        this.border.canvas.style.position = "absolute";

        this.image = <HTMLImageElement>createElement("img", "image");
        this.image.style.position = "absolute";
        this.image.style.transformOrigin = "top left";
        if (cropView.src) {
            this.image.src = cropView.src;
        }
        this.image.style.position = "absolute";

        if (size.equals(new Point(30))) {
            this.onlineIndicator = new Canvas({ size: new Point(14) });
            this.onlineIndicator.fillCircleInSquare(new Point(0, 0), 14, "#2F3136");
            this.onlineIndicator.fillCircleInSquare(new Point(2, 2), 10, "rgb(67,181,129)");
            this.onlineIndicator.canvas.className = "onlineIndicator";
        }

        this.bottomBar = createElement("div", "bottomBar");

        this.sizeDisplay = createElement("div", "size");
        this.sizeDisplay.innerText = size.x + "x" + size.y;
        this.container.title = this.sizeDisplay.innerText;

        this.removeButton = createElement("button", "remove");
        this.removeButton.innerText = "✖";
        this.removeButton.addEventListener("click", () => {
            this.emitEvent("requestremove");
        });

        this.bottomBar.appendChild(this.sizeDisplay);
        this.bottomBar.appendChild(this.removeButton);

        this.appendChild(this.image, this.mask.canvas, this.border.canvas, (this.onlineIndicator && this.onlineIndicator.canvas) || null, this.bottomBar);

        this.container.addEventListener("mouseenter", () => {
            showElement(this.bottomBar);
        });

        this.container.addEventListener("mouseleave", () => {
            hideElement(this.bottomBar);
        });

        hideElement(this.bottomBar);

        this.antialias = true;
    }

    public get size(): Point {
        return this._size;
    }
    
    public applyGradient(): void {
        Border.apply(this.border);
    }

    protected draw() {
        if (AvatarCropper.settings.previewMode !== this.lastMode) {
            this.lastMode = this.cropView.settings.previewMode;

            this.applyGradient();

            if (this.lastMode === "square") {
                this.mask.clear();
                this.mask.fillRect(new Rectangle(new Point(0, this.size.y), new Point(this.size.x, 2)), "#2F3136");
                if (this.onlineIndicator) {
                    hideElement(this.onlineIndicator.canvas);
                }
            }
            else {
                this.mask.fill("#2F3136");
                this.mask.blendMode = "destination-out";
                this.mask.fillCircleInRect(new Rectangle(new Point(0), this.size), "white");
                this.mask.blendMode = "source-over";
                if (this.onlineIndicator) {
                    showElement(this.onlineIndicator.canvas);
                }
            }
        }

        let scale = this.size.dividedBy(this.cropView.cropArea.size);
        this.image.style.transform = "scale(" + scale.x + "," + scale.y + ") rotate(" + this.cropView.rotation + "deg)";


        let p = new Point(0);
        p.subtract(this.cropView.cropArea.position.times(scale));

        let dp = new Point(
            parseFloat(this.cropView.image.style.left || "0px"),
            parseFloat(this.cropView.image.style.top || "0px")
        );

        dp.multiply(1 / this.cropView.zoomFactor);

        p.add(dp.times(scale));

        this.image.style.left = p.x + "px";
        this.image.style.top = p.y + "px";
    }

    public set antialias(antialias: boolean) {
        makePixelated(this.image, !antialias);
        this.antialiased = antialias;
    }

    public get antialias(): boolean {
        return this.antialiased;
    }
}