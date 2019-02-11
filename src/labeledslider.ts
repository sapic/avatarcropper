import { Widget } from "./widget";
import { createElement } from "./util";

export class LabelSlider extends Widget
{
    private labelElement : HTMLElement;
    private sliderElement : HTMLInputElement;

    constructor(minValue : number,  maxValue : number, step : number, label : string = "", className : string = "")
    {
        super(createElement("div", "labelSlider " + className));

        this.createEvent("slide");
        this.createEvent("change");

        this.labelElement = createElement("div", "labelSlider-label");
        this.labelElement.innerText = label;
        this.labelElement.style.position = "absolute";
        
        this.sliderElement = <HTMLInputElement>createElement("input", "labelSlider-slider");
        this.sliderElement.type = "range";
        this.sliderElement.min = minValue.toString();
        this.sliderElement.max = maxValue.toString();
        this.sliderElement.step = step.toString();
        this.sliderElement.style.position = "absolute";

        this.sliderElement.addEventListener("input", () =>
        {
            this.emitEvent("slide", parseFloat(this.sliderElement.value));
        });

        this.sliderElement.addEventListener("change", () =>
        {
            this.emitEvent("change", parseFloat(this.sliderElement.value))
        });

        this.appendChild(this.labelElement, this.sliderElement);
    }

    public get value() : number
    {
        return parseFloat(this.sliderElement.value);
    }

    public set value(value : number)
    {
        this.sliderElement.value = value.toString();
    }
}