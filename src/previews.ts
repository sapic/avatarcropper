import { Widget } from "./widget";
import { Preview } from "./preview";
import { createElement, array_remove, array_insert } from "./util";
import { CropView } from "./cropview";

export class Previews extends Widget
{
    private previews : Preview[] = [];
    private cropView : CropView;
    public readonly padding : number = 16;
    private _size : number = 0;

    constructor(cropView : CropView)
    {
        super(createElement("div", "previews"));

        this.createEvent("sizechange");
        this.createEvent("sizeArrayChange");

        this.cropView = cropView;
    }

    public get sizeArray() : number[]
    {
        let ret = [];

        this.previews.forEach(preview =>
        {
            ret.push(preview.size);
        });

        return ret;
    }

    public addPreviewSize(size : number)
    {
        let p = new Preview(size, this.cropView);
        p.on("requestremove", this.removePreview.bind(this, p));
        p.container.style.position = "absolute";

        this.appendChild(p);
        array_insert(
            this.previews,
            p,
            (left, right) => left.size > right.size
        );
        this.render();
        p.update();

        this.emitEvent("sizeArrayChange", this.sizeArray);
    }

    private removePreview(preview : Preview)
    {
        array_remove(this.previews, preview);
        this.removeChild(preview);
        this.render();
        
        this.emitEvent("sizeArrayChange", this.sizeArray);
    }

    public get width() : number
    {
        return this._size;
    }

    public get height() : number
    {
        return this.previews[0] ? this.previews[0].size : 0;
    }

    private render() : void
    {
        let runningX = this.padding;

        this.previews.forEach(preview =>
        {
            preview.container.style.right = runningX + "px";
            runningX += preview.size + this.padding;
        });

        this._size = runningX;
        this.emitEvent("sizechange", runningX);
    }
}