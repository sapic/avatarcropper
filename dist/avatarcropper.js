var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "./widget", "./cropview", "./previews", "./util", "./labeledslider", "./storage"], function (require, exports, widget_1, cropview_1, previews_1, util_1, labeledslider_1, storage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var AvatarCropper = /** @class */ (function (_super) {
        __extends(AvatarCropper, _super);
        function AvatarCropper(container) {
            var _this = _super.call(this, container) || this;
            _this.menuToggle = true;
            _this.firstOpened = false;
            _this.settings = {
                maskOpacity: 0.5,
                previewMode: "circle",
                outlinesEnabled: true,
                antialias: true
            };
            _this.loadSettings();
            _this.constructMenu();
            _this.cropView = new cropview_1.CropView(_this.settings);
            _this.previews = new previews_1.Previews(_this.cropView);
            _this.appendChild(_this.cropView, _this.previews);
            _this.previews.addPreviewSize(128);
            _this.previews.addPreviewSize(30);
            _this.previews.addPreviewSize(40);
            _this.previews.addPreviewSize(64);
            window.addEventListener("resize", _this.handleResize.bind(_this));
            _this.previews.on("sizechange", _this.handleResize.bind(_this));
            _this.cropView.on("antialiaschange", function (antialiased) {
                if (antialiased) {
                    _this.antialiasButton.classList.add("toggled");
                }
                else {
                    _this.antialiasButton.classList.remove("toggled");
                }
                _this.settings.antialias = antialiased;
                _this.saveSettings();
            });
            _this.handleResize();
            return _this;
        }
        AvatarCropper.prototype.loadFromFile = function (file) {
            this.cropView.setImageFromFile(file);
        };
        AvatarCropper.prototype.saveSettings = function () {
            storage_1.default.set("settings", this.settings);
        };
        AvatarCropper.prototype.loadSettings = function () {
            var s = storage_1.default.get("settings", {});
            for (var key in this.settings) {
                if (s.hasOwnProperty(key)) {
                    this.settings[key] = s[key];
                }
            }
            this.saveSettings();
        };
        AvatarCropper.prototype.constructMenu = function () {
            var _this = this;
            this.menu = util_1.createElement("div", "menu");
            var openFile = util_1.createElement("input", "openInput show");
            openFile.type = "file";
            openFile.addEventListener("change", function (e) {
                if (openFile.files && openFile.files[0]) {
                    _this.openFile(openFile.files[0]);
                }
            });
            this.openFileLabel = util_1.createElement("label", "open item show");
            this.openFileLabel.innerText = "Open File...";
            this.openFileLabel.appendChild(openFile);
            this.menu.appendChild(this.openFileLabel);
            this.toggleMenuButton = util_1.createElement("button", "toggleMenu item show");
            this.toggleMenuButton.setAttribute("uptext", "▲");
            this.toggleMenuButton.setAttribute("downtext", "▼");
            this.toggleMenuButton.innerText = this.toggleMenuButton.getAttribute("uptext");
            this.toggleMenuButton.addEventListener("click", this.toggleMenu.bind(this));
            this.toggleMenuButton.style.display = "none";
            this.menu.appendChild(this.toggleMenuButton);
            var circle = util_1.createElement("button", "open item half");
            circle.innerText = "Circle";
            var square = util_1.createElement("button", "open item half");
            square.innerText = "Sqauarare";
            circle.addEventListener("click", function () {
                circle.classList.add("toggled");
                square.classList.remove("toggled");
                _this.settings.previewMode = "circle";
                _this.cropView && _this.cropView.refresh(); // will update previews as well
                _this.saveSettings();
            });
            square.addEventListener("click", function () {
                circle.classList.remove("toggled");
                square.classList.add("toggled");
                _this.settings.previewMode = "square";
                _this.cropView && _this.cropView.refresh(); // will update previews as well
                _this.saveSettings();
            });
            circle.style.display = "none";
            square.style.display = "none";
            this.menu.appendChild(circle);
            this.menu.appendChild(square);
            if (this.settings.previewMode === "circle") {
                circle.click();
            }
            else {
                square.click();
            }
            var tSlider = new labeledslider_1.LabelSlider(0, 1, 0.01, "Mask Transparency", "item transparency");
            tSlider.on("slide", this.setTransparency.bind(this));
            tSlider.on("change", this.saveSettings.bind(this));
            tSlider.value = 1 - this.settings.maskOpacity;
            tSlider.container.style.display = "none";
            this.menu.appendChild(tSlider.container);
            var zoomBar = util_1.createElement("div", "item zoomBar");
            var zoomLabel = util_1.createElement("div", "zoomLabel");
            zoomLabel.innerText = "Zoom:";
            zoomBar.appendChild(zoomLabel);
            var zoomOut = util_1.createElement("button", "zoomOut");
            zoomOut.innerText = "-";
            zoomOut.addEventListener("click", function () { return _this.cropView.zoomOut(); });
            var zoomIn = util_1.createElement("button", "zoomIn");
            zoomIn.innerText = "+";
            zoomIn.addEventListener("click", function () { return _this.cropView.zoomIn(); });
            var zoomFit = util_1.createElement("button", "zoomFit");
            zoomFit.innerText = "Fit";
            zoomFit.addEventListener("click", function () { return _this.cropView.zoomFit(); });
            zoomBar.appendChild(zoomFit);
            zoomBar.appendChild(zoomIn);
            zoomBar.appendChild(zoomOut);
            zoomBar.style.display = "none";
            this.menu.appendChild(zoomBar);
            var rSlider = new labeledslider_1.LabelSlider(-180, 180, 1, "Rotation", "item rotation");
            rSlider.on("slide", function (deg) {
                if (Math.abs(deg - 90) <= 2) {
                    deg = 90;
                }
                else if (Math.abs(deg + 90) <= 2) {
                    deg = -90;
                }
                else if (Math.abs(deg) <= 2) {
                    deg = 0;
                }
                else if (Math.abs(deg - 180) <= 2) {
                    deg = 180;
                }
                else if (Math.abs(deg + 180) <= 2) {
                    deg = -180;
                }
                _this.setRotation(deg);
            });
            rSlider.value = 0;
            rSlider.container.style.display = "none";
            this.menu.appendChild(rSlider.container);
            this.flipHButton = util_1.createElement("button", "half item");
            this.flipHButton.innerText = "Flip Horiz.";
            this.flipHButton.addEventListener("click", this.flipHorizontal.bind(this));
            this.flipHButton.style.display = "none";
            this.menu.appendChild(this.flipHButton);
            this.flipVButton = util_1.createElement("button", "half item");
            this.flipVButton.innerText = "Flip Vertical";
            this.flipVButton.addEventListener("click", this.flipVertical.bind(this));
            this.flipVButton.style.display = "none";
            this.menu.appendChild(this.flipVButton);
            this.antialiasButton = util_1.createElement("button", "half item");
            this.antialiasButton.innerText = "Antialias";
            this.antialiasButton.addEventListener("click", function () {
                _this.cropView.antialias = !_this.cropView.antialias;
            });
            if (this.settings.antialias) {
                this.antialiasButton.classList.add("toggled");
            }
            util_1.hideElement(this.antialiasButton);
            this.menu.appendChild(this.antialiasButton);
            this.maskOutlineButton = util_1.createElement("button", "half item");
            this.maskOutlineButton.innerText = "Mask Outline";
            this.maskOutlineButton.addEventListener("click", this.toggleMaskOutline.bind(this, true));
            this.toggleMaskOutline(false);
            this.maskOutlineButton.style.display = "none";
            this.menu.appendChild(this.maskOutlineButton);
            var addPreview = util_1.createElement("button", "item");
            addPreview.innerText = "Add Preview";
            addPreview.addEventListener("click", this.promptAddPreview.bind(this));
            addPreview.style.display = "none";
            this.menu.appendChild(addPreview);
            var render = util_1.createElement("button", "item render show");
            render.innerText = "Render/Save";
            render.addEventListener("click", this.renderCroppedImage.bind(this));
            render.style.display = "none";
            this.menu.appendChild(render);
            this.appendChild(this.menu);
        };
        AvatarCropper.prototype.flipHorizontal = function () {
            this.cropView.flipHorizontal();
        };
        AvatarCropper.prototype.flipVertical = function () {
            this.cropView.flipVertical();
        };
        AvatarCropper.prototype.toggleMenu = function () {
            if (this.menuToggle) {
                // showing, need to hide //
                Array.from(this.menu.children).forEach(function (child) {
                    if (!child.classList.contains("show")) {
                        child.style.display = "none";
                    }
                });
                this.toggleMenuButton.innerText = this.toggleMenuButton.getAttribute("downtext");
            }
            else {
                Array.from(this.menu.children).forEach(function (child) {
                    child.style.display = "";
                });
                this.toggleMenuButton.innerText = this.toggleMenuButton.getAttribute("uptext");
            }
            this.menuToggle = !this.menuToggle;
        };
        AvatarCropper.prototype.renderCroppedImage = function () {
            this.cropView.renderCroppedImage();
        };
        AvatarCropper.prototype.toggleMaskOutline = function (actuallyToggle) {
            if (actuallyToggle === void 0) { actuallyToggle = true; }
            if (actuallyToggle) {
                this.settings.outlinesEnabled = !this.settings.outlinesEnabled;
            }
            if (this.settings.outlinesEnabled) {
                this.maskOutlineButton.classList.add("toggled");
            }
            else {
                this.maskOutlineButton.classList.remove("toggled");
            }
            this.cropView && this.cropView.refresh();
            this.saveSettings();
        };
        AvatarCropper.prototype.setTransparency = function (transparency) {
            this.settings.maskOpacity = 1 - transparency;
            this.cropView.refresh();
        };
        AvatarCropper.prototype.setRotation = function (deg) {
            this.cropView.rotate(deg);
        };
        AvatarCropper.prototype.promptAddPreview = function () {
            var sizeStr = window.prompt("Enter a custom size like 256");
            if (sizeStr === null) // cancelled
             {
                return;
            }
            var size = parseInt(sizeStr);
            if (isNaN(size) || size <= 0) {
                alert("Bad size make sure it's a number over 0");
            }
            else {
                this.previews.addPreviewSize(size);
            }
        };
        AvatarCropper.prototype.openFile = function (file) {
            if (!file)
                return;
            this.cropView.setImageFromFile(file);
            if (!this.firstOpened) {
                this.firstOpened = true;
                Array.from(this.menu.children).forEach(function (child) {
                    child.style.display = "";
                });
                this.openFileLabel.style.width = "50%";
                this.toggleMenuButton.style.width = "50%";
            }
            if (this.cropView.currentFileType === "gif") {
                util_1.hideElement(this.flipHButton);
                util_1.hideElement(this.flipVButton);
            }
            else {
                util_1.showElement(this.flipHButton);
                util_1.showElement(this.flipVButton);
            }
        };
        AvatarCropper.prototype.handleResize = function () {
            var sideWidth = Math.max(this.previews.width, this.menu.getBoundingClientRect().width);
            this.cropView.container.style.width = "calc(100% - " + sideWidth + "px)";
            this.cropView.reactTMToRefresh();
            var previewHeight = this.previews.height + this.previews.padding * 2;
            //this.menu.style.height = "calc(100% - " + previewHeight + "px)";
        };
        return AvatarCropper;
    }(widget_1.Widget));
    exports.AvatarCropper = AvatarCropper;
    window.a = new AvatarCropper(document.getElementById("container"));
});
//# sourceMappingURL=avatarcropper.js.map