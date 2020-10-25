import { AppState } from "../AppContext";
import { Canvas } from "./canvas";
import Point from "./point";

export interface CropOption
{
    label: string;
    url: string;
}

export function renderStatic(state: AppState, onProgress: (progress: number) => any, callback: (cropOptions: CropOption[]) => any)
{
    if (!state.overlaySize)
    {
        throw "Can't render yet...";
    }

    const rc = new Canvas({
        size: state.overlaySize
    });

    const img = new Image();
    img.onload = () =>
    {
        img.onload = null;
        rc.drawRotatedImage(
            img,
            state.rotationDegrees / 180 * Math.PI,
            state.overlaySize!.dividedBy(2).minus(Point.fromSizeLike(state.image).dividedBy(2))
        );
        
        const cc = new Canvas({
            size: state.cropArea.size
        });

        cc.drawCroppedImage(rc, new Point(0), state.cropArea);
        // todo: apply border

        // square //
        cc.createBlob((squareBlob: Blob) => {
            onProgress(0.5);
            
            cc.blendMode = "destination-in";
            cc.fillCircleInSquare(new Point(0), cc.width, "white");

            cc.createBlob((circleBlob: Blob) =>
            {
                onProgress(1);
                callback([
                    {
                        label: "Square",
                        url: URL.createObjectURL(squareBlob)
                    },
                    {
                        label: "Circle",
                        url: URL.createObjectURL(circleBlob)
                    }
                ]);
            });
        });
    };
    img.src = state.image.src;
}