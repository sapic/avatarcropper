var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "./widget", "./util", "./canvas"], function (require, exports, widget_1, util_1, canvas_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Preview = /** @class */ (function (_super) {
        __extends(Preview, _super);
        function Preview(size, cropView) {
            var _this = _super.call(this, util_1.createElement("div", "preview")) || this;
            _this.lastMode = "none";
            _this.createEvent("requestremove");
            _this.cropView = cropView;
            _this.cropView.on("update", _this.update.bind(_this));
            _this.cropView.on("imagechange", function (src) {
                _this.image.src = src;
            });
            _this.cropView.on("antialiaschange", function (aa) {
                _this.antialias = aa;
            });
            _this._size = size;
            _this.container.style.width = size + "px";
            _this.container.style.height = (size + 2) + "px";
            _this.container.style["z-index"] = -size;
            _this.mask = new canvas_1.Canvas({
                width: size,
                height: size + 2
            });
            _this.mask.canvas.className = "mask";
            _this.mask.canvas.style["z-index"] = 1;
            _this.mask.canvas.style.position = "absolute";
            _this.image = util_1.createElement("img", "image");
            _this.image.style.position = "absolute";
            _this.image.style["transform-origin"] = "top left";
            if (cropView.src) {
                _this.image.src = cropView.src;
            }
            _this.image.style.position = "absolute";
            if (size === 30) {
                _this.onlineIndicator = new canvas_1.Canvas({ width: 14, height: 14 });
                _this.onlineIndicator.fillCircleInSquare(0, 0, 14, "#2F3136");
                _this.onlineIndicator.fillCircleInSquare(2, 2, 10, "rgb(67,181,129)");
                _this.onlineIndicator.canvas.className = "onlineIndicator";
            }
            _this.bottomBar = util_1.createElement("div", "bottomBar");
            _this.sizeDisplay = util_1.createElement("div", "size");
            _this.sizeDisplay.innerText = size + "x" + size;
            _this.removeButton = util_1.createElement("button", "remove");
            _this.removeButton.innerText = "✖";
            _this.removeButton.addEventListener("click", function () {
                _this.emitEvent("requestremove");
            });
            _this.bottomBar.appendChild(_this.sizeDisplay);
            _this.bottomBar.appendChild(_this.removeButton);
            _this.appendChild(_this.image, _this.mask.canvas, (_this.onlineIndicator && _this.onlineIndicator.canvas) || null, _this.bottomBar);
            _this.container.addEventListener("mouseenter", function () {
                util_1.showElement(_this.bottomBar);
            });
            _this.container.addEventListener("mouseleave", function () {
                util_1.hideElement(_this.bottomBar);
            });
            util_1.hideElement(_this.bottomBar);
            _this.antialias = true;
            return _this;
        }
        Object.defineProperty(Preview.prototype, "size", {
            get: function () {
                return this._size;
            },
            enumerable: true,
            configurable: true
        });
        Preview.prototype.update = function () {
            if (this.cropView.settings.previewMode !== this.lastMode) {
                this.lastMode = this.cropView.settings.previewMode;
                if (this.lastMode === "square") {
                    this.mask.clear();
                }
                else {
                    this.mask.fill("#2F3136");
                    this.mask.blendMode = "destination-out";
                    this.mask.fillCircleInSquare(0, 0, this.size, "white");
                    this.mask.blendMode = "source-over";
                }
            }
            var scale = this.size / this.cropView.cropArea.diameter;
            this.image.style.transform = "scale(" + scale + ") rotate(" + this.cropView.rotation + "deg)";
            var x = 0;
            var y = 0;
            x -= this.cropView.cropArea.x * scale;
            y -= this.cropView.cropArea.y * scale;
            var dx = parseFloat(this.cropView.image.style.left || "0px");
            var dy = parseFloat(this.cropView.image.style.top || "0px");
            dx *= (1 / this.cropView.zoomFactor);
            dy *= (1 / this.cropView.zoomFactor);
            x += dx * scale;
            y += dy * scale;
            this.image.style.left = x + "px";
            this.image.style.top = y + "px";
        };
        Object.defineProperty(Preview.prototype, "antialias", {
            get: function () {
                return this.antialiased;
            },
            set: function (antialias) {
                util_1.makePixelated(this.image, !antialias);
                this.antialiased = antialias;
            },
            enumerable: true,
            configurable: true
        });
        return Preview;
    }(widget_1.Widget));
    exports.Preview = Preview;
});
//# sourceMappingURL=preview.js.map