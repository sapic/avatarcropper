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
define(["require", "exports", "./util", "./closabledialog"], function (require, exports, util_1, closabledialog_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var WhatsNewDialog = /** @class */ (function (_super) {
        __extends(WhatsNewDialog, _super);
        function WhatsNewDialog() {
            var _this = _super.call(this) || this;
            _this.list = {
                "February 2019": [
                    "rewrote the whole dang thing so its not all in one file anymore lol",
                    "flip image horizontally or vertically (gifs soon)",
                    "antialias toggle (won't affect rendering, which just crops the image directly)",
                    "online indicator preview for discord",
                    "bugfixes and quality of life improvements",
                    "please tell me if you find bugs they probably exist and please tell me how you made them happen"
                ],
                "December 2018": [
                    "You can remove preview sizes now by clicking in the bottom-right area. The web site will also magically remember your preview sizes between visits.",
                    "Zoom-fit should be imperceptibly faster... also shouldn't show phantom scroll bars anymore"
                ],
                "November 2018": [
                    "Rotation! Please let me know if u find any bugs with this."
                ],
                "August 2018": [
                    "Helpful tutorial",
                    "Better Mask Outline",
                    "Updated Canvas Backend",
                    "Updated Preview Image Backend",
                    "So tell me if you find any weird bugs",
                    "Loading screen so you can't open a file before it's ready for you to"
                ],
                "July 2018": [
                    "Drag &amp; Drop support - thanx TheRebelG0d",
                    "New rendering where you can pick circle or square after rendering... revolutionary...",
                    "Zoom functionality",
                    "Other stuff probaly"
                ],
                "June 2018": [
                    "bugfixes cool"
                ],
                "May 2018": [
                    "GIF support!! wow did you know GIFs work on this ??? at least i hope they do"
                ],
                "Earlier": [
                    "other stuff"
                ]
            };
            _this.dialog.classList.add("dialog-whatsNew");
            var es = [];
            var h1 = util_1.createElement("h1");
            h1.innerText = "What's New,,,";
            es.push(h1);
            var _loop_1 = function (month) {
                var h2 = util_1.createElement("h2");
                h2.innerText = month;
                var ul = util_1.createElement("ul");
                this_1.list[month].forEach(function (thing) {
                    var li = util_1.createElement("li");
                    li.innerText = thing;
                    ul.appendChild(li);
                });
                es.push(h2);
                es.push(ul);
            };
            var this_1 = this;
            for (var month in _this.list) {
                _loop_1(month);
            }
            _this.appendChild.apply(_this, es);
            return _this;
        }
        return WhatsNewDialog;
    }(closabledialog_1.ClosableDialog));
    exports.WhatsNewDialog = WhatsNewDialog;
});
//# sourceMappingURL=whatsnew.js.map