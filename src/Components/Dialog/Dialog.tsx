import React, { useState, useEffect, useRef, useContext } from "react";

interface Props
{
    isShowing: boolean;
    setIsShowing: (isShowing: boolean) => any;
    className?: string;
}

const Dialog: React.FunctionComponent<Props> = (props) =>
{
    function hideDialog()
    {
        props.setIsShowing(false);
    }

    return (
        <div
            className={"dialog " + props.className || ""}
            onClick={hideDialog}
            style={{
                display: props.isShowing ? "" : "none"
            }}
        >
            <div
                className="body"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
                <button
                    className="close"
                    onClick={hideDialog}
                >
                    ❌
                </button>
                <div className="innerContent">
                    {props.children}
                </div>
            </div>
        </div>
    );
};

export default Dialog;