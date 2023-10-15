"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class B64 {
    static #alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    static fromBuffer(buffer) {
        let arr = Array.from(new Uint8Array(buffer));
        const bin = (n) => n.toString(2).padStart(8, "0");
        const l = arr.length;
        let result = '';
        for (let i = 0; i <= (l - 1) / 3; i++) {
            let c1 = i * 3 + 1 >= l; // case when "=" is on end
            let c2 = i * 3 + 2 >= l; // case when "=" is on end
            let chunk = bin(arr[3 * i]) + bin(c1 ? 0 : arr[3 * i + 1]) + bin(c2 ? 0 : arr[3 * i + 2]);
            let r = chunk.match(/.{1,6}/g)?.map((x, j) => j == 3 && c2 ? '=' : (j == 2 && c1 ? '=' : this.#alphabet[+('0b' + x)])) || [];
            result += r.join('');
        }
        return result;
    }
    static fromString(str) {
        return this.fromBuffer(new TextEncoder().encode(str));
    }
    // 
    static toBuffer(b64) {
        let result = new Array();
        for (let i = 0; i < b64.length / 4; i++) {
            let chunk = [...b64.slice(4 * i, 4 * i + 4)];
            let bin = chunk.map(x => this.#alphabet.indexOf(x).toString(2).padStart(6, "0")).join('');
            let bytes = bin.match(/.{1,8}/g)?.map(x => +('0b' + x)) || [];
            result.push(...bytes.slice(0, 3
                - (b64.charAt(4 * i + 2) == "=" ? 1 : 0)
                - (b64.charAt(4 * i + 3) == "=" ? 1 : 0)));
        }
        return new Uint8Array(result);
    }
}
exports.default = B64;
