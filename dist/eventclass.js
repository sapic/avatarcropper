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
            if (!this.events.has(event)) {
                console.warn("event not yet created: " + event);
                this.events.set(event, []);
            }
            this.events.get(event).forEach(function (o) { return o.fn.apply(o, args); });
        };
        EventClass.prototype.on = function (event, fn, id) {
            if (id === void 0) { id = "[unidentified]"; }
            if (!this.events.has(event)) {
                console.warn("event not yet created: " + event);
                this.events.set(event, []);
            }
            this.events.get(event).push({ fn: fn, id: id });
        };
        EventClass.prototype.once = function (event, fn, id) {
            var _this = this;
            if (id === void 0) { id = "[unidentified oneshot]"; }
            if (!this.events.has(event)) {
                console.warn("event not yet created: " + event);
                this.events.set(event, []);
            }
            var wrapper = {
                fn: function () {
                    fn();
                    util_1.array_remove(_this.events.get(event), wrapper);
                },
                id: id
            };
            this.events.get(event).push(wrapper);
        };
        EventClass.prototype.debugEvent = function (event) {
            if (!this.events.has(event)) {
                console.warn("event not yet created: " + event);
                this.events.set(event, []);
            }
            console.log("ids registered to event `" + event + "`:");
            this.events.get(event).forEach(function (o) { return console.log(o.id); });
        };
        return EventClass;
    }());
    exports.EventClass = EventClass;
    exports.GlobalEvents = new EventClass();
});
//# sourceMappingURL=eventclass.js.map