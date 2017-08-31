var canvas, canvas_over;
var canvas_previews = [];
var previewMode = "circle";
var currentAction = "none";
var circle = {
    x: 0,
    y: 0,
    diameter: 32
};
var maskTransparency = 0;
var shouldHide = true;
var outlinesEnabled = true;
var tpixels = false;
var mouseOrigin, circleOrigin;

function createPreviewCanvas(size) {
    var padding = 16;
    var runningX = 0;
    var c = new Canvas(document.createElement("canvas"));
    c.resize(size, size, false);
    c.__size = size;
    c.canvas.title = size + "x" + size;
    c.canvas.className = "canvas-preview";
    document.getElementById("container").appendChild(c.canvas);

    var inserted = false;
    for (var i = 0; i < canvas_previews.length; i++) {
        if (size > canvas_previews[i].__size) {
            canvas_previews.splice(i, 0, c);
            inserted = true;
            break;
        }
    }
    if (!inserted) {
        canvas_previews.push(c);
    }

    for (var i = 0; i < canvas_previews.length; i++) {
        canvas_previews[i].canvas.style.right = runningX + "px";
        runningX += canvas_previews[i].__size + padding;
    }

    runningX += padding;

    var mw = "calc(100% - " + runningX + "px)";
    var mh = "calc(100% - " + (canvas_previews[0].__size + padding + padding) + "px)";

    document.getElementById("canvas").style["max-width"] = mw;
    document.getElementById("canvas-over").style["max-width"] = mw;


    if (shouldHide) {
        c.canvas.className += " hidden";
    } else {
        drawPreview();
    }
}

function applyToPreviewCanvas(fn) {
    for (let i = 0; i < canvas_previews.length; i++) {
        fn(canvas_previews[i]);
    }
}

function init() {
    canvas = new Canvas(document.getElementById("canvas"));
    canvas_over = new Canvas(document.getElementById("canvas-over"));

    createPreviewCanvas(128);
    createPreviewCanvas(90);
    createPreviewCanvas(40);
    //createPreviewCanvas(30);

    document.getElementById("input-file").addEventListener("change", loadImg);

    document.getElementById("switch-square").addEventListener("click", function() {
        previewMode = "square";
        document.getElementById("switch-square").classList.add("switch-active");
        document.getElementById("switch-circle").classList.remove("switch-active");
        drawPreview();
    });

    document.getElementById("switch-circle").addEventListener("click", function() {
        previewMode = "circle";
        document.getElementById("switch-square").classList.remove("switch-active");
        document.getElementById("switch-circle").classList.add("switch-active");
        drawPreview();
    });

    document.getElementById("slider-opacity").addEventListener("input", slider_opacity_inputfn);
    document.getElementById("btn-addPreview").addEventListener("click", btn_addPreview_clickFn);
    document.getElementById("btn-outlines").addEventListener("click", btn_outlines_clickFn);

    document.getElementById("slider-opacity").addEventListener("touchmove", function(e) {
        return false;
    });

    document.getElementById("save").addEventListener("click", function() {
        var c = new Canvas(document.createElement("canvas"));
        c.resize(circle.diameter, circle.diameter, false);
        c.clear();
        c.drawCroppedImage(canvas.canvas, 0, 0, circle.x, circle.y, circle.diameter, circle.diameter);
        if (previewMode === "circle") {
            c.setBlendingMode("destination-in");
            c.fillCircleInSquare(0, 0, c.width(), "white");
        }
        this.href = c.toDataURL().replace("image/png", "application/octet-stream");
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

        if (currentAction === "none") return;

        if (currentAction === "move") {
            var dx = x - mouseOrigin.x;
            var dy = y - mouseOrigin.y;
            circle.x = circleOrigin.x + dx;
            circle.y = circleOrigin.y + dy;

            if (circle.x < 0) circle.x = 0;
            if (circle.y < 0) circle.y = 0;
            if (circle.x + circle.diameter > canvas.width()) circle.x = canvas.width() - circle.diameter;
            if (circle.y + circle.diameter > canvas.height()) circle.y = canvas.height() - circle.diameter;
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
                    if (circleOrigin.x - dd < 0 || circleOrigin.y + circleOrigin.diameter + dd > canvas.height()) {
                        dd = Math.min(circleOrigin.x, canvas.height() - circleOrigin.y - circleOrigin.diameter);
                    }
                }
            } else {
                if (yr) {
                    if (circleOrigin.x + circleOrigin.diameter + dd > canvas.width() || circleOrigin.y - dd < 0) {
                        dd = Math.min(canvas.width() - circleOrigin.x - circleOrigin.diameter, circleOrigin.y);
                    }
                } else {
                    if (circleOrigin.x + circleOrigin.diameter + dd > canvas.width() || circleOrigin.y + circleOrigin.diameter + dd > canvas.height()) {
                        dd = Math.min(canvas.width() - circleOrigin.x - circleOrigin.diameter, canvas.height() - circleOrigin.y - circleOrigin.diameter);
                    }
                }
            }
            if (circle.diameter > canvas.width()) {
                // panic
                circle.x = 0;
                circle.y = 0;
                circle.diameter = canvas.width();
                alert("fuck");
            } else if (circle.diameter > canvas.height()) {
                circle.x = 0;
                circle.y = 0;
                circle.diameter = canvas.height();
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
        e.preventDefault();
    });

    canvas_over.setMouseDown(function(x, y, e) {
        var action = getMouseAction(x, y);
        currentAction = action;

        mouseOrigin = {x, y};
        circleOrigin = {};
        Object.assign(circleOrigin, circle);
    });

    canvas_over.setMouseUp(function() {
        currentAction = "none";
        drawPreview();
    });

    canvas_over.setMouseLeave(canvas_over.mouseUpEvents[0]);

    slider_opacity_inputfn();
}

function slider_opacity_inputfn() {
    maskTransparency = document.getElementById("slider-opacity").value;
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
    outlinesEnabled = !outlinesEnabled;
    $b.classList.toggle("toggle-active");
    drawPreview(false);
}

function loadImg() {
    if (!this.files[0]) return;
    var file = this.files[0];

    Canvas.fileToImage(file, function(img) {
        var data = canvas.getImageData().data;
        for (var i = 0; i < data.length; i += 4) {
            if (data[i + 3] < 255) {
                tpixels = true;
                break;
            }
        }

        var es = document.getElementsByClassName("hidden");
        for (var i = 0; i < es.length; i++) {
            es[i].style.display = "inline-block";
        }
        canvas.resize(img.width, img.height, false);
        canvas_over.resize(img.width, img.height, false);
        canvas.drawImage(img, 0, 0);
        circle.x = 0;
        circle.y = 0;
        circle.diameter = img.width > img.height ? img.height : img.width;
        document.getElementById("save").setAttribute("download", file.name.substring(0, file.name.lastIndexOf('.')) + "_cropped.png");
        if (shouldHide) {
            document.getElementById("switch-circle").click(); // draws preview
        } else {
            drawPreview(); // we've done this before and dont want to set it to circle so just draw preview
        }
        shouldHide = false;


    });
}

function drawPreview(updatePreviews) {
    if (updatePreviews === undefined) updatePreviews = true;

    if (maskTransparency !== 0) {
        canvas_over.clear();
    }

    if (maskTransparency !== 1) {
        canvas_over.fill("rgba(0,0,0," + (1 - maskTransparency) + ")");

        canvas_over.setBlendingMode("destination-out");
        if (previewMode === "circle") {
            canvas_over.fillCircleInSquare(circle.x, circle.y, circle.diameter, "white");
        } else {
            canvas_over.fillRect(circle.x, circle.y, circle.diameter, circle.diameter, "white");
        }
    }

    canvas_over.setBlendingMode("source-over");

    if (outlinesEnabled) {
        if (previewMode === "circle") {
            canvas_over.setLineDash([1, 2]);
            canvas_over.drawCircleInSquare(circle.x, circle.y, circle.diameter, "white", 1);
        } else {
            canvas_over.setLineDash([1]);
            canvas_over.drawRect(circle.x, circle.y, circle.diameter, circle.diameter, "white", 1);
        }
    }

    if (updatePreviews) {
        applyToPreviewCanvas(function(c) {
            c.clear();

            if (currentAction === "none" && circle.diameter > c.__size) {
                let cv = new Canvas(document.createElement("canvas"));
                cv.resize(circle.diameter, circle.diameter, false);
                cv.drawCroppedImage(canvas.canvas, 0, 0, circle.x, circle.y, circle.diameter, circle.diameter);
                let cv_2 = downScaleCanvas(cv.canvas, c.width() / circle.diameter);
                c.drawImage(cv_2, 0, 0);
            } else {
                c.drawCroppedImage(canvas.canvas, 0, 0, circle.x, circle.y, circle.diameter, circle.diameter, c.width(), c.height());
            }

            if (previewMode === "circle") {
                c.setBlendingMode("destination-in");
                c.fillCircleInSquare(0, 0, c.width(), "white");
                c.setBlendingMode("source-over");
            }
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

// -------------------------------- STOLEN AND MODIFIED TO ACCOUNT FOR ALPHA VALUES ALPHA FROM STACK OVERFLOW http://jsfiddle.net/gamealchemist/r6aVp/

// scales the image by (float) scale < 1
// returns a canvas containing the scaled image.
function downScaleImage(img, scale) {
    var imgCV = document.createElement('canvas');
    imgCV.width = img.width;
    imgCV.height = img.height;
    var imgCtx = imgCV.getContext('2d');
    imgCtx.drawImage(img, 0, 0);
    return downScaleCanvas(imgCV, scale);
}

// scales the canvas by (float) scale < 1
// returns a new canvas containing the scaled image.
function downScaleCanvas(cv, scale) {
    if (!(scale < 1) || !(scale > 0)) throw ('scale must be a positive number <1 ');
    scale = normaliseScale(scale);
    var sqScale = scale * scale; // square scale =  area of a source pixel within target
    var sw = cv.width; // source image width
    var sh = cv.height; // source image height
    var tw = Math.floor(sw * scale); // target image width
    var th = Math.floor(sh * scale); // target image height
    var sx = 0, sy = 0, sIndex = 0; // source x,y, index within source array
    var tx = 0, ty = 0, yIndex = 0, tIndex = 0; // target x,y, x,y index within target array
    var tX = 0, tY = 0; // rounded tx, ty
    var w = 0, nw = 0, wx = 0, nwx = 0, wy = 0, nwy = 0; // weight / next weight x / y
    // weight is weight of current source point within target.
    // next weight is weight of current source point within next target's point.
    var crossX = false; // does scaled px cross its current px right border ?
    var crossY = false; // does scaled px cross its current px bottom border ?
    var sBuffer = cv.getContext('2d').
    getImageData(0, 0, sw, sh).data; // source buffer 8 bit rgba
    var tBuffer = new Float32Array(4 * tw * th); // target buffer Float32 rgb
    var sR = 0, sG = 0,  sB = 0, sA = 0; // source's current point r,g,b

    for (sy = 0; sy < sh; sy++) {
        ty = sy * scale; // y src position within target
        tY = 0 | ty;     // rounded : target pixel's y
        yIndex = 4 * tY * tw;  // line index within target array
        crossY = (tY !== (0 | ( ty + scale )));
        if (crossY) { // if pixel is crossing botton target pixel
            wy = (tY + 1 - ty); // weight of point within target pixel
            nwy = (ty + scale - tY - 1); // ... within y+1 target pixel
        }
        for (sx = 0; sx < sw; sx++, sIndex += 4) {
            tx = sx * scale; // x src position within target
            tX = 0 |  tx;    // rounded : target pixel's x
            tIndex = yIndex + tX * 4; // target pixel index within target array
            crossX = (tX !== (0 | (tx + scale)));
            if (crossX) { // if pixel is crossing target pixel's right
                wx = (tX + 1 - tx); // weight of point within target pixel
                nwx = (tx + scale - tX - 1); // ... within x+1 target pixel
            }
            sR = sBuffer[sIndex    ];   // retrieving r,g,b for curr src px.
            sG = sBuffer[sIndex + 1];
            sB = sBuffer[sIndex + 2];
            sA = sBuffer[sIndex + 3];
            //if (sA !== 255) console.log(sA);
            if (!crossX && !crossY) { // pixel does not cross
                // just add components weighted by squared scale.
                tBuffer[tIndex    ] += sR * sqScale;
                tBuffer[tIndex + 1] += sG * sqScale;
                tBuffer[tIndex + 2] += sB * sqScale;
                tBuffer[tIndex + 3] += sA * sqScale;
            } else if (crossX && !crossY) { // cross on X only
                w = wx * scale;
                // add weighted component for current px
                tBuffer[tIndex    ] += sR * w;
                tBuffer[tIndex + 1] += sG * w;
                tBuffer[tIndex + 2] += sB * w;
                tBuffer[tIndex + 3] += sA * w;
                // add weighted component for next (tX+1) px
                nw = nwx * scale
                tBuffer[tIndex + 4] += sR * nw;
                tBuffer[tIndex + 5] += sG * nw;
                tBuffer[tIndex + 6] += sB * nw;
                tBuffer[tIndex + 7] += sA * nw;
            } else if (!crossX && crossY) { // cross on Y only
                w = wy * scale;
                // add weighted component for current px
                tBuffer[tIndex    ] += sR * w;
                tBuffer[tIndex + 1] += sG * w;
                tBuffer[tIndex + 2] += sB * w;
                tBuffer[tIndex + 3] += sA * w;
                // add weighted component for next (tY+1) px
                nw = nwy * scale
                tBuffer[tIndex + 4 * tw    ] += sR * nw;
                tBuffer[tIndex + 4 * tw + 1] += sG * nw;
                tBuffer[tIndex + 4 * tw + 2] += sB * nw;
                tBuffer[tIndex + 4 * tw + 3] += sA * nw;
            } else { // crosses both x and y : four target points involved
                // add weighted component for current px
                w = wx * wy;
                tBuffer[tIndex    ] += sR * w;
                tBuffer[tIndex + 1] += sG * w;
                tBuffer[tIndex + 2] += sB * w;
                tBuffer[tIndex + 3] += sA * w;
                // for tX + 1; tY px
                nw = nwx * wy;
                tBuffer[tIndex + 4] += sR * nw;
                tBuffer[tIndex + 5] += sG * nw;
                tBuffer[tIndex + 6] += sB * nw;
                tBuffer[tIndex + 7] += sA * nw;
                // for tX ; tY + 1 px
                nw = wx * nwy;
                tBuffer[tIndex + 4 * tw    ] += sR * nw;
                tBuffer[tIndex + 4 * tw + 1] += sG * nw;
                tBuffer[tIndex + 4 * tw + 2] += sB * nw;
                tBuffer[tIndex + 4 * tw + 3] += sA * nw;
                // for tX + 1 ; tY +1 px
                nw = nwx * nwy;
                tBuffer[tIndex + 4 * tw + 4] += sR * nw;
                tBuffer[tIndex + 4 * tw + 5] += sG * nw;
                tBuffer[tIndex + 4 * tw + 6] += sB * nw;
                tBuffer[tIndex + 4 * tw + 7] += sA * nw;
            }
        } // end for sx
    } // end for sy

    // create result canvas
    var resCV = document.createElement('canvas');
    resCV.width = tw;
    resCV.height = th;
    var resCtx = resCV.getContext('2d');
    var imgRes = resCtx.getImageData(0, 0, tw, th);
    var tByteBuffer = imgRes.data;
    // convert float32 array into a UInt8Clamped Array
    var pxIndex = 0; //
    for (sIndex = 0, tIndex = 0; pxIndex < tw * th; sIndex += 4, tIndex += 4, pxIndex++) {
        // 0 | number to trunc
        tByteBuffer[tIndex] = 0 | ( tBuffer[sIndex]);
        tByteBuffer[tIndex + 1] = 0 | (tBuffer[sIndex + 1]);
        tByteBuffer[tIndex + 2] = 0 | (tBuffer[sIndex + 2]);
        tByteBuffer[tIndex + 3] = tpixels ? 0 | (tBuffer[sIndex + 3]) : 255;
        /*if ((0 | tBuffer[sIndex + 3]) != 255) {
            console.log(0 | tBuffer[sIndex + 3]);
        }*/
    }
    // writing result to canvas.
    resCtx.putImageData(imgRes, 0, 0);
    return resCV;
}

function polyFillPerfNow() {
    window.performance = window.performance ? window.performance : {};
    window.performance.now =  window.performance.now ||  window.performance.webkitNow ||  window.performance.msNow ||
        window.performance.mozNow || Date.now ;
};

function log2(v) {
    // taken from http://graphics.stanford.edu/~seander/bithacks.html
    var b =  [ 0x2, 0xC, 0xF0, 0xFF00, 0xFFFF0000 ];
    var S =  [1, 2, 4, 8, 16];
    var i=0, r=0;

    for (i = 4; i >= 0; i--) {
        if (v & b[i])  {
            v >>= S[i];
            r |= S[i];
        }
    }
    return r;
}
// normalize a scale <1 to avoid some rounding issue with js numbers
function normaliseScale(s) {
    if (s>1) throw('s must be <1');
    return s;
    /*s = 0 | (1/s);
    var l = log2(s);
    var mask = 1 << l;
    var accuracy = 4;
    while(accuracy && l) { l--; mask |= 1<<l; accuracy--; }
    return 1 / ( s & mask );*/
}
