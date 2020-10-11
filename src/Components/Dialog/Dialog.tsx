import React, { useState, useEffect, useRef, useContext } from "react";

interface Props
{
}

const Dialog: React.FunctionComponent = (props) =>
{
    const [ hidden, setHidden ] = useState(true);

    function hideDialog()
    {
        setHidden(true);
    }

    return (
        <div
            className="dialog"
            onClick={hideDialog}
            style={{
                display: hidden ? "none" : ""
            }}
        >
            <div
                className="body"
            >
                <button
                    className="close"
                    onClick={hideDialog}
                >
                    ❌
                </button>
                {props.children}
            </div>
        </div>
    );
};

export default Dialog;