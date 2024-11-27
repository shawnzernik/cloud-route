export class PayloadLogic {
    private static prefix = "base64::";

    public static encode(value: Uint8Array): string {
        const base64 = this.uint8ArrayToBase64(value);
        return this.prefix + base64;
    }

    public static decode(value: string): Uint8Array {
        if (!value) return new Uint8Array();

        if (!value.startsWith(this.prefix)) {
            throw new Error(`The string is not Base64 encoded - missing '${this.prefix}' prefix!`);
        }

        const base64 = value.substring(this.prefix.length);
        return this.base64ToUint8Array(base64);
    }

    private static uint8ArrayToBase64(value: Uint8Array): string {
        let binary = '';
        const CHUNK_SIZE = 0x8000; // Process in chunks to avoid argument limits

        for (let i = 0; i < value.length; i += CHUNK_SIZE) {
            binary += String.fromCharCode.apply(
                null,
                value.subarray(i, i + CHUNK_SIZE) as unknown as number[]
            );
        }

        return btoa(binary);
    }

    private static base64ToUint8Array(base64: string): Uint8Array {
        const binaryString = atob(base64);
        const length = binaryString.length;
        const array = new Uint8Array(length);
        for (let i = 0; i < length; i++) {
            array[i] = binaryString.charCodeAt(i);
        }
        return array;
    }

    public static uint8ArrayToString(data: Uint8Array): string {
        return new TextDecoder().decode(data);
    }

    public static stringToUint8Array(data: string): Uint8Array {
        return new TextEncoder().encode(data);
    }
}