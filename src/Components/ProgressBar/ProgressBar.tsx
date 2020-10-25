import React from "react";
import "./ProgressBar.scss";

interface Props
{
    /**
     * Indicator of progress from 0 to 1.
     */
    progress: number;
}

function ProgressBar(props: Props)
{
    return (
        <div className="progressBar">
            <div
                className="progress"
                style={{
                    height: "100%",
                    width: `${props.progress * 100}%`
                }}
            >
            </div>
            <div className="progressAmount">
                {Math.round(props.progress * 100)}%
            </div>
        </div>
    );
}

export default ProgressBar;