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
define(["require", "exports", "./dialog"], function (require, exports, dialog_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var InputDialog = /** @class */ (function (_super) {
        __extends(InputDialog, _super);
        function InputDialog(onreturn) {
            var _this = _super.call(this) || this;
            _this.container.classList.add("input");
            _this.createEvent("return");
            if (onreturn) {
                _this.on("return", onreturn);
            }
            _this.container.addEventListener("click", function () {
                _this.emitEvent("return", InputDialog.NO_RESPONSE);
            });
            return _this;
        }
        InputDialog.NO_RESPONSE = null;
        return InputDialog;
    }(dialog_1.Dialog));
    exports.InputDialog = InputDialog;
});
//# sourceMappingURL=inputdialog.js.map