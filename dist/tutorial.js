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
    var TutorialDialog = /** @class */ (function (_super) {
        __extends(TutorialDialog, _super);
        function TutorialDialog() {
            var _this = _super.call(this) || this;
            _this.dialog.classList.add("dialog-tutorial");
            var h1 = util_1.createElement("h1");
            h1.innerText = "Tutorial..";
            var body = util_1.createElement("div");
            body.innerHTML =
                "Hello, you can resize the cropping area by dragging on the "
                    + "\"corners\" of the circle/square.<br>"
                    + "<img src='img/tut.png' class='image'><br>"
                    + "Thank you, this has been the tutorial.<br>"
                    + "Please leave feedback or donate with the links at the bottom!";
            _this.appendChild(h1, body);
            return _this;
        }
        return TutorialDialog;
    }(closabledialog_1.ClosableDialog));
    exports.TutorialDialog = TutorialDialog;
});
//# sourceMappingURL=tutorial.js.map