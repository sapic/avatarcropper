import App from "./App";
import React, { useReducer, FunctionComponent } from "react";
import { ImageInfo } from "./Types";
import Rectangle from "./Utils/rectangle";
import Point from "./Utils/point";
import Storage from './Utils/storage';
import { array_copy, array_insert, array_remove } from "./Utils/utils";

export type PreviewMode = "circle" | "square";

interface Settings
{
    antialias: boolean;
    borderSize: number;
    dismissedCookie: boolean;
    dismissedIE: boolean;
    dismissedTutorial: boolean;
    guidesEnabled: boolean;
    maskOpacity: number;
    outlinesEnabled: boolean;
    previewMode: PreviewMode;
    previewSizes: number[];
    resizeLock: boolean;
    previewPadding: number;
}

interface AppState extends Settings
{
    destFilename: string;
    fileType: string;
    hasOpenedSomething: boolean;
    image: ImageInfo;
    isLoadingFile: boolean;
    rotationDegrees: number;
    showMenu: boolean;
    zoomFactor: number;
    isZoomFitted: boolean;
    cropArea: Rectangle;
    cropImageOffset: Point;
}

const initialSettings : Settings = {
    antialias: false,
    borderSize: 0.05,
    dismissedCookie: false,
    dismissedIE: false,
    dismissedTutorial: false,
    guidesEnabled: true,
    maskOpacity: 0.5,
    outlinesEnabled: true,
    previewMode: "circle",
    previewSizes: [30, 40, 64, 128],
    resizeLock: false,
    previewPadding: 16
};

const initialState : AppState = {
    // settings //
    ...initialSettings,

    // not settings //
    destFilename: "",
    fileType: "",
    hasOpenedSomething: false,
    image: {
        src: "",
        width: 0,
        height: 0
    },
    isLoadingFile: false,
    rotationDegrees: 0,
    showMenu: true,
    zoomFactor: 1,
    isZoomFitted: true,
    cropArea: new Rectangle(new Point(), new Point()),
    cropImageOffset: new Point(0)
};

function saveSettings(state: AppState)
{
    const settings = {};
    for (const key in initialSettings)
    {
        settings[key] = state[key];
    }

    Storage.set("settings", settings);
}

type Action =
    | { type: "setAntialias", payload: boolean }
    | { type: "setBorderSize", payload: number }
    | { type: "setDismissedCookie", payload: boolean }
    | { type: "setDismissedIE", payload: boolean }
    | { type: "setDismissedTutorial", payload: boolean }
    | { type: "setGuidesEnabled", payload: boolean }
    | { type: "setMaskOpacity", payload: number }
    | { type: "setOutlinesEnabled", payload: boolean }
    | { type: "setPreviewMode", payload: PreviewMode }
    | { type: "setPreviewSizes", payload: number[] }
    | { type: "setResizeLock", payload: boolean }
    | { type: "setPreviewPadding", payload: number }

    | { type: "setDestFilename", payload: string }
    | { type: "setFileType", payload: string }
    | { type: "setHasOpenedSomething", payload: boolean }
    | { type: "setImage", payload: ImageInfo }
    | { type: "setRotationDegrees", payload: number }
    | { type: "setShowMenu", payload: boolean }
    | { type: "toggleMenu" }
    | { type: "setIsLoadingFile", payload: boolean }
    | { type: "zoomIn" }
    | { type: "zoomOut" }
    | { type: "zoomFit" }
    | { type: "setZoomFactor", payload: number }
    | { type: "setCropArea", payload: Rectangle }
    | { type: "setCropImageOffset", payload: Point }
    | { type: "addPreviewSize", size: number }
    | { type: "removePreviewSize", size: number }
;

function reducer(state: AppState, action: Action): AppState
{
    switch (action.type)
    {
        case "setAntialias":
        case "setBorderSize":
        case "setDismissedCookie":
        case "setDismissedIE":
        case "setDismissedTutorial":
        case "setGuidesEnabled":
        case "setMaskOpacity":
        case "setOutlinesEnabled":
        case "setPreviewMode":
        case "setPreviewSizes":
        case "setResizeLock":
        case "setPreviewPadding":
        {
            // im fully aware that this is illegal //
            const newState = {
                ...state,
                [action.type[3].toLowerCase() + action.type.substr(4)]: action.payload as any
            };
            saveSettings(newState);
            return newState;
        }
        case "setCropArea":
        case "setCropImageOffset":
        case "setDestFilename":
        case "setFileType":
        case "setHasOpenedSomething":
        case "setImage":
        case "setIsLoadingFile":
        case "setRotationDegrees":
        case "setShowMenu":
        case "setZoomFactor":
        {
            const newState = {
                ...state,
                [action.type[3].toLowerCase() + action.type.substr(4)]: action.payload as any
            };
            return newState;
        }
        case "toggleMenu":
        {
            return {
                ...state,
                "showMenu": !state.showMenu
            };
        }
        case "zoomIn":
            return {
                ...state,
                "zoomFactor": state.zoomFactor * 1.1,
                "isZoomFitted": false
            };
        case "zoomOut":
            return {
                ...state,
                "zoomFactor": state.zoomFactor / 1.1,
                "isZoomFitted": false
            };
        case "zoomFit":
            return {
                ...state,
                isZoomFitted: true
            };
        case "addPreviewSize":
        {
            const newArray = array_copy(state.previewSizes);
            array_insert(newArray, action.size, (a, b) => a < b);
            return {
                ...state,
                previewSizes: newArray
            };
        }
        case "removePreviewSize":
        {
            const newArray = array_copy(state.previewSizes);
            if (!array_remove(newArray, action.size).existed)
            {
                alert("Tried to remove a non-existent preview size.\nPlease file a bug report.");
            }
            return {
                ...state,
                previewSizes: newArray
            };
        }
        default:
            throw new Error("bad action type: " + (action as any).type);
    }
}

export const AppContext = React.createContext<{ state: AppState, dispatch: React.Dispatch<Action> } | null>(null);

interface Props
{
}

export const AppContextProvider: FunctionComponent<Props> = (props) =>
{
    const [ state, dispatch ] = useReducer(reducer, initialState);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            <App />
        </AppContext.Provider>
    )
};