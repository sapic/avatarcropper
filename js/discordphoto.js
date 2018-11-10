var canvas, canvas_over;
var canvas_previews = [];
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
var queuedFile = null;
var loadGif = null;

var zoomFactor = 1;
var zoomFitted = false;

var currentRotation = 0;

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
        c.blendMode = "destination-out";
        c.fillCircleInSquare(c.width - o.size, c.height - o.size, o.size, "white");
        c.blendMode = "source-over";
    });
}

function squarePreviews() {
    setSetting("previewMode", "square");
    document.getElementById("switch-square").classList.add("switch-active");
    document.getElementById("switch-circle").classList.remove("switch-active");

    canvas_previews.forEach(o => {
        let c = o.canvas;
        c.fill("#2F3136");
        c.blendMode = "destination-out";
        c.fillRect(c.width - o.size, c.height - o.size, o.size, o.size, "white");
        c.blendMode = "source-over";
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

    var $container = document.createElement("div");
    $container.className = "canvas-preview-container";
    $container.style.width = size + "px";
    $container.style.height = size + "px";
    $container.style["z-index"] = -size;
    previewObj.container = $container;

    var c = new Canvas({ width: size, height: size });
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

        canvas_previews[i].rect = rect;
        runningX += canvas_previews[i].size + padding;
    }

    runningX += padding;

    var mw = "calc(100% - " + runningX + "px)";
    //var mh = "calc(100% - " + (canvas_previews[0].__size + padding + padding) + "px)";

    document.getElementById("container-canvas").style["width"] = mw;

    zoomFit(false);

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
    document.getElementById("container").classList.remove("hidden");
    document.getElementById("contributors").classList.remove("hidden");
    document.getElementById("container-loading").classList.add("hidden-forever");

    loadSettings();

    if (detectIE() && !settings.dismissedIE) {
        alert("hey so your browser isn't really supported ... things should still work but they will be slower/ugly due to how internet explorer/edge function (They don't conform to web standards). i'd recommend switching to firefox or chrome!! but you don't have to if you don't want to. this is the only time you'll see this message unless u clear ur cache or something. ok bye");
        setSetting("dismissedIE", true);
    }
    
    if (dragdrop) {
        dragdrop.init(document.getElementById("dragDropOverlay"));
        dragdrop.softEvents.onnewinput = function(input) {
            loadImg(input);
        }
    }

    document.getElementById("slider-opacity").value = settings.maskTransparency;
    document.getElementById("slider-rotation").value = 0;
    document.getElementById("btn-outlines").classList[settings.outlinesEnabled ? "add" : "remove"]("toggle-active");

    canvas = document.getElementById("canvas");
    canvas_over = new Canvas({
        canvasElement: document.getElementById("canvas-over"),
        deepCalc: true
    });

    createPreviewCanvas(128);
    createPreviewCanvas(90);
    createPreviewCanvas(40);
    //createPreviewCanvas(30);

    document.getElementById("input-file").addEventListener("change", function(e) {
        if (this.files && this.files[0]) {
            loadImg(this.files[0]);
        } else console.info("It's dead, Jim. %o %o", e, this);
    });
    document.getElementById("closeContrib").addEventListener("click", display_contribs_close);
    document.getElementById("supportersLink").addEventListener("click", showSupporters);

    /*if (mobilecheck()) {
        var link = document.createElement("link");
        link.href = "css/mobile.css"
        link.rel = "stylesheet";
        document.getElementsByTagName("head")[0].appendChild(link);
    }*/

    document.getElementById("renderContainer").addEventListener("click", display_render_close);
    document.getElementById("render-close").addEventListener("click", display_render_close);
    document.getElementById("container-whatsNew").addEventListener("click", display_whatsNew_close);
    document.getElementById("whatsNew-close").addEventListener("click", display_whatsNew_close);
    document.getElementById("link-whatsNew").addEventListener("click", display_whatsNew_open);
    document.getElementById("container-tutorial").addEventListener("click", display_tutorial_close);
    document.getElementById("tutorial-close").addEventListener("click", display_tutorial_close);
    document.getElementById("copyright").addEventListener("click", display_tutorial_open);

    var _stopProp = function(e) {
        e.stopPropagation();
    };

    document.getElementById("renderView").addEventListener("click", _stopProp);
    document.getElementById("whatsNew").addEventListener("click", _stopProp);

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
    document.getElementById("slider-rotation").addEventListener("input", slider_rotation_inputfn);
    document.getElementById("btn-addPreview").addEventListener("click", btn_addPreview_clickFn);
    document.getElementById("btn-outlines").addEventListener("click", btn_outlines_clickFn);

    document.getElementById("slider-opacity").addEventListener("touchmove", function(e) {
        return false;
    });

    document.getElementById("zoom-in").addEventListener("click", zoomIn);
    document.getElementById("zoom-out").addEventListener("click", zoomOut);
    document.getElementById("zoom-fit").addEventListener("click", function() { zoomFit(true); });
    document.getElementById("save").addEventListener("click", render);

    document.getElementById("render-save").addEventListener("click", function() {
        this.href = document.getElementById("render-img").src;
    });

    canvas_over.mouse.addEventListener("move", function(x, y, md, lx, ly, ox, oy, e) {
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
            if (circle.x + circle.diameter > canvas_over.width) circle.x = canvas_over.width - circle.diameter;
            if (circle.y + circle.diameter > canvas_over.height) circle.y = canvas_over.height - circle.diameter;
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
                    if (circleOrigin.x - dd < 0 || circleOrigin.y + circleOrigin.diameter + dd > canvas_over.height) {
                        dd = Math.min(circleOrigin.x, canvas_over.height - circleOrigin.y - circleOrigin.diameter);
                    }
                }
            } else {
                if (yr) {
                    if (circleOrigin.x + circleOrigin.diameter + dd > canvas_over.width || circleOrigin.y - dd < 0) {
                        dd = Math.min(canvas_over.width - circleOrigin.x - circleOrigin.diameter, circleOrigin.y);
                    }
                } else {
                    if (circleOrigin.x + circleOrigin.diameter + dd > canvas_over.width || circleOrigin.y + circleOrigin.diameter + dd > canvas_over.height) {
                        dd = Math.min(canvas_over.width - circleOrigin.x - circleOrigin.diameter, canvas_over.height - circleOrigin.y - circleOrigin.diameter);
                    }
                }
            }
            if (circle.diameter > canvas_over.width) {
                // panic
                circle.x = 0;
                circle.y = 0;
                circle.diameter = canvas_over.width;
                alert("fuck");
            } else if (circle.diameter > canvas_over.height) {
                circle.x = 0;
                circle.y = 0;
                circle.diameter = canvas_over.height;
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

    canvas_over.mouse.addEventListener("down", function(x, y, e) {
        var action = getMouseAction(x, y);
        currentAction = action;

        mouseOrigin = { x, y };
        scrollOrigin = {
            x: document.getElementById("container-canvas").scrollLeft,
            y: document.getElementById("container-canvas").scrollTop
        };
        circleOrigin = {};
        Object.assign(circleOrigin, circle);
    });

    canvas_over.mouse.addEventListener("up", function() {
        currentAction = "none";
        drawPreview();
    });

    canvas_over.mouse.addEventListener("leave", canvas_over.mouse.events.up[0]);

    slider_opacity_inputfn();
    
    var container = document.getElementById("container-canvas");
    //var menu = document.getElementById("container-buttons");

    //container.style.width = (document.body.clientWidth - menu.clientWidth) + "px";
    container.style.height = "100%";
}

function zoomElement(element, x, y) {
    x = x || 1;
    y = y || x;

    element.style["transform-origin"] = "top left";
    element.style.transform = "scale(" + x + ", " + y + ")";
}

function zoom(factor) {
    let rotatePart = "";
    
    if (canvas.style.transform.indexOf(" rotate") !== -1) {
        rotatePart = canvas.style.transform.substr(
            canvas.style.transform.indexOf(" rotate")
        );
    }

    factor = factor || zoomFactor;
    zoomFactor = factor;
    canvas_over.zoom(factor);
    zoomElement(canvas, factor);
    canvas.style.transform += rotatePart;

    let r = canvas.getBoundingClientRect();
    
    if (r.left !== 0)
    {
        let current = canvas.style.left || "0px";
        current = current.substr(0, current.length - 2);

        current = parseFloat(current);
        current -= r.left;

        canvas.style.left = current + "px";
    }
    
    if (r.top !== 0)
    {
        let current = canvas.style.top || "0px";
        current = current.substr(0, current.length - 2);

        current = parseFloat(current);
        current -= r.top;

        canvas.style.top = current + "px";
    }
}

function rotate(deg) {
    deg = deg || currentRotation;
    currentRotation = deg;
    
    if (canvas.style.transform.indexOf(" rotate") !== -1) {
        canvas.style.transform = canvas.style.transform.substr(
            0,
            canvas.style.transform.indexOf(" rotate")
        );
    }

    console.log(canvas.style.transform);
    let b4 = canvas.style.transform;

    canvas.style.left = "0px";
    canvas.style.top = "0px";

    canvas_over.resize(canvas.width, canvas.height);

    let or = canvas.getBoundingClientRect();

    canvas.style.transform = b4 + " rotate(" + deg + "deg)";

    let r = canvas.getBoundingClientRect();
    console.log(or, r);
    let dx = -r.left;
    let dy = -r.top;
    
    canvas.style.left = dx + "px";
    canvas.style.top = dy + "px";

    canvas_over.width *= (r.width / or.width);
    canvas_over.height *= (r.height / or.height);
    drawPreview(true);
    zoomFitted && zoomFit();
}

function zoomIn() {
    zoomFitted = false;
    zoomFactor *= 1.1;
    zoom();
}

function zoomOut() {
    zoomFitted = false;
    zoomFactor /= 1.1;
    zoom();
}

function zoomFit(force) {
    if (shouldHide) {
        return;
    }

    if (force === undefined) force = true;

    if (!zoomFitted && !force) {
        return;
    }

    zoomFitted = true;

    /*if (detectIE() !== false) {
        zoom(1);
        return;
    }*/

    var container = document.getElementById("container-canvas");
    var menu = document.getElementById("container-buttons");
    var cr = container.getBoundingClientRect();
    var ir = { width: canvas_over.width, height: canvas_over.height };

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

    while (!canvas_previews.some(function(o) {
        let r = o.rect;

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
    //console.log("---");
    //console.log("zoom1: ", nr.height / ir.height);

    /*window.requestAnimationFrame(function() {

        var delta = container.scrollWidth - container.clientWidth;
        //console.log("dx: ", delta);
    
        if (delta > 0) {
            nr.width -= delta;
            nr.height -= (ir.height / ir.width) * delta;
            zoom(nr.height / ir.height);
            //console.log("zoomx: ", nr.height / ir.height);
        }
    
        delta = container.scrollHeight - container.clientHeight;
        //console.log("dy: ", delta);
    
        if (delta > 0) {
            nr.height -= delta;
            nr.width -= (ir.width / ir.height) * delta;
    
            zoom(nr.height / ir.height);
            //console.log("zoomy: ", nr.height / ir.height);
        }

    });*/
}

function display_whatsNew_open() {
    document.getElementById("container-whatsNew").style.display = "block";
}

function display_whatsNew_close() {
    document.getElementById("container-whatsNew").style.display = "none";
}

function display_tutorial_open() {
    document.getElementById("container-tutorial").style.display = "block";
}

function display_tutorial_close() {
    document.getElementById("container-tutorial").style.display = "none";
}

function display_render_close() {
    if (currentlyRendering) {
        shouldStopRendering = true;
        loadGif && loadGif.abort();
        document.getElementById("render-pleaseWait").style.display = "block";
        return false;
    }

    if (queuedFile) {
        var temp = queuedFile;
        queuedFile = null;
        loadImg(temp);
        return true;
    }

    document.getElementById("renderContainer").style.display = "none";
    document.getElementById("render-pleaseWait").style.display = "none";

    var bs = document.getElementById("render-types").children;
    for (var i = 0; i < bs.length; i++) {
        URL.revokeObjectURL(bs[i]._url);
    }

    document.getElementById("render-types").innerHTML = "";
    return true;
}

function display_render_start() {
    document.getElementById("renderContainer").style.display = "block";
    document.getElementById("renderView-progressBar").style.display = "block";
    document.getElementById("renderView-progress").style.width = "0%";
    document.getElementById("render-header").innerText = "Rendering...";
    document.getElementById("render-types").style.display = "none";
    document.getElementById("render-save").style.display = "none";
    document.getElementById("render-img").src = "";
}

function display_render_finished(arr) {
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
    display_render_start();
    if (currentFiletype === "image/gif") {
        var gif = new SuperGif({
            gif: canvas.cloneNode()
        });
        currentlyRendering = true;

        loadGif = gif;

        var onload = function() {
            loadGif = null;
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

                var c = new Canvas({ width: circle.diameter, height: circle.diameter });
                c.drawCroppedImage(gif.get_canvas(), 0, 0, circle.x, circle.y, circle.diameter, circle.diameter);
                /*if (settings.previewMode === "circle") {
                    c.blendMode = "destination-in";
                    c.fillCircleInSquare(0, 0, c.width(), "white");
                }*/

                if (shouldStopRendering) {
                    currentlyRendering = false;
                    display_render_close();
                    return;
                }
                
                c.createImage(function(img) {
                    if (shouldStopRendering) {
                        currentlyRendering = false;
                        display_render_close();
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
                display_render_finished([
                    {
                        url: url,
                        type: "GIF"
                    }
                ]);
                currentlyRendering = false;
            });

            saveGif.on("abort", function() {
                currentlyRendering = false;
                display_render_close();
            });

            saveGif.on("progress", function(e) {
                document.getElementById("renderView-progress").style.width = (50 + (e * 50)) + "%";

                if (shouldStopRendering) {
                    saveGif.abort();
                }
            });
        };

        gif.load(onload, undefined, function() {
            loadGif = null;
            currentlyRendering = false;
            display_render_close();
        });
    } else {
        var c = new Canvas({ width: circle.diameter, height: circle.diameter });
        c.drawCroppedImage(canvas, 0, 0, circle.x, circle.y, circle.diameter, circle.diameter);

        var cc = new Canvas({ width: circle.diameter, height: circle.diameter });
        cc.drawImage(c.canvas, 0, 0);

        cc.blendMode = "destination-in";
        cc.fillCircleInSquare(0, 0, c.width, "white");

        var url, urlc;
        var count = 0;

        var check = function() {
            if (count === 2) {
                display_render_finished([
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

        c.createBlob(function(blob) {
            url = URL.createObjectURL(blob);
            count++;
            check();
        });

        cc.createBlob(function(blob) {
            urlc = URL.createObjectURL(blob);
            count++;
            check();
        });
    }
}

function display_contribs_close() {
    document.getElementById("contributors").style.display = "none";
    document.getElementById("container").style.height = "100%";
    zoomFit(false);
}

function showSupporters() {
    alert("Thanks to these people for donating and contributing to my work!!\n\nGlen Cathey\nBetty Glez\nMax Abbot\nMetalSonicDash\nAlmxg Levi\nand 2 anons:)\n\nI always ask before publishing a name so just let me know if you'd prefer to stay anonymous!\nok thx love u");
}

function slider_opacity_inputfn() {
    setSetting("maskTransparency", document.getElementById("slider-opacity").value);
    drawPreview(false);
}

function slider_rotation_inputfn() {
    rotate(document.getElementById("slider-rotation").value);
}

function btn_addPreview_clickFn() {
    var size = prompt("Enter a custom size like 256");

    if (size === null) { // cancelled
        return;
    }

    size = parseInt(size);
    
    if (isNaN(size) || size <= 0) {
        alert("Bad size make sure its a number over 0");
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

    if (!display_render_close()) {
        queuedFile = file;
        return;
    }

    currentFiletype = file.type;

    Canvas.fileToImage(file, function(img) {
        /*tpixels = false;
        canvas_over.drawImage(img, 0, 0);
        var data = canvas_over.getImageData().data;
        for (var i = 0; i < data.length; i += 4) {
            if (data[i + 3] < 255) {
                tpixels = true;
                break;
            }
        }
        canvas_over.clear();*/

        var es = document.getElementsByClassName("hidden");
        for (var i = 0; i < es.length; i++) {
            es[i].style.display = "inline-block"; // TODO: make this fallback to css
        }

        canvas_over.resize(img.width, img.height, false);
        canvas_over.clear();

        canvas.innerWidth = img.width;
        canvas.innerHeight = img.height;
        canvas.src = img.src;
        circle.x = 0;
        circle.y = 0;
        circle.diameter = Math.min(img.width, img.height);
        circle.diameter /= 2;
        //document.getElementById("save").setAttribute("download", file.name.substring(0, file.name.lastIndexOf('.')) + "_cropped.png");
        
        document.getElementById("render-save").setAttribute("download", file.name.substring(0, file.name.lastIndexOf('.')) + "_cropped." + (currentFiletype === "image/gif" ? "gif" : "png"));
        
        drawPreview();
        shouldHide = false;

        if (currentSrc)
        {
            URL.revokeObjectURL(currentSrc);
        }

        currentSrc = img.src;
        canvas_previews.forEach(o => {
            o.img.src = img.src;
        });

        zoomFit(true);

        if (!settings.dismissedTutorial) {
            display_tutorial_open();
            setSetting("dismissedTutorial", true);
        }
    }, false);
}

function drawPreview(updatePreviews) {
    if (updatePreviews === undefined) updatePreviews = true;

    if (settings.maskTransparency !== 0) {
        canvas_over.clear();
    }

    if (settings.maskTransparency !== 1) {
        canvas_over.fill("rgba(0,0,0," + (1 - settings.maskTransparency) + ")");

        canvas_over.blendMode = "destination-out";
        if (settings.previewMode === "circle") {
            canvas_over.fillCircleInSquare(circle.x, circle.y, circle.diameter, "white");
        } else {
            canvas_over.fillRect(circle.x, circle.y, circle.diameter, circle.diameter, "white");
        }
    }

    canvas_over.blendMode = "source-over";

    if (settings.outlinesEnabled) {
        canvas_over.lineDash = [ Math.min(canvas_over.width, canvas_over.height) / 100 ];
        
        if (settings.previewMode === "circle") {
            canvas_over.drawCircleInSquare(circle.x, circle.y, circle.diameter, "white", 1);
        }
        
        canvas_over.drawRect(circle.x, circle.y, circle.diameter, circle.diameter, "white", 1, zoomFactor >= 1);
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
            }"scale(0.523863, 0.523863) rotate(436deg)"
        });*/

        canvas_previews.forEach(o => {
            var scale = o.size / circle.diameter;
            o.img.style.transform = "scale(" + scale + ")";
            o.img.style.position = "absolute";
            
            var x = 0;
            var y = 0;

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
window.addEventListener("resize", function() { zoomFit(false); });

// from https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser //
window.mobilecheck = function() {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};

// https://codepen.io/gapcode/pen/vEJNZN
function detectIE() {
    var ua = window.navigator.userAgent;

    // Test values; Uncomment to check result …

    // IE 10
    // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

    // IE 11
    // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

    // Edge 12 (Spartan)
    // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

    // Edge 13
    // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        // IE 10 or older => return version number
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
        // IE 11 => return version number
        var rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    var edge = ua.indexOf('Edge/');
    if (edge > 0) {
        // Edge (IE 12+) => return version number
        return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }

    // other browser
    return false;
}

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