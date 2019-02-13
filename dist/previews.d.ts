import { Widget } from "./widget";
import { CropView } from "./cropview";
export declare class Previews extends Widget {
    private previews;
    private cropView;
    readonly padding: number;
    private _size;
    constructor(cropView: CropView);
    readonly sizeArray: number[];
    addPreviewSize(size: number): void;
    private removePreview;
    readonly width: number;
    readonly height: number;
    private render;
}
//# sourceMappingURL=previews.d.ts.map