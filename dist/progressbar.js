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
define(["require", "exports", "./widget", "./util"], function (require, exports, widget_1, util_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ProgressBar = /** @class */ (function (_super) {
        __extends(ProgressBar, _super);
        function ProgressBar() {
            var _this = _super.call(this, util_1.createElement("div", "progressBar")) || this;
            _this.progressElement = util_1.createElement("div", "progress");
            _this.progressElement.style.height = "100%";
            _this.progress = 0;
            _this.appendChild(_this.progressElement);
            return _this;
        }
        Object.defineProperty(ProgressBar.prototype, "progress", {
            get: function () {
                return this._progress;
            },
            // 0 to 1 //
            set: function (progress) {
                this._progress = progress;
                this.progressElement.style.width = (progress * 100) + "%";
            },
            enumerable: true,
            configurable: true
        });
        return ProgressBar;
    }(widget_1.Widget));
    exports.ProgressBar = ProgressBar;
});
//# sourceMappingURL=progressbar.js.map