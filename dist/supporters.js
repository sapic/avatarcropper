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
define(["require", "exports", "./closabledialog"], function (require, exports, closabledialog_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SupportersDialog = /** @class */ (function (_super) {
        __extends(SupportersDialog, _super);
        function SupportersDialog() {
            var _this = _super.call(this) || this;
            _this.ppl = [
                "Glen Cathey",
                "Betty Glez",
                "Max Abbot",
                "MetalSonicDash",
                "Almxg Levi",
                "and 2 anons:)"
            ];
            _this.dialog.classList.add("dialog-supporters");
            _this.innerHTML = "<h1>Supporters</h1>";
            _this.innerHTML += "Thanks to these people for donating and contributing to my work!!<br><br>";
            _this.innerHTML += _this.ppl.join("<br>");
            _this.innerHTML += "<br><br>I always ask before publishing a name so just let me know if you'd prefer to stay anonymous!<br>ok thx love u";
            return _this;
        }
        return SupportersDialog;
    }(closabledialog_1.ClosableDialog));
    exports.SupportersDialog = SupportersDialog;
});
//# sourceMappingURL=supporters.js.map