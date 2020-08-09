import React, { useContext } from "react";
import "./CropPreviews.scss";
import { ImageInfo } from "../../Types";
import Rectangle from "../../Utils/rectangle";
import CropPreview from "./CropPreview/CropPreview";
import { PreviewMode, AppContext } from "../../AppContext";
import Point from "../../Utils/point";

interface Props
{
}

const padding = 16;

export default function CropPreviews(props: Props)
{
    const { state, dispatch } = useContext(AppContext)!;
    
    let runningX = padding;

    return (
        <div className="cropPreviews">
            {state.previewSizes.map((previewSize, i) => {
                const ret = <CropPreview
                    key={i}
                    right={runningX}
                    previewSize={previewSize}
                />;

                runningX += previewSize + padding;
                return ret;
            })}
        </div>
    );
}