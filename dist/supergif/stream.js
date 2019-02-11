define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SuperGifStream = /** @class */ (function () {
        function SuperGifStream(data) {
            this.data = data;
            this.position = 0;
        }
        SuperGifStream.prototype.readByte = function () {
            if (this.position >= this.data.length) {
                throw new Error('Attempted to read past end of stream.');
            }
            if (this.data instanceof Uint8Array) {
                return this.data[this.position++];
            }
            else {
                return this.data.charCodeAt(this.position++) & 0xFF;
            }
        };
        ;
        SuperGifStream.prototype.readBytes = function (n) {
            var bytes = [];
            for (var i = 0; i < n; i++) {
                bytes.push(this.readByte());
            }
            return bytes;
        };
        ;
        SuperGifStream.prototype.read = function (n) {
            var s = '';
            for (var i = 0; i < n; i++) {
                s += String.fromCharCode(this.readByte());
            }
            return s;
        };
        ;
        SuperGifStream.prototype.readUnsigned = function () {
            var a = this.readBytes(2);
            return (a[1] << 8) + a[0];
        };
        ;
        return SuperGifStream;
    }());
    exports.SuperGifStream = SuperGifStream;
});
//# sourceMappingURL=stream.js.map