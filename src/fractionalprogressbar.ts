import { ProgressBar } from "./progressbar";

interface FractionPart {
    fractionsOfWhole: number;
    internalSteps: number;
    counter: number;
}

export class FractionalProgressBar extends ProgressBar {
    private fractionParts: FractionPart[] = [];
    private totalFractions: number = 0;

    constructor() {
        super();
    }

    public addFractionPart(fractionsOfWhole: number, internalSteps: number) {
        this.fractionParts.push({ fractionsOfWhole, internalSteps, counter: 0 });
        this.totalFractions += fractionsOfWhole;
    }

    public step() {
        if (this.fractionParts.length > 0) {
            this.fractionParts[0].counter++;
            this.progress += (1 / this.fractionParts[0].internalSteps) * (this.fractionParts[0].fractionsOfWhole);
            if (this.fractionParts[0].counter === this.fractionParts[0].internalSteps) {
                this.fractionParts.shift();
            }
        }
    }

    public reset() {
        this.fractionParts = [];
        this.progress = 0;
    }
}