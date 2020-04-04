import React from "react";
import "./LabeledSlider.scss";

interface Props
{
    min: number;
    max: number;
    step: number;
    value: number;
    label: string;
    onInput: (value: number) => any;
    className?: string;
}

function LabeledSlider(props: Props)
{
    return (
        <div className={"labeledSlider" + (props.className ? " " + props.className : "")}>
            <div className="labeledSlider-label">
                {props.label}
            </div>
            <input
                className="labeledSlider-slider"
                type="range"
                min={props.min}
                max={props.max}
                step={props.step}
                value={props.value}
                onInput={(e) => { props.onInput(parseFloat(e.currentTarget.value)) }}
                onChange={(e) => { props.onInput(parseFloat(e.currentTarget.value)) }}
            />
        </div>
    );
}

export default LabeledSlider;