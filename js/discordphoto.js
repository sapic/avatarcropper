var canvas, canvas_over;
var canvas_previews = [];
var canvas_previews_runningX = 0;
var previewImg;
var currentAction = "none";
var circle = {
    x: 0,
    y: 0,
    diameter: 32
};

function createPreviewCanvas(size) {
    var c = new Canvas(document.createElement("canvas"));
    c.resize(size, size, false);
    canvas_previews.push(c);
    c.canvas.className = "canvas-preview hidden";
    c.canvas.style.right = canvas_previews_runningX + "px";
    canvas_previews_runningX += size;
    document.getElementById("container").appendChild(c.canvas);
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
    previewImg = new Image();
    previewImg.onload = function() {
        document.getElementById("container").style.display = "block";
    }
    previewImg.src = "./img/circle.png";

    document.getElementById("save-square").addEventListener("click", function() {
        var c = new Canvas(document.createElement("canvas"));
        c.resize(circle.diameter, circle.diameter, false);
        c.clear();
        c.drawCroppedImage(canvas.canvas, 0, 0, circle.x, circle.y, circle.diameter, circle.diameter);
        this.href = c.toDataURL();
    });

    document.getElementById("save-circle").addEventListener("click", function() {
        var c = new Canvas(document.createElement("canvas"));
        c.resize(circle.diameter, circle.diameter, false);
        c.clear();
        c.drawCroppedImage(canvas.canvas, 0, 0, circle.x, circle.y, circle.diameter, circle.diameter);
        c.setBlendingMode("destination-in");
        c.fillCircleInSquare(0, 0, c.width(), "white");
        this.href = c.toDataURL();
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
            var dx = x - lx;
            var dy = y - ly;
            circle.x += dx;
            circle.y += dy;

            if (circle.x < 0) circle.x = 0;
            if (circle.y < 0) circle.y = 0;
            if (circle.x + circle.diameter > canvas.width()) circle.x = canvas.width() - circle.diameter;
            if (circle.y + circle.diameter > canvas.height()) circle.y = canvas.height() - circle.diameter;
        } else if (currentAction === "resize") {
            var xr = x < circle.x + circle.diameter / 2;
            var yr = y < circle.y + circle.diameter / 2;
            var dx = x - lx;
            var dy = y - ly;
            if (xr) dx *= -1;
            if (yr) dy *= -1;
            var rx = xr ? circle.x + circle.diameter : circle.x;
            var ry = yr ? circle.y + circle.diameter : circle.y;
            var dd = Math.abs(dx) > Math.abs(dy) ? dx : dy;
            if (circle.diameter + dd < 16) dd = circle.diameter - 16;
            circle.diameter += dd;
            circle.x = xr ? rx - circle.diameter : circle.x;
            circle.y = yr ? ry - circle.diameter : circle.y;
        }

        circle.x = Math.round(circle.x);
        circle.y = Math.round(circle.y);
        circle.diameter = Math.round(circle.diameter);
        drawCircle();
    });

    canvas_over.setMouseDown(function(x, y, e) {
        var action = getMouseAction(x, y);
        currentAction = action;
    });

    canvas_over.setMouseUp(function() {
        currentAction = "none";
        drawCircle();
    });

    canvas_over.setMouseLeave(canvas_over.mouseUpEvents[0]);
}

function loadImg() {
    if (!this.files[0]) return;
    var file = this.files[0];

    Canvas.fileToImage(file, function(img) {
        var es = document.getElementsByClassName("hidden");
        for (var i = 0; i < es.length; i++) {
            es[i].style.display = "block";
        }
        canvas.resize(img.width, img.height, false);
        canvas_over.resize(img.width, img.height, false);
        canvas.drawImage(img, 0, 0);
        circle.x = 0;
        circle.y = 0;
        circle.diameter = img.width > img.height ? img.height : img.width;
        document.getElementById("save-square").setAttribute("download", file.name.substring(0, file.name.lastIndexOf('.')) + "_square_crop");
        document.getElementById("save-circle").setAttribute("download", file.name.substring(0, file.name.lastIndexOf('.')) + "_circle_crop");
        drawCircle();
    });
}

function drawCircle() {
    canvas_over.fill("black");
    canvas_over.setBlendingMode("destination-out");
    canvas_over.fillCircleInSquare(circle.x, circle.y, circle.diameter, "white");
    canvas_over.setBlendingMode("source-over");
    canvas_over.setLineDash([1]);
    canvas_over.drawRect(circle.x, circle.y, circle.diameter, circle.diameter, "white", 1);
    applyToPreviewCanvas(function(c) {
        c.clear();
    });

    if (currentAction === "none" && circle.diameter > 128) {
        applyToPreviewCanvas(function(c) {
            var cv = new Canvas(document.createElement("canvas"));
            cv.resize(circle.diameter, circle.diameter, false);
            cv.drawCroppedImage(canvas.canvas, 0, 0, circle.x, circle.y, circle.diameter, circle.diameter);
            var cv_2 = downScaleCanvas(cv.canvas, c.width() / circle.diameter);
            c.drawImage(cv_2, 0, 0);
        });
    } else {
        applyToPreviewCanvas(function(c) {
            c.drawCroppedImage(canvas.canvas, 0, 0, circle.x, circle.y, circle.diameter, circle.diameter, c.width(), c.height());
        });
    }

    applyToPreviewCanvas(function(c) {
        c.drawImage(previewImg, 0, 0, c.width(), c.height());
    })
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

// -------------------------------- STOLE THIS FROM STACK OVERFLOW http://jsfiddle.net/gamealchemist/r6aVp/

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
    var tBuffer = new Float32Array(3 * tw * th); // target buffer Float32 rgb
    var sR = 0, sG = 0,  sB = 0; // source's current point r,g,b

    for (sy = 0; sy < sh; sy++) {
        ty = sy * scale; // y src position within target
        tY = 0 | ty;     // rounded : target pixel's y
        yIndex = 3 * tY * tw;  // line index within target array
        crossY = (tY !== (0 | ( ty + scale )));
        if (crossY) { // if pixel is crossing botton target pixel
            wy = (tY + 1 - ty); // weight of point within target pixel
            nwy = (ty + scale - tY - 1); // ... within y+1 target pixel
        }
        for (sx = 0; sx < sw; sx++, sIndex += 4) {
            tx = sx * scale; // x src position within target
            tX = 0 |  tx;    // rounded : target pixel's x
            tIndex = yIndex + tX * 3; // target pixel index within target array
            crossX = (tX !== (0 | (tx + scale)));
            if (crossX) { // if pixel is crossing target pixel's right
                wx = (tX + 1 - tx); // weight of point within target pixel
                nwx = (tx + scale - tX - 1); // ... within x+1 target pixel
            }
            sR = sBuffer[sIndex    ];   // retrieving r,g,b for curr src px.
            sG = sBuffer[sIndex + 1];
            sB = sBuffer[sIndex + 2];
            if (!crossX && !crossY) { // pixel does not cross
                // just add components weighted by squared scale.
                tBuffer[tIndex    ] += sR * sqScale;
                tBuffer[tIndex + 1] += sG * sqScale;
                tBuffer[tIndex + 2] += sB * sqScale;
            } else if (crossX && !crossY) { // cross on X only
                w = wx * scale;
                // add weighted component for current px
                tBuffer[tIndex    ] += sR * w;
                tBuffer[tIndex + 1] += sG * w;
                tBuffer[tIndex + 2] += sB * w;
                // add weighted component for next (tX+1) px
                nw = nwx * scale
                tBuffer[tIndex + 3] += sR * nw;
                tBuffer[tIndex + 4] += sG * nw;
                tBuffer[tIndex + 5] += sB * nw;
            } else if (!crossX && crossY) { // cross on Y only
                w = wy * scale;
                // add weighted component for current px
                tBuffer[tIndex    ] += sR * w;
                tBuffer[tIndex + 1] += sG * w;
                tBuffer[tIndex + 2] += sB * w;
                // add weighted component for next (tY+1) px
                nw = nwy * scale
                tBuffer[tIndex + 3 * tw    ] += sR * nw;
                tBuffer[tIndex + 3 * tw + 1] += sG * nw;
                tBuffer[tIndex + 3 * tw + 2] += sB * nw;
            } else { // crosses both x and y : four target points involved
                // add weighted component for current px
                w = wx * wy;
                tBuffer[tIndex    ] += sR * w;
                tBuffer[tIndex + 1] += sG * w;
                tBuffer[tIndex + 2] += sB * w;
                // for tX + 1; tY px
                nw = nwx * wy;
                tBuffer[tIndex + 3] += sR * nw;
                tBuffer[tIndex + 4] += sG * nw;
                tBuffer[tIndex + 5] += sB * nw;
                // for tX ; tY + 1 px
                nw = wx * nwy;
                tBuffer[tIndex + 3 * tw    ] += sR * nw;
                tBuffer[tIndex + 3 * tw + 1] += sG * nw;
                tBuffer[tIndex + 3 * tw + 2] += sB * nw;
                // for tX + 1 ; tY +1 px
                nw = nwx * nwy;
                tBuffer[tIndex + 3 * tw + 3] += sR * nw;
                tBuffer[tIndex + 3 * tw + 4] += sG * nw;
                tBuffer[tIndex + 3 * tw + 5] += sB * nw;
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
    for (sIndex = 0, tIndex = 0; pxIndex < tw * th; sIndex += 3, tIndex += 4, pxIndex++) {
        tByteBuffer[tIndex] = 0 | ( tBuffer[sIndex]);
        tByteBuffer[tIndex + 1] = 0 | (tBuffer[sIndex + 1]);
        tByteBuffer[tIndex + 2] = 0 | (tBuffer[sIndex + 2]);
        tByteBuffer[tIndex + 3] = 255;
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
