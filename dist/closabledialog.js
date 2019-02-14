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
define(["require", "exports", "./dialog", "./util"], function (require, exports, dialog_1, util_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ClosableDialog = /** @class */ (function (_super) {
        __extends(ClosableDialog, _super);
        function ClosableDialog() {
            var _this = _super.call(this) || this;
            _this.dialog.classList.add("closable");
            var close = util_1.createElement("div", "close");
            close.innerText = "❌";
            close.addEventListener("click", function () {
                _this.hide();
            });
            _this.appendChild(close);
            _this.innerContent = util_1.createElement("div", "innerContent");
            _this.appendChild(_this.innerContent);
            _this.contentContainer = _this.innerContent;
            return _this;
        }
        return ClosableDialog;
    }(dialog_1.Dialog));
    exports.ClosableDialog = ClosableDialog;
});
//# sourceMappingURL=closabledialog.js.map