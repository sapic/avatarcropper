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
define(["require", "exports", "./progressbar"], function (require, exports, progressbar_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var FractionalProgressBar = /** @class */ (function (_super) {
        __extends(FractionalProgressBar, _super);
        function FractionalProgressBar() {
            var _this = _super.call(this) || this;
            _this.fractionParts = [];
            _this.totalFractions = 0;
            return _this;
        }
        FractionalProgressBar.prototype.addFractionPart = function (fractionsOfWhole, internalSteps) {
            this.fractionParts.push({ fractionsOfWhole: fractionsOfWhole, internalSteps: internalSteps, counter: 0 });
            this.totalFractions += fractionsOfWhole;
        };
        FractionalProgressBar.prototype.step = function () {
            if (this.fractionParts.length > 0) {
                this.fractionParts[0].counter++;
                this.progress += (1 / this.fractionParts[0].internalSteps) * (this.fractionParts[0].fractionsOfWhole);
                if (this.fractionParts[0].counter === this.fractionParts[0].internalSteps) {
                    this.fractionParts.shift();
                }
            }
        };
        FractionalProgressBar.prototype.reset = function () {
            this.fractionParts = [];
            this.progress = 0;
        };
        return FractionalProgressBar;
    }(progressbar_1.ProgressBar));
    exports.FractionalProgressBar = FractionalProgressBar;
});
//# sourceMappingURL=fractionalprogressbar.js.map