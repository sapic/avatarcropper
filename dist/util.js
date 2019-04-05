define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function createElement(type, className) {
        if (className === void 0) { className = ""; }
        var ret = document.createElement(type);
        ret.className = className;
        return ret;
    }
    exports.createElement = createElement;
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
                    this.setHeightKeepAR(this.top - boundingRect.top);
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
        Rectangle.prototype.round = function () {
            this.position.round();
            this.size.round();
        };
        Object.defineProperty(Rectangle.prototype, "local", {
            get: function () {
                return new Rectangle(new Point(0), this.size.copy());
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
                return this.position.plus(new Point(this.width, 0));
            },
            set: function (topRight) {
                this.position = topRight.minus(new Point(this.width, 0));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "bottomLeft", {
            get: function () {
                return this.position.plus(new Point(0, this.height));
            },
            set: function (bottomLeft) {
                this.position = bottomLeft.minus(new Point(0, this.height));
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
            var pos = new Point(Math.min(p1.x, p2.x), Math.min(p1.y, p2.y));
            var size = new Point(Math.abs(p1.x - p2.x), Math.abs(p1.y - p2.y));
            return new Rectangle(pos, size);
        };
        return Rectangle;
    }());
    exports.Rectangle = Rectangle;
    // https://codepen.io/gapcode/pen/vEJNZN
    function getIEVersion() {
        var ua = window.navigator.userAgent;
        // Test values; Uncomment to check result …
        // IE 10
        // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';
        // IE 11
        // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';
        // Edge 12 (Spartan)
        // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';
        // Edge 13
        // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';
        var msie = ua.indexOf('MSIE ');
        if (msie > 0) {
            // IE 10 or older => return version number
            return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        }
        var trident = ua.indexOf('Trident/');
        if (trident > 0) {
            // IE 11 => return version number
            var rv = ua.indexOf('rv:');
            return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
        }
        var edge = ua.indexOf('Edge/');
        if (edge > 0) {
            // Edge (IE 12+) => return version number
            return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
        }
        // other browser
        return false;
    }
    exports.getIEVersion = getIEVersion;
    function makePixelated(e, pixelate) {
        if (pixelate === void 0) { pixelate = true; }
        if (pixelate) {
            var types = ["optimizeSpeed", "crisp-edges", "-moz-crisp-edges", "-webkit-optimize-contrast", "optimize-contrast", "pixelated"];
            types.forEach(function (type) { return e.style["image-rendering"] = type; });
        }
        else {
            e.style["image-rendering"] = "";
        }
    }
    exports.makePixelated = makePixelated;
    function createOptionElement(text, value) {
        var ret = document.createElement("option");
        ret.innerText = text;
        ret.value = value;
        return ret;
    }
    exports.createOptionElement = createOptionElement;
    function hideElement(element) {
        element.style.display = "none";
    }
    exports.hideElement = hideElement;
    function showElement(element) {
        element.style.display = "";
    }
    exports.showElement = showElement;
    function element_isScrolledTo(element, allowPartial) {
        if (allowPartial === void 0) { allowPartial = false; }
        var height = element.getBoundingClientRect().height;
        var top = element.offsetTop;
        var bottom = top + height;
        var parent = element.parentElement;
        var parentHeight = parent.getBoundingClientRect().height;
        var scrollTop = parent.scrollTop;
        if (allowPartial) {
            return !(scrollTop + parentHeight <= top || scrollTop >= bottom);
        }
        else {
            return !(scrollTop + parentHeight < bottom || scrollTop > top);
        }
    }
    exports.element_isScrolledTo = element_isScrolledTo;
    function element_scrollIntoView(element, align) {
        var height = element.getBoundingClientRect().height;
        var top = element.offsetTop;
        var bottom = top + height;
        var parent = element.parentElement;
        var parentHeight = parent.getBoundingClientRect().height;
        var scrollHeight = parent.scrollHeight;
        switch (align) {
            case "top":
                parent.scrollTop = top;
                break;
            case "center":
                parent.scrollTop = parentHeight / 2 - height / 2;
                break;
            case "bottom":
                parent.scrollTop = bottom - parentHeight;
                break;
        }
    }
    exports.element_scrollIntoView = element_scrollIntoView;
    function element_scrollIntoViewIfNeeded(element, align, allowPartial) {
        if (!element_isScrolledTo(element, allowPartial)) {
            element_scrollIntoView(element, align);
        }
    }
    exports.element_scrollIntoViewIfNeeded = element_scrollIntoViewIfNeeded;
    function endsWith(str, endsWith) {
        if (endsWith.length > str.length) {
            return false;
        }
        return str.substr(str.length - endsWith.length) === endsWith;
    }
    exports.endsWith = endsWith;
    function emptyFn() { }
    exports.emptyFn = emptyFn;
    function array_contains(array, item) {
        return array.indexOf(item) !== -1;
    }
    exports.array_contains = array_contains;
    function array_remove(array, item) {
        var index = array.indexOf(item);
        if (index !== -1) {
            array.splice(index, 1);
            return { item: item, index: index, existed: true };
        }
        return { item: item, index: -1, existed: false };
    }
    exports.array_remove = array_remove;
    function array_remove_all(array, item) {
        var indexes = [];
        var index;
        while ((index = array.indexOf(item)) !== -1) {
            indexes.push(index);
            array.splice(index, 1);
        }
        return { item: item, indexes: indexes, existed: indexes.length > 0 };
    }
    exports.array_remove_all = array_remove_all;
    function array_item_at(array, index) {
        if (index >= array.length) {
            return array[index % array.length];
        }
        else if (index < 0) {
            return array[array.length - (-index % array.length)];
        }
        else {
            return array[index];
        }
    }
    exports.array_item_at = array_item_at;
    function array_remove_at(array, index) {
        if (index !== -1) {
            return { item: array.splice(index, 1)[0], index: index, existed: true };
        }
        return { item: null, index: -1, existed: false };
    }
    exports.array_remove_at = array_remove_at;
    function array_insert(array, item, index_or_fn) {
        if (typeof index_or_fn === "number") {
            array.splice(index_or_fn, 0, item);
            return { item: item, index: index_or_fn };
        }
        else {
            for (var i = 0; i < array.length; i++) {
                if (index_or_fn(item, array[i])) {
                    array.splice(i, 0, item);
                    return { item: item, index: i };
                }
            }
            array.push(item);
            return { item: item, index: array.length - 1 };
        }
    }
    exports.array_insert = array_insert;
    function array_copy(array) {
        return array.slice();
    }
    exports.array_copy = array_copy;
    function array_shuffle(array) {
        var i = 0;
        var j = 0;
        var temp = null;
        for (i = array.length - 1; i > 0; i -= 1) {
            j = Math.floor(Math.random() * (i + 1));
            temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }
    exports.array_shuffle = array_shuffle;
    function array_insert_random(array, item) {
        var index = Math.floor(Math.random() * (array.length + 1));
        return array_insert(array, item, index);
    }
    exports.array_insert_random = array_insert_random;
    function array_last(array) {
        return array[array.length - 1];
    }
    exports.array_last = array_last;
    function array_swap(array, a, b) {
        if (typeof (a) !== "number") {
            a = array.indexOf(a);
        }
        if (typeof (b) !== "number") {
            b = array.indexOf(b);
        }
        var temp = array[a];
        array[a] = array[b];
        array[b] = temp;
    }
    exports.array_swap = array_swap;
    function stopProp(e) {
        e.stopPropagation();
    }
    exports.stopProp = stopProp;
    function getRainbowColor(n) {
        var r = ~~(255 * (n < 0.5 ? 1 : 1 - 2 * (n - 0.5)));
        var g = ~~(255 * (n < 0.5 ? 2 * n : 1));
        var b = ~~(255 * (n > 0.5 ? 2 * (n - 0.5) : 0));
        var color = "rgb(" + r + "," + g + "," + b + ")";
        return color;
    }
    exports.getRainbowColor = getRainbowColor;
    function getCurrentMs() {
        return Date.now();
    }
    exports.getCurrentMs = getCurrentMs;
    function sign(n) {
        return (n > 0 ? 1 : (n < 0 ? -1 : 0));
    }
    exports.sign = sign;
});
//# sourceMappingURL=util.js.map