define(["require", "exports", "./point"], function (require, exports, point_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Rectangle = /** @class */ (function () {
        function Rectangle(position, size) {
            this.position = position;
            this.size = size;
        }
        Rectangle.prototype.toString = function () {
            return "(" + this.x + ", " + this.y + ", " + this.width + ", " + this.height + ")";
        };
        Rectangle.prototype.fitInside = function (rect, anchor) {
            var ar = rect.aspectRatio;
            var startPoint = this.getPointFromAnchor(anchor).copy();
            if (ar > this.aspectRatio) {
                // wider //
                this.width *= rect.height / this.height;
                this.height = rect.height;
            }
            else {
                // taller //
                this.height *= rect.width / this.width;
                this.width = rect.width;
            }
            this.setPointFromAnchor(anchor, startPoint);
        };
        Rectangle.prototype.setWidthKeepAR = function (width) {
            var ar = this.width / width;
            this.width = width;
            this.height = this.height / ar;
        };
        Rectangle.prototype.setHeightKeepAR = function (height) {
            var ar = this.height / height;
            this.height = height;
            this.width = this.width / ar;
        };
        Rectangle.prototype.expandToward = function (anchor, factor) {
            switch (anchor) {
                case "ne":
                    var bl = this.bottomLeft;
                    this.size.multiply(factor);
                    this.bottomLeft = bl;
                    break;
                case "nw":
                    var br = this.bottomRight;
                    this.size.multiply(factor);
                    this.bottomRight = br;
                    break;
                case "se":
                    var tl = this.topLeft;
                    this.size.multiply(factor);
                    this.topLeft = tl;
                    break;
                case "sw":
                    var tr = this.topRight;
                    this.size.multiply(factor);
                    this.topRight = tr;
                    break;
            }
        };
        Rectangle.prototype.fitInsideGreedyCenter = function (rect, boundingRect) {
            var ar = rect.aspectRatio;
            var center = this.center.copy(); // just being careful
            var size = this.size.copy();
            if (ar > 1) {
                // wider //
                this.height *= rect.width / this.width;
                this.width = rect.width;
            }
            else {
                // taller //
                this.width *= rect.height / this.height;
                this.height = rect.height;
            }
            this.center = center;
            if (!boundingRect.containsRect(this)) {
                if (this.right > boundingRect.right) {
                    this.setHeightKeepAR(size.x);
                }
                if (this.bottom > boundingRect.bottom) {
                    this.setHeightKeepAR(size.y);
                }
                if (this.left < boundingRect.left) {
                    this.setHeightKeepAR(size.x);
                }
                if (this.top < boundingRect.top) {
                    this.setHeightKeepAR(size.y);
                }
                this.center = center;
            }
        };
        Rectangle.prototype.fitInsideGreedy = function (rect, anchor, boundingRect) {
            var ar = rect.aspectRatio;
            var startPoint = this.getPointFromAnchor(anchor).copy();
            if (ar > 1) {
                // wider //
                this.height *= rect.width / this.width;
                this.width = rect.width;
            }
            else {
                // taller //
                this.width *= rect.height / this.height;
                this.height = rect.height;
            }
            this.setPointFromAnchor(anchor, startPoint);
            if (!boundingRect.containsRect(this)) {
                if (this.right > boundingRect.right) {
                    this.setWidthKeepAR(boundingRect.right - this.left);
                }
                if (this.bottom > boundingRect.bottom) {
                    this.setHeightKeepAR(boundingRect.bottom - this.top);
                }
                if (this.left < boundingRect.left) {
                    this.setWidthKeepAR(this.right - boundingRect.left);
                }
                if (this.top < boundingRect.top) {
                    this.setHeightKeepAR(this.bottom - boundingRect.top);
                }
                this.setPointFromAnchor(anchor, startPoint);
            }
        };
        Rectangle.prototype.copy = function () {
            return new Rectangle(this.position.copy(), this.size.copy());
        };
        Rectangle.prototype.mirror = function (r) {
            this.position = r.position;
            this.size = r.size;
        };
        Rectangle.prototype.getPointFromAnchor = function (anchor) {
            switch (anchor) {
                case "nw": return this.topLeft;
                case "ne": return this.topRight;
                case "sw": return this.bottomLeft;
                case "se": return this.bottomRight;
            }
        };
        Rectangle.prototype.setPointFromAnchor = function (anchor, point) {
            switch (anchor) {
                case "nw":
                    this.topLeft = point;
                    break;
                case "ne":
                    this.topRight = point;
                    break;
                case "sw":
                    this.bottomLeft = point;
                    break;
                case "se":
                    this.bottomRight = point;
                    break;
            }
        };
        Rectangle.anchorOpposite = function (anchor) {
            switch (anchor) {
                case "nw": return "se";
                case "ne": return "sw";
                case "sw": return "ne";
                case "se": return "nw";
            }
        };
        Object.defineProperty(Rectangle.prototype, "aspectRatio", {
            get: function () {
                return this.width / this.height;
            },
            enumerable: true,
            configurable: true
        });
        Rectangle.prototype.round = function (aboutCenter) {
            if (aboutCenter === void 0) { aboutCenter = false; }
            if (aboutCenter) {
                var c = this.center;
                this.size.round();
                this.center = c.rounded;
            }
            else {
                this.position.round();
                this.size.round();
            }
        };
        Object.defineProperty(Rectangle.prototype, "local", {
            get: function () {
                return new Rectangle(new point_1.Point(0), this.size.copy());
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "x", {
            get: function () {
                return this.position.x;
            },
            set: function (x) {
                this.position.x = x;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "y", {
            get: function () {
                return this.position.y;
            },
            set: function (y) {
                this.position.y = y;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "left", {
            get: function () {
                return this.position.x;
            },
            set: function (left) {
                this.position.x = left;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "top", {
            get: function () {
                return this.position.y;
            },
            set: function (top) {
                this.position.y = top;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "width", {
            get: function () {
                return this.size.x;
            },
            set: function (width) {
                this.size.x = width;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "height", {
            get: function () {
                return this.size.y;
            },
            set: function (height) {
                this.size.y = height;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "right", {
            get: function () {
                return this.x + this.width;
            },
            set: function (right) {
                this.x = right - this.width;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "bottom", {
            get: function () {
                return this.y + this.height;
            },
            set: function (bottom) {
                this.y = bottom - this.height;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "topLeft", {
            get: function () {
                return this.position;
            },
            set: function (topLeft) {
                this.position = topLeft;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "topRight", {
            get: function () {
                return this.position.plus(new point_1.Point(this.width, 0));
            },
            set: function (topRight) {
                this.position = topRight.minus(new point_1.Point(this.width, 0));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "bottomLeft", {
            get: function () {
                return this.position.plus(new point_1.Point(0, this.height));
            },
            set: function (bottomLeft) {
                this.position = bottomLeft.minus(new point_1.Point(0, this.height));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "bottomRight", {
            get: function () {
                return this.position.plus(this.size);
            },
            set: function (bottomRight) {
                this.position = bottomRight.minus(this.size);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "center", {
            get: function () {
                return this.position.plus(this.size.times(1 / 2));
            },
            set: function (center) {
                this.position = center.minus(this.size.times(1 / 2));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "cx", {
            get: function () {
                return this.center.x;
            },
            set: function (cx) {
                this.position.x = cx - this.size.x / 2;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "cy", {
            get: function () {
                return this.center.y;
            },
            set: function (cy) {
                this.position.y = cy - this.size.y / 2;
            },
            enumerable: true,
            configurable: true
        });
        Rectangle.prototype.containsPoint = function (p) {
            return (p.x >= this.x && p.x <= this.right &&
                p.y >= this.y && p.y <= this.bottom);
        };
        Rectangle.prototype.containsRect = function (r) {
            return this.containsPoint(r.topLeft) && this.containsPoint(r.bottomRight);
        };
        Rectangle.between = function (p1, p2) {
            var pos = new point_1.Point(Math.min(p1.x, p2.x), Math.min(p1.y, p2.y));
            var size = new point_1.Point(Math.abs(p1.x - p2.x), Math.abs(p1.y - p2.y));
            return new Rectangle(pos, size);
        };
        return Rectangle;
    }());
    exports.Rectangle = Rectangle;
});
//# sourceMappingURL=rectangle.js.map