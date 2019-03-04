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
define(["require", "exports", "./util", "./fractionalprogressbar", "./canvas", "./closabledialog"], function (require, exports, util_1, fractionalprogressbar_1, canvas_1, closabledialog_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Renderer = /** @class */ (function (_super) {
        __extends(Renderer, _super);
        function Renderer(cropView) {
            var _this = _super.call(this) || this;
            _this.renderedString = "Rendered! yayy";
            _this.renderingString = "Rendering...";
            _this.shouldStopRendering = false;
            _this.currentlyRendering = false;
            _this.initialized = false;
            _this.dialog.classList.add("dialog-render");
            _this.createEvent("close");
            _this.cropView = cropView;
            _this.headerElement = util_1.createElement("h1", "header");
            _this.headerElement.innerText = _this.renderingString;
            _this.progressBar = new fractionalprogressbar_1.FractionalProgressBar();
            _this.imageElement = util_1.createElement("img", "image");
            _this.noteElement = util_1.createElement("div", "note");
            _this.noteElement.innerText = "Save as a square for Discord!!";
            _this.pleaseWaitElement = util_1.createElement("div", "pleaseWait");
            _this.pleaseWaitElement.innerText = "Aborting render... please wait...";
            _this.optionBar = util_1.createElement("div", "optionBar");
            _this.saveButton = util_1.createElement("a", "save");
            _this.saveButton.innerText = "Save";
            _this.saveButton.addEventListener("click", function () {
                _this.saveButton.href = _this.imageElement.src;
            });
            _this.appendChild(_this.headerElement, _this.progressBar, _this.imageElement, _this.noteElement, _this.pleaseWaitElement, _this.optionBar, _this.saveButton);
            _this.initialized = true;
            return _this;
        }
        Renderer.prototype.render = function () {
            this.currentlyRendering = true;
            this.shouldStopRendering = false;
            this.show();
            if (this.cropView.currentFileType === "gif") {
                this.renderGif();
            }
            else {
                this.getFrameURLs(this.cropView.image, false, true, this.display.bind(this));
                this.currentlyRendering = false;
            }
        };
        Renderer.prototype.renderGif = function () {
            var _this = this;
            var gif = new SuperGif({
                gif: this.cropView.image.cloneNode()
            });
            this.loadGif = gif;
            var onload = function () {
                _this.loadGif = null;
                if (_this.shouldStopRendering) {
                    _this.currentlyRendering = false;
                    _this.tryClose();
                }
                var saveGif = new GIF({
                    workers: 3,
                    quality: 1,
                    dither: false,
                    width: _this.cropView.cropArea.diameter,
                    height: _this.cropView.cropArea.diameter,
                    debug: false,
                    copy: true
                });
                var len = gif.get_length();
                _this.progressBar.addFractionPart(1 / 6, len);
                var renderFrame = function (i) {
                    gif.move_to(i);
                    _this.getFrameURLs(gif.get_canvas(), true, false, function (options) {
                        var img = new Image();
                        img.addEventListener("load", function () {
                            if (_this.shouldStopRendering) {
                                _this.currentlyRendering = false;
                                _this.tryClose();
                                return;
                            }
                            saveGif.addFrame(img, {
                                delay: gif.get_frames()[i].delay * 10
                            });
                            _this.progressBar.step();
                            i++;
                            if (i === len) {
                                saveGif.render();
                            }
                            else {
                                renderFrame(i);
                            }
                        });
                        img.src = options[0].url;
                    });
                };
                saveGif.on("finished", function (blob) {
                    var url = URL.createObjectURL(blob);
                    _this.display([
                        {
                            label: "GIF",
                            url: url
                        }
                    ]);
                    _this.currentlyRendering = false;
                });
                saveGif.on("abort", function () {
                    _this.currentlyRendering = false;
                    _this.tryClose();
                });
                saveGif.on("progress", function (progress) {
                    _this.progressBar.progress = 1 / 6 + progress * 5 / 6;
                    if (_this.shouldStopRendering) {
                        saveGif.abort();
                    }
                });
                renderFrame(0);
            };
            gif.load(onload, undefined, function () {
                _this.loadGif = null;
                _this.currentlyRendering = false;
                _this.tryClose();
            });
        };
        Renderer.prototype.getFrameURLs = function (frame, pixelated, getCircle, callback) {
            var ret = [];
            var expectedLength = getCircle ? 2 : 1;
            var counter = 0;
            var check = function (url, label, index) {
                counter++;
                ret[index] = { url: url, label: label };
                if (counter === expectedLength) {
                    callback(ret);
                }
            };
            var rc = new canvas_1.Canvas({
                width: this.cropView.outerWidth,
                height: this.cropView.outerHeight,
                pixelated: pixelated
            });
            rc.drawRotatedImage(frame, this.cropView.rotation / 180 * Math.PI, this.cropView.outerWidth / 2 - this.cropView.innerWidth / 2, this.cropView.outerHeight / 2 - this.cropView.innerHeight / 2);
            var squareCrop = new canvas_1.Canvas({
                width: this.cropView.cropArea.diameter,
                height: this.cropView.cropArea.diameter,
                pixelated: pixelated
            });
            squareCrop.drawCroppedImage(rc, 0, 0, this.cropView.cropArea.position.x, this.cropView.cropArea.position.y, this.cropView.cropArea.diameter, this.cropView.cropArea.diameter);
            squareCrop.createBlob(function (blob) {
                check(URL.createObjectURL(blob), "Square", 0);
            });
            if (getCircle) {
                var circleCrop = new canvas_1.Canvas({
                    width: this.cropView.cropArea.diameter,
                    height: this.cropView.cropArea.diameter,
                    pixelated: pixelated
                });
                circleCrop.drawCroppedImage(rc, 0, 0, this.cropView.cropArea.position.x, this.cropView.cropArea.position.y, this.cropView.cropArea.diameter, this.cropView.cropArea.diameter);
                circleCrop.blendMode = "destination-in";
                circleCrop.fillCircleInSquare(0, 0, circleCrop.width, "white");
                circleCrop.createBlob(function (blob) {
                    check(URL.createObjectURL(blob), "Circle", 1);
                });
            }
        };
        Renderer.prototype.display = function (cropOptions) {
            var _this = this;
            this.progressBar.hide();
            util_1.showElement(this.optionBar);
            util_1.showElement(this.saveButton);
            this.headerElement.innerText = this.renderedString;
            this.optionBar.innerHTML = "";
            var firstButton;
            cropOptions.forEach(function (option, i) {
                var b = util_1.createElement("button", "option");
                b.style.width = (1 / cropOptions.length * 100) + "%";
                b.innerText = option.label;
                b.url = option.url;
                b.addEventListener("click", function () {
                    _this.imageElement.src = option.url;
                    var bs = _this.optionBar.children;
                    for (var i_1 = 0; i_1 < bs.length; i_1++) {
                        bs[i_1].classList.remove("toggled");
                    }
                    b.classList.add("toggled");
                });
                _this.optionBar.appendChild(b);
                if (i === 0) {
                    firstButton = b;
                }
            });
            this.imageElement.onload = function () {
                _this.contentContainer.scrollTop = _this.contentContainer.scrollHeight;
                _this.imageElement.onload = null;
            };
            firstButton.click();
        };
        Renderer.prototype.show = function () {
            this.progressBar.show();
            this.progressBar.reset();
            this.headerElement.innerText = this.renderingString;
            util_1.hideElement(this.optionBar);
            util_1.hideElement(this.saveButton);
            util_1.hideElement(this.pleaseWaitElement);
            this.imageElement.src = "";
            this.saveButton.setAttribute("download", this.cropView.filename);
            util_1.makePixelated(this.imageElement, !this.cropView.antialias);
            _super.prototype.show.call(this);
        };
        Renderer.prototype.hide = function (force) {
            if (force === void 0) { force = false; }
            if (force || !this.initialized) {
                _super.prototype.hide.call(this);
            }
            else {
                this.tryClose();
            }
        };
        Renderer.prototype.tryClose = function () {
            if (this.currentlyRendering) {
                this.shouldStopRendering = true;
                this.loadGif && this.loadGif.abort();
                util_1.showElement(this.pleaseWaitElement);
                return false;
            }
            var bs = this.optionBar.children;
            for (var i = 0; i < bs.length; i++) {
                bs[i].url && URL.revokeObjectURL(bs[i].url);
            }
            this.emitEvent("close");
            this.hide(true);
            return true;
        };
        return Renderer;
    }(closabledialog_1.ClosableDialog));
    exports.Renderer = Renderer;
});
//# sourceMappingURL=renderer.js.map