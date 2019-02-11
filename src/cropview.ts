import { Widget } from "./widget";
import { createElement, makePixelated } from "./util";
import { Canvas } from "./canvas";
import { Settings } from "./avatarcropper";
import { Renderer } from "./renderer";

type MouseAction = "move" | "resize" | "new" | "none";
type Point = { x : number, y : number };

export interface ShallowCircle
{
    x : number;
    y : number;
    diameter : number;
}

class Circle implements ShallowCircle
{
    public x : number = 0;
    public y : number = 0;
    public diameter : number = 1;
    private cropView : CropView;
    private _origin : ShallowCircle;

    constructor(cropView : CropView)
    {
        this.cropView = cropView;
        this.saveOrigin();
    }

    public get radius() : number
    {
        return this.diameter / 2;
    }

    public set radius(radius : number)
    {
        this.diameter = radius * 2;
    }

    public reset() : void
    {
        this.x = 0;
        this.y = 0;
        this.diameter = this.cropView.minDim / 2;
    }

    public get point() : Point
    {
        return { x: this.x, y: this.y };
    }

    public get shallowCircle() : ShallowCircle
    {
        return {
            x: this.x,
            y: this.y,
            diameter: this.diameter
        };
    }

    public saveOrigin() : void
    {
        this._origin = this.shallowCircle;
    }
    
    public get origin() : ShallowCircle
    {
        return this._origin;
    }

    public validate() : void
    {
        if (this.x < 0) this.x = 0;
        if (this.y < 0) this.y = 0;
        if (this.x + this.diameter > this.cropView.outerWidth) this.x = this.cropView.outerWidth - this.diameter;
        if (this.y + this.diameter > this.cropView.outerHeight) this.y = this.cropView.outerHeight - this.diameter; 
    }
}

export class CropView extends Widget
{
    public readonly image : HTMLImageElement;
    public readonly overlay : Canvas;
    private _isZoomFitted : boolean = false;
    private _zoomFactor : number = 1;
    private currentRotation = 0;
    public currentFileType : string;
    private circle : Circle;
    private _width : number;
    private _height : number;
    private _filename : string;
    private currentAction : MouseAction;
    private mouseOrigin : Point;
    public readonly settings : Settings;
    private readonly renderer : Renderer;
    private loadingImage : boolean = false;
    private antialiased : boolean;
    
    constructor(settingsObject : Settings)
    {
        super(createElement("div", "cropView"));

        this.createEvent("update");
        this.createEvent("imagechange");
        this.createEvent("antialiaschange");

        this.on("update", this.renderOverlay.bind(this));

        this.settings = settingsObject;
        this.circle = new Circle(this);
        this.renderer = new Renderer(this);

        this.image = <HTMLImageElement>createElement("img", "image");
        (<any>this.image.style)["transform-origin"] = "top left";

        this.overlay = new Canvas({
            deepCalc: true
        });

        this.appendChild(this.image, this.overlay.canvas);

        document.body.appendChild(this.renderer.container);

        this.overlay.mouse.addEventListener("move", this.mouseMove.bind(this));
        this.overlay.mouse.addEventListener("down", this.mouseDown.bind(this));
    
        this.overlay.canvas.addEventListener("touchmove", (e) => 
        {
            if (!(this.currentAction === "new" || this.currentAction === "none"))
            {
                e.preventDefault();
            }
        });

        document.body.addEventListener("mouseup", () =>
        {
            this.currentAction = "none";
            this.emitEvent("update");
        });

        document.body.addEventListener("touchend", () =>
        {
            this.currentAction = "none";
            this.emitEvent("update");
        });
    
        //this.overlay.mouse.addEventListener("leave", this.overlay.mouse.events.up[0]);
        this.antialias = this.settings.antialias;
    }

    public get rotation() : number
    {
        return this.currentRotation;
    }

    public get cropArea() : ShallowCircle
    {
        return this.circle.shallowCircle;
    }

    public get zoomFactor() : number
    {
        return this._zoomFactor;
    }

    public refresh() : void
    {
        this.renderOverlay();
        this.emitEvent("update");
    }

    public reactTMToRefresh()
    {
        this.isZoomFitted && this.zoomFit();
    }

    private renderOverlay() : void
    {
        // draw mask //
        if (this.settings.maskOpacity !== 1)
        {
            this.overlay.clear();
        }

        if (this.settings.maskOpacity !== 0)
        {
            this.overlay.fill("rgba(0,0,0," + this.settings.maskOpacity + ")");

            this.overlay.blendMode = "destination-out";
            if (this.settings.previewMode === "circle")
            {
                this.overlay.fillCircleInSquare(this.circle.x, this.circle.y, this.circle.diameter, "white");
            }
            else
            {
                this.overlay.fillRect(this.circle.x, this.circle.y, this.circle.diameter, this.circle.diameter, "white");
            }
        }

        this.overlay.blendMode = "source-over";

        if (this.settings.outlinesEnabled)
        {
            let lineWidth = ~~(1 / this.zoomFactor) + 1;
            let sharp = lineWidth % 3 === 0;

            this.overlay.lineDash = [ Math.min(this.overlay.width, this.overlay.height) / 100 ];
            
            if (this.settings.previewMode === "circle")
            {
                this.overlay.drawCircleInSquare(this.circle.x, this.circle.y, this.circle.diameter, "white", lineWidth);
            }
            this.overlay.drawRect(this.circle.x, this.circle.y, this.circle.diameter, this.circle.diameter, "white", lineWidth, sharp);
        }
    }

    // returns size of image (internal res of image) //
    public get innerWidth() : number
    {
        return this._width;
    }

    public get innerHeight() : number
    {
        return this._height;
    }

    // returns sizes taking rotation into consideration (internal res of overlay) //
    public get outerWidth() : number
    {
        return this.overlay.width;
    }

    public get outerHeight() : number
    {
        return this.overlay.height;
    }

    public get width() : number
    {
        return this.container.getBoundingClientRect().width;
    }

    public get height() : number
    {
        return this.container.getBoundingClientRect().height;
    }

    public get minDim() : number
    {
        return Math.min(this._width, this._height);
    }

    private get isZoomFitted() : boolean
    {
        return this._isZoomFitted;
    }

    private set isZoomFitted(z : boolean)
    {
        this._isZoomFitted = z;

        if (z)
        {
            this.container.style.overflow = "hidden";
        }
        else
        {
            this.container.style.overflow = "";
        }
    }

    public zoom(factor? : number) : void
    {
        this.container.scrollTop = 0;
        this.container.scrollLeft = 0;
        let rotatePart = "";
    
        if (this.image.style.transform.indexOf(" rotate") !== -1) {
            rotatePart = this.image.style.transform.substr(
                this.image.style.transform.indexOf(" rotate")
            );
        }
    
        factor = factor || this.zoomFactor;
        this._zoomFactor = factor;
        this.overlay.zoom(factor);
        this.image.style.transform = "scale(" + factor + "," + factor + ")";

        this.image.style.transform += rotatePart;
    
        let r = this.image.getBoundingClientRect();
        
        if (r.left !== 0)
        {
            let current = parseFloat(this.image.style.left || "0px");
            current -= r.left;
    
            this.image.style.left = current + "px";
        }
        
        if (r.top !== 0)
        {
            let current = parseFloat(this.image.style.top || "0px");
            current -= r.top;
    
            this.image.style.top = current + "px";
        }

        this.refresh();
    }

    public zoomIn() : void
    {
        this.isZoomFitted = false;
        this.zoom(this.zoomFactor * 1.1);
    }
    
    public zoomOut() : void
    {
        this.isZoomFitted = false;
        this.zoom(this.zoomFactor / 1.1);
    }

    public zoomFit(force : boolean = true) : void
    {    
        if (!this.image)
        {
            return;
        }
    
        if (!this.isZoomFitted && !force)
        {
            return;
        }
        
        this.isZoomFitted = true;
    
        /*if (detectIE() !== false) {
            zoom(1);
            return;
        }*/

        var cr = this.container.getBoundingClientRect();
        var ir = { width: this.overlay.width, height: this.overlay.height };
    
        var fw = cr.width / ir.width;
        var fh = cr.height / ir.height;
        var f = Math.min(fw, fh);
    
        //document.getElementById("container-canvas").style["width"] = cr.width + "px";
    
        this.zoom(f);
        //console.log("---");
        //console.log("zoom1: ", nr.height / ir.height);
    
        /*window.requestAnimationFrame(function() {
    
            var delta = container.scrollWidth - container.clientWidth;
            //console.log("dx: ", delta);
        
            if (delta > 0) {
                nr.width -= delta;
                nr.height -= (ir.height / ir.width) * delta;
                zoom(nr.height / ir.height);
                //console.log("zoomx: ", nr.height / ir.height);
            }
        
            delta = container.scrollHeight - container.clientHeight;
            //console.log("dy: ", delta);
        
            if (delta > 0) {
                nr.height -= delta;
                nr.width -= (ir.width / ir.height) * delta;
        
                zoom(nr.height / ir.height);
                //console.log("zoomy: ", nr.height / ir.height);
            }
    
        });*/
    }

    public rotate(deg? : number) : void
    {
        let odeg = this.currentRotation;
        if (deg === undefined) deg = this.currentRotation;
    
        this.currentRotation = deg;
        
        if (this.image.style.transform.indexOf(" rotate") !== -1)
        {
            this.image.style.transform = this.image.style.transform.substr(
                0,
                this.image.style.transform.indexOf(" rotate")
            );
        }
    
        let b4 = this.image.style.transform;
    
        this.image.style.left = "0px";
        this.image.style.top = "0px";
    
        this.overlay.resize(this.image.width, this.image.height);
    
        let or = this.image.getBoundingClientRect();
    
        this.image.style.transform = b4 + " rotate(" + deg + "deg)";
    
        let r = this.image.getBoundingClientRect();
        let dx = -r.left;
        let dy = -r.top;
        
        this.image.style.left = dx + "px";
        this.image.style.top = dy + "px";
    
        this.overlay.width *= (r.width / or.width);
        this.overlay.height *= (r.height / or.height);
    
        /*let circleMagnitude = Math.sqrt(
            Math.pow(this.overlay.width - circle.cx(), 2) +
            Math.pow(this.overlay.height - circle.cy(), 2)
        );
    
        let rad = ((deg - 90) / 180) * Math.PI;
        let orad = ((odeg - 90) / 180) * Math.PI;
    
        let cdx = Math.cos(rad) - Math.cos(orad);
        let cdy = Math.sin(rad) - Math.sin(orad);
        cdx *= circleMagnitude;
        cdy *= circleMagnitude;
    
        circle.x += cdx;
        circle.y += cdy;*/
    
        this.isZoomFitted && this.zoomFit();
        this.circle.validate();
        this.emitEvent("update");
    }

    public set antialias(antialias : boolean)
    {
        makePixelated(this.image, !antialias);
        this.overlay.pixelated = !antialias;

        this.antialiased = antialias;
        this.emitEvent("antialiaschange", this.antialiased);
    }

    public get antialias() : boolean
    {
        return this.antialiased;
    }

    public setImageFromFile(file : File)
    {
        if (!file || file.type.split("/")[0] !== "image" || this.loadingImage)
        {
            return;
        }

        this.currentFileType = file.type.split("/")[1] === "gif" ? "gif" : "png";
        this._filename = file.name.substring(0, file.name.lastIndexOf('.')) + "_cropped." + this.currentFileType;

        this.loadingImage = true;
        Canvas.fileToImage(file, this.setImageFromFileHelper.bind(this), false);
    }

    private setImageFromFileHelper(image : HTMLImageElement)
    {
        if (this.image.src)
        {
            URL.revokeObjectURL(this.image.src);
        }

        this.overlay.resize(image.width, image.height);
        this.overlay.clear();

        this.image.width = image.width;
        this.image.height = image.height;
        this.image.src = image.src;

        this._width = this.image.width;
        this._height = this.image.height;

        this.circle.reset();
        this.zoomFit();
        this.rotate(0);

        this.emitEvent("imagechange", this.image.src);
        this.emitEvent("update");
        this.renderOverlay();
        this.loadingImage = false;
    }

    public flipHorizontal() : void
    {
        let c = new Canvas({ width: this.image.width, height: this.image.height });
        c.context.scale(-1, 1);
        c.drawImage(this.image, 0, 0, -this.image.width, this.image.height);
        c.context.setTransform(1, 0, 0, 1, 0, 0);

        this.loadingImage = true;
        c.createImage(this.flipHelper.bind(this), undefined, false);
    }

    public flipVertical() : void
    {
        let c = new Canvas({ width: this.image.width, height: this.image.height });
        c.context.scale(1, -1);
        c.drawImage(this.image, 0, 0, this.image.width, -this.image.height);
        c.context.setTransform(1, 0, 0, 1, 0, 0);

        this.loadingImage = true;
        c.createImage(this.flipHelper.bind(this), undefined, false);
    }

    private flipHelper(image : HTMLImageElement) : void
    {
        if (this.image.src)
        {
            URL.revokeObjectURL(this.image.src);
        }

        this.image.src = image.src;

        this.emitEvent("imagechange", this.image.src);
        this.emitEvent("update");
        this.renderOverlay();
        this.loadingImage = false;
    }

    public renderCroppedImage() : void
    {
        this.renderer.render();
    }

    public get filename() : string
    {
        return this._filename;
    }

    public get src() : string
    {
        return this.image.src || null;
    }

    private getMouseAction(x : number, y : number) : MouseAction
    {
        if (!(x <= this.circle.x
            || x >= this.circle.x + this.circle.diameter
            || y <= this.circle.y
            || y >= this.circle.y + this.circle.diameter))
        {
            // point is in rect=
            let cx = this.circle.x + this.circle.radius;
            let cy = this.circle.y + this.circle.radius;
            //console.log(x, y, cx, cy, Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2)));
            if (Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2)) < this.circle.radius)
            {
                // point is in circle
                return "move";
            }
            else
            {
                return "resize";
            }
        }
        else
        {
            return "new";
        }
    }

    private mouseDown(x : number, y : number) : void
    {
        var action = this.getMouseAction(x, y);
        this.currentAction = action;

        this.mouseOrigin = { x, y };
        this.circle.saveOrigin();
    }

    private mouseMove(x : number, y : number) : void
    {
        // determine what cursor to show //
        let action = this.currentAction;
        if (action === "none")
        {
            action = this.getMouseAction(x, y);
        }

        if (action === "move")
        {
            this.overlay.canvas.style.cursor = "move";
        }
        else if (action === "resize")
        {
            let xr = x < this.circle.x + this.circle.radius;
            let yr = y < this.circle.y + this.circle.radius;
            let thing = +xr ^ +yr; // nice
            this.overlay.canvas.style.cursor = thing ? "nesw-resize" : "nwse-resize";
        }
        else
        {
            this.overlay.canvas.style.cursor = "default";
        }

        // actually do stuff //
        if (this.currentAction === "none")
        {
            return;
        }
        else if (this.currentAction === "move")
        {
            let dx = x - this.mouseOrigin.x;
            let dy = y - this.mouseOrigin.y;
            this.circle.x = this.circle.origin.x + dx;
            this.circle.y = this.circle.origin.y + dy;
            this.circle.validate();
        }
        else if (this.currentAction === "resize")
        {
            this.performResize(x, y);
        }

        this.circle.x = Math.round(this.circle.x);
        this.circle.y = Math.round(this.circle.y);
        this.circle.diameter = Math.round(this.circle.diameter);

        if (this.circle.diameter !== this.circle.origin.diameter)
        {
            this.mouseOrigin = { x, y };
            this.circle.saveOrigin();
        }

        this.emitEvent("update");
    }

    private performResize(x : number, y : number)
    {
        let xr = x < this.circle.x + this.circle.radius;
        let yr = y < this.circle.y + this.circle.radius;
        let dx = x - this.mouseOrigin.x;
        let dy = y - this.mouseOrigin.y;

        if (xr) dx *= -1;
        if (yr) dy *= -1;

        let dd = Math.abs(dx) > Math.abs(dy) ? dx : dy;

        if (this.circle.origin.diameter + dd < 1)
        {
            dd = this.circle.diameter - 1;
        }

        if (xr)
        {
            if (yr)
            {
                if (this.circle.origin.x - dd < 0 || this.circle.origin.y - dd < 0)
                {
                    dd = Math.min(this.circle.origin.x, this.circle.origin.y);
                }
            }
            else
            {
                if (this.circle.origin.x - dd < 0 || this.circle.origin.y + this.circle.origin.diameter + dd > this.overlay.height)
                {
                    dd = Math.min(this.circle.origin.x, this.overlay.height - this.circle.origin.y - this.circle.origin.diameter);
                }
            }
        }
        else
        {
            if (yr)
            {
                if (this.circle.origin.x + this.circle.origin.diameter + dd > this.overlay.width || this.circle.origin.y - dd < 0)
                {
                    dd = Math.min(this.overlay.width - this.circle.origin.x - this.circle.origin.diameter, this.circle.origin.y);
                }
            }
            else
            {
                if (this.circle.origin.x + this.circle.origin.diameter + dd > this.overlay.width || this.circle.origin.y + this.circle.origin.diameter + dd > this.overlay.height)
                {
                    dd = Math.min(this.overlay.width - this.circle.origin.x - this.circle.origin.diameter, this.overlay.height - this.circle.origin.y - this.circle.origin.diameter);
                }
            }
        }
        
        if (this.circle.diameter > this.overlay.width)
        {
            // panic
            this.circle.x = 0;
            this.circle.y = 0;
            this.circle.diameter = this.overlay.width;
            alert("fuck");
        }
        else if (this.circle.diameter > this.overlay.height)
        {
            this.circle.x = 0;
            this.circle.y = 0;
            this.circle.diameter = this.overlay.height;
            alert("fuck");
        }
        else
        {
            this.circle.diameter = this.circle.origin.diameter + dd;
            this.circle.x = xr ? this.circle.origin.x - dd : this.circle.origin.x;
            this.circle.y = yr ? this.circle.origin.y - dd : this.circle.origin.y;
        }
    }
}