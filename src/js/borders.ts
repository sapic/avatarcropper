import { GlobalEvents } from "./eventclass";
import { Point } from "./point";
import { Canvas } from "./canvas";

export type GradientStop = {
    pos: number,
    color: string
};

export type GradientInfo = {
    name: string,
    gradient: GradientStop[],
    angle: number
};

export class Border {
    public static get defaults(): GradientInfo[] {
        return [
            {
                name: "LGBT Pride",
                angle: 0,
                gradient: [
                    { pos: 0/5, color: "#FF0018" },
                    { pos: 1/5, color: "#FFA52C" },
                    { pos: 2/5, color: "#FFFF41" },
                    { pos: 3/5, color: "#008018" },
                    { pos: 4/5, color: "#0000F9" },
                    { pos: 5/5, color: "#86007D" },
                ]
            },
            {
                name: "Trans Pride",
                angle: 0,
                gradient: [
                    { pos: 0, color: "#55CDFC" },
                    { pos: 0.25, color: "#F7A8B8" },
                    { pos: 0.5, color: "#FFFFFF" },
                    { pos: 0.75, color: "#F7A8B8" },
                    { pos: 1, color: "#55CDFC" }
                ]
            },
            {
                name: "Nonbinary Pride",
                angle: 0,
                gradient: [
                    { pos: 0/3, color: "#FFF430" },
                    { pos: 1/3, color: "#FFFFFF" },
                    { pos: 2/3, color: "#9C59D1" },
                    { pos: 3/3, color: "#000000" },
                ]
            },
        ];
    }

    private static _type: "none" | "solid" | "gradient" = "none";
    private static _size: number = 0.05;
    private static _color: string = "#FFAA00";
    private static _gradient: GradientInfo = Border.defaults[0];
    private static _shape: "circle" | "square" = "circle";

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

    public static set shape(shape: "circle" | "square") {
        this._shape = shape;
        GlobalEvents.emitEvent("borderchange");
    }

    public static get shape(): "circle" | "square" {
        return this._shape;
    }

    public static applyGradientToCanvas(gradientInfo : GradientInfo, canvas : Canvas) {
        let a1 = (-270 - gradientInfo.angle) * Math.PI / 180;
        let a2 = (-270 - (gradientInfo.angle + 180)) * Math.PI / 180;
        
        // https://math.stackexchange.com/questions/2468060/find-x-y-coordinates-of-a-square-given-an-angle-alpha
        let p1 = new Point(
            0.5 / Math.max(Math.abs(Math.cos(a1)), Math.abs(Math.sin(a1))) * Math.cos(a1),
            0.5 / Math.max(Math.abs(Math.cos(a1)), Math.abs(Math.sin(a1))) * Math.sin(a1),
        ).times(canvas.size).plus(canvas.size.dividedBy(2));
        
        let p2 = new Point(
            0.5 / Math.max(Math.abs(Math.cos(a2)), Math.abs(Math.sin(a2))) * Math.cos(a2),
            0.5 / Math.max(Math.abs(Math.cos(a2)), Math.abs(Math.sin(a2))) * Math.sin(a2),
        ).times(canvas.size).plus(canvas.size.dividedBy(2));

        // swap y values here since geometric y is inverted relative to screen y //
        let gradient = canvas.context.createLinearGradient(p1.x, p2.y, p2.x, p1.y);
        gradientInfo.gradient.forEach((def) => {
            gradient.addColorStop(def.pos, def.color);
        });
        canvas.context.fillStyle = gradient;
        canvas.context.fillRect(0, 0, canvas.width, canvas.height);
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
            this.applyGradientToCanvas(this.gradient, canvas);
            canvas.blendMode = "destination-out";
            if (this.shape === "circle") {
                canvas.fillCircleInRect(canvas.size.toRectangle().expand(1 - this.size), "white");
            } else {
                canvas.fillRect(canvas.size.toRectangle().expand(1 - this.size), "white");
            }
            canvas.blendMode = "source-over";
        }
    }
}