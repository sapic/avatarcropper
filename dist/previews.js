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
define(["require", "exports", "./widget", "./preview", "./util"], function (require, exports, widget_1, preview_1, util_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Previews = /** @class */ (function (_super) {
        __extends(Previews, _super);
        function Previews(cropView) {
            var _this = _super.call(this, util_1.createElement("div", "previews")) || this;
            _this.previews = [];
            _this.padding = 16;
            _this._size = 0;
            _this.createEvent("sizechange");
            _this.createEvent("sizeArrayChange");
            _this.cropView = cropView;
            return _this;
        }
        Object.defineProperty(Previews.prototype, "sizeArray", {
            get: function () {
                var ret = [];
                this.previews.forEach(function (preview) {
                    ret.push(preview.size);
                });
                return ret;
            },
            enumerable: true,
            configurable: true
        });
        Previews.prototype.addPreviewSize = function (size) {
            var p = new preview_1.Preview(size, this.cropView);
            p.on("requestremove", this.removePreview.bind(this, p));
            p.container.style.position = "absolute";
            this.appendChild(p);
            util_1.array_insert(this.previews, p, function (left, right) { return left.size > right.size; });
            this.render();
            p.update();
            this.emitEvent("sizeArrayChange", this.sizeArray);
        };
        Previews.prototype.removePreview = function (preview) {
            util_1.array_remove(this.previews, preview);
            this.removeChild(preview);
            this.render();
            this.emitEvent("sizeArrayChange", this.sizeArray);
        };
        Object.defineProperty(Previews.prototype, "width", {
            get: function () {
                return this._size;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Previews.prototype, "height", {
            get: function () {
                return this.previews[0] ? this.previews[0].size : 0;
            },
            enumerable: true,
            configurable: true
        });
        Previews.prototype.render = function () {
            var _this = this;
            var runningX = this.padding;
            this.previews.forEach(function (preview) {
                preview.container.style.right = runningX + "px";
                runningX += preview.size + _this.padding;
            });
            this._size = runningX;
            this.emitEvent("sizechange", runningX);
        };
        return Previews;
    }(widget_1.Widget));
    exports.Previews = Previews;
});
//# sourceMappingURL=previews.js.map