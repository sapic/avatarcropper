import { Widget } from "./widget";
export interface Settings {
    previewSizes: number[];
    maskOpacity: number;
    previewMode: "circle" | "square";
    outlinesEnabled: boolean;
    antialias: boolean;
    dismissedTutorial: boolean;
    dismissedIE: boolean;
}
export declare class AvatarCropper extends Widget {
    private cropView;
    private previews;
    private menu;
    private openFileLabel;
    private maskOutlineButton;
    private toggleMenuButton;
    private flipHButton;
    private flipVButton;
    private antialiasButton;
    private menuToggle;
    private firstOpened;
    private settings;
    constructor(container: HTMLElement);
    loadFromFile(file: File): void;
    private saveSettings;
    private loadSettings;
    private constructMenu;
    private flipHorizontal;
    private flipVertical;
    private toggleMenu;
    private renderCroppedImage;
    private toggleMaskOutline;
    private setTransparency;
    private setRotation;
    private promptAddPreview;
    private openFile;
    private handleResize;
}
//# sourceMappingURL=avatarcropper.d.ts.map