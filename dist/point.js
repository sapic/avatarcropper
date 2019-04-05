define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Point = /** @class */ (function () {
        function Point(x, y) {
            if (x === undefined) {
                this.x = 0;
                this.y = 0;
            }
            else if (y === undefined) {
                this.x = x;
                this.y = x;
            }
            else {
                this.x = x;
                this.y = y;
            }
        }
        Point.prototype.equals = function (p) {
            return this.x === p.x && this.y === p.y;
        };
        Point.prototype.copy = function () {
            return new Point(this.x, this.y);
        };
        Point.prototype.round = function () {
            this.x = Math.round(this.x);
            this.y = Math.round(this.y);
        };
        Point.prototype.times = function (n) {
            var ret = this.copy();
            ret.multiply(n);
            return ret;
        };
        Point.prototype.multiply = function (n) {
            if (n instanceof Point) {
                this.x *= n.x;
                this.y *= n.y;
            }
            else {
                this.x *= n;
                this.y *= n;
            }
        };
        Point.prototype.dividedBy = function (n) {
            var ret = this.copy();
            ret.divideBy(n);
            return ret;
        };
        Point.prototype.divideBy = function (n) {
            if (n instanceof Point) {
                this.x /= n.x;
                this.y /= n.y;
            }
            else {
                this.x /= n;
                this.y /= n;
            }
        };
        Point.prototype.plus = function (n) {
            var ret = this.copy();
            ret.add(n);
            return ret;
        };
        Point.prototype.add = function (n) {
            if (n instanceof Point) {
                this.x += n.x;
                this.y += n.y;
            }
            else {
                this.x += n;
                this.y += n;
            }
        };
        Point.prototype.minus = function (n) {
            var ret = this.copy();
            ret.subtract(n);
            return ret;
        };
        Point.prototype.subtract = function (n) {
            if (n instanceof Point) {
                this.x -= n.x;
                this.y -= n.y;
            }
            else {
                this.x -= n;
                this.y -= n;
            }
        };
        Object.defineProperty(Point.prototype, "squared", {
            get: function () {
                return this.times(this);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Point.prototype, "sum", {
            get: function () {
                return this.x + this.y;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Point.prototype, "min", {
            get: function () {
                return Math.min(this.x, this.y);
            },
            enumerable: true,
            configurable: true
        });
        Point.prototype.distanceTo = function (p) {
            return Math.sqrt(this.minus(p).squared.sum);
        };
        Point.prototype.toString = function () {
            return "(" + this.x + ", " + this.y + ")";
        };
        return Point;
    }());
    exports.Point = Point;
});
//# sourceMappingURL=point.js.map