import React, { useEffect, useRef, useReducer, useContext, useLayoutEffect } from "react";
import { Canvas } from "../../../Utils/canvas";
import Rectangle, { RectAnchor } from "../../../Utils/rectangle";
import Point from "../../../Utils/point";
import { ImageInfo } from "../../../Types";
import { PreviewMode, AppContext } from "../../../AppContext";
import { makePixelated } from "../../../Utils/utils";

type MouseAction = "move" | "resize" | "none";

class Circle extends Rectangle {
    private _origin: Rectangle = new Rectangle(new Point(), new Point());

    constructor() {
        super(new Point(), new Point());
        this.saveOrigin();
    }

    public get radius(): Point {
        return this.size.dividedBy(2);
    }

    public set radius(radius: Point) {
        this.size = radius.times(2);
    }

    public reset(outerRect: Rectangle): void {
        this.position = new Point(0);
        this.size = new Point(outerRect.size.min / 2);
    }

    public setRectangle(rect: Rectangle): void
    {
        this.position = rect.position;
        this.size = rect.size;
    }

    public get rectangle(): Rectangle {
        return this.deepCopy();
    }

    public saveOrigin(): void {
        this._origin = this.deepCopy();
    }

    public get origin(): Rectangle {
        return this._origin;
    }

    public validate(outerRect: Rectangle): number {
        let ret = 0b00000000;

        if (this.width > outerRect.size.x) {
            this.setWidthKeepAR(outerRect.size.x);
            ret |= 1;
        }

        if (this.height > outerRect.size.y) {
            this.setHeightKeepAR(outerRect.size.y);
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

        if (this.bottom > outerRect.size.y) {
            this.bottom = outerRect.size.y;
            ret |= 16;
        }

        if (this.right > outerRect.size.x) {
            this.right = outerRect.size.x;
            ret |= 32;
        }

        return ret;
    }
}

interface Props
{
    size: Point | null;
}

export default function Overlay(props: Props)
{
    const { state, dispatch } = useContext(AppContext)!;

    const canvasEl = useRef<HTMLCanvasElement>(null);
    const canvas = useRef<Canvas | null>(null);
    const currentAction = useRef<MouseAction>("none");
    const circle = useRef<Circle>(new Circle());
    const mouseOrigin = useRef<Point>(new Point(0));
    const resizeOffset = useRef<Point>(new Point(0));

    const isDirty = useRef(false);
    const frameIsWaiting = useRef(false);

    useEffect(() =>
    {
        canvas.current = new Canvas({
            canvasElement: canvasEl.current!,
            deepCalc: true
        });
    }, []);

    useEffect(() =>
    {
        if (canvas.current)
        {
            canvas.current.pixelated = !state.antialias;
        }
    }, [ state.antialias ]);

    useLayoutEffect(() =>
    {
        if (!props.size) return;

        canvas.current?.resize(props.size, false);
        circle.current.validate(getOuterRect());
        update();
    }, [ props.size ]);

    useEffect(() =>
    {
        const mouseMove = (pos : Point, isDown : boolean, lastPos : Point, originalPos : Point, e : MouseEvent | TouchEvent) =>
        {
            e.stopPropagation();
            if (!canvas.current || !canvasEl.current || !props.size) return;
    
            // determine what cursor to show //
            let action = currentAction.current;
            if (action === "none")
            {
                action = getMouseAction(pos.x, pos.y);
            }
    
            if (action === "move")
            {
                canvasEl.current.style.cursor = "move";
            }
            else if (action === "resize")
            {
                let xr = pos.x < circle.current.cx;
                let yr = pos.y < circle.current.cy;
                let thing = +xr ^ +yr; // nice
                canvasEl.current.style.cursor = thing ? "nesw-resize" : "nwse-resize";
            }
            else
            {
                canvasEl.current.style.cursor = "default";
            }
    
            // actually do stuff //
            if (currentAction.current === "none")
            {
                return;
            }
            else if (currentAction.current === "move")
            {
                let d = pos.minus(mouseOrigin.current);
                circle.current.position = circle.current.origin.position.plus(d);
                circle.current.validate(getOuterRect());
                mouseOrigin.current = pos.copy();
                circle.current.saveOrigin();
            }
            else if (currentAction.current === "resize")
            {
                performResize(pos.x, pos.y);
            }
    
            circle.current.round(state.resizeLock); // u rite
            update();
        };
    
        const mouseDown = (pos : Point, e : MouseEvent | TouchEvent) =>
        {
            e.stopPropagation();
            var action = getMouseAction(pos.x, pos.y);
            currentAction.current = action;
    
            mouseOrigin.current = pos.copy();
            circle.current.saveOrigin();
    
            resizeOffset.current = circle.current
                .getPointFromAnchor(getCircleAnchor(mouseOrigin.current))
                .minus(mouseOrigin.current)
            ;
        };

        const touchMove = (e) =>
        {
            if (!(currentAction.current === "none"))
            {
                e.preventDefault();
            }
        };

        const mouseUp = () =>
        {
            const ca = currentAction.current;
            currentAction.current = "none";
            if (ca !== "none")
            {
                update();
            }
        };

        canvas.current?.addEventListener("mousemove", mouseMove);
        canvas.current?.addEventListener("mousedown", mouseDown);
        canvasEl.current?.addEventListener("touchmove", touchMove);
        document.body.addEventListener("mouseup", mouseUp);
        document.body.addEventListener("touchend", mouseUp);

        return () =>
        {
            canvas.current?.removeEventListener("mousemove", mouseMove);
            canvas.current?.removeEventListener("mousedown", mouseDown);
            canvasEl.current?.removeEventListener("touchmove", touchMove);
            document.body.removeEventListener("mouseup", mouseUp);
            document.body.removeEventListener("touchend", mouseUp);
        };
    });

    useEffect(() =>
    {
        update();
    }, [ state.maskOpacity, state.previewMode, state.outlinesEnabled, state.guidesEnabled ]);

    useEffect(() =>
    {
        canvas.current?.resize(Point.fromSizeLike(state.image), false);
        circle.current.reset(getOuterRect());
        update();
    }, [ state.image ]);

    useEffect(() =>
    {
        canvas.current?.zoom(state.zoomFactor, "", "");
    }, [ state.zoomFactor ])

    // useEffect(() =>
    // {
    //     circle.current.setRectangle(state.cropArea);
    // }, [ state.cropArea ]);

    function getOuterRect(): Rectangle
    {
        return new Rectangle(
            new Point(0),
            canvas.current!.size
        );
    }

    // call when u want to redraw //
    function update()
    {
        isDirty.current = true;
        if (!frameIsWaiting.current)
        {
            frameIsWaiting.current = true;
            requestAnimationFrame(_draw);
        }
    }

    // should rly only be called by requestAnimationFrame //
    function _draw()
    {
        if (isDirty.current && canvas.current)
        {
            dispatch({ type: "setCropArea", payload: circle.current.rectangle });

            // draw mask //
            if (state.maskOpacity !== 1) {
                canvas.current.clear();
            }
    
            if (state.maskOpacity !== 0) {
                canvas.current.fill("rgba(0,0,0," + state.maskOpacity + ")");
    
                canvas.current.blendMode = "destination-out";
                if (state.previewMode === "circle") {
                    canvas.current.fillCircleInRect(circle.current, "white");
                }
                else {
                    canvas.current.fillRect(circle.current, "white");
                }
            }
    
            canvas.current.blendMode = "source-over";
            let lineWidth = ~~(1 / state.zoomFactor) + 1;
    
            if (state.outlinesEnabled) {
                let sharp = lineWidth % 2 === 1;
    
                canvas.current.lineDash = [Math.min(canvas.current.width, canvas.current.height) / 100];
    
                if (state.previewMode === "circle") {
                    canvas.current.drawCircleInRect(circle.current, "white", lineWidth);
                }
    
                canvas.current.drawRect(
                    new Rectangle(
                        circle.current.position.minus(lineWidth),
                        circle.current.size.plus(lineWidth)
                    ),
                    "white",
                    lineWidth,
                    sharp
                );
            }
    
            if (state.guidesEnabled) {
                canvas.current.context.lineDashOffset = canvas.current.context.getLineDash()[0];
                canvas.current.drawLine(circle.current.center, new Point(circle.current.cx, circle.current.bottom), "yellow", lineWidth);
                canvas.current.drawLine(circle.current.center, new Point(circle.current.cx, circle.current.top), "yellow", lineWidth);
                canvas.current.drawLine(circle.current.center, new Point(circle.current.right, circle.current.cy), "yellow", lineWidth);
                canvas.current.drawLine(circle.current.center, new Point(circle.current.left, circle.current.cy), "yellow", lineWidth);
                canvas.current.context.lineDashOffset = 0;
            }

            isDirty.current = false;
            frameIsWaiting.current = true;
            requestAnimationFrame(_draw);
        }
        else
        {
            frameIsWaiting.current = false;
        }
    }

    function getMouseAction(x: number, y: number): MouseAction {
        let mousePoint = new Point(x, y);
        if (circle.current.containsPoint(new Point(x, y))) {
            // this logic for non-square crop area (aspect ratio != 1:1)
            /*let handleSize = circle.current.radius.min / 2;
            let _rb = (p1, p2) => Rectangle.between(p1, p2);
            let _con = (r : Rectangle) => r.containsPoint(mousePoint);
            let grabbing = (p1 : Point, toAdd : Point | number) => _con(_rb(p1, p1.plus(toAdd)));
            
            let grabbingHandle = (
                grabbing(circle.current.topLeft, handleSize) ||
                grabbing(circle.current.topRight, new Point(-handleSize, handleSize)) ||
                grabbing(circle.current.bottomLeft, new Point(handleSize, -handleSize)) ||
                grabbing(circle.current.bottomRight, -handleSize)
            );*/

            let grabbingHandle = circle.current.center.distanceTo(new Point(x, y)) >= circle.current.radius.x;

            return grabbingHandle ? "resize" : "move";
        }
        else {
            return "none";
        }
    }

    function getCircleAnchor(p: Point): RectAnchor {
        const east = p.x > circle.current.cx;
        const south = p.y > circle.current.cy;

        return east ? (south ? "se" : "ne") : (south ? "sw" : "nw");
    }

    function performResize(x: number, y: number) {
        let anchor = Rectangle.anchorOpposite(getCircleAnchor(new Point(x, y)));

        if (!state.resizeLock) {
            const resizeAnchor = circle.current.getPointFromAnchor(anchor).minus(resizeOffset.current);
            let size = circle.current.size.copy();

            let r = Rectangle.between(new Point(x, y), resizeAnchor);
            //r.round();
            circle.current.fitInsideGreedy(r, anchor, getOuterRect());
            circle.current.validate(getOuterRect());
            
        }
        else {
            let r = Rectangle.between(new Point(x, y).plus(resizeOffset.current), circle.current.center);
            r.expandToward(anchor, 2);
            //r.round();
            circle.current.fitInsideGreedyCenter(r, getOuterRect());
            circle.current.validate(getOuterRect());
        }
    }
    
    return (
        <canvas ref={canvasEl}></canvas>
    )
}