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
    var LabelSlider = /** @class */ (function (_super) {
        __extends(LabelSlider, _super);
        function LabelSlider(minValue, maxValue, step, label, className) {
            if (label === void 0) { label = ""; }
            if (className === void 0) { className = ""; }
            var _this = _super.call(this, util_1.createElement("div", "labelSlider " + className)) || this;
            _this.createEvent("slide");
            _this.createEvent("change");
            _this.labelElement = util_1.createElement("div", "labelSlider-label");
            _this.labelElement.innerText = label;
            _this.labelElement.style.position = "absolute";
            _this.sliderElement = util_1.createElement("input", "labelSlider-slider");
            _this.sliderElement.type = "range";
            _this.sliderElement.min = minValue.toString();
            _this.sliderElement.max = maxValue.toString();
            _this.sliderElement.step = step.toString();
            _this.sliderElement.style.position = "absolute";
            _this.sliderElement.addEventListener("input", function () {
                _this.emitEvent("slide", parseFloat(_this.sliderElement.value));
            });
            _this.sliderElement.addEventListener("change", function () {
                _this.emitEvent("change", parseFloat(_this.sliderElement.value));
            });
            _this.appendChild(_this.labelElement, _this.sliderElement);
            return _this;
        }
        Object.defineProperty(LabelSlider.prototype, "value", {
            get: function () {
                return parseFloat(this.sliderElement.value);
            },
            set: function (value) {
                this.sliderElement.value = value.toString();
            },
            enumerable: true,
            configurable: true
        });
        return LabelSlider;
    }(widget_1.Widget));
    exports.LabelSlider = LabelSlider;
});
//# sourceMappingURL=labeledslider.js.map