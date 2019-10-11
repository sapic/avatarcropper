define(["require", "exports", "./point", "./util", "./rectangle"], function (require, exports, point_1, util_1, rectangle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Canvas = /** @class */ (function () {
        function Canvas(options) {
            if (options === void 0) { options = {}; }
            options = options || {};
            if (!options.canvasElement) {
                options.canvasElement = document.createElement("canvas");
            }
            else if (typeof (options.canvasElement) === "string") {
                options.canvasElement = document.querySelector(options.canvasElement);
            }
            this.canvas = options.canvasElement;
            this.context = this.canvas.getContext("2d", { alpha: !options.opaque });
            options.size = options.size || new point_1.Point(1);
            this.resize(options.size, false);
            this.translation = new point_1.Point(0);
            this.align =
                {
                    horizontal: (options.align && options.align.horizontal) || false,
                    vertical: (options.align && options.align.vertical) || false
                };
            if (this.align.horizontal || this.align.vertical) {
                //this.canvas.style.transformOrigin = "center";
                //this.canvas.style.position = "absolute";
                /*if (this.align.horizontal && this.align.vertical)
                {
                    this.canvas.style.transform = "translate(-50%, -50%)";
                    this.canvas.style.left = "50%";
                    this.canvas.style.top = "50%";
                }
                else if (this.align.horizontal)
                {
                    this.canvas.style.transform = "translateX(-50%)";
                    this.canvas.style.left = "50%";
                }
                else // vertical
                {
                    this.canvas.style.transform = "translateY(-50%)";
                    this.canvas.style.top = "50%";
                }*/
            }
            else {
                this.canvas.style.transformOrigin = "top left";
            }
            this.usingDeepCalc = options.deepCalc || false;
            this.pixelated = options.pixelated || false;
            if (this.usingDeepCalc) {
                this.deepCalcPosition();
                window.addEventListener("resize", this.deepCalcPosition);
            }
            this.mouse =
                {
                    isDown: false,
                    lastPos: null,
                    originalPos: { x: -1, y: -1 },
                    events: {
                        move: [],
                        down: [],
                        up: [],
                        leave: []
                    }
                };
            this.canvas.addEventListener("mousemove", this.mouseMove.bind(this));
            this.canvas.addEventListener("touchmove", this.mouseMove.bind(this));
            this.canvas.addEventListener("mousedown", this.mouseDown.bind(this));
            this.canvas.addEventListener("touchstart", this.mouseDown.bind(this));
            this.canvas.addEventListener("mouseup", this.mouseUp.bind(this));
            this.canvas.addEventListener("touchend", this.mouseUp.bind(this));
            this.canvas.addEventListener("mouseleave", this.mouseLeave.bind(this));
            this.canvas.addEventListener("touchcancel", this.mouseLeave.bind(this));
        }
        Canvas.prototype.addEventListener = function (eventName, fn) {
            if (util_1.array_contains(["mouseup", "mousedown", "mousemove", "mouseleave"], eventName)) {
                this.mouse.events[eventName.substr(5)].push(fn);
            }
        };
        Canvas.prototype.resize = function (size, redraw) {
            var c;
            if (redraw) {
                c = this.canvas.cloneNode();
            }
            this.canvas.width = size.x;
            this.canvas.height = size.y;
            if (redraw) {
                this.drawImage(c, new point_1.Point(0));
            }
        };
        Canvas.prototype.zoom = function (amount) {
            var x;
            var y;
            if (typeof (amount) === "number") {
                x = amount;
                y = amount;
            }
            else {
                x = amount.x;
                y = amount.y;
            }
            this.canvas.style["transform"] = "scale(" + x + ", " + y + ")";
        };
        Canvas.prototype.zoomToFit = function (size) {
            var wRatio = size.x / this.width;
            var hRatio = size.y / this.height;
            if (wRatio < hRatio) {
                this.zoom(wRatio);
            }
            else {
                this.zoom(hRatio);
            }
        };
        Canvas.prototype.scale = function (amount) {
            return this.zoom(amount);
        };
        Canvas.prototype.clear = function () {
            this.context.clearRect(-this.translation.x, -this.translation.y, this.canvas.width, this.canvas.height);
        };
        Canvas.prototype.deepCalcPosition = function () {
            var z = this.canvas, x = 0, y = 0, c;
            while (z && !isNaN(z.offsetLeft) && !isNaN(z.offsetTop)) {
                c = window.getComputedStyle(z, null);
                x += z.offsetLeft - z.scrollLeft + (c ? parseInt(c.getPropertyValue('border-left-width'), 10) : 0);
                y += z.offsetTop - z.scrollTop + (c ? parseInt(c.getPropertyValue('border-top-width'), 10) : 0);
                z = z.offsetParent;
            }
            this.offset = new point_1.Point(x, y);
        };
        Canvas.prototype.posFromEvent = function (e) {
            var ret = new point_1.Point();
            if (e instanceof MouseEvent) {
                ret = new point_1.Point(e.pageX, e.pageY);
            }
            else {
                ret = new point_1.Point(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
            }
            if (this.usingDeepCalc) {
                this.deepCalcPosition();
            }
            var bounds = this.canvas.getBoundingClientRect();
            var o = this.usingDeepCalc ? this.offset.copy() : new point_1.Point(bounds.left, bounds.top);
            if (this.align.horizontal && o.x > 0) {
                o.x = (2 * o.x - bounds.width) / 2;
            }
            if (this.align.vertical && o.y > 0) {
                o.y = (2 * o.y - bounds.height) / 2;
            }
            ret.subtract(o);
            ret.multiply(this.size.dividedBy(new point_1.Point(bounds.width, bounds.height)));
            return ret;
        };
        Object.defineProperty(Canvas.prototype, "size", {
            get: function () {
                return new point_1.Point(this.canvas.width, this.canvas.height);
            },
            enumerable: true,
            configurable: true
        });
        Canvas.prototype.mouseMove = function (e) {
            var _this = this;
            var pos = this.posFromEvent(e);
            if (!this.mouse.lastPos)
                this.mouse.lastPos = pos;
            if (!this.mouse.isDown)
                this.mouse.originalPos = pos;
            this.mouse.events.move.forEach(function (fn) {
                var event = fn.call(_this, pos.x, pos.y, _this.mouse.isDown, _this.mouse.lastPos.x, _this.mouse.lastPos.y, _this.mouse.originalPos.x, _this.mouse.originalPos.y, e);
                if (event !== false) {
                    _this.mouse.lastPos = pos;
                }
            });
        };
        Canvas.prototype.mouseDown = function (e) {
            var _this = this;
            var pos = this.posFromEvent(e);
            this.mouse.isDown = true;
            this.mouse.lastPos = pos;
            this.mouse.originalPos = pos;
            this.mouse.events.down.forEach(function (fn) {
                fn.call(_this, pos.x, pos.y, e);
            });
        };
        Canvas.prototype.mouseUp = function (e) {
            var _this = this;
            var pos = this.posFromEvent(e);
            this.mouse.isDown = false;
            this.mouse.events.up.forEach(function (fn) {
                fn.call(_this, pos.x, pos.y, _this.mouse.originalPos.x, _this.mouse.originalPos.y, e);
            });
            this.mouse.lastPos = pos;
        };
        Canvas.prototype.mouseLeave = function (e) {
            var _this = this;
            var pos = this.posFromEvent(e);
            this.mouse.events.leave.forEach(function (fn) {
                fn.call(_this, pos.x, pos.y, e);
            });
        };
        Object.defineProperty(Canvas.prototype, "pixelated", {
            set: function (bool) {
                var _this = this;
                bool = !bool;
                var ctx = this.context;
                ctx.mozImageSmoothingEnabled = bool;
                ctx.webkitImageSmoothingEnabled = bool;
                //(<any>ctx).msImageSmoothingEnabled = bool;
                ctx.imageSmoothingEnabled = bool;
                if (!bool) {
                    var types = ["optimizeSpeed", "crisp-edges", "-moz-crisp-edges", "-webkit-optimize-contrast", "optimize-contrast", "pixelated"];
                    types.forEach(function (type) { return _this.canvas.style["image-rendering"] = type; });
                }
                else {
                    this.canvas.style["image-rendering"] = "";
                }
                //this.canvas.style.msInterpolationMode = "nearest-neighbor";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Canvas.prototype, "width", {
            get: function () { return this.canvas.width; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Canvas.prototype, "height", {
            get: function () { return this.canvas.height; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Canvas.prototype, "opacity", {
            get: function () { return this.context.globalAlpha; },
            set: function (opacity) { this.context.globalAlpha = opacity; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Canvas.prototype, "color", {
            get: function () { return this.context.fillStyle; },
            set: function (val) {
                if (val === undefined)
                    return;
                this.context.fillStyle = val;
                this.context.strokeStyle = val;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Canvas.prototype, "font", {
            get: function () { return this.context.font; },
            set: function (val) {
                if (val === undefined)
                    return;
                this.context.font = val;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Canvas.prototype, "lineWidth", {
            get: function () { return this.context.lineWidth; },
            set: function (val) {
                if (val === undefined)
                    return;
                this.context.lineWidth = val;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Canvas.prototype, "blendMode", {
            get: function () { return this.context.globalCompositeOperation; },
            set: function (val) { this.context.globalCompositeOperation = val; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Canvas.prototype, "lineDash", {
            get: function () { return this.context.getLineDash(); },
            set: function (dash) { this.context.setLineDash(dash); },
            enumerable: true,
            configurable: true
        });
        Canvas.prototype.createBlob = function (callback, mimeType) {
            this.canvas.toBlob(function (blob) {
                callback(blob);
            }, mimeType);
        };
        Canvas.prototype.createImage = function (callback, mimeType, autoRevoke) {
            if (autoRevoke === void 0) { autoRevoke = true; }
            this.canvas.toBlob(function (blob) {
                var ret = new Image();
                ret.onload = function () {
                    callback(ret);
                    ret.onload = null;
                    autoRevoke && URL.revokeObjectURL(ret.src);
                };
                var url = URL.createObjectURL(blob);
                ret.src = url;
            }, mimeType);
        };
        Object.defineProperty(Canvas.prototype, "imageData", {
            get: function () {
                return this.context.getImageData(0, 0, this.width, this.height);
            },
            enumerable: true,
            configurable: true
        });
        Canvas.prototype.drawImage = function (image, position) {
            if (image instanceof Canvas) {
                image = image.canvas;
            }
            if (position instanceof point_1.Point) {
                this.context.drawImage(image, position.x, position.y);
            }
            else {
                this.context.drawImage(image, position.x, position.y, position.width, position.height);
            }
        };
        Canvas.prototype.drawCroppedImage = function (image, position, cropRegion) {
            if (image instanceof Canvas) {
                image = image.canvas;
            }
            if (position instanceof point_1.Point) {
                this.context.drawImage(image, cropRegion.x, cropRegion.y, cropRegion.width, cropRegion.height, position.x, position.y, cropRegion.width, cropRegion.height);
            }
            else {
                this.context.drawImage(image, cropRegion.x, cropRegion.y, cropRegion.width, cropRegion.height, position.x, position.y, position.width, position.height);
            }
        };
        Canvas.prototype.drawRotatedCroppedImage = function (image, rotate, anchor, position, cropRegion) {
            if (image instanceof Canvas) {
                image = image.canvas;
            }
            var ctx = this.context;
            ctx.save();
            ctx.translate(position.x + anchor.x, position.y + anchor.y);
            ctx.rotate(rotate);
            if (position instanceof point_1.Point) {
                ctx.drawImage(image, cropRegion.x, cropRegion.y, cropRegion.width, cropRegion.height, -anchor.x, -anchor.y, image.width, image.height);
            }
            else {
                ctx.drawImage(image, cropRegion.x, cropRegion.y, cropRegion.width, cropRegion.height, -anchor.x, -anchor.y, position.width, position.height);
            }
            ctx.restore();
        };
        Canvas.prototype.fillWithImage = function (image, resizeCanvasToFit) {
            if (resizeCanvasToFit) {
                this.resize(new point_1.Point(image.width, image.height), false);
            }
            this.drawImage(image, new point_1.Point(0));
        };
        Canvas.prototype.drawLine = function (start, end, color, lineWidth) {
            this.color = color;
            this.lineWidth = lineWidth;
            this.context.beginPath();
            this.context.moveTo(start.x, start.y);
            this.context.lineTo(end.x, end.y);
            this.context.stroke();
        };
        Canvas.prototype.drawRect = function (rect, color, lineWidth, sharp) {
            if (sharp === void 0) { sharp = true; }
            this.color = color;
            this.lineWidth = lineWidth;
            if (sharp) {
                rect = rect.translated(new point_1.Point(0.5));
            }
            this.context.strokeRect(rect.x, rect.y, rect.width, rect.height);
        };
        Canvas.prototype.fillRect = function (rect, color) {
            this.color = color;
            this.context.fillRect(rect.x, rect.y, rect.width, rect.height);
        };
        // https://stackoverflow.com/a/7838871
        Canvas.prototype.drawRoundedRect = function (rect, radius, color, lineWidth, sharp) {
            if (sharp === void 0) { sharp = true; }
            this.color = color;
            this.lineWidth = lineWidth;
            if (sharp) {
                rect = rect.translated(new point_1.Point(0.5));
            }
            if (rect.width < 2 * radius)
                radius = rect.width / 2;
            if (rect.height < 2 * radius)
                radius = rect.height / 2;
            this.context.beginPath();
            this.context.moveTo(rect.x + radius, rect.y);
            this.context.arcTo(rect.right, rect.y, rect.right, rect.bottom, radius);
            this.context.arcTo(rect.right, rect.bottom, rect.x, rect.bottom, radius);
            this.context.arcTo(rect.x, rect.bottom, rect.x, rect.y, radius);
            this.context.arcTo(rect.x, rect.y, rect.right, rect.y, radius);
            this.context.closePath();
            this.context.stroke();
        };
        Canvas.prototype.fillRoundedRect = function (rect, radius, color, sharp) {
            if (sharp === void 0) { sharp = true; }
            this.color = color;
            if (sharp) {
                rect = rect.translated(new point_1.Point(0.5));
            }
            if (rect.width < 2 * radius)
                radius = rect.width / 2;
            if (rect.height < 2 * radius)
                radius = rect.height / 2;
            this.context.beginPath();
            this.context.moveTo(rect.x + radius, rect.y);
            this.context.arcTo(rect.right, rect.y, rect.right, rect.bottom, radius);
            this.context.arcTo(rect.right, rect.bottom, rect.x, rect.bottom, radius);
            this.context.arcTo(rect.x, rect.bottom, rect.x, rect.y, radius);
            this.context.arcTo(rect.x, rect.y, rect.right, rect.y, radius);
            this.context.closePath();
            this.context.fill();
        };
        Canvas.prototype.fill = function (color) {
            this.fillRect(new rectangle_1.Rectangle(new point_1.Point(0), this.size), color);
        };
        Canvas.prototype.fillText = function (text, position, color, baseline, align, font) {
            this.color = color;
            if (font) {
                this.font = font;
            }
            if (baseline) {
                this.context.textBaseline = baseline;
            }
            if (align) {
                this.context.textAlign = align;
            }
            this.context.fillText(text, position.x, position.y);
        };
        Canvas.prototype.fillCircle = function (position, radius, color) {
            this.color = color;
            this.context.beginPath();
            this.context.arc(position.x, position.y, radius, 0, 2 * Math.PI, false);
            this.context.fill();
        };
        Canvas.prototype.fillCircleInSquare = function (position, diameter, color) {
            this.color = color;
            this.context.beginPath();
            this.context.arc(position.x + diameter / 2, position.y + diameter / 2, diameter / 2, 0, 2 * Math.PI, false);
            this.context.fill();
        };
        Canvas.prototype.drawCircleInSquare = function (position, diameter, color, lineWidth) {
            this.color = color;
            this.lineWidth = lineWidth;
            this.context.beginPath();
            this.context.arc(position.x + diameter / 2, position.y + diameter / 2, diameter / 2, 0, 2 * Math.PI, false);
            this.context.stroke();
        };
        Canvas.prototype.fillCircleInRect = function (rect, color) {
            if (rect.isSquare) {
                return this.fillCircleInSquare(rect.position, rect.width, color);
            }
            this.color = color;
            this.context.beginPath();
            this.context.ellipse(rect.x, rect.y, rect.width / 2, rect.height / 2, 0, 0, Math.PI * 2);
            this.context.fill();
        };
        Canvas.prototype.drawCircleInRect = function (rect, color, lineWidth) {
            if (rect.isSquare) {
                return this.drawCircleInSquare(rect.position, rect.width, color, lineWidth);
            }
            this.color = color;
            this.lineWidth = lineWidth;
            this.context.beginPath();
            this.context.ellipse(rect.x, rect.y, rect.width / 2, rect.height / 2, 0, 0, Math.PI * 2);
            this.context.stroke();
        };
        Canvas.prototype.drawRotatedImage = function (image, rotate, position) {
            if (image instanceof Canvas) {
                image = image.canvas;
            }
            var w;
            var h;
            if (position instanceof point_1.Point) {
                w = image.width;
                h = image.height;
            }
            else {
                w = position.width;
                h = position.height;
            }
            this.context.save();
            this.context.translate(position.x + w / 2, position.y + h / 2);
            this.context.rotate(rotate);
            this.context.drawImage(image, -w / 2, -h / 2, w, h);
            this.context.restore();
        };
        Canvas.fileToImage = function (file, callback, autoRevoke) {
            if (autoRevoke === void 0) { autoRevoke = true; }
            var img = new Image();
            img.onload = function () {
                callback(img);
                if (autoRevoke) {
                    window.URL.revokeObjectURL(img.src);
                }
            };
            img.src = window.URL.createObjectURL(file);
        };
        return Canvas;
    }());
    exports.Canvas = Canvas;
    // from https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
    if (!HTMLCanvasElement.prototype.toBlob) {
        Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
            value: function (callback, type, quality) {
                var canvas = this;
                setTimeout(function () {
                    var binStr = atob(canvas.toDataURL(type, quality).split(',')[1]), len = binStr.length, arr = new Uint8Array(len);
                    for (var i = 0; i < len; i++) {
                        arr[i] = binStr.charCodeAt(i);
                    }
                    callback(new Blob([arr], { type: type || 'image/png' }));
                });
            }
        });
    }
});
//# sourceMappingURL=canvas.js.map