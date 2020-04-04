import Rectangle from "./rectangle";

/**
 * A class to represent a two-dimensional point in space, or something that would benefit from a similar treatment.
 *
 * Any functions that are said to return a copy do not modify the original point.
 *
 * Any operations such as [[times]] that act on two points will perform their operations element-wise. So, in the example of [[times]], the x-coordinates will be multiplied together and the y-coordinates will be multiplied together.
 */
export default class Point
{
    /** The x-coordinate of the point. */
    public x : number;

    /** The y-coordinate of the point. */
    public y : number;

    /**
     * Creates a new Point.
     * @param x The x-coordinate of the point. If not defined, both x and y will be set to 0.
     * @param y The y-coordinate of the point. If not defined, the x value will be used in its place.
     */
    constructor(x? : number, y? : number)
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
    
    public static fromSizeLike(sizeLike : { width : number, height : number}) : Point
    {
        return new Point(sizeLike.width, sizeLike.height);
    }
    
    public static fromPointLike(pointLike : { x : number, y : number}) : Point
    {
        return new Point(pointLike.x, pointLike.y);
    }

    public toRectangle(offset? : Point) : Rectangle
    {
        return new Rectangle(offset || new Point(0), this.copy());
    }

    /**
     * @returns A copy of the point with y set to 0.
     */
    public get xOnly() : Point
    {
        return new Point(this.x, 0);
    }

    /**
     * @returns A copy of the point with x set to 0.
     */
    public get yOnly() : Point
    {
        return new Point(0, this.y);
    }

    /**
     * @returns A copy of the point scaled so that the magnitude of its x-coordinate is 1.
     */
    public get unitX() : Point
    {
        return new Point(this.x > 0 ? 1 : -1, this.y / this.x);
    }

    /**
     * @returns A copy of the point scaled so that the magnitude of its y-coordinate is 1.
     */
    public get unitY() : Point
    {
        return new Point(this.x / this.y, this.y > 0 ? 1 : -1);
    }

    /**
     * @returns A copy of the point with both coordinates inverted (multiplied by -1).
     */
    public get inverted() : Point
    {
        return this.times(-1);
    }

    /**
     * @param x The magnitude of the horizontal scaling.
     * @returns A copy of the point, inverted and scaled so that the magnitude of its x-coordinate is the passed value.
     */
    public reverseByX(x : number) : void
    {
        let offset = this.unitX.inverted.times(x);
        this.x = offset.x;
        this.y = offset.y;
    }

    /**
     * @param x The magnitude of the vertical scaling.
     * @returns A copy of the point, inverted and scaled so that the magnitude of its y-coordinate is the passed value.
     */
    public reverseByY(y : number) : void
    {
        let offset = this.unitY.inverted.times(y);
        this.x = offset.x;
        this.y = offset.y;
    }

    /**
     * @param array The array from which to construct the point. Should be in the format [ x, y ]. Any elements beyond the second will be ignored.
     * @returns A new point, the constructor called using the array as an argument list.
     */
    public static fromArray(array : number[]) : Point
    {
        return new Point(...array);
    }

    /**
     * Used to generate a point from an index within a rectangular shape and the width of that rectangle. Like translating a tile index to a tile location.
     * @param index The 0-based index to translate into a point.
     * @param width The width of the rectangle.
     */
    public static fromIndex(index : number, width : number) : Point
    {
        return new Point(index % width, ~~(index / width));
    }

    /**
     * Creates a unit vector from a given angle.
     * @param radians The angle in radians.
     */
    public static fromAngle(radians : number) : Point
    {
        return new Point(Math.cos(radians), Math.sin(radians));
    }

    /**
     * @param p The point with which to test equality.
     * @returns Whether or not the two points have equal x and y values.
     */
    public equals(p : Point) : boolean
    {
        return this.x === p.x && this.y === p.y;
    }

    /**
     * @returns A copy of the point.
     */
    public copy() : Point
    {
        return new Point(this.x, this.y);
    }

    /**
     * Modifies the point so that its coordinates are rounded to the nearest integer using Math.round.
     */
    public round() : void
    {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
    }

    /**
     * @returns A copy of the point with its coordinates rounded via Math.round.
     */
    public get rounded() : Point
    {
        return new Point(Math.round(this.x), Math.round(this.y));
    }

    /**
     * @param n A number or other point by which to multiply the point.
     * @returns A copy of the point multiplied by the given value.
     */
    public times(n : number | Point) : Point
    {
        let ret = this.copy();
        ret.multiply(n);
        return ret;
    }

    /**
     * Multiplies the point by the given value.
     * @param n A number or other point by which to multiply the point.
     */
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

    /**
     * @param n A number or other point by which to divide the point.
     * @returns A copy of the point divided by the given value.
     */
    public dividedBy(n : number | Point) : Point
    {
        let ret = this.copy();
        ret.divideBy(n);
        return ret;
    }

    /**
     * Divides the point by the given value.
     * @param n A number or other point by which to divide the point.
     */
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

    /**
     * @param n A number or other point to be added to the point.
     * @returns A copy of the point summed with the given value.
     */
    public plus(n : number | Point) : Point
    {
        let ret = this.copy();
        ret.add(n);
        return ret;
    }
    
    /**
     * Adds the given point to this point.
     * @param n A number or other point to be added to this point.
     */
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

    /**
     * @param n A number or other point to be subtracted from the point.
     * @returns A copy of the difference between this point and the given point.
     */
    public minus(n : number | Point) : Point
    {
        let ret = this.copy();
        ret.subtract(n);
        return ret;
    }

    /**
     * Subtracts the given point from this point.
     * @param n A number or other point to be subtracted from this point.
     */
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

    /**
     * @returns A copy of this point with its coordinates multiplied by themselves.
     */
    public get squared() : Point
    {
        return this.times(this);
    }

    /**
     * @returns The sum of the point's two coordinates.
     */
    public get sum() : number
    {
        return this.x + this.y;
    }

    /**
     * @returns The smaller of the point's two coordinates.
     */
    public get min() : number
    {
        return Math.min(this.x, this.y);
    }

    /**
     * @returns The larger of the point's two coordinates.
     */
    public get max() : number
    {
        return Math.max(this.x, this.y);
    }

    /**
     * @param p The point to get the distance to.
     * @returns The distance between this and the given point.
     */
    public distanceTo(p : Point) : number
    {
        return Math.sqrt(this.minus(p).squared.sum);
    }

    /**
     * @returns A string in the format (x, y).
     */
    public toString() : string
    {
        return "(" + this.x + ", " + this.y + ")";
    }

    /**
     * @returns A length-2 array of the form [ x, y ].
     */
    public toArray() : number[]
    {
        return [ this.x, this.y ];
    }
}