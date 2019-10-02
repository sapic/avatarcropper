export enum Keys {
    left = 37,
    up = 38,
    right = 39,
    down = 40
}

export class KeyManager {
    private static keysDown: { [key: number]: boolean } = {};

    public static initialize(): void {
        window.addEventListener("keydown", e => KeyManager.keysDown[e.keyCode] = true);
        window.addEventListener("keyup", e => KeyManager.keysDown[e.keyCode] = false);
    }

    public static isDown(key: number): boolean {
        return this.keysDown[key] || false;
    }

    public static axis(keyP: number, keyN: number): number {
        return +this.isDown(keyP) - +this.isDown(keyN);
    }

    public static isArrowKey(key: number): boolean {
        return key >= 37 && key <= 40;
    }
}
