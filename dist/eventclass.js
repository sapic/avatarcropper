define(["require", "exports", "./util"], function (require, exports, util_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var EventClass = /** @class */ (function () {
        function EventClass() {
            this.events = new Map();
            // poopie
        }
        EventClass.prototype.createEvent = function (event) {
            if (!this.events.has(event)) {
                this.events.set(event, []);
            }
        };
        EventClass.prototype.emitEvent = function (event) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            this.events.get(event).forEach(function (fn) { return fn.apply(void 0, args); });
        };
        EventClass.prototype.on = function (event, fn) {
            if (!this.events.has(event)) {
                throw "no such event: " + event;
            }
            this.events.get(event).push(fn);
        };
        EventClass.prototype.once = function (event, fn) {
            var _this = this;
            var wrapperFn = function () {
                fn();
                util_1.array_remove(_this.events.get(event), wrapperFn);
            };
            this.on(event, wrapperFn);
        };
        return EventClass;
    }());
    exports.EventClass = EventClass;
});
//# sourceMappingURL=eventclass.js.map