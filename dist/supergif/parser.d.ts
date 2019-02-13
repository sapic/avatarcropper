import { SuperGifStream } from './stream';
import { EventClass } from '../eventclass';
export declare class SuperGifParser extends EventClass {
    private stream;
    private handler;
    private shouldAbort;
    private shouldAbortSilently;
    constructor(stream: SuperGifStream, handler: any);
    abort(silent?: boolean): void;
    private parseCT;
    private readSubBlocks;
    private parseHeader;
    private parseExt;
    private parseImg;
    private parseBlock;
    parse(): void;
}
//# sourceMappingURL=parser.d.ts.map