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