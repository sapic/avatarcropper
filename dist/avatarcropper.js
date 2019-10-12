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
define(["require", "exports", "./widget", "./cropview", "./previews", "./util", "./labeledslider", "./storage", "./footer", "./eventclass", "./dragdrop", "./point", "./keymanager", "./borders"], function (require, exports, widget_1, cropview_1, previews_1, util_1, labeledslider_1, storage_1, footer_1, eventclass_1, dragdrop_1, point_1, keymanager_1, borders_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var AvatarCropper = /** @class */ (function (_super) {
        __extends(AvatarCropper, _super);
        function AvatarCropper(container) {
            var _this = _super.call(this, container) || this;
            _this.menuToggle = true;
            _this.firstOpened = false;
            _this.settings = {
                previewSizes: [30, 40, 64, 128],
                maskOpacity: 0.5,
                previewMode: "circle",
                outlinesEnabled: true,
                antialias: true,
                dismissedTutorial: false,
                dismissedIE: false,
                dismissedCookie: false,
                guidesEnabled: true,
                resizeLock: false,
                borderSize: 0.05
            };
            _this.loadSettings();
            borders_1.Border.size = _this.settings.borderSize;
            console.log(_this.settings.borderSize);
            _this.constructMenu();
            _this.cropView = new cropview_1.CropView(_this.settings);
            _this.previews = new previews_1.Previews(_this.cropView);
            _this.appendChild(_this.cropView, _this.previews);
            _this.settings.previewSizes.forEach(function (size) {
                _this.previews.addPreviewSize(new point_1.Point(size));
            });
            _this.previews.on("sizeArrayChange", function (sizeArray) {
                _this.settings.previewSizes = sizeArray;
                _this.saveSettings();
            });
            window.addEventListener("resize", _this.handleResize.bind(_this));
            _this.previews.on("sizechange", _this.handleResize.bind(_this));
            eventclass_1.GlobalEvents.on("resize", _this.handleResize.bind(_this));
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
            _this.textOverlay = util_1.createElement("label", "bigOverlay");
            _this.textOverlay.innerText = "Open file";
            _this.textOverlay.style.cursor = "pointer";
            _this.textOverlay.setAttribute("for", "openInput");
            var dragDrop = new dragdrop_1.DragDrop(_this.textOverlay);
            dragDrop.on("drop", function (file) {
                _this.openFile(file);
            });
            dragDrop.on("dragleave", function () {
                if (!_this.firstOpened) {
                    util_1.showElement(_this.textOverlay);
                }
            });
            _this.appendChild(_this.textOverlay);
            if (util_1.getIEVersion() !== false && !_this.settings.dismissedIE) {
                window.alert("hey so your browser isn't really supported ... things should still work but they will be slower/ugly due to how internet explorer/edge function (They don't conform to web standards). i'd recommend switching to firefox or chrome!! but you don't have to if you don't want to. this is the only time you'll see this message unless u clear ur cache or something. ok bye");
                _this.settings.dismissedIE = true;
                _this.saveSettings();
            }
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
                    if (s[key] !== null) {
                        this.settings[key] = s[key];
                    }
                }
            }
            this.saveSettings();
        };
        AvatarCropper.prototype.constructMenu = function () {
            var _this = this;
            this.menu = util_1.createElement("div", "menu");
            var openFile = util_1.createElement("input", "openInput show");
            openFile.id = "openInput";
            openFile.type = "file";
            openFile.addEventListener("change", function (e) {
                if (openFile.files && openFile.files[0]) {
                    _this.openFile(openFile.files[0]);
                }
            });
            this.openFileLabel = util_1.createElement("label", "open half item show");
            this.openFileLabel.innerText = "Open File...";
            this.openFileLabel.appendChild(openFile);
            this.menu.appendChild(this.openFileLabel);
            this.toggleMenuButton = util_1.createElement("button", "half item show");
            this.toggleMenuButton.setAttribute("uptext", "Collapse Menu");
            this.toggleMenuButton.setAttribute("downtext", "▼");
            this.toggleMenuButton.innerText = this.toggleMenuButton.getAttribute("uptext");
            this.toggleMenuButton.addEventListener("click", this.toggleMenu.bind(this));
            this.menu.appendChild(this.toggleMenuButton);
            var circle = util_1.createElement("button", "open item half");
            circle.innerText = "Circle";
            var square = util_1.createElement("button", "open item half");
            square.innerText = "Squaré";
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
            this.menu.appendChild(rSlider.container);
            this.flipHButton = util_1.createElement("button", "half item");
            this.flipHButton.innerText = "Flip Horiz.";
            this.flipHButton.addEventListener("click", this.flipHorizontal.bind(this));
            this.menu.appendChild(this.flipHButton);
            this.flipVButton = util_1.createElement("button", "half item");
            this.flipVButton.innerText = "Flip Vertical";
            this.flipVButton.addEventListener("click", this.flipVertical.bind(this));
            this.menu.appendChild(this.flipVButton);
            this.antialiasButton = util_1.createElement("button", "half item");
            this.antialiasButton.innerText = "Antialias";
            this.antialiasButton.addEventListener("click", function () {
                _this.cropView.antialias = !_this.cropView.antialias;
            });
            if (this.settings.antialias) {
                this.antialiasButton.classList.add("toggled");
            }
            this.menu.appendChild(this.antialiasButton);
            this.maskOutlineButton = util_1.createElement("button", "half item");
            this.maskOutlineButton.innerText = "Mask Outline";
            this.maskOutlineButton.addEventListener("click", this.toggleMaskOutline.bind(this, true));
            this.toggleMaskOutline(false);
            this.menu.appendChild(this.maskOutlineButton);
            var addPreview = util_1.createElement("button", "half item");
            addPreview.innerText = "Add Preview Size";
            addPreview.addEventListener("click", this.promptAddPreview.bind(this));
            this.menu.appendChild(addPreview);
            this.guidesButton = util_1.createElement("button", "half item");
            this.guidesButton.innerText = "Guidelines";
            this.guidesButton.addEventListener("click", this.toggleGuides.bind(this, true));
            this.toggleGuides(false);
            this.menu.appendChild(this.guidesButton);
            var centerCropArea = util_1.createElement("button", "half item");
            centerCropArea.innerText = "Center";
            centerCropArea.addEventListener("click", this.centerCropArea.bind(this));
            this.menu.appendChild(centerCropArea);
            var setCropSize = util_1.createElement("button", "half item");
            setCropSize.innerText = "Set Size";
            setCropSize.addEventListener("click", this.setCropSize.bind(this));
            this.menu.appendChild(setCropSize);
            var lock = util_1.createElement("button", "item");
            lock.innerText = "Lock Center During Resize";
            lock.addEventListener("click", this.toggleResizeLock.bind(this));
            this.menu.appendChild(lock);
            eventclass_1.GlobalEvents.on("resizelockchange", function () {
                if (_this.settings.resizeLock) {
                    lock.classList.add("toggled");
                }
                else {
                    lock.classList.remove("toggled");
                }
            });
            eventclass_1.GlobalEvents.emitEvent("resizelockchange");
            // create border options //
            var border = util_1.createElement("select", "item");
            for (var borderType in borders_1.Border.types) {
                border.add(util_1.createOptionElement(borders_1.Border.types[borderType].text, borderType));
            }
            border.addEventListener("change", function () {
                borders_1.Border.type = border.value;
            });
            this.menu.appendChild(border);
            // create border slider //
            var borderSlider = new labeledslider_1.LabelSlider(0, 0.5, 0.01, "Border Size", "item");
            borderSlider.value = borders_1.Border.size;
            borderSlider.on("slide", function (value) {
                borders_1.Border.size = value;
            });
            borderSlider.on("change", function () {
                _this.settings.borderSize = borderSlider.value;
                _this.saveSettings();
            });
            this.menu.appendChild(borderSlider.container);
            // create render button //
            var render = util_1.createElement("button", "item render show");
            render.innerText = "Render/Save";
            render.addEventListener("click", this.renderCroppedImage.bind(this));
            this.menu.appendChild(render);
            this.appendChild(this.menu);
        };
        AvatarCropper.prototype.flipHorizontal = function () {
            this.cropView.flipHorizontal();
        };
        AvatarCropper.prototype.flipVertical = function () {
            this.cropView.flipVertical();
        };
        AvatarCropper.prototype.centerCropArea = function () {
            this.cropView.centerCropArea();
        };
        AvatarCropper.prototype.setCropSize = function () {
            var promptStr = "The current picture is " + this.cropView.innerSize.x.toString() + "x" + this.cropView.innerSize.y.toString() + "\n" +
                "The current croparea is " + this.cropView.cropArea.width + "x" + this.cropView.cropArea.height + "\n" +
                "Enter in a size either by specifying a number (like 64) or a percentage of width (50%w) or height (50%h)";
            var sizeStr = window.prompt(promptStr);
            if (sizeStr === null || isNaN(parseInt(sizeStr))) {
                return;
            }
            var size = parseInt(sizeStr);
            if (sizeStr.endsWith("%w")) {
                size = this.cropView.innerSize.x * (size / 100);
            }
            else if (sizeStr.endsWith("%h")) {
                size = this.cropView.innerSize.y * (size / 100);
            }
            this.cropView.setCropSize(size);
        };
        AvatarCropper.prototype.toggleResizeLock = function () {
            this.settings.resizeLock = !this.settings.resizeLock;
            this.saveSettings();
            eventclass_1.GlobalEvents.emitEvent("resizelockchange");
        };
        AvatarCropper.prototype.toggleMenu = function () {
            if (this.menuToggle) {
                // showing, need to hide //
                Array.from(this.menu.children).forEach(function (child) {
                    if (!child.classList.contains("show")) {
                        child.style.display = "none";
                    }
                });
                this.toggleMenuButton.classList.add("toggled");
                this.toggleMenuButton.innerText = this.toggleMenuButton.getAttribute("downtext");
            }
            else {
                Array.from(this.menu.children).forEach(function (child) {
                    child.style.display = "";
                });
                this.toggleMenuButton.classList.remove("toggled");
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
        AvatarCropper.prototype.toggleGuides = function (actuallyToggle) {
            if (actuallyToggle === void 0) { actuallyToggle = true; }
            if (actuallyToggle) {
                this.settings.guidesEnabled = !this.settings.guidesEnabled;
            }
            if (this.settings.guidesEnabled) {
                this.guidesButton.classList.add("toggled");
            }
            else {
                this.guidesButton.classList.remove("toggled");
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
            var sizeStr = window.prompt("Enter a custom size\nDefault sizes are 30, 40, 64, and 128\nNote: 30 will come with a discord online indicator");
            if (sizeStr === null) // cancelled
             {
                return;
            }
            var size = parseInt(sizeStr);
            if (isNaN(size) || size <= 0) {
                alert("Bad size make sure it's a number over 0");
            }
            else {
                this.previews.addPreviewSize(new point_1.Point(size)); // emits sizeArrayChange event which changes settings so dw
            }
        };
        AvatarCropper.prototype.openFile = function (file) {
            if (!this.cropView.setImageFromFile(file)) {
                return;
            }
            if (!this.firstOpened) {
                this.firstOpened = true;
                this.show();
                util_1.hideElement(this.textOverlay);
                this.textOverlay.removeAttribute("for");
                this.textOverlay.style.cursor = "";
            }
            if (this.cropView.currentFileType === "gif") {
                util_1.hideElement(this.flipHButton);
                util_1.hideElement(this.flipVButton);
            }
            else {
                util_1.showElement(this.flipHButton);
                util_1.showElement(this.flipVButton);
            }
            if (!this.settings.dismissedTutorial || !this.settings.dismissedCookie) {
                footer_1.showTutorial();
                this.settings.dismissedTutorial = true;
                this.settings.dismissedCookie = true;
                this.saveSettings();
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
    footer_1.doFooterThings();
    window.a = new AvatarCropper(document.getElementById("container"));
    keymanager_1.KeyManager.initialize();
});
//# sourceMappingURL=avatarcropper.js.map