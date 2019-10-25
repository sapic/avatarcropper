export abstract class Drawer {
    private dirty: boolean = false;
    private animationFrame: number;

    constructor() {
        requestAnimationFrame(this.draw.bind(this));
    }

    protected update(): void {
        this.dirty = true;
    }

    protected abstract draw(): void;
}