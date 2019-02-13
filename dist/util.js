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