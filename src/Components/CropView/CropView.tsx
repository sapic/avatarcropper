import React, { useState, useRef, useEffect, useLayoutEffect, useContext } from 'react';
import Rectangle from "../../Utils/rectangle";
import Point from "../../Utils/point";
import { Canvas } from '../../Utils/canvas';
import { ImageInfo } from '../../Types';
import { PreviewMode, AppContext } from '../../AppContext';
import Overlay from "./Overlay/Overlay";
import "./CropView.scss"
import { debounce, makePixelated } from '../../Utils/utils';

interface Props
{
}

function CropView(props: Props)
{
    const { state, dispatch } = useContext(AppContext)!;
    const [ refreshSizeSwitch, setRefreshSizeSwitch ] = useState(false);
    
    const container = useRef<HTMLDivElement>(null);
    const image = useRef<HTMLImageElement>(null);

    useEffect(() =>
    {
        const fn = debounce(() =>
        {
            setRefreshSizeSwitch(!refreshSizeSwitch);
        }, 100);

        window.addEventListener("resize", fn);

        return () =>
        {
            window.removeEventListener("resize", fn);
        }
    });

    useEffect(() =>
    {
        if (image.current)
        {
            image.current.width = state.image.width;
            image.current.height = state.image.height;
        }
    }, [ state.image ]);

    useEffect(() =>
    {
        zoom(state.zoomFactor);
    }, [ state.zoomFactor ]);

    useEffect(() =>
    {
        if (state.isZoomFitted)
        {
            zoomFit();
        }
    }, [ state.isZoomFitted, state.image, state.previewSizes, state.previewPadding, refreshSizeSwitch ]);

    useEffect(() =>
    {
        if (image.current)
        {
            makePixelated(image.current, !state.antialias);
        }
    }, [ state.antialias ]);

    function zoom(factor?: number)
    {
        if (!container.current || !image.current)
        {
            return;
        }

        const ogScrollTopP = container.current.scrollTop / container.current.scrollHeight;
        const ogScrollLeftP = container.current.scrollLeft / container.current.scrollWidth;

        container.current.scrollTop = 0;
        container.current.scrollLeft = 0;
        let rotatePart = "";

        if (image.current.style.transform.indexOf(" rotate") !== -1) {
            rotatePart = image.current.style.transform.substr(
                image.current.style.transform.indexOf(" rotate")
            );
        }

        factor = factor || state.zoomFactor;
        image.current.style.transform = "scale(" + factor + "," + factor + ")";
        image.current.style.transform += rotatePart;

        let r = image.current.getBoundingClientRect();

        if (r.left !== 0) {
            let current = parseFloat(image.current.style.left || "0px");
            current -= r.left;

            image.current.style.left = current + "px";
        }

        if (r.top !== 0) {
            let current = parseFloat(image.current.style.top || "0px");
            current -= r.top;

            image.current.style.top = current + "px";
        }

        container.current.scrollTop = ogScrollTopP * container.current.scrollHeight;
        container.current.scrollLeft = ogScrollLeftP * container.current.scrollWidth;
    }

    function zoomFit(force: boolean = true)
    {
        if (!image.current || !container.current)
        {
            return;
        }

        if (!state.isZoomFitted && !force)
        {
            return;
        }

        var cr = container.current.getBoundingClientRect();
        var ir = { width: state.image.width, height: state.image.height };

        var fw = cr.width / ir.width;
        var fh = cr.height / ir.height;
        var f = Math.min(fw, fh);

        dispatch({ type: "setZoomFactor", payload: f });
    }

    const widthOffset = Math.max(
        state.previewSizes.reduce((l, r) => l + r) + state.previewPadding * (state.previewSizes.length + 1),
        256 // menu width
    );

    return (
        <div
            className="cropView"
            ref={container}
            style={{
                width: `calc(100% - ${widthOffset}px)`
            }}
        >
            <img
                src={state.image.src}
                ref={image}
                style={{
                    left: `${state.cropImageOffset.x}px`,
                    top: `${state.cropImageOffset.x}px`
                }}
            ></img>
            <Overlay
            />
        </div>
    );
}

export default CropView;