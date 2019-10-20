import { GlobalEvents } from "./eventclass";
import { Point } from "./point";
import { Canvas } from "./canvas";

type GradientInfo = {
    name: string,
    gradient: { pos: number, color: string }[],
    p1: Point,
    p2: Point
};

export class Border {
    public static readonly types: { [type: string]: GradientInfo } = {
        none: {
            name: "No Border",
            p1: new Point(0),
            p2: new Point(0),
            gradient: []
        },
        lgbt: {
            name: "LGBT Pride",
            p1: new Point(0.5, 0),
            p2: new Point(0.5, 1),
            gradient: [
                { pos: 0/5, color: "#FF0018" },
                { pos: 1/5, color: "#FFA52C" },
                { pos: 2/5, color: "#FFFF41" },
                { pos: 3/5, color: "#008018" },
                { pos: 4/5, color: "#0000F9" },
                { pos: 5/5, color: "#86007D" },
            ]
        },
        trans: {
            name: "Trans Pride",
            p1: new Point(0.5, 0),
            p2: new Point(0.5, 1),
            gradient: [
                { pos: 0, color: "#55CDFC" },
                { pos: 0.25, color: "#F7A8B8" },
                { pos: 0.5, color: "#FFFFFF" },
                { pos: 0.75, color: "#F7A8B8" },
                { pos: 1, color: "#55CDFC" }
            ]
        },
        nonbinary: {
            name: "Nonbinary Pride",
            p1: new Point(0.5, 0),
            p2: new Point(0.5, 1),
            gradient: [
                { pos: 0/3, color: "#FFF430" },
                { pos: 1/3, color: "#FFFFFF" },
                { pos: 2/3, color: "#9C59D1" },
                { pos: 3/3, color: "#000000" },
            ]
        },
    };

    private static _type: "none" | "solid" | "gradient" = "none";
    private static _size: number = 0.05;
    private static _color: string = "";
    private static _gradient: GradientInfo = Border.types.trans;

    public static get type() : "none" | "solid" | "gradient" {
        return this._type;
    }

    public static set type(type: "none" | "solid" | "gradient") {
        this._type = type;
        GlobalEvents.emitEvent("borderchange");
    }

    public static get size() : number {
        return this._size;
    }

    public static set size(size: number) {
        this._size = size;
        GlobalEvents.emitEvent("borderchange");
    }

    public static set color(color: string) {
        this._color = color;
        GlobalEvents.emitEvent("borderchange");
    }

    public static get color(): string {
        return this._color;
    }

    public static set gradient(gradient: GradientInfo) {
        this._gradient = gradient;
        GlobalEvents.emitEvent("borderchange");
    }

    public static get gradient(): GradientInfo {
        return this._gradient;
    }

    public static apply(canvas : Canvas) : void {
        canvas.clear();

        if (this.type === "none" || this.size === 0) {
            return;
        } else if (this.type === "solid") {
            canvas.fill(this.color);
            canvas.blendMode = "destination-out";
            canvas.fillCircleInRect(canvas.size.toRectangle().expand(1 - this.size), "white");
            canvas.blendMode = "source-over";
        } else if (this.type === "gradient") {
            let p1 = this.gradient.p1.times(canvas.size);
            let p2 = this.gradient.p2.times(canvas.size);
            let gradient = canvas.context.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            this.gradient.gradient.forEach((def) => {
                gradient.addColorStop(def.pos, def.color);
            });
            canvas.context.fillStyle = gradient;
            canvas.context.fillRect(0, 0, canvas.width, canvas.height);
            canvas.blendMode = "destination-out";
            canvas.fillCircleInRect(canvas.size.toRectangle().expand(1 - this.size), "white");
            canvas.blendMode = "source-over";
        }
    }
}