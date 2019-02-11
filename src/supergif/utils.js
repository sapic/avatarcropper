define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SuperGifUtils = (function () {
        function SuperGifUtils() {
        }
        SuperGifUtils.bitsToNum = function (ba) {
            return ba.reduce(function (s, n) {
                return s * 2 + n;
            }, 0);
        };
        ;
        SuperGifUtils.byteToBitArr = function (bite) {
            var a = [];
            for (var i = 7; i >= 0; i--) {
                a.push(!!(bite & (1 << i)));
            }
            return a;
        };
        ;
        SuperGifUtils.lzwDecode = function (minCodeSize, data) {
            var pos = 0;
            var readCode = function (size) {
                var code = 0;
                for (var i = 0; i < size; i++) {
                    if (data.charCodeAt(pos >> 3) & (1 << (pos & 7))) {
                        code |= 1 << i;
                    }
                    pos++;
                }
                return code;
            };
            var output = [];
            var clearCode = 1 << minCodeSize;
            var eoiCode = clearCode + 1;
            var codeSize = minCodeSize + 1;
            var dict = [];
            var clear = function () {
                dict = [];
                codeSize = minCodeSize + 1;
                for (var i = 0; i < clearCode; i++) {
                    dict[i] = [i];
                }
                dict[clearCode] = [];
                dict[eoiCode] = null;
            };
            var code;
            var last;
            while (true) {
                last = code;
                code = readCode(codeSize);
                if (code === clearCode) {
                    clear();
                    continue;
                }
                if (code === eoiCode)
                    break;
                if (code < dict.length) {
                    if (last !== clearCode) {
                        dict.push(dict[last].concat(dict[code][0]));
                    }
                }
                else {
                    if (code !== dict.length)
                        throw new Error('Invalid LZW code.');
                    dict.push(dict[last].concat(dict[last][0]));
                }
                output.push.apply(output, dict[code]);
                if (dict.length === (1 << codeSize) && codeSize < 12) {
                    codeSize++;
                }
            }
            return output;
        };
        ;
        return SuperGifUtils;
    }());
    exports.SuperGifUtils = SuperGifUtils;
});
