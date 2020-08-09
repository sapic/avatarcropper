import Point from "./point";

export type RectAnchor = "ne" | "nw" | "se" | "sw";

export default class Rectangle
{
    public position : Point;
    public size : Point;

    constructor(position : Point, size : Point)
    {
        this.position = position;
        this.size = size;
    }

    public static fromClientRect(rect : ClientRect | DOMRect) : Rectangle {
        return new Rectangle(new Point(rect.left, rect.top), Point.fromSizeLike(rect));
    }

    public expand(multiplier : number) : Rectangle
    {
        let r = this.deepCopy();
        let newSize = r.size.times(multiplier);
        let center = r.center;
        let diff = newSize.minus(r.size);
        r.position.subtract(diff.dividedBy(2));
        r.size.add(diff);
        r.center = center;
        return r;
    }

    public get isSquare() : boolean
    {
        return this.width === this.height;
    }

    public plus(operand : Rectangle) : Rectangle
    {
        return new Rectangle(this.position.plus(operand.position), this.size.plus(operand.size));
    }

    public times(operand : Rectangle | number) : Rectangle
    {
        if (typeof(operand) === "number")
        {
            return new Rectangle(this.position.times(operand), this.size.times(operand));
        }
        else
        {
            return new Rectangle(this.position.times(operand.position), this.size.times(operand.size));
        }
    }

    public translated(offset : Point) : Rectangle
    {
        return new Rectangle(this.position.plus(offset), this.size.copy());
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

    public expandToward(anchor : RectAnchor, factor : number) : void
    {
        switch (anchor)
        {
            case "ne":
                let bl = this.bottomLeft;
                this.size.multiply(factor);
                this.bottomLeft = bl;
                break;
            case "nw":
                let br = this.bottomRight;
                this.size.multiply(factor);
                this.bottomRight = br;
                break;
            case "se":
                let tl = this.topLeft;
                this.size.multiply(factor);
                this.topLeft = tl;
                break;
            case "sw":
                let tr = this.topRight;
                this.size.multiply(factor);
                this.topRight = tr;
                break;
        }
    }

    public fitInsideGreedyCenter(rect : Rectangle, boundingRect : Rectangle)
    {
        let ar = rect.aspectRatio;
        let center = this.center.copy(); // just being careful
        let size = this.size.copy();

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

        this.center = center;

        if (!boundingRect.containsRect(this))
        {
            if (this.right > boundingRect.right)
            {
                this.setWidthKeepAR((boundingRect.right - center.x) * 2);
                this.center = center;
            }
            if (this.bottom > boundingRect.bottom)
            {
                this.setHeightKeepAR((boundingRect.bottom - center.y) * 2);
                this.center = center;
            }
            if (this.left < boundingRect.left)
            {
                this.setWidthKeepAR((center.x - boundingRect.left) * 2);
                this.center = center;
            }
            if (this.top < boundingRect.top)
            {
                this.setHeightKeepAR((center.y - boundingRect.top) * 2);
                this.center = center;
            }
        }
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
                this.setPointFromAnchor(anchor, startPoint);
            }
            if (this.bottom > boundingRect.bottom)
            {
                this.setHeightKeepAR(boundingRect.bottom - this.top);
                this.setPointFromAnchor(anchor, startPoint);
            }
            if (this.left < boundingRect.left)
            {
                this.setWidthKeepAR(this.right - boundingRect.left);
                this.setPointFromAnchor(anchor, startPoint);
            }
            if (this.top < boundingRect.top)
            {
                this.setHeightKeepAR(this.bottom - boundingRect.top);
                this.setPointFromAnchor(anchor, startPoint);
            }
        }
    }

    public shallowCopy() : Rectangle
    {
        return new Rectangle(this.position, this.size);
    }

    public deepCopy() : Rectangle
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

    public round(aboutCenter : boolean = false) : void
    {
        if (aboutCenter)
        {
            let c = this.center;
            this.size.round();
            this.center = c.rounded;
        }
        else
        {
            this.position.round();
            this.size.round();
        }
    }

    public get rounded() : Rectangle
    {
        return new Rectangle(this.position.rounded, this.size.rounded);
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

    /**
     * @param r Rectangle to test for intersection with this one.
     * @returns Whether or not the rectangles intersect. If they are just touching, will return `false`.
     */
    public intersects(r : Rectangle) : boolean
    {
        return !(r.left >= this.right || 
            r.right <= this.left || 
            r.top >= this.bottom ||
            r.bottom <= this.top)
    }
    
    public static between(p1 : Point, p2 : Point) : Rectangle
    {
        let pos = new Point(Math.min(p1.x, p2.x), Math.min(p1.y, p2.y));
        let size = new Point(Math.abs(p1.x - p2.x), Math.abs(p1.y - p2.y));
        return new Rectangle(pos, size);
    }
}