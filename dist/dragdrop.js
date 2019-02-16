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
define(["require", "exports", "./util", "./eventclass"], function (require, exports, util_1, eventclass_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DragDrop = /** @class */ (function (_super) {
        __extends(DragDrop, _super);
        function DragDrop(overlay) {
            var _this = _super.call(this) || this;
            _this.tempText = null;
            _this.createEvent("drop");
            _this.createEvent("dragleave");
            document.addEventListener("dragover", function (e) {
                e.preventDefault();
                e.stopPropagation();
            });
            document.addEventListener("dragend", function (e) {
                e.preventDefault();
                e.stopPropagation();
            });
            document.addEventListener("dragenter", function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (!_this.tempText) {
                    _this.tempText = overlay.innerText;
                }
                util_1.showElement(overlay);
                overlay.innerText = "Drop file";
                console.log(_this.tempText);
            });
            document.addEventListener("dragleave", function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (e.target === overlay) {
                    util_1.hideElement(overlay);
                    overlay.innerText = _this.tempText;
                    _this.tempText = null;
                    _this.emitEvent("dragleave");
                }
            });
            document.addEventListener("drop", function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (e.dataTransfer.files.length) {
                    _this.emitEvent("drop", e.dataTransfer.files[0]);
                }
                util_1.hideElement(overlay);
                overlay.innerText = _this.tempText;
                _this.tempText = null;
            });
            return _this;
        }
        return DragDrop;
    }(eventclass_1.EventClass));
    exports.DragDrop = DragDrop;
});
//# sourceMappingURL=dragdrop.js.map