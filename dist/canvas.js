define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Canvas = /** @class */ (function () {
        function Canvas(options) {
            options = options || {};
            if (!options.canvasElement) {
                options.canvasElement = document.createElement("canvas");
            }
            if (typeof (options.canvasElement) === "string") {
                options.canvasElement = document.querySelector(options.canvasElement);
            }
            this.canvas = options.canvasElement;
            this.resize(options.width, options.height);
            this.translation = { x: 0, y: 0 };
            this.align =
                {
                    horizontal: (options.align && options.align.horizontal) || false,
                    vertical: (options.align && options.align.vertical) || false
                };
            if (this.align.horizontal || this.align.vertical) {
                this.canvas.style["transform-origin"] = "center";
            }
            else {
                this.canvas.style["transform-origin"] = "top left";
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
                    },
                    addEventListener: function (eventName, fn) {
                        this.events[eventName].push(fn);
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
        Canvas.round = function (x) {
            var negative = x < 0;
            x = Math.abs(x);
            x = (x + 0.5) | 0;
            if (negative)
                x = -x;
            return x;
        };
        Canvas.prototype.resize = function (w, h, redraw) {
            if (w === undefined && h === undefined) {
                return;
            }
            w = w || this.width;
            h = h || this.height;
            var c;
            if (redraw) {
                c = this.canvas.cloneNode();
            }
            this.canvas.width = w;
            this.canvas.height = h;
            if (redraw) {
                this.drawImage(c);
            }
        };
        Canvas.prototype.zoom = function (x, y) {
            x = x || 1;
            y = y || x;
            this.canvas.style["transform"] = "scale(" + x + ", " + y + ")";
        };
        Canvas.prototype.scale = function (x, y) {
            return this.zoom(x, y);
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
            this.offset = { x: x, y: y };
        };
        Canvas.prototype.posFromEvent = function (e) {
            var x = e.pageX;
            var y = e.pageY;
            if (e.changedTouches) {
                x = e.changedTouches[0].pageX;
                y = e.changedTouches[0].pageY;
            }
            if (this.usingDeepCalc) {
                this.deepCalcPosition();
            }
            var bounds = this.canvas.getBoundingClientRect();
            var ox = this.usingDeepCalc ? this.offset.x : bounds.left;
            var oy = this.usingDeepCalc ? this.offset.y : bounds.top;
            if (this.align.horizontal && ox > 0) {
                ox = (2 * ox - bounds.width) / 2;
            }
            if (this.align.vertical && oy > 0) {
                oy = (2 * oy - bounds.height) / 2;
            }
            x -= ox;
            y -= oy;
            x *= this.canvas.width / bounds.width;
            y *= this.canvas.height / bounds.height;
            return { x: x, y: y };
        };
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
        Object.defineProperty(Canvas.prototype, "context", {
            get: function () {
                return this.canvas.getContext("2d");
            },
            enumerable: true,
            configurable: true
        });
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
            set: function (w) { this.resize(w, this.height); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Canvas.prototype, "height", {
            get: function () { return this.canvas.height; },
            set: function (h) { this.resize(this.width, h); },
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
                    callback(this);
                    this.onload = null;
                    autoRevoke && URL.revokeObjectURL(this.src);
                };
                var url = URL.createObjectURL(blob);
                ret.src = url;
            }, mimeType);
        };
        Canvas.prototype.drawImage = function (image, x, y, w, h) {
            if (image instanceof Canvas) {
                image = image.canvas;
            }
            if (x === undefined)
                x = 0;
            if (y === undefined)
                y = 0;
            if (w === undefined)
                w = image.width;
            if (h === undefined)
                h = image.height;
            x = Canvas.round(x);
            y = Canvas.round(y);
            w = Canvas.round(w);
            h = Canvas.round(h);
            this.context.drawImage(image, x, y, w, h);
        };
        Canvas.prototype.drawScaledImage = function (image, x, y, sw, sh) {
            var w = image.width * sw;
            var h = image.height * sh;
            this.drawImage(image, x, y, w, h);
        };
        Canvas.prototype.drawCroppedImage = function (image, x, y, cx, cy, cw, ch, w, h) {
            if (image instanceof Canvas) {
                image = image.canvas;
            }
            if (w === undefined)
                w = cw;
            if (h === undefined)
                h = ch;
            x = Canvas.round(x);
            y = Canvas.round(y);
            cx = Canvas.round(cx);
            cy = Canvas.round(cy);
            cw = Canvas.round(cw);
            ch = Canvas.round(ch);
            w = Canvas.round(w);
            h = Canvas.round(h);
            this.context.drawImage(image, cx, cy, cw, ch, x, y, w, h);
        };
        Canvas.prototype.drawRotatedCroppedImage = function (image, rotate, anchorX, anchorY, x, y, cx, cy, cw, ch, w, h) {
            if (image instanceof Canvas) {
                image = image.canvas;
            }
            if (w === undefined)
                w = cw;
            if (h === undefined)
                h = ch;
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
        };
        ;
        // use closures to make function factory function for onclick etc
        Canvas.prototype.fillImage = function (image, resizeToFit) {
            if (resizeToFit) {
                this.resize(image.width, image.height);
            }
            this.drawImage(image, 0, 0, this.width, this.height);
        };
        Canvas.prototype.drawLine = function (x1, y1, x2, y2, color, lineWidth) {
            this.color = color;
            this.lineWidth = lineWidth;
            this.context.beginPath();
            this.context.moveTo(x1, y1);
            this.context.lineTo(x2, y2);
            this.context.stroke();
        };
        Canvas.prototype.drawRect = function (x, y, w, h, color, lineWidth, sharp) {
            this.color = color;
            this.lineWidth = lineWidth;
            if (sharp === undefined)
                sharp = true;
            x = Canvas.round(x);
            y = Canvas.round(y);
            w = Canvas.round(w);
            h = Canvas.round(h);
            if (sharp) {
                x += 0.5;
                y += 0.5;
            }
            this.context.strokeRect(x, y, w, h);
        };
        Canvas.prototype.fillRect = function (x, y, w, h, color) {
            this.color = color;
            x = Canvas.round(x);
            y = Canvas.round(y);
            w = Canvas.round(w);
            h = Canvas.round(h);
            this.context.fillRect(x, y, w, h);
        };
        // https://stackoverflow.com/a/7838871
        Canvas.prototype.drawRoundedRect = function (x, y, w, h, r, color, lineWidth, sharp) {
            this.color = color;
            this.lineWidth = lineWidth;
            if (sharp === undefined)
                sharp = true;
            x = Canvas.round(x);
            y = Canvas.round(y);
            w = Canvas.round(w);
            h = Canvas.round(h);
            r = Canvas.round(r);
            if (sharp) {
                x += 0.5;
                y += 0.5;
            }
            if (w < 2 * r)
                r = w / 2;
            if (h < 2 * r)
                r = h / 2;
            this.context.beginPath();
            this.context.moveTo(x + r, y);
            this.context.arcTo(x + w, y, x + w, y + h, r);
            this.context.arcTo(x + w, y + h, x, y + h, r);
            this.context.arcTo(x, y + h, x, y, r);
            this.context.arcTo(x, y, x + w, y, r);
            this.context.closePath();
            this.context.stroke();
        };
        Canvas.prototype.fillRoundedRect = function (x, y, w, h, r, color, sharp) {
            this.color = color;
            if (sharp === undefined)
                sharp = true;
            x = Canvas.round(x);
            y = Canvas.round(y);
            w = Canvas.round(w);
            h = Canvas.round(h);
            r = Canvas.round(r);
            if (sharp) {
                x += 0.5;
                y += 0.5;
            }
            if (w < 2 * r)
                r = w / 2;
            if (h < 2 * r)
                r = h / 2;
            this.context.beginPath();
            this.context.moveTo(x + r, y);
            this.context.arcTo(x + w, y, x + w, y + h, r);
            this.context.arcTo(x + w, y + h, x, y + h, r);
            this.context.arcTo(x, y + h, x, y, r);
            this.context.arcTo(x, y, x + w, y, r);
            this.context.closePath();
            this.context.fill();
        };
        Canvas.prototype.fill = function (color) {
            this.fillRect(0, 0, this.width, this.height, color);
        };
        Canvas.prototype.fillText = function (text, x, y, color, baseline, align, font) {
            this.color = color;
            this.font = font;
            this.context.textBaseline = baseline;
            this.context.textAlign = align;
            this.context.fillText(text, x, y);
        };
        Canvas.prototype.fillCircle = function (x, y, radius, color) {
            this.color = color;
            this.context.beginPath();
            this.context.arc(x, y, radius, 0, 2 * Math.PI, false);
            this.context.fill();
        };
        Canvas.prototype.fillCircleInSquare = function (x, y, diameter, color) {
            this.color = color;
            this.context.beginPath();
            this.context.arc(x + diameter / 2, y + diameter / 2, diameter / 2, 0, 2 * Math.PI, false);
            this.context.fill();
        };
        ;
        Canvas.prototype.drawCircleInSquare = function (x, y, diameter, color, lineWidth) {
            this.color = color;
            this.lineWidth = lineWidth;
            this.context.beginPath();
            this.context.arc(x + diameter / 2, y + diameter / 2, diameter / 2, 0, 2 * Math.PI, false);
            this.context.stroke();
        };
        ;
        Canvas.prototype.drawRotatedImage = function (image, rotate, x, y, w, h) {
            if (image instanceof Canvas) {
                image = image.canvas;
            }
            if (w === undefined)
                w = image.width;
            if (h === undefined)
                h = image.height;
            x = Canvas.round(x);
            y = Canvas.round(y);
            w = Canvas.round(w);
            h = Canvas.round(h);
            this.context.save();
            this.context.translate(x + w / 2, y + h / 2);
            this.context.rotate(rotate);
            this.context.drawImage(image, -w / 2, -h / 2, w, h);
            this.context.restore();
        };
        ;
        Canvas.fileToImage = function (file, callback, autoRevoke) {
            if (autoRevoke === void 0) { autoRevoke = true; }
            var img = new Image();
            img.onload = function () {
                callback(this);
                if (autoRevoke) {
                    window.URL.revokeObjectURL(this.src);
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