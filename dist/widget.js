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
    var Widget = /** @class */ (function (_super) {
        __extends(Widget, _super);
        function Widget(className_or_container) {
            var _this = _super.call(this) || this;
            if (className_or_container) {
                if (typeof (className_or_container) === "string") {
                    _this.container = util_1.createElement("div", className_or_container);
                }
                else {
                    _this.container = className_or_container;
                }
            }
            else {
                _this.container = util_1.createElement("div");
            }
            _this.contentContainer = _this.container;
            return _this;
        }
        Widget.prototype.show = function () {
            this.container.style.display = "";
        };
        Widget.prototype.hide = function () {
            this.container.style.display = "none";
        };
        Object.defineProperty(Widget.prototype, "innerHTML", {
            get: function () {
                return this.contentContainer.innerHTML;
            },
            set: function (innerHTML) {
                this.contentContainer.innerHTML = innerHTML;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Widget.prototype, "innerText", {
            get: function () {
                return this.contentContainer.innerText;
            },
            set: function (innerText) {
                this.contentContainer.innerText = innerText;
            },
            enumerable: true,
            configurable: true
        });
        Widget.prototype.appendChild = function () {
            var _this = this;
            var children = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                children[_i] = arguments[_i];
            }
            if (children.length === 1) {
                this.appendHelper(this.contentContainer, children[0]);
            }
            else {
                var frag_1 = document.createDocumentFragment();
                children.forEach(function (child) {
                    _this.appendHelper(frag_1, child);
                });
                this.contentContainer.appendChild(frag_1);
            }
        };
        Widget.prototype.appendHelper = function (parent, child) {
            if (child instanceof HTMLElement) {
                parent.appendChild(child);
            }
            else if (child) {
                parent.appendChild(child.container);
            }
        };
        Widget.prototype.removeChild = function (child) {
            if (!this.hasChild(child)) {
                return false;
            }
            if (child instanceof HTMLElement) {
                this.contentContainer.removeChild(child);
            }
            else {
                this.contentContainer.removeChild(child.container);
            }
            return true;
        };
        Widget.prototype.hasChild = function (child) {
            if (child instanceof HTMLElement) {
                return this.contentContainer.contains(child);
            }
            else {
                return this.contentContainer.contains(child.container);
            }
        };
        return Widget;
    }(eventclass_1.EventClass));
    exports.Widget = Widget;
});
//# sourceMappingURL=widget.js.map