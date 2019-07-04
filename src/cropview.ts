import { Widget } from "./widget";
import { createElement, makePixelated } from "./util";
import { Canvas } from "./canvas";
import { Settings } from "./avatarcropper";
import { Renderer } from "./renderer";
import { Point } from "./point";
import { Rectangle, RectAnchor } from "./rectangle";
import { KeyManager, Keys } from "./keymanager";

type MouseAction = "move" | "resize" | "new" | "none";

class Circle extends Rectangle
{
    private cropView : CropView;
    private _origin : Rectangle;

    constructor(cropView : CropView)
    {
        super(new Point(), new Point());
        this.cropView = cropView;
        this.saveOrigin();
    }

    public get radius() : Point
    {
        return this.size.dividedBy(2);
    }

    public set radius(radius : Point)
    {
        this.size = radius.times(2);
    }

    public reset() : void
    {
        this.position = new Point(0);
        this.size = new Point(this.cropView.outerRect.size.min / 2);
    }

    public get rectangle() : Rectangle
    {
        return this.copy();
    }

    public saveOrigin() : void
    {
        this._origin = this.copy();
    }
    
    public get origin() : Rectangle
    {
        return this._origin;
    }

    public validate() : number
    {
        let ret = 0b00000000;

        if (this.width > this.cropView.outerWidth)
        {
            this.setWidthKeepAR(this.cropView.outerWidth);
            ret |= 1;
        }

        if (this.height > this.cropView.outerHeight)
        {
            this.setHeightKeepAR(this.cropView.outerHeight);
            ret |= 2;
        }

        if (this.x < 0) 
        {
            this.x = 0;
            ret |= 4;
        }

        if (this.y < 0)
        {
            this.y = 0;
            ret |= 8;
        }

        if (this.bottom > this.cropView.outerHeight)
        {
            this.bottom = this.cropView.outerHeight;
            ret |= 16;
        }

        if (this.right > this.cropView.outerWidth)
        {
            this.right = this.cropView.outerWidth;
            ret |= 32;
        }

        return ret;
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
    private _filename : string;
    private currentAction : MouseAction;
    private mouseOrigin : Point;
    private resizeAnchor : Point;
    private resizeOffset : Point;
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
        this.once("update", () => console.log("sup"));

        this.settings = settingsObject;
        this.circle = new Circle(this);
        this.renderer = new Renderer(this);

        this.image = <HTMLImageElement>createElement("img", "image");
        this.image.style.transformOrigin = "top left";

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
            let ca = this.currentAction;
            this.currentAction = "none";
            if (ca !== "none")
            {
                this.refresh();
            }
        });

        document.body.addEventListener("touchend", () =>
        {
            let ca = this.currentAction;
            this.currentAction = "none";
            if (ca !== "none")
            {
                this.refresh();
            }
        });

        // move circle around with arrow keys //
        window.addEventListener("keydown", e => this.handleKeypress(e.keyCode));
    
        //this.overlay.mouse.addEventListener("leave", this.overlay.mouse.events.up[0]);
        this.antialias = this.settings.antialias;
    }

    private handleKeypress(key : number)
    {
        if (KeyManager.isArrowKey(key))
        {
            console.log( KeyManager.axis(Keys.right, Keys.left))
            this.circle.x += KeyManager.axis(Keys.right, Keys.left);
            this.circle.y += KeyManager.axis(Keys.down, Keys.up);
            this.refresh();
        }
    }

    public get rotation() : number
    {
        return this.currentRotation;
    }

    public get cropArea() : Rectangle
    {
        return this.circle.rectangle;
    }

    public get zoomFactor() : number
    {
        return this._zoomFactor;
    }

    public refresh() : void
    {
        this.emitEvent("update"); // renders overlay
    }

    public reactTMToRefresh()
    {
        this.isZoomFitted && this.zoomFit();
    }

    private renderOverlay() : void
    {
        console.log("rendering overlay");
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
                this.overlay.fillCircleInRect(this.circle.x, this.circle.y, this.circle.size.x, this.circle.size.y, "white");
            }
            else
            {
                this.overlay.fillRect(this.circle.x, this.circle.y, this.circle.size.x, this.circle.size.y, "white");
            }
        }

        this.overlay.blendMode = "source-over";
        let lineWidth = ~~(1 / this.zoomFactor) + 1;

        if (this.settings.outlinesEnabled)
        {
            let sharp = lineWidth % 2 === 1;

            this.overlay.lineDash = [ Math.min(this.overlay.width, this.overlay.height) / 100 ];
            
            if (this.settings.previewMode === "circle")
            {
                this.overlay.drawCircleInRect(this.circle.x, this.circle.y, this.circle.size.x, this.circle.size.y, "white", lineWidth);
            }

            this.overlay.drawRect(
                this.circle.x - lineWidth,
                this.circle.y - lineWidth,
                this.circle.width + lineWidth,
                this.circle.height + lineWidth,
                "white",
                lineWidth,
                sharp
            );
        }

        if (this.settings.guidesEnabled)
        {
            this.overlay.drawLine(this.circle.cx, this.circle.cy, this.circle.cx, this.circle.bottom, "white", lineWidth);
            this.overlay.drawLine(this.circle.cx, this.circle.cy, this.circle.cx, this.circle.top, "white", lineWidth);
            this.overlay.drawLine(this.circle.cx, this.circle.cy, this.circle.right, this.circle.cy, "white", lineWidth);
            this.overlay.drawLine(this.circle.cx, this.circle.cy, this.circle.left, this.circle.cy, "white", lineWidth);
            this.overlay.context.lineDashOffset = this.overlay.context.getLineDash()[0];
            this.overlay.drawLine(this.circle.cx, this.circle.cy, this.circle.cx, this.circle.bottom, "cyan", lineWidth);
            this.overlay.drawLine(this.circle.cx, this.circle.cy, this.circle.cx, this.circle.top, "cyan", lineWidth);
            this.overlay.drawLine(this.circle.cx, this.circle.cy, this.circle.right, this.circle.cy, "cyan", lineWidth);
            this.overlay.drawLine(this.circle.cx, this.circle.cy, this.circle.left, this.circle.cy, "cyan", lineWidth);
            this.overlay.context.lineDashOffset = 0;
            this.overlay.drawLine(this.circle.cx - lineWidth * 2, this.circle.cy, this.circle.cx + lineWidth * 2, this.circle.cy, "cyan", lineWidth);
            this.overlay.drawLine(this.circle.cx, this.circle.cy - lineWidth * 2, this.circle.cx, this.circle.cy + lineWidth * 2, "cyan", lineWidth);
        }

        /*let theta = (90 - this.rotation) / 180 * Math.PI;
        let cot = (t) => 1 / Math.tan(t);
        
        let cx = this.outerWidth / 2;
        let cy = this.outerHeight / 2;
        
        let circleX = this.circle.cx;
        let circleY = this.circle.cy;

        let xc = circleX - cx;
        let yc = cy - circleY;

        //console.log(cx, cy, circleX, circleY, dx, dy);

        (<any>window).z = theta;

        let f = (x) => Math.tan(theta) * x;
        let fp = (x) => -cot(theta) * x;
        let yy = yc - fp(xc);
        let fpc = (x) => -cot(theta) * x + yc + cot(theta) * xc;
        let ix = yy / (Math.tan(theta) + cot(theta));
        let iy = fpc(ix);

        console.log(xc, yc);

        this.overlay.drawLine(cx, cy, cx + 500, cy - f(500), "red", 2);
        this.overlay.drawLine(cx, cy, cx - 500, cy - f(-500), "red", 2);

        this.overlay.drawLine(cx, cy, cx + 500, cy - fp(500), "red", 2);
        this.overlay.drawLine(cx, cy, cx - 500, cy - fp(-500), "red", 2);

        this.overlay.drawLine(circleX, circleY, circleX, circleY + yy, "green", 2);
        this.overlay.drawLine(circleX, circleY, cx + ix, cy - iy, "blue", 2);*/
    }

    // returns size of image (internal res of image) //
    public get innerRect() : Rectangle
    {
        return new Rectangle(Point.Zero, new Point(this.image.width, this.image.height));
    }

    public get innerWidth() : number
    {
        return this.image.width;
    }

    public get innerHeight() : number
    {
        return this.image.height;
    }

    // returns sizes taking rotation into consideration (internal res of overlay) //
    public get outerRect() : Rectangle
    {
        return new Rectangle(Point.Zero, new Point(this.overlay.width, this.overlay.height));
    }

    public get outerWidth() : number
    {
        return this.overlay.width;
    }

    public get outerHeight() : number
    {
        return this.overlay.height;
    }

    public get apparentWidth() : number
    {
        return this.container.getBoundingClientRect().width;
    }

    public get apparentHeight() : number
    {
        return this.container.getBoundingClientRect().height;
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

    public zoom(factor? : number, shouldUpdate : boolean = true) : void
    {
        let ogScrollTopP = this.container.scrollTop / this.container.scrollHeight;
        let ogScrollLeftP = this.container.scrollLeft / this.container.scrollWidth;

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

        shouldUpdate && this.refresh();

        this.container.scrollTop = ogScrollTopP * this.container.scrollHeight;
        this.container.scrollLeft = ogScrollTopP * this.contentContainer.scrollWidth;
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

    public zoomFit(force : boolean = true, shouldUpdate : boolean = true) : void
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
    
        this.zoom(f, shouldUpdate);
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

    public rotate(deg? : number, shouldUpdate : boolean = true) : void
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
        let dx = -r.left - this.container.scrollLeft;
        let dy = -r.top - this.container.scrollTop;
        
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
    
        this.zoomFit(false, shouldUpdate);
        this.circle.validate();
        shouldUpdate && this.emitEvent("update");
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

    public setImageFromFile(file : File) : boolean
    {
        if (!file || file.type.split("/")[0] !== "image" || this.loadingImage)
        {
            return false;
        }

        this.currentFileType = file.type.split("/")[1] === "gif" ? "gif" : "png";
        this._filename = file.name.substring(0, file.name.lastIndexOf('.')) + "_cropped." + this.currentFileType;

        this.loadingImage = true;
        Canvas.fileToImage(file, this.setImageFromFileHelper.bind(this), false);
        return true;
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

        this.circle.reset();
        this.zoomFit(true, false);
        this.rotate(0, false);

        this.emitEvent("imagechange", this.image.src);
        this.refresh();
        this.loadingImage = false;
    }

    public flipHorizontal() : void
    {
        let c = new Canvas({ width: this.image.width, height: this.image.height });
        c.context.scale(-1, 1);
        c.drawImage(this.image, 0, 0, -this.image.width, this.image.height);
        c.context.setTransform(1, 0, 0, 1, 0, 0);

        this.loadingImage = true;
        c.createImage((img) =>
        {
            this.flipHelper(img, true);
        }, undefined, false);
    }

    public flipVertical() : void
    {
        let c = new Canvas({ width: this.image.width, height: this.image.height });
        c.context.scale(1, -1);
        c.drawImage(this.image, 0, 0, this.image.width, -this.image.height);
        c.context.setTransform(1, 0, 0, 1, 0, 0);

        this.loadingImage = true;
        c.createImage((img : HTMLImageElement) =>
        {
            this.flipHelper(img, false);
        }, undefined, false);
    }

    private flipHelper(image : HTMLImageElement, horizontal : boolean) : void
    {
        if (this.image.src)
        {
            URL.revokeObjectURL(this.image.src);
        }

        this.image.onload = () =>
        {
            this.rotate(-this.rotation, false);
            if (horizontal)
            {
                this.circle.cx = this.outerWidth - this.circle.cx;
            }
            else
            {
                this.circle.cy = this.outerHeight - this.circle.cy;
            }
            this.emitEvent("imagechange", this.image.src);
            this.refresh();
            this.loadingImage = false;
        };

        this.image.src = image.src;
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

    public centerCropArea() : void
    {
        this.circle.center = this.outerRect.center;
        this.circle.validate();
        this.refresh();
    }

    public setCropSize(size : number) : void
    {
        this.circle.size = new Point(size);
        this.circle.validate();
        this.refresh();
    }

    private getMouseAction(x : number, y : number) : MouseAction
    {
        let mousePoint = new Point(x, y);
        if (this.circle.containsPoint(new Point(x, y)))
        {
            // this logic for non-square crop area (aspect ratio != 1:1)
            /*let handleSize = this.circle.radius.min / 2;
            let _rb = (p1, p2) => Rectangle.between(p1, p2);
            let _con = (r : Rectangle) => r.containsPoint(mousePoint);
            let grabbing = (p1 : Point, toAdd : Point | number) => _con(_rb(p1, p1.plus(toAdd)));
            
            let grabbingHandle = (
                grabbing(this.circle.topLeft, handleSize) ||
                grabbing(this.circle.topRight, new Point(-handleSize, handleSize)) ||
                grabbing(this.circle.bottomLeft, new Point(handleSize, -handleSize)) ||
                grabbing(this.circle.bottomRight, -handleSize)
            );*/

            let grabbingHandle = this.circle.center.distanceTo(new Point(x, y)) >= this.circle.radius.x;

            return grabbingHandle ? "resize" : "move";
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

        this.mouseOrigin = new Point(x, y);
        this.circle.saveOrigin();

        this.resizeOffset = this.circle.getPointFromAnchor(this.getCircleAnchor(this.mouseOrigin)).minus(this.mouseOrigin);
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
            let xr = x < this.circle.cx;
            let yr = y < this.circle.cy;
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
            let d = new Point(x, y).minus(this.mouseOrigin);
            this.circle.position = this.circle.origin.position.plus(d);
            this.circle.validate();
            this.mouseOrigin = new Point(x, y);
            this.circle.saveOrigin();
        }
        else if (this.currentAction === "resize")
        {
            this.performResize(x, y);
        }
        
        this.circle.round(this.settings.resizeLock); // u rite

        this.emitEvent("update");
    }

    private getCircleAnchor(p : Point) : RectAnchor
    {
        let x = p.x;
        let y = p.y;

        if (x > this.circle.cx)
        {
            if (y > this.circle.cy)
            {
                return "se";
            }
            else
            {
                return "ne";
            }
        }
        else
        {
            if (y > this.circle.cy)
            {
                return "sw";
            }
            else
            {
                return "nw";
            }
        }
    }

    private performResize(x : number, y : number)
    {
        let anchor = Rectangle.anchorOpposite(this.getCircleAnchor(new Point(x, y)));

        if (!this.settings.resizeLock)
        {
            this.resizeAnchor = this.circle.getPointFromAnchor(anchor).minus(this.resizeOffset);
            let size = this.circle.size.copy();
    
            let r = Rectangle.between(new Point(x, y), this.resizeAnchor);
            //r.round();
            this.circle.fitInsideGreedy(r, anchor, this.outerRect);
            this.circle.validate();
        }
        else
        {
            let r = Rectangle.between(new Point(x, y).plus(this.resizeOffset), this.circle.center);
            r.expandToward(anchor, 2);
            //r.round();
            this.circle.fitInsideGreedyCenter(r, this.outerRect);
            this.circle.validate();
        }
    }
}