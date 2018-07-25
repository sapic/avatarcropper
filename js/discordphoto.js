var canvas, canvas_over;
var canvas_previews = [];
var canvas_preview_rects = [];
var currentAction = "none";
var circle = {
    x: 0,
    y: 0,
    diameter: 32
};
var shouldHide = true;
var tpixels = false;
var mouseOrigin, circleOrigin, scrollOrigin;
var currentSrc;
var currentFiletype;
var currentlyRendering = false;
var shouldStopRendering = false;

var zoomFactor = 1;

var settings = {
    previewMode: "circle",
    maskTransparency: 0,
    outlinesEnabled: true
};

function setSetting(key, value) {
    settings[key] = value;
    Storage.set("settings", settings);
}

function loadSettings() {
    settings = Storage.get("settings", settings);
}

function circlePreviews() {
    setSetting("previewMode", "circle");
    document.getElementById("switch-square").classList.remove("switch-active");
    document.getElementById("switch-circle").classList.add("switch-active");

    canvas_previews.forEach(o => {
        let c = o.canvas;
        c.fill("#2F3136");
        c.setBlendingMode("destination-out");
        c.fillCircleInSquare(c.width() - o.size, c.height() - o.size, o.size, "white");
        c.setBlendingMode("source-over");
    });
}

function squarePreviews() {
    setSetting("previewMode", "square");
    document.getElementById("switch-square").classList.add("switch-active");
    document.getElementById("switch-circle").classList.remove("switch-active");

    canvas_previews.forEach(o => {
        let c = o.canvas;
        c.fill("#2F3136");
        c.setBlendingMode("destination-out");
        c.fillRect(c.width() - o.size, c.height() - o.size, o.size, o.size, "white");
        c.setBlendingMode("source-over");
    });
}

function circleOrSquarePreviews() {
    if (settings.previewMode === "circle") {
        circlePreviews();
    } else {
        squarePreviews();
    }
}

function createPreviewCanvas(size) {
    var previewObj = {
        size: size,
        largest: 0,
        canvas: null,
        container: null,
        img: null
    };

    var padding = 16;
    var runningX = 0;
    var largest = size;

    canvas_preview_rects = [];

    for (var i = 0; i < canvas_previews.length; i++) {
        if (canvas_previews[i].size > largest) {
            largest = canvas_previews[i].size;
        }
    }

    previewObj.largest = largest;

    var $container = document.createElement("div");
    $container.className = "canvas-preview-container";
    $container.style.width = largest + "px";
    $container.style.height = largest + "px";
    $container.style["z-index"] = -size;
    previewObj.container = $container;

    var c = new Canvas(document.createElement("canvas"));
    c.resize(largest, largest, false);
    c.__size = size;
    c.canvas.title = size + "x" + size;
    c.canvas.className = "canvas-preview";
    previewObj.canvas = c;
    $container.appendChild(c.canvas);

    var $img = document.createElement("img");
    $img.className = "canvas-preview-img";
    if (currentSrc) {
        $img.src = currentSrc;
    }
    previewObj.img = $img;
    $container.appendChild($img);

    document.getElementById("previews").appendChild($container);

    var inserted = false;
    for (var i = 0; i < canvas_previews.length; i++) {
        if (size > canvas_previews[i].size) {
            canvas_previews.splice(i, 0, previewObj);
            inserted = true;
            break;
        }
    }
    if (!inserted) {
        canvas_previews.push(previewObj);
    }

    var wr = document.body.getBoundingClientRect();

    for (var i = 0; i < canvas_previews.length; i++) {
        canvas_previews[i].container.style.right = runningX + "px";

        let rect = {
            x: wr.width - (runningX + canvas_previews[i].size + padding),
            y: wr.height - padding - canvas_previews[i].size - padding,
            width: canvas_previews[i].size + padding * 2,
            height: canvas_previews[i].size + padding * 2
        };

        canvas_preview_rects.push(rect);
        runningX += canvas_previews[i].size + padding;
    }

    runningX += padding;

    var mw = "calc(100% - " + runningX + "px)";
    //var mh = "calc(100% - " + (canvas_previews[0].__size + padding + padding) + "px)";

    document.getElementById("container-canvas").style["width"] = mw;

    zoomFit();

    circleOrSquarePreviews();

    if (shouldHide) {
        c.canvas.className += " hidden";
    } else {
        drawPreview();
    }
}

function rectsIntersect(r1, r2) {
    return !(r2.x >= r1.x + r1.width
        || r2.x + r2.width <= r1.x
        || r2.y >= r1.y + r1.height
        || r2.y + r2.height <= r1.y);
}

function applyToPreviewCanvas(fn) {
    for (let i = 0; i < canvas_previews.length; i++) {
        fn(canvas_previews[i]);
    }
}

function init() {
    loadSettings();
    if (dragdrop) {
        dragdrop.init(document.getElementById("dragDropOverlay"));
        dragdrop.softEvents.onnewinput = function(input) {
            loadImg(input);
        }
    }
    document.getElementById("slider-opacity").value = settings.maskTransparency;
    document.getElementById("btn-outlines").classList[settings.outlinesEnabled ? "add" : "remove"]("toggle-active");

    canvas = document.getElementById("canvas");
    canvas_over = new Canvas(document.getElementById("canvas-over"), Canvas.flags.useDeepCalc);

    createPreviewCanvas(128);
    createPreviewCanvas(90);
    createPreviewCanvas(40);
    //createPreviewCanvas(30);

    document.getElementById("input-file").addEventListener("change", function(e) {
        if (this.files && this.files[0]) {
            loadImg(this.files[0]);
        } else console.info("It's dead, Jim. %o %o", e, this);
    });
    document.getElementById("closeContrib").addEventListener("click", hideContribs);
    document.getElementById("supportersLink").addEventListener("click", showSupporters);

    if (mobilecheck()) {
        var link = document.createElement("link");
        link.href = "css/mobile.css"
        link.rel = "stylesheet";
        document.getElementsByTagName("head")[0].appendChild(link);
    }

    document.getElementById("renderContainer").addEventListener("click", display_renderClose);
    document.getElementById("render-close").addEventListener("click", display_renderClose);

    document.getElementById("renderView").addEventListener("click", function(e) {
        e.stopPropagation();
    });

    document.getElementById("switch-square").addEventListener("click", function() {
        squarePreviews();
        drawPreview();
    });

    document.getElementById("switch-circle").addEventListener("click", function() {
        circlePreviews();
        drawPreview();
    });

    circleOrSquarePreviews();

    document.getElementById("slider-opacity").addEventListener("input", slider_opacity_inputfn);
    document.getElementById("btn-addPreview").addEventListener("click", btn_addPreview_clickFn);
    document.getElementById("btn-outlines").addEventListener("click", btn_outlines_clickFn);

    document.getElementById("slider-opacity").addEventListener("touchmove", function(e) {
        return false;
    });

    document.getElementById("zoom-in").addEventListener("click", zoomIn);
    document.getElementById("zoom-out").addEventListener("click", zoomOut);
    document.getElementById("zoom-fit").addEventListener("click", zoomFit);
    document.getElementById("save").addEventListener("click", render);

    document.getElementById("render-save").addEventListener("click", function() {
        this.href = document.getElementById("render-img").src;
    });

    canvas_over.setMouseMove(function(x, y, md, lx, ly, e) {
        var action = currentAction === "none" ? getMouseAction(x, y) : currentAction;
        if (action === "move") {
            canvas_over.canvas.style.cursor = "move";
        } else if (action === "resize") {
            var xr = x < circle.x + circle.diameter / 2;
            var yr = y < circle.y + circle.diameter / 2;
            var thing = xr ^ yr; // nice
            canvas_over.canvas.style.cursor = thing ? "nesw-resize" : "nwse-resize";
        } else {
            canvas_over.canvas.style.cursor = "default";
        }

        /*if (currentAction === "none" || currentAction === "new") {
            if (md) {
                var dx = x - mouseOrigin.x;
                var dy = y - mouseOrigin.y;
    
                var container = document.getElementById("container-canvas");
                
                if (container.scrollWidth > container.clientWidth) {
                    container.scrollLeft = scrollOrigin.x - dx;
                }
                
                if (container.scrollHeight > container.clientHeight) {
                    container.scrollTop = scrollOrigin.y - dy;
                }
            }
            return;
        }*/

        if (currentAction === "none") return;

        if (currentAction === "move") {
            var dx = x - mouseOrigin.x;
            var dy = y - mouseOrigin.y;
            circle.x = circleOrigin.x + dx;
            circle.y = circleOrigin.y + dy;

            if (circle.x < 0) circle.x = 0;
            if (circle.y < 0) circle.y = 0;
            if (circle.x + circle.diameter > canvas.innerWidth) circle.x = canvas.innerWidth - circle.diameter;
            if (circle.y + circle.diameter > canvas.innerHeight) circle.y = canvas.innerHeight - circle.diameter;
        } else if (currentAction === "resize") {
            var xr = x < circle.x + circle.diameter / 2;
            var yr = y < circle.y + circle.diameter / 2;
            var dx = x - mouseOrigin.x;
            var dy = y - mouseOrigin.y;
            if (xr) dx *= -1;
            if (yr) dy *= -1;
            var dd = Math.abs(dx) > Math.abs(dy) ? dx : dy;
            if (circleOrigin.diameter + dd < 1) {
                dd = circle.diameter - 1;
            }
            if (xr) {
                if (yr) {
                    if (circleOrigin.x - dd < 0 || circleOrigin.y - dd < 0) {
                        dd = Math.min(circleOrigin.x, circleOrigin.y);
                    }
                } else {
                    if (circleOrigin.x - dd < 0 || circleOrigin.y + circleOrigin.diameter + dd > canvas.innerHeight) {
                        dd = Math.min(circleOrigin.x, canvas.innerHeight - circleOrigin.y - circleOrigin.diameter);
                    }
                }
            } else {
                if (yr) {
                    if (circleOrigin.x + circleOrigin.diameter + dd > canvas.innerWidth || circleOrigin.y - dd < 0) {
                        dd = Math.min(canvas.innerWidth - circleOrigin.x - circleOrigin.diameter, circleOrigin.y);
                    }
                } else {
                    if (circleOrigin.x + circleOrigin.diameter + dd > canvas.innerWidth || circleOrigin.y + circleOrigin.diameter + dd > canvas.innerHeight) {
                        dd = Math.min(canvas.innerWidth - circleOrigin.x - circleOrigin.diameter, canvas.innerHeight - circleOrigin.y - circleOrigin.diameter);
                    }
                }
            }
            if (circle.diameter > canvas.innerWidth) {
                // panic
                circle.x = 0;
                circle.y = 0;
                circle.diameter = canvas.innerWidth;
                alert("fuck");
            } else if (circle.diameter > canvas.innerHeight) {
                circle.x = 0;
                circle.y = 0;
                circle.diameter = canvas.innerHeight;
                alert("fuck");
            } else {
                circle.diameter = circleOrigin.diameter + dd;
                circle.x = xr ? circleOrigin.x - dd : circleOrigin.x;
                circle.y = yr ? circleOrigin.y - dd : circleOrigin.y;
            }
        }

        circle.x = Math.round(circle.x);
        circle.y = Math.round(circle.y);
        circle.diameter = Math.round(circle.diameter);
        if (circle.diameter !== circleOrigin.diameter) {
            circleOrigin = {};
            mouseOrigin = {x, y};
            Object.assign(circleOrigin, circle);
        }
        drawPreview();
    });

    canvas_over.canvas.addEventListener("touchmove", function(e) {
        if (!(currentAction === "new" || currentAction === "none")) {
            e.preventDefault();
        }
    });

    canvas_over.setMouseDown(function(x, y, e) {
        var action = getMouseAction(x, y);
        currentAction = action;

        mouseOrigin = {x, y};
        scrollOrigin = {
            x: document.getElementById("container-canvas").scrollLeft,
            y: document.getElementById("container-canvas").scrollTop
        };
        circleOrigin = {};
        Object.assign(circleOrigin, circle);
    });

    canvas_over.setMouseUp(function() {
        currentAction = "none";
        drawPreview();
    });

    canvas_over.setMouseLeave(canvas_over.mouseUpEvents[0]);

    slider_opacity_inputfn();

    
    var container = document.getElementById("container-canvas");
    var menu = document.getElementById("container-buttons");

    //container.style.width = (document.body.clientWidth - menu.clientWidth) + "px";
    container.style.height = "100%";
}

function zoom(factor) {
    factor = factor || zoomFactor;
    zoomFactor = factor;
    canvas_over.zoom(factor);
    Canvas.zoomElement(canvas, factor);
}

function zoomIn() {
    zoomFactor *= 1.1;
    zoom();
}

function zoomOut() {
    zoomFactor /= 1.1;
    zoom();
}

function zoomFit() {
    if (shouldHide) {
        return;
    }

    var container = document.getElementById("container-canvas");
    var menu = document.getElementById("container-buttons");
    var cr = container.getBoundingClientRect();
    var ir = { width: canvas_over.width(), height: canvas_over.height() };

    var fw = cr.width / ir.width;
    var fh = cr.height / ir.height;
    var f = Math.min(fw, fh);

    var dw = 1;
    var dh = ir.height / ir.width;

    var nr = {
        x: 0,
        y: 0,
        width: ir.width * f,
        height: ir.height * f
    };

    while (!canvas_preview_rects.some(function(r) {
        if (rectsIntersect(nr, r)) {
            //console.log(JSON.parse(JSON.stringify(nr)), JSON.parse(JSON.stringify(r)));
            return true;
        } else {
            return false;
        }
    }) && !(nr.height >= document.getElementById("container").clientHeight)
    && (!nr.width >= document.body.clientWidth - menu.clientWidth)) {
        nr.width += dw;
        nr.height += dh;
    }

    //document.getElementById("container-canvas").style["width"] = cr.width + "px";

    zoom(nr.height / ir.height);

    var delta = container.scrollWidth - container.clientWidth;

    if (delta > 0) {
        nr.width -= delta;
        nr.height -= (ir.height / ir.width) * delta;
        zoom(nr.height / ir.height);
    }


    var delta = container.scrollHeight - container.clientHeight;

    if (delta > 0) {
        nr.height -= delta;
        nr.width -= (ir.width / ir.height) * delta;

        zoom(nr.height / ir.height);
    }
}

function display_renderClose() {
    if (currentlyRendering) {
        shouldStopRendering = true;
        return;
    }

    document.getElementById("renderContainer").style.display = "none";

    var bs = document.getElementById("render-types").children;
    for (var i = 0; i < bs.length; i++) {
        URL.revokeObjectURL(bs[i]._url);
    }

    document.getElementById("render-types").innerHTML = "";
}

function display_renderStart() {
    document.getElementById("renderContainer").style.display = "block";
    document.getElementById("renderView-progressBar").style.display = "block";
    document.getElementById("renderView-progress").style.width = "0%";
    document.getElementById("render-header").innerText = "Rendering...";
    document.getElementById("render-types").style.display = "none";
    document.getElementById("render-save").style.display = "none";
    document.getElementById("render-img").src = "";
}

function display_renderFinished(arr) {
    // arr is array of objects with url and type properties

    document.getElementById("render-img").src = arr[0].url;
    document.getElementById("renderView-progressBar").style.display = "none";
    document.getElementById("render-types").style.display = "block";
    document.getElementById("render-save").style.display = "block";
    document.getElementById("render-header").innerText = "Rendered! yayy";
    
    var $t = document.getElementById("render-types");

    var bc = function() {
        document.getElementById("render-img").src = this._url;
        var bs = document.getElementsByClassName("render-types-button");
        for (var i = 0; i < bs.length; i++) {
            bs[i].classList.remove("toggle-active");
        }

        this.classList.add("toggle-active");
    };

    for (var i = 0; i < arr.length; i++) {
        let $b = document.createElement("button");
        $b.className = "render-types-button";
        $b.style.width = (1 / arr.length * 100) + "%";
        $b.innerText = arr[i].type;
        $b._url = arr[i].url;
        $b.addEventListener("click", bc.bind($b));

        $t.appendChild($b);

        if (i === 0) {
            bc.bind($b)();
        }
    }

    setTimeout(function() {
        var $c = document.getElementById("renderView");
        $c.scrollTop = $c.scrollHeight;
    }, 50);
}

function render() {
    shouldStopRendering = false;
    display_renderStart();
    if (currentFiletype === "image/gif") {
        gif = new SuperGif({
            gif: canvas.cloneNode()
        });
        currentlyRendering = true;

        gif.load(function() {
            var saveGif = new GIF({
                workers: 3,
                quality: 1,
                dither: false,
                width: circle.diameter,
                height: circle.diameter,
                debug: false,
                copy: true
            });

            var len = gif.get_length();

            var renderFrame = function(i, cb) {
                gif.move_to(i);

                var c = new Canvas(document.createElement("canvas"));
                c.resize(circle.diameter, circle.diameter, false);
                c.clear();
                c.drawCroppedImage(gif.get_canvas(), 0, 0, circle.x, circle.y, circle.diameter, circle.diameter);
                /*if (settings.previewMode === "circle") {
                    c.setBlendingMode("destination-in");
                    c.fillCircleInSquare(0, 0, c.width(), "white");
                }*/

                if (shouldStopRendering) {
                    currentlyRendering = false;
                    display_renderClose();
                    return;
                }
                
                c.toImage(function(img) {
                    if (shouldStopRendering) {
                        currentlyRendering = false;
                        display_renderClose();
                        return;
                    }

                    img.crossOrigin = "anonymous"
                    saveGif.addFrame(img, {
                        delay: gif.get_frames()[i].delay * 10
                    });
                    i++;
                    document.getElementById("renderView-progress").style.width = (((i / len) * 50)) + "%";

                    if (i === len) {
                        saveGif.render();
                    } else {
                        cb(i, cb);
                    }
                });
            };

            renderFrame(0, renderFrame);
            
            saveGif.on("finished", function(blob) {
                var url = URL.createObjectURL(blob);
                display_renderFinished([
                    {
                        url: url,
                        type: "GIF"
                    }
                ]);
                currentlyRendering = false;
            });

            saveGif.on("abort", function() {
                currentlyRendering = false;
                display_renderClose();
            });

            saveGif.on("progress", function(e) {
                document.getElementById("renderView-progress").style.width = (50 + (e * 50)) + "%";

                if (shouldStopRendering) {
                    saveGif.abort();
                }
            });

        },
    
        function(e) {
            if (e.lengthComputable) {
                var progress = e.loaded / e.total;
            }
        });
    } else {
        var c = new Canvas(document.createElement("canvas"));
        c.resize(circle.diameter, circle.diameter, false);
        c.clear();
        c.drawCroppedImage(canvas, 0, 0, circle.x, circle.y, circle.diameter, circle.diameter);

        var cc = new Canvas(document.createElement("canvas"));
        cc.resize(circle.diameter, circle.diameter, false);
        cc.clear();
        cc.drawImage(c.canvas, 0, 0);

        cc.setBlendingMode("destination-in");
        cc.fillCircleInSquare(0, 0, c.width(), "white");

        var url, urlc;
        var count = 0;

        var check = function() {
            if (count === 2) {
                display_renderFinished([
                    {
                        "url": url,
                        "type": "Square"
                    },
                    {
                        "url": urlc,
                        "type": "Circle"
                    }
                ]);
            }
        };

        c.canvas.toBlob((function(blob) {
            url = URL.createObjectURL(blob);
            count++;
            check();
        }).bind(this));

        cc.canvas.toBlob((function(blob) {
            urlc = URL.createObjectURL(blob);
            count++;
            check();
        }).bind(this));
    }
}

function hideContribs() {
    document.getElementById("contributors").style.display = "none";
    document.getElementById("container").style.height = "100%";
}

function showSupporters() {
    alert("Thanks to these people for donating and contributing to my work!!\n\nGlen Cathey\nBetty Glez\nMax Abbot\nand 2 anons:)\n\nI always ask before publishing a name so just let me know if you'd prefer to stay anonymous!\nok thx love u");
}

function slider_opacity_inputfn() {
    setSetting("maskTransparency", document.getElementById("slider-opacity").value);
    drawPreview(false);
}

function btn_addPreview_clickFn() {
    var size = parseInt(prompt("Enter a custom size like 256"));
    if (isNaN(size)) {
        // you're dumb
    } else {
        createPreviewCanvas(size);
    }
}

function btn_outlines_clickFn() {
    var $b = document.getElementById("btn-outlines");
    setSetting("outlinesEnabled", !settings.outlinesEnabled);
    $b.classList.toggle("toggle-active");
    drawPreview(false);
}

function loadImg(file) {
    if (!file) return;
    currentFiletype = file.type;

    Canvas.fileToImage(file, function(img) {
        tpixels = false;
        canvas_over.drawImage(img, 0, 0);
        var data = canvas_over.getImageData().data;
        for (var i = 0; i < data.length; i += 4) {
            if (data[i + 3] < 255) {
                tpixels = true;
                break;
            }
        }
        canvas_over.clear();

        var es = document.getElementsByClassName("hidden");
        for (var i = 0; i < es.length; i++) {
            es[i].style.display = "inline-block";
        }
        canvas.innerWidth = img.width;
        canvas.innerHeight = img.height;
        canvas_over.resize(img.width, img.height, false);
        canvas.src = window.URL.createObjectURL(file);
        circle.x = 0;
        circle.y = 0;
        circle.diameter = img.width > img.height ? img.height : img.width;
        circle.diameter /= 2;
        //document.getElementById("save").setAttribute("download", file.name.substring(0, file.name.lastIndexOf('.')) + "_cropped.png");
        document.getElementById("render-save").setAttribute("download", file.name.substring(0, file.name.lastIndexOf('.')) + "_cropped." + (currentFiletype === "image/gif" ? "gif" : "png"));
        drawPreview();
        shouldHide = false;

        currentSrc = canvas.src;
        canvas_previews.forEach(o => {
            o.img.src = currentSrc;
        });

        zoomFit();
    });
}

function drawPreview(updatePreviews) {
    if (updatePreviews === undefined) updatePreviews = true;

    if (settings.maskTransparency !== 0) {
        canvas_over.clear();
    }

    if (settings.maskTransparency !== 1) {
        canvas_over.fill("rgba(0,0,0," + (1 - settings.maskTransparency) + ")");

        canvas_over.setBlendingMode("destination-out");
        if (settings.previewMode === "circle") {
            canvas_over.fillCircleInSquare(circle.x, circle.y, circle.diameter, "white");
        } else {
            canvas_over.fillRect(circle.x, circle.y, circle.diameter, circle.diameter, "white");
        }
    }

    canvas_over.setBlendingMode("source-over");

    if (settings.outlinesEnabled) {
        if (settings.previewMode === "circle") {
            canvas_over.setLineDash([1, 2]);
            canvas_over.drawCircleInSquare(circle.x, circle.y, circle.diameter, "white", 1);
        } else {
            canvas_over.setLineDash([1]);
            canvas_over.drawRect(circle.x, circle.y, circle.diameter, circle.diameter, "white", 1);
        }
    }

    if (updatePreviews) {
        /*applyToPreviewCanvas(function(c) {
            c.clear();

            if (currentAction === "none" && circle.diameter > c.__size) {
                let cv = new Canvas(document.createElement("canvas"));
                cv.resize(circle.diameter, circle.diameter, false);
                cv.drawCroppedImage(canvas, 0, 0, circle.x, circle.y, circle.diameter, circle.diameter);
                let cv_2 = downScaleCanvas(cv.canvas, c.width() / circle.diameter);
                c.drawImage(cv_2, 0, 0);
            } else {
                c.drawCroppedImage(canvas, 0, 0, circle.x, circle.y, circle.diameter, circle.diameter, c.width(), c.height());
            }
        });*/

        canvas_previews.forEach(o => {
            var scale = o.size / circle.diameter;
            o.img.style.transform = "scale(" + scale + ")";
            o.img.style.position = "absolute";
            
            var x = o.largest - o.size;
            var y = o.largest - o.size;

            x -= circle.x * scale;
            y -= circle.y * scale;

            o.img.style.left = x + "px";
            o.img.style.top = y + "px";
        });
    }
}

function getMouseAction(x, y) {
    if (!(x <= circle.x
        || x >= circle.x + circle.diameter
        || y <= circle.y
        || y >= circle.y + circle.diameter)) {
        // point is in rect=
        var cx = circle.x + circle.diameter / 2;
        var cy = circle.y + circle.diameter / 2;
        //console.log(x, y, cx, cy, Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2)));
        if (Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2)) < circle.diameter / 2) {
            // point is in circle
            return "move";
        } else {
            return "resize";
        }
    } else {
        return "new";
    }
}

window.addEventListener("load", init);
window.addEventListener("resize", zoomFit);

// from https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser //
window.mobilecheck = function() {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};

// from https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
if (!HTMLCanvasElement.prototype.toBlob) {
    Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
        value: function (callback, type, quality) {
            var canvas = this;
            setTimeout(function() {
                var binStr = atob( canvas.toDataURL(type, quality).split(',')[1] ),
                    len = binStr.length,
                    arr = new Uint8Array(len);

                for (var i = 0; i < len; i++ ) {
                arr[i] = binStr.charCodeAt(i);
                }

                callback(new Blob([arr], { type: type || 'image/png' }));
            });
        }
    });
}