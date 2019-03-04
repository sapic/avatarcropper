export class Canvas
{
    canvas : HTMLCanvasElement;
    translation : any;
    align : any;
    usingDeepCalc : boolean;
    mouse : any;
    offset : any;

    constructor(options)
    {
        options = options || {}

        if (!options.canvasElement)
        {
            options.canvasElement = document.createElement("canvas");
        }

        if (typeof(options.canvasElement) === "string")
        {
            options.canvasElement = document.querySelector(options.canvasElement);
        }

        this.canvas = options.canvasElement;
        
        this.resize(options.width, options.height);

        this.translation = { x: 0, y: 0 }

        this.align =
        {
            horizontal: (options.align && options.align.horizontal) || false,
            vertical: (options.align && options.align.vertical) || false
        }

        if (this.align.horizontal || this.align.vertical)
        {
            this.canvas.style["transform-origin"] = "center";
        }
        else
        {
            this.canvas.style["transform-origin"] = "top left";
        }

        this.usingDeepCalc = options.deepCalc || false;
        this.pixelated = options.pixelated || false;

        if (this.usingDeepCalc)
        {
            this.deepCalcPosition();
            window.addEventListener("resize", this.deepCalcPosition);
        }

        this.mouse =
        {
            isDown: false,
            lastPos: null,
            originalPos: { x: -1, y: -1 },
            events:
            {
                move: [],
                down: [],
                up: [],
                leave: []
            },
            addEventListener: function(eventName, fn)
            {
                this.events[eventName].push(fn);
            }
        }

        this.canvas.addEventListener("mousemove", this.mouseMove.bind(this));
        this.canvas.addEventListener("touchmove", this.mouseMove.bind(this));
        this.canvas.addEventListener("mousedown", this.mouseDown.bind(this));
        this.canvas.addEventListener("touchstart", this.mouseDown.bind(this));
        this.canvas.addEventListener("mouseup", this.mouseUp.bind(this));
        this.canvas.addEventListener("touchend", this.mouseUp.bind(this));
        this.canvas.addEventListener("mouseleave", this.mouseLeave.bind(this));
        this.canvas.addEventListener("touchcancel", this.mouseLeave.bind(this));
    }

    static round(x)
    {
        let negative = x < 0;
        x = Math.abs(x);
        x = (x + 0.5) | 0;
        if (negative) x = -x;
        return x;
    }

    resize(w?, h?, redraw?)
    {
        if (w === undefined && h === undefined)
        {
            return;
        }

        w = w || this.width;
        h = h || this.height;

        let c;

        if (redraw)
        {
            c = this.canvas.cloneNode();
        }

        this.canvas.width = w;
        this.canvas.height = h;

        if (redraw)
        {
            this.drawImage(c);
        }
    }

    zoom(x?, y?)
    {
        x = x || 1;
        y = y || x;

        this.canvas.style["transform"] = "scale(" + x + ", " + y + ")";
    }

    scale(x?, y?)
    {
        return this.zoom(x, y);
    }

    clear()
    {
        this.context.clearRect(-this.translation.x, -this.translation.y, this.canvas.width, this.canvas.height);  
    }

    deepCalcPosition()
    {
        let z = <HTMLElement>this.canvas, x = 0, y = 0, c; 

        while(z && !isNaN(z.offsetLeft) && !isNaN(z.offsetTop)) {        
            c =  window.getComputedStyle(z, null); 
            x += z.offsetLeft - z.scrollLeft + (c ? parseInt(c.getPropertyValue('border-left-width') , 10) : 0);
            y += z.offsetTop - z.scrollTop + (c ? parseInt(c.getPropertyValue('border-top-width') , 10) : 0);
            z = <HTMLElement>z.offsetParent;
        }

        this.offset = { x: x, y: y }
    }

    posFromEvent(e)
    {
        let x = e.pageX;
        let y = e.pageY;


        if (e.changedTouches)
        {
            x = e.changedTouches[0].pageX;
            y = e.changedTouches[0].pageY;
        }

        if (this.usingDeepCalc)
        {
            this.deepCalcPosition();
        }

        let bounds = this.canvas.getBoundingClientRect();

        let ox = this.usingDeepCalc ? this.offset.x : bounds.left;
        let oy = this.usingDeepCalc ? this.offset.y : bounds.top;

        if (this.align.horizontal && ox > 0)
        {
            ox = (2 * ox - bounds.width) / 2;
        }

        if (this.align.vertical && oy > 0)
        {
            oy = (2 * oy - bounds.height) / 2;
        }

        x -= ox;
        y -= oy;

        x *= this.canvas.width / bounds.width;
        y *= this.canvas.height / bounds.height;

        return { x, y }
    }

    mouseMove(e)
    {
        let pos = this.posFromEvent(e);
        if (!this.mouse.lastPos) this.mouse.lastPos = pos;
        if (!this.mouse.isDown) this.mouse.originalPos = pos;

        this.mouse.events.move.forEach(fn =>
        {
            let event = fn.call(
                this,
                pos.x,
                pos.y,
                this.mouse.isDown,
                this.mouse.lastPos.x,
                this.mouse.lastPos.y,
                this.mouse.originalPos.x,
                this.mouse.originalPos.y,
                e
            );

            if (event !== false)
            {
                this.mouse.lastPos = pos;
            }
        });
    }

    mouseDown(e)
    {
        let pos = this.posFromEvent(e);
        this.mouse.isDown = true;
        this.mouse.lastPos = pos;
        this.mouse.originalPos = pos;

        this.mouse.events.down.forEach(fn =>
        {
            fn.call(this, pos.x, pos.y, e);
        });
    }

    mouseUp(e)
    {
        let pos = this.posFromEvent(e);
        this.mouse.isDown = false;

        this.mouse.events.up.forEach(fn =>
        {
            fn.call(this, pos.x, pos.y, this.mouse.originalPos.x, this.mouse.originalPos.y, e);
        });

        this.mouse.lastPos = pos;
    }

    mouseLeave(e)
    {
        let pos = this.posFromEvent(e);

        this.mouse.events.leave.forEach(fn =>
        {
            fn.call(this, pos.x, pos.y, e);
        });
    }

    get context()
    {
        return this.canvas.getContext("2d");
    }

    set pixelated(bool)
    {
        bool = !bool;

        let ctx = this.context;
        (<any>ctx).mozImageSmoothingEnabled = bool;
        (<any>ctx).webkitImageSmoothingEnabled = bool;
        //(<any>ctx).msImageSmoothingEnabled = bool;
        (<any>ctx).imageSmoothingEnabled = bool;

        if (!bool)
        {
            let types = [ "optimizeSpeed", "crisp-edges", "-moz-crisp-edges", "-webkit-optimize-contrast", "optimize-contrast", "pixelated" ];
            
            types.forEach(type => this.canvas.style["image-rendering"] = type);
        }
        else
        {
            this.canvas.style["image-rendering"] = "";
        }
        //this.canvas.style.msInterpolationMode = "nearest-neighbor";
    }

    get width() { return this.canvas.width; }
    set width(w) { this.resize(w, this.height); }
    get height() { return this.canvas.height; }
    set height(h) { this.resize(this.width, h); }

    get opacity() { return this.context.globalAlpha; }
    set opacity(opacity) { this.context.globalAlpha = opacity; }

    get color() { return this.context.fillStyle; }
    set color(val)
    {
        if (val === undefined) return;

        this.context.fillStyle = val;
        this.context.strokeStyle = val;
    }

    get font() { return this.context.font; }
    set font(val)
    {
        if (val === undefined) return;

        this.context.font = val;
    }

    get lineWidth() { return this.context.lineWidth; }
    set lineWidth(val)
    {
        if (val === undefined) return;
        
        this.context.lineWidth = val;
    }

    get blendMode() { return this.context.globalCompositeOperation; }
    set blendMode(val) { this.context.globalCompositeOperation = val; }

    get lineDash() { return this.context.getLineDash(); }
    set lineDash(dash) { this.context.setLineDash(dash); }

    createBlob(callback, mimeType?)
    {
        this.canvas.toBlob(function(blob)
        {
            callback(blob);
        }, mimeType);
    }

    createImage(callback, mimeType?, autoRevoke = true)
    {
        this.canvas.toBlob(function(blob) {
            let ret = new Image();
    
            ret.onload = function()
            {
                callback(this);
                this.onload = null;
                autoRevoke && URL.revokeObjectURL((<HTMLImageElement>this).src);
            }
        
            let url = URL.createObjectURL(blob);
            ret.src = url;
        }, mimeType);
    }

    drawImage(image, x?, y?, w?, h?)
    {
        if (image instanceof Canvas)
        {
            image = image.canvas;
        }

        if (x === undefined) x = 0;
        if (y === undefined) y = 0;
        if (w === undefined) w = image.width;
        if (h === undefined) h = image.height;

        x = Canvas.round(x);
        y = Canvas.round(y);
        w = Canvas.round(w);
        h = Canvas.round(h);
        
        this.context.drawImage(image, x, y, w, h);
    }

    drawScaledImage(image, x, y, sw, sh)
    {
        let w = image.width * sw;
        let h = image.height * sh;

        this.drawImage(image, x, y, w, h);
    }

    drawCroppedImage(image, x, y, cx, cy, cw, ch, w?, h?)
    {
        if (image instanceof Canvas)
        {
            image = image.canvas;
        }

        if (w === undefined) w = cw;
        if (h === undefined) h = ch;
        
        x = Canvas.round(x);
        y = Canvas.round(y);
        cx = Canvas.round(cx);
        cy = Canvas.round(cy);
        cw = Canvas.round(cw);
        ch = Canvas.round(ch);
        w = Canvas.round(w);
        h = Canvas.round(h);

        this.context.drawImage(image, cx, cy, cw, ch, x, y, w, h);
    }
    
    drawRotatedCroppedImage(image, rotate, anchorX, anchorY, x, y, cx, cy, cw, ch, w, h)
    {
        if (image instanceof Canvas)
        {
            image = image.canvas;
        }

        if (w === undefined) w = cw;
        if (h === undefined) h = ch;
        
        x = Canvas.round(x);
        y = Canvas.round(y);
        cx = Canvas.round(cx);
        cy = Canvas.round(cy);
        cw = Canvas.round(cw);
        ch = Canvas.round(ch);
        w = Canvas.round(w);
        h = Canvas.round(h);
    
        var ctx = this.context;
    
        ctx.save();
        ctx.translate(x + anchorX, y + anchorY);
        ctx.rotate(rotate);
        ctx.drawImage(image, cx, cy, cw, ch, -anchorX, -anchorY, w, h);
        ctx.restore();
    }

    // use closures to make function factory function for onclick etc

    fillImage(image, resizeToFit)
    {
        if (resizeToFit)
        {
            this.resize(image.width, image.height);
        }

        this.drawImage(image, 0, 0, this.width, this.height);
    }

    drawLine(x1, y1, x2, y2, color?, lineWidth?) {
        this.color = color;
        this.lineWidth = lineWidth;
    
        this.context.beginPath();
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
        this.context.stroke();
    }

    drawRect(x : number, y : number, w : number, h : number, color, lineWidth, sharp)
    {
        this.color = color;
        this.lineWidth = lineWidth;

        if (sharp === undefined) sharp = true;

        x = Canvas.round(x);
        y = Canvas.round(y);
        w = Canvas.round(w);
        h = Canvas.round(h);

        if (sharp)
        {
            x += 0.5;
            y += 0.5;
        }

        this.context.strokeRect(x, y, w, h);
    }

    fillRect(x : number, y : number, w : number, h : number, color)
    {
        this.color = color;

        x = Canvas.round(x);
        y = Canvas.round(y);
        w = Canvas.round(w);
        h = Canvas.round(h);

        this.context.fillRect(x, y, w, h);
    }

    // https://stackoverflow.com/a/7838871
    drawRoundedRect(x : number, y : number, w : number, h : number, r : number, color, lineWidth, sharp)
    {
        this.color = color;
        this.lineWidth = lineWidth;

        if (sharp === undefined) sharp = true;

        x = Canvas.round(x);
        y = Canvas.round(y);
        w = Canvas.round(w);
        h = Canvas.round(h);
        r = Canvas.round(r);

        if (sharp)
        {
            x += 0.5;
            y += 0.5;
        }

        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;

        this.context.beginPath();
        this.context.moveTo(x+r, y);
        this.context.arcTo(x+w, y,   x+w, y+h, r);
        this.context.arcTo(x+w, y+h, x,   y+h, r);
        this.context.arcTo(x,   y+h, x,   y,   r);
        this.context.arcTo(x,   y,   x+w, y,   r);
        this.context.closePath();
        this.context.stroke();
    }

    fillRoundedRect(x : number, y : number, w : number, h : number, r : number, color, sharp?)
    {
        this.color = color;

        if (sharp === undefined) sharp = true;

        x = Canvas.round(x);
        y = Canvas.round(y);
        w = Canvas.round(w);
        h = Canvas.round(h);
        r = Canvas.round(r);

        if (sharp)
        {
            x += 0.5;
            y += 0.5;
        }

        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;

        this.context.beginPath();
        this.context.moveTo(x+r, y);
        this.context.arcTo(x+w, y,   x+w, y+h, r);
        this.context.arcTo(x+w, y+h, x,   y+h, r);
        this.context.arcTo(x,   y+h, x,   y,   r);
        this.context.arcTo(x,   y,   x+w, y,   r);
        this.context.closePath();
        this.context.fill();
    }

    fill(color)
    {
        this.fillRect(0, 0, this.width, this.height, color);
    }

    fillText(text, x, y, color, baseline, align, font)
    {
        this.color = color;
        this.font = font;

        this.context.textBaseline = baseline;
        this.context.textAlign = align;
        this.context.fillText(text, x, y);
    }

    fillCircle(x : number, y : number, radius : number, color)
    {
        this.color = color;

        this.context.beginPath();
        this.context.arc(x, y, radius, 0, 2 * Math.PI, false);
        this.context.fill();
    }

    fillCircleInSquare(x : number, y : number, diameter : number, color)
    {    
        this.color = color;
    
        this.context.beginPath();
        this.context.arc(x + diameter / 2, y + diameter / 2, diameter / 2, 0, 2 * Math.PI, false);
        this.context.fill();
    }

    drawCircleInSquare(x : number, y : number, diameter : number, color, lineWidth)
    {
        this.color = color;
        this.lineWidth = lineWidth;

        this.context.beginPath();
        this.context.arc(x + diameter / 2, y + diameter / 2, diameter / 2, 0, 2 * Math.PI, false);
        this.context.stroke();
    }

    fillCircleInRect(x : number, y : number, diameterX : number, diameterY : number, color : string)
    {
        if (diameterX === diameterY)
        {
            return this.fillCircleInSquare(x, y, diameterX, color);
        }
        
        this.color = color;

        this.context.beginPath();
        this.context.ellipse(x, y, diameterX / 2, diameterY / 2, 0, 0, Math.PI * 2);
        this.context.fill();
    }

    drawCircleInRect(x : number, y : number, diameterX : number, diameterY : number, color? : string, lineWidth? : number)
    {
        if (diameterX === diameterY)
        {
            return this.drawCircleInSquare(x, y, diameterX, color, lineWidth);
        }
        
        this.color = color;
        this.lineWidth = lineWidth;

        this.context.beginPath();
        this.context.ellipse(x, y, diameterX / 2, diameterY / 2, 0, 0, Math.PI * 2);
        this.context.stroke();
    }

    drawRotatedImage(image : Canvas | HTMLImageElement | HTMLCanvasElement, rotate : number, x : number, y : number, w? : number, h? : number) {
        if (image instanceof Canvas)
        {
            image = image.canvas;
        }

        if (w === undefined) w = image.width;
        if (h === undefined) h = image.height;
        
        x = Canvas.round(x);
        y = Canvas.round(y);
        w = Canvas.round(w);
        h = Canvas.round(h);
    
        this.context.save();
        this.context.translate(x + w / 2, y + h / 2);
        this.context.rotate(rotate);
        this.context.drawImage(image, -w / 2, -h / 2, w, h);
        this.context.restore();
    }

    static fileToImage(file, callback, autoRevoke = true) {
        let img = new Image();
    
        img.onload = function() {
            callback(this);
            if (autoRevoke)
            {
                window.URL.revokeObjectURL((<HTMLImageElement>this).src);
            }
        }
    
        img.src = window.URL.createObjectURL(file);
    }
}

// from https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
if (!HTMLCanvasElement.prototype.toBlob) {
    Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
        value: function (callback, type, quality) {
            var canvas = this;
            setTimeout(function() {
                var binStr = atob( canvas.toDataURL(type, quality).split(',')[1] ),
                    len = binStr.length,
                    arr = new Uint8Array(len);

                for (var i = 0; i < len; i++ ) {
                arr[i] = binStr.charCodeAt(i);
                }

                callback(new Blob([arr], { type: type || 'image/png' }));
            });
        }
    });
}