import { EventClass } from '../eventclass';
export declare class SuperGif extends EventClass {
    private gifImgElement;
    private options;
    private hdr;
    private loadErrorCause;
    private loading;
    private ready;
    private transparency;
    private delay;
    private disposalMethod;
    private disposalRestoreFromIdx;
    private lastDisposalMethod;
    private frame;
    private lastImg;
    private playing;
    private forward;
    private ctxScaled;
    private frames;
    private frameOffsets;
    private onEndListener;
    private loopDelay;
    private overrideLoopMode;
    private drawWhileLoading;
    private canvas;
    private canvasContext;
    private tmpCanvas;
    private initialized;
    private loadCallback;
    private currentFrameIndex;
    private iterationCount;
    private stepping;
    private parser;
    private handler;
    constructor(gifImgElement: HTMLImageElement, opts: any);
    abort(): void;
    private init;
    private loadSetup;
    private completeLoop;
    private doStep;
    private step;
    private putFrame;
    private playerInit;
    private clear;
    private parseStream;
    private setSizes;
    private drawError;
    private handleError;
    private doHdr;
    private doGCE;
    private pushFrame;
    private doImg;
    private doNothing;
    private withProgress;
    /**
     * Gets the index of the frame "up next".
     * @returns {number}
     */
    getNextFrameNo(): number;
    stepFrame(amount: any): void;
    getCanvasScale(): number;
    play(): void;
    pause(): void;
    isPlaying(): any;
    getCanvas(): HTMLCanvasElement;
    isLoading(): boolean;
    isReady(): boolean;
    isAutoPlay(): any;
    getLength(): any;
    getCurrentFrame(): number;
    getFrames(): any;
    moveTo(idx: any): void;
    loadURL(src: string, callback: any): void;
    load(callback: any): void;
}
//# sourceMappingURL=supergif.d.ts.map