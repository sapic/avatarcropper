var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "./widget", "./util", "./canvas", "./renderer"], function (require, exports, widget_1, util_1, canvas_1, renderer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Circle = /** @class */ (function (_super) {
        __extends(Circle, _super);
        function Circle(cropView) {
            var _this = _super.call(this, new util_1.Point(), new util_1.Point()) || this;
            _this.cropView = cropView;
            _this.saveOrigin();
            return _this;
        }
        Object.defineProperty(Circle.prototype, "diameter", {
            get: function () {
                return this.size;
            },
            set: function (diameter) {
                this.size = diameter;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Circle.prototype, "radius", {
            get: function () {
                return this.diameter.times(1 / 2);
            },
            set: function (radius) {
                this.diameter = radius.times(2);
            },
            enumerable: true,
            configurable: true
        });
        Circle.prototype.reset = function () {
            this.position = new util_1.Point(0);
            this.diameter = new util_1.Point(this.cropView.minDim / 2);
        };
        Object.defineProperty(Circle.prototype, "shallowCircle", {
            get: function () {
                return {
                    position: this.position.copy(),
                    diameter: this.diameter.copy()
                };
            },
            enumerable: true,
            configurable: true
        });
        Circle.prototype.saveOrigin = function () {
            this._origin = this.shallowCircle;
        };
        Object.defineProperty(Circle.prototype, "origin", {
            get: function () {
                return this._origin;
            },
            enumerable: true,
            configurable: true
        });
        Circle.prototype.validate = function () {
            if (this.diameter.x > this.cropView.outerWidth)
                this.diameter.x = this.cropView.outerWidth;
            if (this.diameter.y > this.cropView.outerHeight)
                this.diameter.y = this.cropView.outerHeight;
            if (this.x < 0)
                this.x = 0;
            if (this.y < 0)
                this.y = 0;
            if (this.x + this.diameter.x > this.cropView.outerWidth)
                this.x = this.cropView.outerWidth - this.diameter.x;
            if (this.y + this.diameter.y > this.cropView.outerHeight)
                this.y = this.cropView.outerHeight - this.diameter.y;
        };
        return Circle;
    }(util_1.Rectangle));
    var CropView = /** @class */ (function (_super) {
        __extends(CropView, _super);
        function CropView(settingsObject) {
            var _this = _super.call(this, util_1.createElement("div", "cropView")) || this;
            _this._isZoomFitted = false;
            _this._zoomFactor = 1;
            _this.currentRotation = 0;
            _this.loadingImage = false;
            _this.createEvent("update");
            _this.createEvent("imagechange");
            _this.createEvent("antialiaschange");
            _this.on("update", _this.renderOverlay.bind(_this));
            _this.settings = settingsObject;
            _this.circle = new Circle(_this);
            _this.renderer = new renderer_1.Renderer(_this);
            _this.image = util_1.createElement("img", "image");
            _this.image.style["transform-origin"] = "top left";
            _this.overlay = new canvas_1.Canvas({
                deepCalc: true
            });
            _this.appendChild(_this.image, _this.overlay.canvas);
            document.body.appendChild(_this.renderer.container);
            _this.overlay.mouse.addEventListener("move", _this.mouseMove.bind(_this));
            _this.overlay.mouse.addEventListener("down", _this.mouseDown.bind(_this));
            _this.overlay.canvas.addEventListener("touchmove", function (e) {
                if (!(_this.currentAction === "new" || _this.currentAction === "none")) {
                    e.preventDefault();
                }
            });
            document.body.addEventListener("mouseup", function () {
                _this.currentAction = "none";
                _this.emitEvent("update");
            });
            document.body.addEventListener("touchend", function () {
                _this.currentAction = "none";
                _this.emitEvent("update");
            });
            //this.overlay.mouse.addEventListener("leave", this.overlay.mouse.events.up[0]);
            _this.antialias = _this.settings.antialias;
            return _this;
        }
        Object.defineProperty(CropView.prototype, "rotation", {
            get: function () {
                return this.currentRotation;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CropView.prototype, "cropArea", {
            get: function () {
                return this.circle.shallowCircle;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CropView.prototype, "zoomFactor", {
            get: function () {
                return this._zoomFactor;
            },
            enumerable: true,
            configurable: true
        });
        CropView.prototype.refresh = function () {
            this.renderOverlay();
            this.emitEvent("update");
        };
        CropView.prototype.reactTMToRefresh = function () {
            this.isZoomFitted && this.zoomFit();
        };
        CropView.prototype.renderOverlay = function () {
            // draw mask //
            if (this.settings.maskOpacity !== 1) {
                this.overlay.clear();
            }
            if (this.settings.maskOpacity !== 0) {
                this.overlay.fill("rgba(0,0,0," + this.settings.maskOpacity + ")");
                this.overlay.blendMode = "destination-out";
                if (this.settings.previewMode === "circle") {
                    this.overlay.fillCircleInRect(this.circle.x, this.circle.y, this.circle.diameter.x, this.circle.diameter.y, "white");
                }
                else {
                    this.overlay.fillRect(this.circle.x, this.circle.y, this.circle.diameter.x, this.circle.diameter.y, "white");
                }
            }
            this.overlay.blendMode = "source-over";
            if (this.settings.outlinesEnabled) {
                var lineWidth = ~~(1 / this.zoomFactor) + 1;
                var sharp = lineWidth % 2 === 1;
                this.overlay.lineDash = [Math.min(this.overlay.width, this.overlay.height) / 100];
                if (this.settings.previewMode === "circle") {
                    this.overlay.drawCircleInRect(this.circle.x, this.circle.y, this.circle.diameter.x, this.circle.diameter.y, "white", lineWidth);
                }
                this.overlay.drawRect(this.circle.x, this.circle.y, this.circle.diameter.x, this.circle.diameter.y, "white", lineWidth, sharp);
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
        };
        Object.defineProperty(CropView.prototype, "innerWidth", {
            // returns size of image (internal res of image) //
            get: function () {
                return this._width;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CropView.prototype, "innerHeight", {
            get: function () {
                return this._height;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CropView.prototype, "outerWidth", {
            // returns sizes taking rotation into consideration (internal res of overlay) //
            get: function () {
                return this.overlay.width;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CropView.prototype, "outerHeight", {
            get: function () {
                return this.overlay.height;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CropView.prototype, "width", {
            get: function () {
                return this.container.getBoundingClientRect().width;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CropView.prototype, "height", {
            get: function () {
                return this.container.getBoundingClientRect().height;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CropView.prototype, "minDim", {
            get: function () {
                return Math.min(this._width, this._height);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CropView.prototype, "isZoomFitted", {
            get: function () {
                return this._isZoomFitted;
            },
            set: function (z) {
                this._isZoomFitted = z;
                if (z) {
                    this.container.style.overflow = "hidden";
                }
                else {
                    this.container.style.overflow = "";
                }
            },
            enumerable: true,
            configurable: true
        });
        CropView.prototype.zoom = function (factor) {
            this.container.scrollTop = 0;
            this.container.scrollLeft = 0;
            var rotatePart = "";
            if (this.image.style.transform.indexOf(" rotate") !== -1) {
                rotatePart = this.image.style.transform.substr(this.image.style.transform.indexOf(" rotate"));
            }
            factor = factor || this.zoomFactor;
            this._zoomFactor = factor;
            this.overlay.zoom(factor);
            this.image.style.transform = "scale(" + factor + "," + factor + ")";
            this.image.style.transform += rotatePart;
            var r = this.image.getBoundingClientRect();
            if (r.left !== 0) {
                var current = parseFloat(this.image.style.left || "0px");
                current -= r.left;
                this.image.style.left = current + "px";
            }
            if (r.top !== 0) {
                var current = parseFloat(this.image.style.top || "0px");
                current -= r.top;
                this.image.style.top = current + "px";
            }
            this.refresh();
        };
        CropView.prototype.zoomIn = function () {
            this.isZoomFitted = false;
            this.zoom(this.zoomFactor * 1.1);
        };
        CropView.prototype.zoomOut = function () {
            this.isZoomFitted = false;
            this.zoom(this.zoomFactor / 1.1);
        };
        CropView.prototype.zoomFit = function (force) {
            if (force === void 0) { force = true; }
            if (!this.image) {
                return;
            }
            if (!this.isZoomFitted && !force) {
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
        };
        CropView.prototype.rotate = function (deg) {
            var odeg = this.currentRotation;
            if (deg === undefined)
                deg = this.currentRotation;
            this.currentRotation = deg;
            if (this.image.style.transform.indexOf(" rotate") !== -1) {
                this.image.style.transform = this.image.style.transform.substr(0, this.image.style.transform.indexOf(" rotate"));
            }
            var b4 = this.image.style.transform;
            this.image.style.left = "0px";
            this.image.style.top = "0px";
            this.overlay.resize(this.image.width, this.image.height);
            var or = this.image.getBoundingClientRect();
            this.image.style.transform = b4 + " rotate(" + deg + "deg)";
            var r = this.image.getBoundingClientRect();
            var dx = -r.left;
            var dy = -r.top;
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
        };
        Object.defineProperty(CropView.prototype, "antialias", {
            get: function () {
                return this.antialiased;
            },
            set: function (antialias) {
                util_1.makePixelated(this.image, !antialias);
                this.overlay.pixelated = !antialias;
                this.antialiased = antialias;
                this.emitEvent("antialiaschange", this.antialiased);
            },
            enumerable: true,
            configurable: true
        });
        CropView.prototype.setImageFromFile = function (file) {
            if (!file || file.type.split("/")[0] !== "image" || this.loadingImage) {
                return false;
            }
            this.currentFileType = file.type.split("/")[1] === "gif" ? "gif" : "png";
            this._filename = file.name.substring(0, file.name.lastIndexOf('.')) + "_cropped." + this.currentFileType;
            this.loadingImage = true;
            canvas_1.Canvas.fileToImage(file, this.setImageFromFileHelper.bind(this), false);
            return true;
        };
        CropView.prototype.setImageFromFileHelper = function (image) {
            if (this.image.src) {
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
        };
        CropView.prototype.flipHorizontal = function () {
            var _this = this;
            var c = new canvas_1.Canvas({ width: this.image.width, height: this.image.height });
            c.context.scale(-1, 1);
            c.drawImage(this.image, 0, 0, -this.image.width, this.image.height);
            c.context.setTransform(1, 0, 0, 1, 0, 0);
            this.loadingImage = true;
            c.createImage(function (img) {
                _this.rotate(_this.rotation * -1);
                _this.circle.cx = _this.outerWidth - _this.circle.cx;
                _this.flipHelper(img);
            }, undefined, false);
        };
        CropView.prototype.flipVertical = function () {
            var _this = this;
            var c = new canvas_1.Canvas({ width: this.image.width, height: this.image.height });
            c.context.scale(1, -1);
            c.drawImage(this.image, 0, 0, this.image.width, -this.image.height);
            c.context.setTransform(1, 0, 0, 1, 0, 0);
            this.loadingImage = true;
            c.createImage(function (img) {
                _this.rotate(-_this.rotation);
                _this.circle.cy = _this.outerHeight - _this.circle.cy;
                _this.flipHelper(img);
            }, undefined, false);
        };
        CropView.prototype.flipHelper = function (image) {
            if (this.image.src) {
                URL.revokeObjectURL(this.image.src);
            }
            this.image.src = image.src;
            this.emitEvent("imagechange", this.image.src);
            this.emitEvent("update");
            this.renderOverlay();
            this.loadingImage = false;
        };
        CropView.prototype.renderCroppedImage = function () {
            this.renderer.render();
        };
        Object.defineProperty(CropView.prototype, "filename", {
            get: function () {
                return this._filename;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CropView.prototype, "src", {
            get: function () {
                return this.image.src || null;
            },
            enumerable: true,
            configurable: true
        });
        CropView.prototype.getMouseAction = function (x, y) {
            var mousePoint = new util_1.Point(x, y);
            if (this.circle.containsPoint(new util_1.Point(x, y))) {
                var handleSize = this.circle.radius.min / 2;
                var _rb_1 = function (p1, p2) { return util_1.Rectangle.between(p1, p2); };
                var _con_1 = function (r) { return r.containsPoint(mousePoint); };
                var grabbing = function (p1, toAdd) { return _con_1(_rb_1(p1, p1.plus(toAdd))); };
                var grabbingHandle = (grabbing(this.circle.topLeft, handleSize) ||
                    grabbing(this.circle.topRight, new util_1.Point(-handleSize, handleSize)) ||
                    grabbing(this.circle.bottomLeft, new util_1.Point(handleSize, -handleSize)) ||
                    grabbing(this.circle.bottomRight, -handleSize));
                return grabbingHandle ? "resize" : "move";
            }
            else {
                return "new";
            }
        };
        CropView.prototype.mouseDown = function (x, y) {
            var action = this.getMouseAction(x, y);
            this.currentAction = action;
            this.mouseOrigin = new util_1.Point(x, y);
            this.circle.saveOrigin();
            this.resizeOffset = this.circle.getPointFromAnchor(this.getCircleAnchor(this.mouseOrigin)).minus(this.mouseOrigin);
        };
        CropView.prototype.mouseMove = function (x, y) {
            // determine what cursor to show //
            var action = this.currentAction;
            if (action === "none") {
                action = this.getMouseAction(x, y);
            }
            if (action === "move") {
                this.overlay.canvas.style.cursor = "move";
            }
            else if (action === "resize") {
                var xr = x < this.circle.cx;
                var yr = y < this.circle.cy;
                var thing = +xr ^ +yr; // nice
                this.overlay.canvas.style.cursor = thing ? "nesw-resize" : "nwse-resize";
            }
            else {
                this.overlay.canvas.style.cursor = "default";
            }
            // actually do stuff //
            if (this.currentAction === "none") {
                return;
            }
            else if (this.currentAction === "move") {
                var d = new util_1.Point(x, y).minus(this.mouseOrigin);
                this.circle.position = this.circle.origin.position.plus(d);
                this.circle.validate();
                this.mouseOrigin = new util_1.Point(x, y);
                this.circle.saveOrigin();
            }
            else if (this.currentAction === "resize") {
                this.performResize(x, y);
            }
            this.circle.round(); // u rite
            this.emitEvent("update");
        };
        CropView.prototype.getCircleAnchor = function (p) {
            var x = p.x;
            var y = p.y;
            if (x > this.circle.cx) {
                if (y > this.circle.cy) {
                    return "se";
                }
                else {
                    return "ne";
                }
            }
            else {
                if (y > this.circle.cy) {
                    return "sw";
                }
                else {
                    return "nw";
                }
            }
        };
        CropView.prototype.performResize = function (x, y) {
            var anchor = util_1.Rectangle.anchorOpposite(this.getCircleAnchor(new util_1.Point(x, y)));
            this.resizeAnchor = this.circle.getPointFromAnchor(anchor).minus(this.resizeOffset);
            var r = util_1.Rectangle.between(new util_1.Point(x, y), this.resizeAnchor);
            r.round();
            this.circle.fitInsideGreedy(r, anchor);
        };
        return CropView;
    }(widget_1.Widget));
    exports.CropView = CropView;
});
//# sourceMappingURL=cropview.js.map