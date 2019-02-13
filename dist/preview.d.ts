import { Widget } from "./widget";
import { CropView } from "./cropview";
export declare class Preview extends Widget {
    private mask;
    private image;
    private onlineIndicator;
    private bottomBar;
    private sizeDisplay;
    private removeButton;
    private _size;
    private cropView;
    private lastMode;
    private antialiased;
    constructor(size: number, cropView: CropView);
    readonly size: number;
    update(): void;
    antialias: boolean;
}
//# sourceMappingURL=preview.d.ts.map