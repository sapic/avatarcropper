import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import Rectangle from "../../Utils/rectangle";
import Point from "../../Utils/point";
import { Canvas } from '../../Utils/canvas';
import { ImageInfo } from '../../Types';

type MouseAction = "move" | "resize" | "new" | "none";

class Circle extends Rectangle {
    private _origin: Rectangle = new Rectangle(new Point(), new Point());

    constructor(private getOuterRect: () => Rectangle) {
        super(new Point(), new Point());
        this.saveOrigin();
    }

    public get radius(): Point {
        return this.size.dividedBy(2);
    }

    public set radius(radius: Point) {
        this.size = radius.times(2);
    }

    public reset(): void {
        this.position = new Point(0);
        this.size = new Point(this.getOuterRect().size.min / 2);
    }

    public get rectangle(): Rectangle {
        return this.copy();
    }

    public saveOrigin(): void {
        this._origin = this.copy();
    }

    public get origin(): Rectangle {
        return this._origin;
    }

    public validate(): number {
        let ret = 0b00000000;

        if (this.width > this.getOuterRect().size.x) {
            this.setWidthKeepAR(this.getOuterRect().size.x);
            ret |= 1;
        }

        if (this.height > this.getOuterRect().size.y) {
            this.setHeightKeepAR(this.getOuterRect().size.y);
            ret |= 2;
        }

        if (this.x < 0) {
            this.x = 0;
            ret |= 4;
        }

        if (this.y < 0) {
            this.y = 0;
            ret |= 8;
        }

        if (this.bottom > this.getOuterRect().size.y) {
            this.bottom = this.getOuterRect().size.y;
            ret |= 16;
        }

        if (this.right > this.getOuterRect().size.x) {
            this.right = this.getOuterRect().size.x;
            ret |= 32;
        }

        return ret;
    }
}

interface Props
{
    image: ImageInfo;
}

function CropView(props: Props)
{
    const [ zoomFactor, setZoomFactor ] = useState(1);
    const [ isZoomFitted, setIsZoomFitted ] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    let canvas: Canvas | null = null;

    useEffect(() =>
    {
        canvas = new Canvas({
            canvasElement: canvasRef.current!
        });
    }, []);

    useEffect(() =>
    {
        canvas?.resize(Point.fromSizeLike(props.image), false);
    }, [ props.image ]);

    function zoom(factor?: number)
    {
        if (!containerRef.current || !imageRef.current || !canvas)
        {
            return;
        }

        const container = containerRef.current;
        const image = imageRef.current;

        const ogScrollTopP = container.scrollTop / container.scrollHeight;
        const ogScrollLeftP = container.scrollLeft / container.scrollWidth;

        container.scrollTop = 0;
        container.scrollLeft = 0;
        let rotatePart = "";

        if (image.style.transform.indexOf(" rotate") !== -1) {
            rotatePart = image.style.transform.substr(
                image.style.transform.indexOf(" rotate")
            );
        }

        factor = factor || zoomFactor;
        setZoomFactor(factor);
        canvas!.zoom(factor, "", "");
        image.style.transform = "scale(" + factor + "," + factor + ")";
        image.style.transform += rotatePart;

        let r = image.getBoundingClientRect();

        if (r.left !== 0) {
            let current = parseFloat(image.style.left || "0px");
            current -= r.left;

            image.style.left = current + "px";
        }

        if (r.top !== 0) {
            let current = parseFloat(image.style.top || "0px");
            current -= r.top;

            image.style.top = current + "px";
        }

        container.scrollTop = ogScrollTopP * container.scrollHeight;
        container.scrollLeft = ogScrollLeftP * container.scrollWidth;
    }

    function zoomIn()
    {
        setIsZoomFitted(false);
        zoom(zoomFactor * 1.1);
    }

    function zoomOut()
    {
        setIsZoomFitted(false);
        zoom(zoomFactor / 1.1);
    }

    function zoomFit(force: boolean = true)
    {
        if (!imageRef.current || !containerRef.current || !canvas)
        {
            return;
        }

        if (!isZoomFitted && !force)
        {
            return;
        }

        setIsZoomFitted(true);

        var cr = containerRef.current.getBoundingClientRect();
        var ir = { width: props.image.width, height: props.image.height };

        var fw = cr.width / ir.width;
        var fh = cr.height / ir.height;
        var f = Math.min(fw, fh);

        zoom(f);
    }

    return (
        <div className="cropView" ref={containerRef}>
            <img src={props.image.src} ref={imageRef}></img>
            <canvas ref={canvasRef}></canvas>
        </div>
    );
}

export default CropView;