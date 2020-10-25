import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AppContext } from "../../AppContext";
import useLayoutEffectNI from "../../Hooks/useLayoutEffectNI";
import { CropOption, renderStatic } from "../../Utils/renderer";
import Dialog from "../Dialog/Dialog";
import ProgressBar from "../ProgressBar/ProgressBar";
import "./RenderDialog.scss";

interface Props
{
}

const renderingText = "Rendering...";
const renderedText = "Rendered! yayy";

function RenderDialog(props: Props)
{
    const { state, dispatch } = useContext(AppContext)!;
    const [ headerText, setHeaderText ] = useState(renderingText);
    const [ renderProgress, setRenderProgress ] = useState(0);
    const [ cropOptions, setCropOptions ] = useState<CropOption[]>([]);
    const [ selectedCropOptionIndex, setSelectedCropOptionIndex ] = useState(0);
    const downloadAnchor = useRef<HTMLAnchorElement | null>(null);

    function setIsShowing(isShowing: boolean)
    {
        dispatch({ type: "setIsShowingRenderDialog", payload: isShowing });
    }

    useLayoutEffectNI(() =>
    {
        // clear crop options //
        cropOptions.forEach((cropOption) =>
        {
            URL.revokeObjectURL(cropOption.url);
        }); 

        setIsShowing(true);
        setCropOptions([]);
        setRenderProgress(0);
        setHeaderText(renderingText);

        if (state.fileType === "gif")
        {
            // todo
        }
        else
        {
            renderStatic(state, setRenderProgress, (cropOptions) =>
            {
                setHeaderText(renderedText);
                setCropOptions(cropOptions);
            });
        }

    }, [ state.renderSignal ]);

    function saveImage()
    {
        downloadAnchor.current!.click();
    }

    return (
        <Dialog
            isShowing={state.isShowingRenderDialog}
            setIsShowing={setIsShowing}
            className="renderDialog"
        >
            <h1 className="header">{headerText}</h1>
            {cropOptions.length == 0 ? (<>
                <ProgressBar
                    progress={renderProgress}
                />
            </>) : (<>
                <img className="image" src={cropOptions[selectedCropOptionIndex].url}></img>
                <div className="reminder">note: it's usually best 2 save as a square !!</div>
                <div className="cropOptions">
                    {cropOptions.map((cropOption, i) => (
                        <button
                            className={"cropOption" + (selectedCropOptionIndex === i ? " selected" : "")}
                            onClick={() => setSelectedCropOptionIndex(i)}
                            key={i}
                        >
                            {cropOption.label}
                        </button>
                    ))}
                </div>
                <button className="save" onClick={saveImage}>Save</button>
                <a
                    href={cropOptions[selectedCropOptionIndex].url}
                    download={state.destFilename}
                    ref={downloadAnchor}
                    style={{
                        display: "none"
                    }}
                ></a>
            </>)}
        </Dialog>
    );
}

export default RenderDialog;