define(["require", "exports", "./eventclass", "./point"], function (require, exports, eventclass_1, point_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Border = /** @class */ (function () {
        function Border() {
        }
        Object.defineProperty(Border, "current", {
            get: function () {
                return this.types[this.type];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Border, "type", {
            get: function () {
                return this._type;
            },
            set: function (type) {
                this._type = type;
                eventclass_1.GlobalEvents.emitEvent("borderchange");
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Border, "size", {
            get: function () {
                return this._size;
            },
            set: function (size) {
                this._size = size;
                eventclass_1.GlobalEvents.emitEvent("borderchange");
            },
            enumerable: true,
            configurable: true
        });
        Border.apply = function (canvas) {
            canvas.clear();
            if (this.type !== "none" && this.size > 0) {
                var p1 = this.current.p1.times(canvas.size);
                var p2 = this.current.p2.times(canvas.size);
                var gradient_1 = canvas.context.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
                this.current.gradient.forEach(function (def) {
                    gradient_1.addColorStop(def.pos, def.color);
                });
                canvas.context.fillStyle = gradient_1;
                canvas.context.fillRect(0, 0, canvas.width, canvas.height);
                canvas.blendMode = "destination-out";
                canvas.fillCircleInRect(canvas.size.toRectangle().expand(1 - this.size), "white");
                canvas.blendMode = "source-over";
            }
        };
        Border.types = {
            none: {
                text: "No Border",
                p1: new point_1.Point(0),
                p2: new point_1.Point(0),
                gradient: []
            },
            lgbt: {
                text: "LGBT Pride",
                p1: new point_1.Point(0.5, 0),
                p2: new point_1.Point(0.5, 1),
                gradient: [
                    { pos: 0 / 5, color: "#FF0018" },
                    { pos: 1 / 5, color: "#FFA52C" },
                    { pos: 2 / 5, color: "#FFFF41" },
                    { pos: 3 / 5, color: "#008018" },
                    { pos: 4 / 5, color: "#0000F9" },
                    { pos: 5 / 5, color: "#86007D" },
                ]
            },
            trans: {
                text: "Trans Pride",
                p1: new point_1.Point(0.5, 0),
                p2: new point_1.Point(0.5, 1),
                gradient: [
                    { pos: 0, color: "#55CDFC" },
                    { pos: 0.25, color: "#F7A8B8" },
                    { pos: 0.5, color: "#FFFFFF" },
                    { pos: 0.75, color: "#F7A8B8" },
                    { pos: 1, color: "#55CDFC" }
                ]
            },
            nonbinary: {
                text: "Nonbinary Pride",
                p1: new point_1.Point(0.5, 0),
                p2: new point_1.Point(0.5, 1),
                gradient: [
                    { pos: 0 / 3, color: "#FFF430" },
                    { pos: 1 / 3, color: "#FFFFFF" },
                    { pos: 2 / 3, color: "#9C59D1" },
                    { pos: 3 / 3, color: "#000000" },
                ]
            },
        };
        Border._type = "none";
        Border._size = 0.05;
        return Border;
    }());
    exports.Border = Border;
});
//# sourceMappingURL=borders.js.map