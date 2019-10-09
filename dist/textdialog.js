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
define(["require", "exports", "./closabledialog", "./util"], function (require, exports, closabledialog_1, util_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TextDialog = /** @class */ (function (_super) {
        __extends(TextDialog, _super);
        function TextDialog() {
            var _this = _super.call(this) || this;
            _this.dialog.classList.add("text");
            _this.textContent = util_1.createElement("div", "text");
            _this.appendChild(_this.textContent);
            _this.contentContainer = _this.textContent;
            return _this;
        }
        return TextDialog;
    }(closabledialog_1.ClosableDialog));
    exports.TextDialog = TextDialog;
});
//# sourceMappingURL=textdialog.js.map