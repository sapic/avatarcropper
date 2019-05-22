define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Keys;
    (function (Keys) {
        Keys[Keys["left"] = 37] = "left";
        Keys[Keys["up"] = 38] = "up";
        Keys[Keys["right"] = 39] = "right";
        Keys[Keys["down"] = 40] = "down";
    })(Keys = exports.Keys || (exports.Keys = {}));
    var KeyManager = /** @class */ (function () {
        function KeyManager() {
        }
        KeyManager.initialize = function () {
            window.addEventListener("keydown", function (e) { return KeyManager.keysDown[e.keyCode] = true; });
            window.addEventListener("keyup", function (e) { return KeyManager.keysDown[e.keyCode] = false; });
        };
        KeyManager.isDown = function (key) {
            return this.keysDown[key] || false;
        };
        KeyManager.axis = function (keyP, keyN) {
            return +this.isDown(keyP) - +this.isDown(keyN);
        };
        KeyManager.isArrowKey = function (key) {
            return key >= 37 && key <= 40;
        };
        KeyManager.keysDown = {};
        return KeyManager;
    }());
    exports.KeyManager = KeyManager;
});
//# sourceMappingURL=keymanager.js.map