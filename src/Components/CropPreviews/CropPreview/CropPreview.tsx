import React, { useState, useEffect, useRef, useContext } from "react";
import "./CropPreview.scss";
import { ImageInfo } from "../../../Types";
import Rectangle from "../../../Utils/rectangle";
import Point from "../../../Utils/point";
import { Canvas } from "../../../Utils/canvas";
import { PreviewMode, AppContext } from "../../../AppContext";

interface Props
{
    previewSize: number;
    right: number;
}

export default function CropPreview(props: Props)
{
    const { state, dispatch } = useContext(AppContext)!;

    const [ imagePosition, setImagePosition ] = useState<Point>(new Point(0));
    const [ imageScale, setImageScale ] = useState<Point>(new Point(1));
    const canvasEl = useRef<HTMLCanvasElement | null>(null);
    const canvas = useRef<Canvas | null>(null);

    useEffect(() =>
    {
        canvas.current = new Canvas({
            canvasElement: canvasEl.current!
        });
    }, []);

    useEffect(() =>
    {
        if (canvas.current)
        {
            canvas.current.resize(new Point(props.previewSize, props.previewSize + 2), false);

            if (state.previewMode === "square")
            {
                canvas.current.clear();
                canvas.current.fillRect(
                    new Rectangle(
                        new Point(0, props.previewSize),
                        new Point(props.previewSize, 2)
                    ),
                    "#2F3136"
                );
            }
            else
            {
                canvas.current.fill("#2F3136");
                canvas.current.blendMode = "destination-out";
                canvas.current.fillCircleInRect(
                    new Rectangle(
                        new Point(0),
                        new Point(props.previewSize)
                    ),
                    "white"
                );
                canvas.current.blendMode = "source-over";
            }
        }
    }, [ state.previewMode, props.previewSize ]);

    useEffect(() =>
    {
        if (state.cropArea.size.x > 0 && state.cropArea.size.y > 0)
        {
            const scale = new Point(props.previewSize).dividedBy(state.cropArea.size);
            const dp = state.cropImageOffset.times(1 / state.zoomFactor);
            const p = (dp.minus(state.cropArea.position).times(scale));
            setImagePosition(p);
            setImageScale(scale);
            // console.log(`
            //     scale: ${scale.toString()}\n
            //     imagePosition: ${imagePosition.toString()}\n
            //     dp: ${dp.toString()}\n
            //     p: ${p.toString()}\n
            //     state.cropArea.position: ${state.cropArea.position.toString()}\n
            // `);
        }
    }, [ state.image, props.previewSize, state.cropArea, state.rotationDegrees, state.zoomFactor ]);

    return (
        <div
            className="cropPreview"
            style={{
                right: `${props.right}px`,
                width: `${props.previewSize}px`,
                height: `${props.previewSize + 2}px`,
                zIndex: -props.previewSize
            }}
        >
            <canvas
                ref={canvasEl}
                className="mask"
            />
            <img
                src={state.image.src}
                style={{
                    transform: `scale(${imageScale.x}, ${imageScale.y}) rotate(${state.rotationDegrees}deg)`,
                    left: `${imagePosition.x}px`,
                    top: `${imagePosition.y}px`
                }}
            />
        </div>
    );
}