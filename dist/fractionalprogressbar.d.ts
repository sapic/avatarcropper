import { ProgressBar } from "./progressbar";
export declare class FractionalProgressBar extends ProgressBar {
    private fractionParts;
    private totalFractions;
    constructor();
    addFractionPart(fractionsOfWhole: number, internalSteps: number): void;
    step(): void;
    reset(): void;
}
//# sourceMappingURL=fractionalprogressbar.d.ts.map