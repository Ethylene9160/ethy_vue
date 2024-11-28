class SerilizedData {
    constructor(json, data) {
        this.json = json ? JSON.stringify(json) : '';
        this.data = data || new Uint8Array(0);
    }

    static async fromFile(jsonObject, filePath) {
        let data = new Uint8Array(0);
        if (filePath) {
            const response = await fetch(filePath);
            const arrayBuffer = await response.arrayBuffer();
            data = new Uint8Array(arrayBuffer);
        }
        return new MLData(jsonObject, data);
    }

    encode() {
        const jsonBytes = new TextEncoder().encode(this.json);
        const jsonLength = jsonBytes.length;
        const dataLength = this.data.length;
        const buffer = new ArrayBuffer(4 + 4 + jsonLength + dataLength);
        const view = new DataView(buffer);
        view.setInt32(0, jsonLength);
        view.setInt32(4, dataLength);

        const uint8Array = new Uint8Array(buffer);
        uint8Array.set(jsonBytes, 8);
        if (dataLength > 0) {
            uint8Array.set(this.data, 8 + jsonLength);
        }
        console.log('jsonLen:', jsonLength);
        console.log('dataLen:', dataLength);
        return buffer;
    }

    static decode(buffer) {
        const view = new DataView(buffer);
        const jsonLength = view.getInt32(0);
        const dataLength = view.getInt32(4);

        const jsonBytes = new Uint8Array(buffer, 8, jsonLength);
        const dataBytes = new Uint8Array(buffer, 8 + jsonLength, dataLength);

        // default: utf-8
        const json = JSON.parse(new TextDecoder().decode(jsonBytes));
        return new MLData(json, dataBytes);
    }

    getJson() {
        return JSON.parse(this.json);
    }
}