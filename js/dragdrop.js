var dragdrop = (function() {
    var sandbox = {
        _elements: {
            overlay: null
        },
        _counter: 0,
        softEvents: {
            onnewinput: function(input) {}
        },
        init: function(overlay) {
            sandbox._elements.overlay = overlay;
            if (!sandbox._elements.overlay) return;
            var _false = function() {
                return false;
            };
            sandbox._elements.ondragleave = _false;
            sandbox._elements.ondrop = _false;
            document.body.ondragover = _false;
            document.body.ondragend = _false;

            document.body.ondragenter = function() {
                sandbox._elements.overlay.style.display = "flex";
                sandbox._counter++;
                return false;
            };
            document.body.ondragleave = function() {
                if (--sandbox._counter === 0) {
                    sandbox._elements.overlay.style.display = "none";
                }
                return false;
            };
            document.body.ondrop = function(e) {
                e.preventDefault();

                if (e.dataTransfer.files.length) {
                    sandbox.broadcastInput(e.dataTransfer.files[0]);
                }

                sandbox._elements.overlay.style.display = "none";
                sandbox._counter = 0;
            };
        },
        broadcastInput: function(input) {
            if (sandbox.softEvents && sandbox.softEvents.onnewinput && typeof sandbox.softEvents.onnewinput === "function") {
                sandbox.softEvents.onnewinput(input);
            }
        }
    };
    return {
        init: sandbox.init,
        softEvents: sandbox.softEvents
    };
})();