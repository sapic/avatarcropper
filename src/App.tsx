import React, { useState, useReducer, useRef, useContext } from 'react';
import logo from './logo.svg';
import './App.scss';
import LabeledSlider from './Components/LabeledSlider/LabeledSlider';
import Storage from './Utils/storage';
import CropView from './Components/CropView/CropView';
import CropPreviews from './Components/CropPreviews/CropPreviews';
import { AppContext } from './AppContext';

function App()
{
    const { state, dispatch } = useContext(AppContext)!;

    // ok time for the actual stuff //

    function toggleMenu()
    {
        dispatch({ type: "toggleMenu" });
    }

    function setMaskTransparency(trans: number)
    {
        dispatch({ type: "setMaskOpacity", payload: 1 - trans });
    }

    function rotationDegrees(deg: number)
    {
        const snap = 2;

        if (Math.abs(deg - 90) <= snap)
        {
            deg = 90
        }
        else if (Math.abs(deg + 90) <= snap)
        {
            deg = -90
        }
        else if (Math.abs(deg) <= snap)
        {
            deg = 0
        }
        else if (Math.abs(deg - 180) <= snap)
        {
            deg = 180
        }
        else if (Math.abs(deg + 180) <= snap)
        {
            deg = -180
        }
        
        dispatch({ type: "setRotationDegrees", payload: deg });
    }

    function flipHorizontal()
    {

    }

    function flipVertical()
    {

    }

    function addPreview()
    {

    }

    function center()
    {

    }

    function setSize()
    {

    }

    function showTutorial()
    {

    }

    function openFile(file: File)
    {
        if (!state.isLoadingFile)
        {
            if (file.type.split("/")[0] !== "image")
            {
                return;
            }

            if (!state.hasOpenedSomething)
            {
                dispatch({ type: "setHasOpenedSomething", payload: true });
            }
            else
            {
                window.URL.revokeObjectURL(state.image.src);
            }

            const fileType = file.type.split("/")[1] === "gif" ? "gif" : "png";
            dispatch({ type: "setFileType", payload: fileType });
            dispatch({ type: "setDestFilename", payload: file.name.substring(0, file.name.lastIndexOf('.')) + "_cropped." + fileType });
            
            const url = window.URL.createObjectURL(file);
            const img = new Image();
            img.onload = () =>
            {
                dispatch({ type: "setImage", payload: img });
                dispatch({ type: "setIsLoadingFile", payload: false });
                dispatch({ type: "zoomFit" });
            };
            img.src = url;
            dispatch({ type: "setIsLoadingFile", payload: true });
        }
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>)
    {
        const file : File | null = e.currentTarget.files ? e.currentTarget.files[0] || null : null;
        if (file)
        {
            openFile(file);
        }
    }

    return (
        <div className="app">
            <CropView
            />

            <CropPreviews
            />

            <div className="menu">
                <label className="half menuItem">
                    Open File...
                    <input
                        type="file"
                        id="openInput"
                        onChange={handleFileChange}
                    />
                </label>
                <button onClick={toggleMenu} className={"half menuItem" + (state.showMenu ? "" : " toggled")}>
                    {state.showMenu ? "Collapse Menu" : "▼"}
                </button>
                {state.showMenu && (<React.Fragment>
                    <button
                        className={"half menuItem" + (state.previewMode === "circle" ? " toggled" : "")}
                        onClick={() => dispatch({ type: "setPreviewMode", payload: "circle" })}
                    >
                        Circle
                    </button>
                    <button
                        className={"half menuItem" + (state.previewMode === "square" ? " toggled" : "")}
                        onClick={() => dispatch({ type: "setPreviewMode", payload: "square" })}
                    >
                        Sqare
                    </button>
                    <LabeledSlider
                        label="Mask Transparency"
                        max={1}
                        min={0}
                        onInput={setMaskTransparency}
                        step={0.05}
                        value={1 - state.maskOpacity}
                        className="menuItem"
                    />
                    <div className="zoomBar menuItem">
                        <div className="zoomLabel">Zoom:</div>
                        <button onClick={() => dispatch({ type: "zoomFit" })}>Fit</button>
                        <button onClick={() => dispatch({ type: "zoomIn" })}>+</button>
                        <button onClick={() => dispatch({ type: "zoomOut" })}>-</button>
                    </div>
                    <LabeledSlider
                        label="rotationDegrees"
                        max={180}
                        min={-180}
                        onInput={rotationDegrees}
                        step={1}
                        value={state.rotationDegrees}
                        className="menuItem"
                    />
                    <button className="half menuItem" onClick={flipHorizontal}>
                        Flip Horiz.
                    </button>
                    <button className="half menuItem" onClick={flipVertical}>
                        Flip Vertical
                    </button>
                    <button
                        className={"half menuItem" + (state.antialias ? " toggled" : "")}
                        onClick={() => dispatch({ type: "setAntialias", payload: !state.antialias })}
                    >
                        Antialias
                    </button>
                    <button
                        className={"half menuItem" + (state.outlinesEnabled ? " toggled" : "")}
                        onClick={() => dispatch({ type: "setOutlinesEnabled", payload: !state.outlinesEnabled })}
                    >
                        Mask Outline
                    </button>
                    <button className="half menuItem" onClick={addPreview}>
                        Add Preview
                    </button>
                    <button
                        className={"half menuItem" + (state.guidesEnabled ? " toggled" : "")}
                        onClick={() => dispatch({ type: "setGuidesEnabled", payload: !state.guidesEnabled })}
                    >
                        Guidelines
                    </button>
                    <button className="half menuItem" onClick={center}>
                        Center
                    </button>
                    <button className="half menuItem" onClick={setSize}>
                        Set Size
                    </button>
                    <button
                        className={"menuItem" + (state.resizeLock ? " toggled" : "")}
                        onClick={() => dispatch({ type: "setResizeLock", payload: !state.resizeLock })}
                    >
                        Lock Center During Resize
                    </button>
                </React.Fragment>)}
            </div>
        </div>
    );
}

export default App;