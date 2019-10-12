define(["require", "exports", "./rectangle"], function (require, exports, rectangle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * A class to represent a two-dimensional point in space, or something that would benefit from a similar treatment.
     *
     * Any functions that are said to return a copy do not modify the original point.
     *
     * Any operations such as [[times]] that act on two points will perform their operations element-wise. So, in the example of [[times]], the x-coordinates will be multiplied together and the y-coordinates will be multiplied together.
     */
    var Point = /** @class */ (function () {
        /**
         * Creates a new Point.
         * @param x The x-coordinate of the point. If not defined, both x and y will be set to 0.
         * @param y The y-coordinate of the point. If not defined, the x value will be used in its place.
         */
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
        Point.fromSizeLike = function (sizeLike) {
            return new Point(sizeLike.width, sizeLike.height);
        };
        Point.fromPointLike = function (pointLike) {
            return new Point(pointLike.x, pointLike.y);
        };
        Point.prototype.toRectangle = function (offset) {
            return new rectangle_1.Rectangle(offset || new Point(0), this.copy());
        };
        Object.defineProperty(Point.prototype, "xOnly", {
            /**
             * @returns A copy of the point with y set to 0.
             */
            get: function () {
                return new Point(this.x, 0);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Point.prototype, "yOnly", {
            /**
             * @returns A copy of the point with x set to 0.
             */
            get: function () {
                return new Point(0, this.y);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Point.prototype, "unitX", {
            /**
             * @returns A copy of the point scaled so that the magnitude of its x-coordinate is 1.
             */
            get: function () {
                return new Point(this.x > 0 ? 1 : -1, this.y / this.x);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Point.prototype, "unitY", {
            /**
             * @returns A copy of the point scaled so that the magnitude of its y-coordinate is 1.
             */
            get: function () {
                return new Point(this.x / this.y, this.y > 0 ? 1 : -1);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Point.prototype, "inverted", {
            /**
             * @returns A copy of the point with both coordinates inverted (multiplied by -1).
             */
            get: function () {
                return this.times(-1);
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @param x The magnitude of the horizontal scaling.
         * @returns A copy of the point, inverted and scaled so that the magnitude of its x-coordinate is the passed value.
         */
        Point.prototype.reverseByX = function (x) {
            var offset = this.unitX.inverted.times(x);
            this.x = offset.x;
            this.y = offset.y;
        };
        /**
         * @param x The magnitude of the vertical scaling.
         * @returns A copy of the point, inverted and scaled so that the magnitude of its y-coordinate is the passed value.
         */
        Point.prototype.reverseByY = function (y) {
            var offset = this.unitY.inverted.times(y);
            this.x = offset.x;
            this.y = offset.y;
        };
        /**
         * @param array The array from which to construct the point. Should be in the format [ x, y ]. Any elements beyond the second will be ignored.
         * @returns A new point, the constructor called using the array as an argument list.
         */
        Point.fromArray = function (array) {
            return new (Point.bind.apply(Point, [void 0].concat(array)))();
        };
        /**
         * Used to generate a point from an index within a rectangular shape and the width of that rectangle. Like translating a tile index to a tile location.
         * @param index The 0-based index to translate into a point.
         * @param width The width of the rectangle.
         */
        Point.fromIndex = function (index, width) {
            return new Point(index % width, ~~(index / width));
        };
        /**
         * @param p The point with which to test equality.
         * @returns Whether or not the two points have equal x and y values.
         */
        Point.prototype.equals = function (p) {
            return this.x === p.x && this.y === p.y;
        };
        /**
         * @returns A copy of the point.
         */
        Point.prototype.copy = function () {
            return new Point(this.x, this.y);
        };
        /**
         * Modifies the point so that its coordinates are rounded to the nearest integer using Math.round.
         */
        Point.prototype.round = function () {
            this.x = Math.round(this.x);
            this.y = Math.round(this.y);
        };
        Object.defineProperty(Point.prototype, "rounded", {
            /**
             * @returns A copy of the point with its coordinates rounded via Math.round.
             */
            get: function () {
                return new Point(Math.round(this.x), Math.round(this.y));
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @param n A number or other point by which to multiply the point.
         * @returns A copy of the point multiplied by the given value.
         */
        Point.prototype.times = function (n) {
            var ret = this.copy();
            ret.multiply(n);
            return ret;
        };
        /**
         * Multiplies the point by the given value.
         * @param n A number or other point by which to multiply the point.
         */
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
        /**
         * @param n A number or other point by which to divide the point.
         * @returns A copy of the point divided by the given value.
         */
        Point.prototype.dividedBy = function (n) {
            var ret = this.copy();
            ret.divideBy(n);
            return ret;
        };
        /**
         * Divides the point by the given value.
         * @param n A number or other point by which to divide the point.
         */
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
        /**
         * @param n A number or other point to be added to the point.
         * @returns A copy of the point summed with the given value.
         */
        Point.prototype.plus = function (n) {
            var ret = this.copy();
            ret.add(n);
            return ret;
        };
        /**
         * Adds the given point to this point.
         * @param n A number or other point to be added to this point.
         */
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
        /**
         * @param n A number or other point to be subtracted from the point.
         * @returns A copy of the difference between this point and the given point.
         */
        Point.prototype.minus = function (n) {
            var ret = this.copy();
            ret.subtract(n);
            return ret;
        };
        /**
         * Subtracts the given point from this point.
         * @param n A number or other point to be subtracted from this point.
         */
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
            /**
             * @returns A copy of this point with its coordinates multiplied by themselves.
             */
            get: function () {
                return this.times(this);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Point.prototype, "sum", {
            /**
             * @returns The sum of the point's two coordinates.
             */
            get: function () {
                return this.x + this.y;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Point.prototype, "min", {
            /**
             * @returns The smaller of the point's two coordinates.
             */
            get: function () {
                return Math.min(this.x, this.y);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Point.prototype, "max", {
            /**
             * @returns The larger of the point's two coordinates.
             */
            get: function () {
                return Math.max(this.x, this.y);
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @param p The point to get the distance to.
         * @returns The distance between this and the given point.
         */
        Point.prototype.distanceTo = function (p) {
            return Math.sqrt(this.minus(p).squared.sum);
        };
        /**
         * @returns A string in the format (x, y).
         */
        Point.prototype.toString = function () {
            return "(" + this.x + ", " + this.y + ")";
        };
        /**
         * @returns A length-2 array of the form [ x, y ].
         */
        Point.prototype.toArray = function () {
            return [this.x, this.y];
        };
        return Point;
    }());
    exports.Point = Point;
});
//# sourceMappingURL=point.js.map