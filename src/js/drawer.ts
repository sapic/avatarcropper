import { Widget } from "./widget";

export abstract class Drawer extends Widget {
    private dirty: boolean = false;
    private frameWaiting: boolean = false;

    constructor(className_or_container?: string | HTMLElement) {
        super(className_or_container);
    }

    public update(source: string): void {
        this.dirty = true;
        if (!this.frameWaiting) {
            this.requestAnimationFrame();
        }
    }

    private _draw() {
        if (this.dirty) {
            this.draw();
            this.dirty = false;
            this.requestAnimationFrame();
        } else {
            this.frameWaiting = false;
        }
    }

    private requestAnimationFrame(): void {
        this.frameWaiting = true;
        requestAnimationFrame(this._draw.bind(this));
    }

    protected abstract draw(): void;
}