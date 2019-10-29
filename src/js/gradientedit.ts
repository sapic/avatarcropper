import { Widget } from "./widget";
import { Canvas } from "./canvas";
import { Point } from "./point";
import { GradientInfo, Border, GradientStop } from "./borders";
import { InputDialog } from "./inputdialog";
import { createElement, array_last, array_remove, createOptionElement } from "./util";
import { LabelSlider } from "./labeledslider";
import { AvatarCropper } from "./avatarcropper";

// what fucked up design pattern is this //
export class GradientEditButton extends Widget {
    private canvas: Canvas;
    private _gradient: GradientInfo;

    constructor(resolution: Point) {
        super();
        this.canvas = new Canvas({ size: resolution });
        this.container = this.canvas.canvas;
        this.createEvent("update");

        this.container.addEventListener("click", () => {
            let d = new GradientEditDialog(this.gradient);
            d.on("return", (gradient: GradientInfo) => {
                this.emitEvent("update", gradient);
            });
            document.getElementById("container").appendChild(d.container);
            d.show();
        });
    }

    public set gradient(gradient: GradientInfo) {
        if (gradient !== null) {
            this._gradient = gradient;
            Border.applyGradientToCanvas(gradient, this.canvas);
        }
    }

    public get gradient(): GradientInfo {
        return this._gradient;
    }
}

class GradientEditDialog extends InputDialog<GradientInfo> {
    private previewCanvas: Canvas;
    private gradientSlider: GradientSlider;
    private gradientInfo: GradientInfo;
    private angleSlider: LabelSlider;
    private colorSelect: HTMLInputElement;
    private dirty: boolean = true;

    constructor(gradientInfo: GradientInfo) {
        super();
        this.container.classList.add("gradientEdit");
        this.gradientInfo = gradientInfo;

        let leftCol = createElement("div", "leftCol");
        let rightCol = createElement("div", "rightCol");

        // preview canvas //
        this.previewCanvas = new Canvas({ size: new Point(500) });
        this.previewCanvas.canvas.classList.add("preview")
        Border.applyGradientToCanvas(this.gradientInfo, this.previewCanvas);
        leftCol.appendChild(this.previewCanvas.canvas);

        // presets //
        let presetRow = createElement("div", "row");

        let presetLabel = createElement("span", "label");
        presetLabel.innerText = "Preset:";
        presetRow.appendChild(presetLabel);

        let presetSelect = createElement("select") as HTMLSelectElement;
        presetSelect.add(createOptionElement("Select one...", ""));
        AvatarCropper.settings.borderPresets.forEach((preset) => {
            presetSelect.add(createOptionElement(preset.name, JSON.stringify(preset)));
        });
        presetRow.appendChild(presetSelect);

        let load = createElement("button");
        load.innerText = "Load this preset";
        load.addEventListener("click", () => {
            if (presetSelect.value) {
                this.gradientInfo = JSON.parse(presetSelect.value);
                this.gradientSlider.stops = this.gradientInfo.gradient;
                this.dirty = true;
            }
        });
        presetRow.appendChild(load);

        let overwrite = createElement("button");
        overwrite.innerText = "Overwrite this preset";
        overwrite.addEventListener("click", () => {
            if (presetSelect.value) {
                AvatarCropper.settings.borderPresets[presetSelect.selectedIndex - 1] = this.gradientInfo;
                presetSelect.selectedOptions[0].value = JSON.stringify(this.gradientInfo);
                AvatarCropper.saveSettings();
            }  else {
                alert("Please select a valid preset or save as new preset.");
            }
        });
        presetRow.appendChild(overwrite);

        let saveNew = createElement("button");
        saveNew.innerText = "Save as new preset";
        saveNew.addEventListener("click", () => {
            let name = prompt("Name the new preset:");
            if (name === null) {
                // cancelled
            } else if (!name) {
                alert("That name is invalid.");
            } else {
                if (AvatarCropper.settings.borderPresets.some(preset => preset.name.toLowerCase() === name.toLowerCase())) {
                    alert("That name is already taken.");
                } else {
                    this.gradientInfo.name = name;
                    AvatarCropper.settings.borderPresets.push(this.gradientInfo);
                    AvatarCropper.saveSettings();
                    presetSelect.add(createOptionElement(name, JSON.stringify(this.gradientInfo)));
                    presetSelect.selectedIndex = AvatarCropper.settings.borderPresets.length; // no - 1 because theres an extra at the beginning of the select
                }
            }
        });
        presetRow.appendChild(saveNew);

        let deletePreset = createElement("button");
        deletePreset.innerText = "Delete this preset";
        deletePreset.addEventListener("click", () => {
            if (presetSelect.value && confirm("Are you sure you want to delete this preset?")) {
                let index = presetSelect.selectedIndex - 1;
                AvatarCropper.settings.borderPresets.splice(index, 1);
                AvatarCropper.saveSettings();
                presetSelect.remove(index + 1);
            }
        });
        presetRow.appendChild(deletePreset);

        rightCol.appendChild(presetRow);

        // gradient slider //
        this.gradientSlider = new GradientSlider(new Point(500, 28), this.gradientInfo);
        this.gradientSlider.on("update", (stops: GradientStop[]) => {
            this.gradientInfo.gradient = stops;
        });
        this.gradientSlider.on("colorchange", (color: string) => {
            this.colorSelect.value = color;
        });
        rightCol.appendChild(this.gradientSlider.container);

        // color select //
        this.colorSelect = createElement("input") as HTMLInputElement;
        this.colorSelect.type = "color";
        this.colorSelect.value = this.gradientSlider.currentStopColor;
        this.colorSelect.addEventListener("change", () => {
            this.gradientSlider.currentStopColor = this.colorSelect.value;
        });
        rightCol.appendChild(this.colorSelect);

        // buttons //
        let buttonRow = createElement("div", "row");

        let add = createElement("button");
        add.innerText = "Add stop";
        add.addEventListener("click", () => {
            this.gradientSlider.addStop();
        });
        buttonRow.appendChild(add);

        let remove = createElement("button");
        remove.innerText = "Remove stop";
        remove.addEventListener("click", () => {
            this.gradientSlider.removeStop();
        });
        buttonRow.appendChild(remove);

        let equidistant = createElement("button");
        equidistant.innerText = "Make stops equidistant";
        equidistant.addEventListener("click", () => {
            this.gradientSlider.makeEquidistant();
        });
        buttonRow.appendChild(equidistant);
        rightCol.appendChild(buttonRow);

        // angle slider //
        this.angleSlider = new LabelSlider(0, 360, 1, "Angle", "angleSlider");
        this.angleSlider.value = gradientInfo.angle;

        this.angleSlider.on("slide", () => {
            this.gradientInfo.angle = this.angleSlider.value;
            this.dirty = true;
        });
        rightCol.appendChild(this.angleSlider.container);

        // ok and cancel //
        let saveRow = createElement("div", "row");
        
        let ok = createElement("button", "ok");
        ok.innerText = "OK";
        ok.addEventListener("click", () => {
            this.emitEvent("return", this.gradientInfo);
            this.hide();
        });

        let cancel = createElement("button", "cancel");
        cancel.innerText = "Cancel";
        cancel.addEventListener("click", () => {
            this.hide();
        });

        saveRow.appendChild(cancel);
        saveRow.appendChild(ok);
        rightCol.appendChild(saveRow);

        // finalize //
        this.appendChild(
            leftCol,
            rightCol
        );
        
        this._draw();
    }
    
    public dismiss(): void {
        if (!this.gradientSlider.isDragging) {
            this.hide();
        }
    }

    private _draw(): void {
        if (this.gradientSlider.dirty || this.dirty) {
            Border.applyGradientToCanvas(this.gradientInfo, this.previewCanvas);
            this.gradientSlider.draw();
            this.dirty = false;
        }

        requestAnimationFrame(() => this._draw());
    }
}

class GradientSlider extends Widget {
    private gradientCanvas: Canvas;
    private stopElements: HTMLElement[] = [];
    private lastTouched : HTMLElement;
    private dragging: HTMLElement;
    private dragOriginX: number;
    private elementOriginX: number;
    public dirty: boolean = true;
    private _stops: GradientStop[] = [];

    constructor(size: Point, gradient: GradientInfo) {
        super("gradientSlider");

        this.createEvent("update");
        this.createEvent("currentstopchange");

        this.gradientCanvas = new Canvas({ size });

        document.addEventListener("mouseup", () => {
            setTimeout(() => this.dragging = null, 1);
        });

        document.addEventListener("touchend", () => {
            setTimeout(() => this.dragging = null, 1);
        });

        document.addEventListener("mousemove", this.drag.bind(this));
        document.addEventListener("touchmove", this.drag.bind(this));

        this.appendChild(this.gradientCanvas.canvas);
        this.stops = gradient.gradient.sort((a, b) => a.pos - b.pos);
    }

    public set stops(stops: GradientStop[]) {
        this._stops = stops;
        this.stopElements.forEach((element) => {
            this.removeChild(element);
        });
        this.stopElements = this.stops.map(this.createStop.bind(this));
        this.makeLastTouched(this.stopElements[0]);
        this.appendChild(...this.stopElements);
    }

    public get stops(): GradientStop[] {
        return this._stops;
    }

    private get width() {
        return this.gradientCanvas.width;
    }

    private get height() {
        return this.gradientCanvas.height;
    }

    private get trackWidth() {
        return this.width - this.height;
    }

    private applyMousedown(stopElement: HTMLElement, clientX: number) {
        this.dragging = stopElement;
        this.dragOriginX = clientX;
        this.elementOriginX = parseInt(stopElement.style.left);
        this.makeLastTouched(stopElement);
    }

    private makeLastTouched(stopElement: HTMLElement) {
        if (this.lastTouched) {
            this.lastTouched.classList.remove("current");
            this.lastTouched.style.zIndex = "0";
        }
        this.lastTouched = stopElement;
        this.lastTouched.classList.add("current");
        this.lastTouched.style.zIndex = "1";
        this.emitEvent("colorchange", this.lastTouched.getAttribute("color"));
    }

    private createStop(info : GradientStop) {
        let r = this.gradientCanvas.size.x - this.gradientCanvas.size.y;
        let stop = createElement("div", "stop");
        stop.style.left = (r * info.pos).toString() + "px";
        stop.setAttribute("color", info.color);
        stop.style.backgroundColor = info.color;
        stop.addEventListener("mousedown", (e) => {
            this.applyMousedown(stop, e.clientX);
        });
        stop.addEventListener("touchstart", (e) => {
            this.applyMousedown(stop, e.touches[0].clientX);
        });
        return stop;
    }

    public set currentStopColor(color: string) {
        if (this.lastTouched) {
            this.lastTouched.setAttribute("color", color);
            this.lastTouched.style.backgroundColor = color;
            this.update();
        }
    }
    
    public get currentStopColor(): string {
        return this.lastTouched.getAttribute("color");
    }

    public get isDragging(): boolean {
        return !!this.dragging;
    }

    private drag(e: MouseEvent | TouchEvent) {
        if (this.dragging) {
            let clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
            if (e instanceof TouchEvent) {
                e.preventDefault();
            }
            let diff = this.dragOriginX - clientX;
            let x = this.elementOriginX - diff;
            x = Math.max(0, x);
            x = Math.min(this.trackWidth, x);
            this.dragging.style.left = x.toString() + "px";
            this.update();
        }
    }

    private update() {
        this._stops = this.stopElements.map((stop) => {
            return {
                pos: parseInt(stop.style.left) / (this.trackWidth),
                color: stop.getAttribute("color")
            };
        });

        this.dirty = true;

        this.emitEvent("update", this.stops);
    }

    public draw(): void {
        Border.applyGradientToCanvas({ angle: 270, gradient: this.stops, name: "" }, this.gradientCanvas);
        this.dirty = false;
    }

    public addStop(): void {
        // sort elements left to right //
        this.stopElements.sort((a, b) => parseInt(a.style.left) - parseInt(b.style.left));

        // get reference info //
        let ref = this.lastTouched || this.stopElements[0];
        let li = this.stopElements.indexOf(ref);

        // put new stop between ref and something else //
        let offset = li < this.stopElements.length - 1 ? 1 : -1;
        let newStop = this.createStop({
            color: "white",
            pos: (parseInt(ref.style.left) + parseInt(this.stopElements[li + offset].style.left)) / 2 / (this.trackWidth)
        });

        this.stopElements.push(newStop);
        this.appendChild(newStop);
        this.makeLastTouched(newStop);
        this.update();
    }

    public removeStop(): void {
        // don't remove if only 2 //
        if (this.stopElements.length === 2) {
            return;
        }

        // sort elements left to right //
        this.stopElements.sort((a, b) => parseInt(a.style.left) - parseInt(b.style.left));

        // remove either last touched or last element //
        let toRemove = this.lastTouched || array_last(this.stopElements);

        array_remove(this.stopElements, toRemove);
        this.removeChild(toRemove);
        this.makeLastTouched(this.stopElements[0]);
        this.update();
    }

    public makeEquidistant(): void {
        // sort elements left to right //
        this.stopElements.sort((a, b) => parseInt(a.style.left) - parseInt(b.style.left));

        this.stopElements.forEach((stop, i) => {
            stop.style.left = ((i / (this.stopElements.length - 1)) * (this.trackWidth)).toString() + "px";
        });

        this.update();
    }
}