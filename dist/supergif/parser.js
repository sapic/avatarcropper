var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "./utils", "../eventclass"], function (require, exports, utils_1, eventclass_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // The actual parsing; returns an object with properties.
    var SuperGifParser = /** @class */ (function (_super) {
        __extends(SuperGifParser, _super);
        function SuperGifParser(stream, handler) {
            var _this = _super.call(this) || this;
            _this.stream = stream;
            _this.handler = handler;
            _this.shouldAbort = false;
            _this.shouldAbortSilently = false;
            _this.createEvent("abort");
            return _this;
        }
        SuperGifParser.prototype.abort = function (silent) {
            if (silent === void 0) { silent = false; }
            this.shouldAbort = true;
            this.shouldAbortSilently = silent;
        };
        // LZW (GIF-specific)
        SuperGifParser.prototype.parseCT = function (entries) {
            var ct = [];
            for (var i = 0; i < entries; i++) {
                ct.push(this.stream.readBytes(3));
            }
            return ct;
        };
        ;
        SuperGifParser.prototype.readSubBlocks = function () {
            var size, data;
            data = '';
            do {
                size = this.stream.readByte();
                data += this.stream.read(size);
            } while (size !== 0);
            return data;
        };
        ;
        SuperGifParser.prototype.parseHeader = function () {
            var hdr = {};
            hdr.sig = this.stream.read(3);
            hdr.ver = this.stream.read(3);
            if (hdr.sig !== 'GIF')
                throw new Error('Not a GIF file.'); // XXX: This should probably be handled more nicely.
            hdr.width = this.stream.readUnsigned();
            hdr.height = this.stream.readUnsigned();
            var bits = utils_1.SuperGifUtils.byteToBitArr(this.stream.readByte());
            hdr.gctFlag = bits.shift();
            hdr.colorRes = utils_1.SuperGifUtils.bitsToNum(bits.splice(0, 3));
            hdr.sorted = bits.shift();
            hdr.gctSize = utils_1.SuperGifUtils.bitsToNum(bits.splice(0, 3));
            hdr.bgColor = this.stream.readByte();
            hdr.pixelAspectRatio = this.stream.readByte(); // if not 0, aspectRatio = (pixelAspectRatio + 15) / 64
            if (hdr.gctFlag) {
                hdr.gct = this.parseCT(1 << (hdr.gctSize + 1));
            }
            this.handler.hdr && this.handler.hdr(hdr);
        };
        ;
        SuperGifParser.prototype.parseExt = function (block) {
            var _this = this;
            var parseGCExt = function (block) {
                var blockSize = _this.stream.readByte(); // Always 4
                var bits = utils_1.SuperGifUtils.byteToBitArr(_this.stream.readByte());
                block.reserved = bits.splice(0, 3); // Reserved; should be 000.
                block.disposalMethod = utils_1.SuperGifUtils.bitsToNum(bits.splice(0, 3));
                block.userInput = bits.shift();
                block.transparencyGiven = bits.shift();
                block.delayTime = _this.stream.readUnsigned();
                block.transparencyIndex = _this.stream.readByte();
                block.terminator = _this.stream.readByte();
                _this.handler.gce && _this.handler.gce(block);
            };
            var parseComExt = function (block) {
                block.comment = _this.readSubBlocks();
                _this.handler.com && _this.handler.com(block);
            };
            var parsePTExt = function (block) {
                // No one *ever* uses this. If you use it, deal with parsing it yourself.
                var blockSize = _this.stream.readByte(); // Always 12
                block.ptHeader = _this.stream.readBytes(12);
                block.ptData = _this.readSubBlocks();
                _this.handler.pte && _this.handler.pte(block);
            };
            var parseAppExt = function (block) {
                var parseNetscapeExt = function (block) {
                    var blockSize = _this.stream.readByte(); // Always 3
                    block.unknown = _this.stream.readByte(); // ??? Always 1? What is this?
                    block.iterations = _this.stream.readUnsigned();
                    block.terminator = _this.stream.readByte();
                    _this.handler.app && _this.handler.app.NETSCAPE && _this.handler.app.NETSCAPE(block);
                };
                var parseUnknownAppExt = function (block) {
                    block.appData = _this.readSubBlocks();
                    // FIXME: This won't work if a handler wants to match on any identifier.
                    _this.handler.app && _this.handler.app[block.identifier] && _this.handler.app[block.identifier](block);
                };
                var blockSize = _this.stream.readByte(); // Always 11
                block.identifier = _this.stream.read(8);
                block.authCode = _this.stream.read(3);
                switch (block.identifier) {
                    case 'NETSCAPE':
                        parseNetscapeExt(block);
                        break;
                    default:
                        parseUnknownAppExt(block);
                        break;
                }
            };
            var parseUnknownExt = function (block) {
                block.data = _this.readSubBlocks();
                _this.handler.unknown && _this.handler.unknown(block);
            };
            block.label = this.stream.readByte();
            switch (block.label) {
                case 0xF9:
                    block.extType = 'gce';
                    parseGCExt(block);
                    break;
                case 0xFE:
                    block.extType = 'com';
                    parseComExt(block);
                    break;
                case 0x01:
                    block.extType = 'pte';
                    parsePTExt(block);
                    break;
                case 0xFF:
                    block.extType = 'app';
                    parseAppExt(block);
                    break;
                default:
                    block.extType = 'unknown';
                    parseUnknownExt(block);
                    break;
            }
        };
        ;
        SuperGifParser.prototype.parseImg = function (img) {
            var deinterlace = function (pixels, width) {
                // Of course this defeats the purpose of interlacing. And it's *probably*
                // the least efficient way it's ever been implemented. But nevertheless...
                var newPixels = new Array(pixels.length);
                var rows = pixels.length / width;
                var cpRow = function (toRow, fromRow) {
                    var fromPixels = pixels.slice(fromRow * width, (fromRow + 1) * width);
                    newPixels.splice.apply(newPixels, [toRow * width, width].concat(fromPixels));
                };
                // See appendix E.
                var offsets = [0, 4, 2, 1];
                var steps = [8, 8, 4, 2];
                var fromRow = 0;
                for (var pass = 0; pass < 4; pass++) {
                    for (var toRow = offsets[pass]; toRow < rows; toRow += steps[pass]) {
                        cpRow(toRow, fromRow);
                        fromRow++;
                    }
                }
                return newPixels;
            };
            img.leftPos = this.stream.readUnsigned();
            img.topPos = this.stream.readUnsigned();
            img.width = this.stream.readUnsigned();
            img.height = this.stream.readUnsigned();
            var bits = utils_1.SuperGifUtils.byteToBitArr(this.stream.readByte());
            img.lctFlag = bits.shift();
            img.interlaced = bits.shift();
            img.sorted = bits.shift();
            img.reserved = bits.splice(0, 2);
            img.lctSize = utils_1.SuperGifUtils.bitsToNum(bits.splice(0, 3));
            if (img.lctFlag) {
                img.lct = this.parseCT(1 << (img.lctSize + 1));
            }
            img.lzwMinCodeSize = this.stream.readByte();
            var lzwData = this.readSubBlocks();
            img.pixels = utils_1.SuperGifUtils.lzwDecode(img.lzwMinCodeSize, lzwData);
            if (img.interlaced) { // Move
                img.pixels = deinterlace(img.pixels, img.width);
            }
            this.handler.img && this.handler.img(img);
        };
        ;
        SuperGifParser.prototype.parseBlock = function () {
            var block = {};
            block.sentinel = this.stream.readByte();
            switch (String.fromCharCode(block.sentinel)) { // For ease of matching
                case '!':
                    block.type = 'ext';
                    this.parseExt(block);
                    break;
                case ',':
                    block.type = 'img';
                    this.parseImg(block);
                    break;
                case ';':
                    block.type = 'eof';
                    this.handler.eof && this.handler.eof(block);
                    break;
                default:
                    throw new Error('Unknown block: 0x' + block.sentinel.toString(16)); // TODO: Pad this with a 0.
            }
            if (this.shouldAbort) {
                if (!this.shouldAbortSilently) {
                    this.emitEvent("abort");
                }
                this.shouldAbort = false;
                return;
            }
            if (block.type !== 'eof')
                setTimeout(this.parseBlock.bind(this), 0);
        };
        ;
        SuperGifParser.prototype.parse = function () {
            this.parseHeader();
            setTimeout(this.parseBlock.bind(this), 0);
        };
        ;
        return SuperGifParser;
    }(eventclass_1.EventClass));
    exports.SuperGifParser = SuperGifParser;
});
//# sourceMappingURL=parser.js.map