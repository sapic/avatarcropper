export type SortFunction<T> = (a : T, b : T) => boolean;

export function createElement(type : string, className : string = "") : HTMLElement
{
    let ret = document.createElement(type);
    ret.className = className;
    return ret;
}

export class Point
{
    public x : number;
    public y : number;

    constructor(x? : number, y? : number )
    {
        if (x === undefined)
        {
            this.x = 0;
            this.y = 0;
        }
        else if (y === undefined)
        {
            this.x = x;
            this.y = x;
        }
        else
        {
            this.x = x;
            this.y = y;
        }
    }

    public equals(p : Point) : boolean
    {
        return this.x === p.x && this.y === p.y;
    }

    public copy() : Point
    {
        return new Point(this.x, this.y);
    }

    public round() : void
    {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
    }

    public times(n : number | Point) : Point
    {
        let ret = this.copy();
        ret.multiply(n);
        return ret;
    }

    public multiply(n : number | Point) : void
    {
        if (n instanceof Point)
        {
            this.x *= n.x;
            this.y *= n.y;
        }
        else
        {
            this.x *= n;
            this.y *= n;
        }
    }

    public dividedBy(n : number | Point) : Point
    {
        let ret = this.copy();
        ret.divideBy(n);
        return ret;
    }

    public divideBy(n : number | Point) : void
    {
        if (n instanceof Point)
        {
            this.x /= n.x;
            this.y /= n.y;
        }
        else
        {
            this.x /= n;
            this.y /= n;
        }
    }

    public plus(n : number | Point) : Point
    {
        let ret = this.copy();
        ret.add(n);
        return ret;
    }

    public add(n : number | Point) : void
    {
        if (n instanceof Point)
        {
            this.x += n.x;
            this.y += n.y;
        }
        else
        {
            this.x += n;
            this.y += n;
        }
    }

    public minus(n : number | Point) : Point
    {
        let ret = this.copy();
        ret.subtract(n);
        return ret;
    }

    public subtract(n : number | Point) : void
    {
        if (n instanceof Point)
        {
            this.x -= n.x;
            this.y -= n.y;
        }
        else
        {
            this.x -= n;
            this.y -= n;
        }
    }

    public get squared() : Point
    {
        return this.times(this);
    }

    public get sum() : number
    {
        return this.x + this.y;
    }

    public get min() : number
    {
        return Math.min(this.x, this.y);
    }

    public distanceTo(p : Point) : number
    {
        return Math.sqrt(this.minus(p).squared.sum);
    }

    public toString() : string
    {
        return "(" + this.x + ", " + this.y + ")";
    }
}

export type RectAnchor = "ne" | "nw" | "se" | "sw";

export class Rectangle
{
    public position : Point;
    public size : Point;

    constructor(position : Point, size : Point)
    {
        this.position = position;
        this.size = size;
    }

    public toString() : string
    {
        return "(" + this.x + ", " + this.y + ", " + this.width + ", " + this.height + ")";
    }

    public fitInside(rect : Rectangle, anchor : RectAnchor) : void
    {
        let ar = rect.aspectRatio;
        let startPoint = this.getPointFromAnchor(anchor).copy();

        if (ar > this.aspectRatio)
        {
            // wider //
            this.width *= rect.height / this.height;
            this.height = rect.height;
        }
        else
        {
            // taller //
            this.height *= rect.width / this.width;
            this.width = rect.width;
        }

        this.setPointFromAnchor(anchor, startPoint);
    }

    public setWidthKeepAR(width : number) : void
    {
        let ar = this.width / width;
        this.width = width;
        this.height = this.height / ar;
    }

    public setHeightKeepAR(height : number) : void
    {
        let ar = this.height / height;
        this.height = height;
        this.width = this.width / ar;
    }

    public fitInsideGreedy(rect : Rectangle, anchor : RectAnchor, boundingRect : Rectangle) : void
    {
        let ar = rect.aspectRatio;
        let startPoint = this.getPointFromAnchor(anchor).copy();

        if (ar > 1)
        {
            // wider //
            this.height *= rect.width / this.width;
            this.width = rect.width;
        }
        else
        {
            // taller //
            this.width *= rect.height / this.height;
            this.height = rect.height;
        }

        this.setPointFromAnchor(anchor, startPoint);

        if (!boundingRect.containsRect(this))
        {
            if (this.right > boundingRect.right)
            {
                this.setWidthKeepAR(boundingRect.right - this.left);
            }
            if (this.bottom > boundingRect.bottom)
            {
                this.setHeightKeepAR(boundingRect.bottom - this.top);
            }
            if (this.left < boundingRect.left)
            {
                this.setWidthKeepAR(this.right - boundingRect.left);
            }
            if (this.top < boundingRect.top)
            {
                this.setHeightKeepAR(this.top - boundingRect.top);
            }

            this.setPointFromAnchor(anchor, startPoint);
        }
    }

    public copy() : Rectangle
    {
        return new Rectangle(this.position.copy(), this.size.copy());
    }

    public mirror(r : Rectangle) : void
    {
        this.position = r.position;
        this.size = r.size;
    }

    public getPointFromAnchor(anchor : RectAnchor)
    {
        switch (anchor)
        {
            case "nw": return this.topLeft;
            case "ne": return this.topRight;
            case "sw": return this.bottomLeft;
            case "se": return this.bottomRight;
        }
    }

    public setPointFromAnchor(anchor : RectAnchor, point : Point)
    {
        switch (anchor)
        {
            case "nw": this.topLeft = point; break;
            case "ne": this.topRight = point; break;
            case "sw": this.bottomLeft = point; break;
            case "se": this.bottomRight = point; break;
        }
    }

    public static anchorOpposite(anchor : RectAnchor) : RectAnchor
    {
        switch (anchor)
        {
            case "nw": return "se";
            case "ne": return "sw";
            case "sw": return "ne";
            case "se": return "nw";
        }
    }

    public get aspectRatio() : number
    {
        return this.width / this.height;
    }

    public round() : void
    {
        this.position.round();
        this.size.round();
    }

    public get local() : Rectangle
    {
        return new Rectangle(new Point(0), this.size.copy());
    }
    
    public get x() : number
    {
        return this.position.x;
    }

    public set x(x : number)
    {
        this.position.x = x;
    }

    public get y() : number
    {
        return this.position.y;
    }

    public set y(y : number)
    {
        this.position.y = y;
    }
    
    public get left() : number
    {
        return this.position.x;
    }

    public set left(left : number)
    {
        this.position.x = left;
    }

    public get top() : number
    {
        return this.position.y;
    }

    public set top(top : number)
    {
        this.position.y = top;
    }

    public get width() : number
    {
        return this.size.x;
    }

    public set width(width : number)
    {
        this.size.x = width;
    }

    public get height() : number
    {
        return this.size.y;
    }

    public set height(height : number)
    {
        this.size.y = height;
    }

    public get right() : number
    {
        return this.x + this.width;
    }

    public set right(right : number)
    {
        this.x = right - this.width;
    }

    public get bottom() : number
    {
        return this.y + this.height;
    }

    public set bottom(bottom : number)
    {
        this.y = bottom - this.height;
    }

    public get topLeft() : Point
    {
        return this.position;
    }

    public set topLeft(topLeft : Point)
    {
        this.position = topLeft;
    }

    public get topRight() : Point
    {
        return this.position.plus(new Point(this.width, 0));
    }

    public set topRight(topRight : Point)
    {
        this.position = topRight.minus(new Point(this.width, 0));
    }

    public get bottomLeft() : Point
    {
        return this.position.plus(new Point(0, this.height));
    }

    public set bottomLeft(bottomLeft : Point)
    {
        this.position = bottomLeft.minus(new Point(0, this.height));
    }

    public get bottomRight() : Point
    {
        return this.position.plus(this.size);
    }

    public set bottomRight(bottomRight : Point)
    {
        this.position = bottomRight.minus(this.size);
    }

    public get center() : Point
    {
        return this.position.plus(this.size.times(1/2));
    }

    public set center(center : Point)
    {
        this.position = center.minus(this.size.times(1/2));
    }

    public get cx() : number
    {
        return this.center.x;
    }

    public set cx(cx : number)
    {
        this.position.x = cx - this.size.x / 2;
    }

    public get cy() : number
    {
        return this.center.y;
    }

    public set cy(cy : number)
    {
        this.position.y = cy - this.size.y / 2;
    }

    public containsPoint(p : Point) : boolean
    {
        return (
            p.x >= this.x && p.x <= this.right &&
            p.y >= this.y && p.y <= this.bottom
        );
    }

    public containsRect(r : Rectangle) : boolean
    {
        return this.containsPoint(r.topLeft) && this.containsPoint(r.bottomRight);
    }
    
    public static between(p1 : Point, p2 : Point) : Rectangle
    {
        let pos = new Point(Math.min(p1.x, p2.x), Math.min(p1.y, p2.y));
        let size = new Point(Math.abs(p1.x - p2.x), Math.abs(p1.y - p2.y));
        return new Rectangle(pos, size);
    }
}

// https://codepen.io/gapcode/pen/vEJNZN
export function getIEVersion() : boolean | number
{
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

export function makePixelated(e : HTMLImageElement | HTMLCanvasElement, pixelate : boolean = true) : void
{
    if (pixelate)
    {
        let types = [ "optimizeSpeed", "crisp-edges", "-moz-crisp-edges", "-webkit-optimize-contrast", "optimize-contrast", "pixelated" ];
        types.forEach(type => e.style["image-rendering"] = type);
    }
    else
    {
        e.style["image-rendering"] = "";
    }
}

export function createOptionElement(text : string, value : string) : HTMLOptionElement
{
    let ret = document.createElement("option");
    ret.innerText = text;
    ret.value = value;

    return ret;
}

export function hideElement(element : HTMLElement) : void
{
    element.style.display = "none";
}

export function showElement(element : HTMLElement) : void
{
    element.style.display = "";
}

export function element_isScrolledTo(element : HTMLElement, allowPartial : boolean = false)
{
    let height = element.getBoundingClientRect().height;
    let top = element.offsetTop;
    let bottom = top + height;

    let parent = element.parentElement;
    let parentHeight = parent.getBoundingClientRect().height;
    let scrollTop = parent.scrollTop;
    
    if (allowPartial)
    {
        return !(scrollTop + parentHeight <= top || scrollTop >= bottom);
    }
    else
    {
        return !(scrollTop + parentHeight < bottom || scrollTop > top);
    }
}

export function element_scrollIntoView(element : HTMLElement, align : "top" | "center" | "bottom") : void
{
    let height = element.getBoundingClientRect().height;
    let top = element.offsetTop;
    let bottom = top + height;

    let parent = element.parentElement;
    let parentHeight = parent.getBoundingClientRect().height;
    let scrollHeight = parent.scrollHeight;

    switch (align)
    {
        case "top":
            parent.scrollTop = top;
            break;
        case "center":
            parent.scrollTop = parentHeight / 2 - height / 2;
            break;
        case "bottom":
            parent.scrollTop = bottom - parentHeight;
            break;
    }
}

export function element_scrollIntoViewIfNeeded(element : HTMLElement, align : "top" | "center" | "bottom", allowPartial : boolean) : void
{
    if (!element_isScrolledTo(element, allowPartial))
    {
        element_scrollIntoView(element, align);
    }
}

export function endsWith(str : string, endsWith : string) : boolean
{
    if (endsWith.length > str.length)
    {
        return false;
    }
    
    return str.substr(str.length - endsWith.length) === endsWith;
}

export function emptyFn() {}

export function array_contains<T>(array: T[], item : T) : boolean
{
    return array.indexOf(item) !== -1;
}

export function array_remove<T>(array : T[], item : T) : { item : T, index : number, existed : boolean }
{
    let index = array.indexOf(item);
    if (index !== -1)
    {
        array.splice(index, 1);
        return { item, index, existed: true };
    }

    return { item, index: -1, existed: false };
}

export function array_remove_all<T>(array : T[], item : T) : { item : T, indexes : number[], existed : boolean }
{
    let indexes = [];

    let index;

    while ((index = array.indexOf(item)) !== -1)
    {
        indexes.push(index);
        array.splice(index, 1);
    }

    return { item, indexes: indexes, existed: indexes.length > 0 };
}

export function array_item_at<T>(array : T[], index : number) : T
{
    if (index >= array.length)
    {
        return array[index % array.length];
    }
    else if (index < 0)
    {
        return array[array.length - (-index % array.length)];
    }
    else
    {
        return array[index];
    }
}

export function array_remove_at<T>(array : T[], index : number) : { item : T, index : number, existed : boolean }
{    
    if (index !== -1)
    {
        return { item: array.splice(index, 1)[0], index, existed: true };
    }

    return { item: null, index: -1, existed: false };
}

export function array_insert<T>(array : T[], item : T, index_or_fn : number | SortFunction<T>) : { item : T, index : number }
{
    if (typeof index_or_fn === "number")
    {
        array.splice(index_or_fn, 0, item);
        return { item: item, index: index_or_fn };
    }
    else
    {
        for (let i = 0; i < array.length; i++)
        {
            if (index_or_fn(item, array[i]))
            {
                array.splice(i, 0, item);
                return { item: item, index: i };
            }
        }

        array.push(item);
        return { item: item, index: array.length - 1 };
    }

}

export function array_copy<T>(array : T[]) : T[]
{
    return array.slice();
}

export function array_shuffle<T>(array : T[]) : void
{
    let i = 0;
    let j = 0;
    let temp = null;
    
    for (i = array.length - 1; i > 0; i -= 1)
    {
        j = Math.floor(Math.random() * (i + 1));
        temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

export function array_insert_random<T>(array : T[], item : T) : { index : number, item : T }
{
    let index = Math.floor(Math.random() * (array.length + 1));
    return array_insert(array, item, index);
}

export function array_last<T>(array : T[]) : T
{
    return array[array.length - 1];
}

export function array_swap<T>(array : T[], a : number | T, b : number | T) : void
{
    if (typeof(a) !== "number")
    {
        a = array.indexOf(a);
    }

    if (typeof(b) !== "number")
    {
        b = array.indexOf(b);
    }

    let temp = array[a];
    array[a] = array[b];
    array[b] = temp;
}

export function stopProp(e : MouseEvent) : void
{
    e.stopPropagation();
}

export function getRainbowColor(n : number) : string
{
    let r = ~~(255 * (n < 0.5 ? 1 : 1 - 2 * (n - 0.5)));
    let g = ~~(255 * (n < 0.5 ? 2 * n : 1));
    let b = ~~(255 * (n > 0.5 ? 2 * (n - 0.5) : 0));
    let color = "rgb(" + r + "," + g + "," + b + ")";
    return color;
}

export function getCurrentMs() : number
{
    return Date.now();
}

export function sign(n : number) : number
{
    return (n > 0 ? 1 : (n < 0 ? -1 : 0));
}