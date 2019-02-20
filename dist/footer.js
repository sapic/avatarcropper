define(["require", "exports", "./whatsnew", "./util", "./eventclass", "./tutorial", "./supporters"], function (require, exports, whatsnew_1, util_1, eventclass_1, tutorial_1, supporters_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tutorial;
    function showTutorial() {
        tutorial.show();
    }
    exports.showTutorial = showTutorial;
    function doFooterThings() {
        tutorial = new tutorial_1.TutorialDialog();
        document.body.appendChild(tutorial.container);
        document.getElementById("link-help").addEventListener("click", function () {
            showTutorial();
        });
        var whatsNew = new whatsnew_1.WhatsNewDialog();
        document.getElementById("link-whatsNew").addEventListener("click", function () {
            whatsNew.show();
        });
        document.body.appendChild(whatsNew.container);
        document.getElementById("closeFooter").addEventListener("click", function () {
            document.getElementById("container").style.height = "100%";
            document.getElementsByClassName("bigOverlay")[0].style.height = "100%";
            util_1.hideElement(document.getElementById("footer"));
            eventclass_1.GlobalEvents.emitEvent("resize");
        });
        var supporters = new supporters_1.SupportersDialog();
        document.getElementById("link-supporters").addEventListener("click", function () {
            supporters.show();
        });
        document.body.appendChild(supporters.container);
    }
    exports.doFooterThings = doFooterThings;
});
//# sourceMappingURL=footer.js.map