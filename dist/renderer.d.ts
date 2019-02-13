import { CropView } from "./cropview";
import { ClosableDialog } from "./closabledialog";
export declare class Renderer extends ClosableDialog {
    private readonly renderedString;
    private readonly renderingString;
    private readonly cropView;
    private shouldStopRendering;
    private currentlyRendering;
    private progressBar;
    private readonly imageElement;
    private optionBar;
    private headerElement;
    private noteElement;
    private pleaseWaitElement;
    private saveButton;
    private loadGif;
    private readonly initialized;
    constructor(cropView: CropView);
    render(): void;
    private renderGif;
    private getFrameURLs;
    private display;
    show(): void;
    hide(force?: boolean): void;
    tryClose(): boolean;
}
//# sourceMappingURL=renderer.d.ts.map