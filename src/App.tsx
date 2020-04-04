import React, { useState } from 'react';
import logo from './logo.svg';
import './App.scss';
import LabeledSlider from './Components/LabeledSlider/LabeledSlider';
import Storage from './Utils/storage';
import CropView from './Components/CropView/CropView';
import { ImageInfo } from './Types';

interface Settings
{
    previewSizes: number[]
    maskOpacity: number
    previewMode: 'circle' | 'square'
    outlinesEnabled: boolean
    antialias: boolean
    dismissedTutorial: boolean
    dismissedIE: boolean
    dismissedCookie: boolean
    guidesEnabled: boolean
    resizeLock: boolean
    borderSize: number
}

function useSetting(settings: Settings, key: string)
{
    const [ val, setVal ] = useState(settings[key]);

    function setSetting(val: any)
    {
        settings[key] = val;
        Storage.set("settings", settings);
        setVal(val);
    }

    return [
        val,
        setSetting
    ];
}

function App()
{
    // load settings //
    const settings : Settings = {
        previewSizes: [30, 40, 64, 128],
        maskOpacity: 0.5,
        previewMode: 'circle',
        outlinesEnabled: true,
        antialias: true,
        dismissedTutorial: false,
        dismissedIE: false,
        dismissedCookie: false,
        guidesEnabled: true,
        resizeLock: false,
        borderSize: 0.05
    };

    const s = Storage.get("settings", {})

    for (const key in settings)
    {
        if (s.hasOwnProperty(key))
        {
            if (s[key] !== null)
            {
                settings[key] = s[key];
            }
        }
    }

    // ok time for the actual stuff //
    const [ image, setImage ] = useState<ImageInfo>({ src: "", width: 0, height: 0 });
    const [ destFilename, setDestfilename ] = useState("");
    const [ fileType, setFileType ] = useState("");
    const [ showMenu, setShowMenu ] = useState(true);
    const [ firstOpened, setFirstOpened ] = useState(false);
    const [ rotation, setRotation ] = useState(0);
    const [ cropShape, setCropShape ] = useSetting(settings, "previewMode");
    const [ maskOpacity, setMaskOpacity ] = useSetting(settings, "maskOpacity");
    const [ antialias, setAntialias ] = useSetting(settings, "antialias");
    const [ maskOutline, setMaskOutline ] = useSetting(settings, "outlinesEnabled");
    const [ guidelines, setGuidelines ] = useSetting(settings, "guidesEnabled");
    const [ lockCenter, setLockCenter ] = useSetting(settings, "resizeLock");

    let isLoading = false;
    let openRequest : File | null = null;

    function toggleMenu()
    {
        setShowMenu(!showMenu);
    }

    function setMaskTransparency(trans: number)
    {
        setMaskOpacity(1 - trans);
    }

    function handleRotation(deg: number)
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

        setRotation(deg)
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
        if (!isLoading)
        {
            isLoading = true;

            if (file.type.split("/")[0] !== "image")
            {
                return;
            }

            if (!firstOpened)
            {
                setFirstOpened(true);
            }
            else
            {
                window.URL.revokeObjectURL(image.src);
            }

            setFileType(file.type.split("/")[1] === "gif" ? "gif" : "png");
            setDestfilename(file.name.substring(0, file.name.lastIndexOf('.')) + "_cropped." + fileType);
            
            const url = window.URL.createObjectURL(file);
            const img = new Image();
            img.onload = () =>
            {
                if (!openRequest)
                {
                    setImage(img);
                }
                else
                {
                    const toUse = openRequest;
                    openRequest = null;
                    openFile(toUse);
                }
            };
            img.src = url;
        }
        else
        {
            openRequest = file;
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
                image={image}
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
                <button onClick={toggleMenu} className={"half menuItem" + (showMenu ? "" : " toggled")}>
                    {showMenu ? "Collapse Menu" : "▼"}
                </button>
                {showMenu && (<React.Fragment>
                    <button
                        className={"half menuItem" + (cropShape === "circle" ? " toggled" : "")}
                        onClick={() => setCropShape("circle")}
                    >
                        Circle
                    </button>
                    <button
                        className={"half menuItem" + (cropShape === "square" ? " toggled" : "")}
                        onClick={() => setCropShape("square")}
                    >
                        Sqare
                    </button>
                    <LabeledSlider
                        label="Mask Transparency"
                        max={1}
                        min={0}
                        onInput={setMaskTransparency}
                        step={0.05}
                        value={1 - maskOpacity}
                        className="menuItem"
                    />
                    <div className="zoomBar menuItem">
                        <div className="zoomLabel">Zoom:</div>
                        <button>Fit</button>
                        <button>+</button>
                        <button>-</button>
                    </div>
                    <LabeledSlider
                        label="Rotation"
                        max={180}
                        min={-180}
                        onInput={handleRotation}
                        step={1}
                        value={rotation}
                        className="menuItem"
                    />
                    <button className="half menuItem" onClick={flipHorizontal}>
                        Flip Horiz.
                    </button>
                    <button className="half menuItem" onClick={flipVertical}>
                        Flip Vertical
                    </button>
                    <button
                        className={"half menuItem" + (antialias ? " toggled" : "")}
                        onClick={() => setAntialias(!antialias)}
                    >
                        Antialias
                    </button>
                    <button
                        className={"half menuItem" + (maskOutline ? " toggled" : "")}
                        onClick={() => setMaskOutline(!maskOutline)}
                    >
                        Mask Outline
                    </button>
                    <button className="half menuItem" onClick={addPreview}>
                        Add Preview
                    </button>
                    <button
                        className={"half menuItem" + (guidelines ? " toggled" : "")}
                        onClick={() => setGuidelines(!guidelines)}
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
                        className={"menuItem" + (lockCenter ? " toggled" : "")}
                        onClick={() => setLockCenter(!lockCenter)}
                    >
                        Lock Center During Resize
                    </button>
                </React.Fragment>)}
            </div>
        </div>
    );
}

export default App;