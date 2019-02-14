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
define(["require", "exports", "./widget", "./util"], function (require, exports, widget_1, util_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Dialog = /** @class */ (function (_super) {
        __extends(Dialog, _super);
        function Dialog() {
            var _this = _super.call(this, "dialog-backdrop") || this;
            _this.dialog = util_1.createElement("div", "dialog");
            _this.dialog.addEventListener("click", util_1.stopProp);
            _this.container.appendChild(_this.dialog);
            _this.contentContainer = _this.dialog;
            _this.container.addEventListener("click", function () {
                _this.hide();
            });
            _this.hide();
            return _this;
        }
        Dialog.prototype.show = function () {
            _super.prototype.show.call(this);
            this.contentContainer.scrollTop = 0;
        };
        return Dialog;
    }(widget_1.Widget));
    exports.Dialog = Dialog;
});
//# sourceMappingURL=dialog.js.map