"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
// 
const b64_1 = __importDefault(require("../b64"));
const types_1 = require("./../api/types");
class Tokens {
    static async create(options) {
        let constructor_options = {
            keys: {
                cryption: {},
                signature: {}
            }
        };
        if (typeof options.keys.cryption.publicKey == "string") {
            constructor_options.keys.cryption.publicKey = await crypto_1.webcrypto.subtle.importKey("spki", b64_1.default.toBuffer(options.keys.cryption.publicKey), {
                name: "RSA-OAEP",
                modulusLength: 4096,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256"
            }, true, ["encrypt"]);
        }
        if (typeof options.keys.cryption.privateKey == "string") {
            constructor_options.keys.cryption.privateKey = await crypto_1.webcrypto.subtle.importKey("pkcs8", b64_1.default.toBuffer(options.keys.cryption.privateKey), {
                name: "RSA-OAEP",
                modulusLength: 4096,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256"
            }, true, ["decrypt"]);
        }
        if (typeof options.keys.signature.publicKey == "string") {
            constructor_options.keys.signature.publicKey = await crypto_1.webcrypto.subtle.importKey("spki", b64_1.default.toBuffer(options.keys.signature.publicKey), {
                name: "ECDSA",
                namedCurve: "P-256"
            }, true, ["verify"]);
        }
        if (typeof options.keys.signature.privateKey == "string") {
            constructor_options.keys.signature.privateKey = await crypto_1.webcrypto.subtle.importKey("pkcs8", b64_1.default.toBuffer(options.keys.signature.privateKey), {
                name: "ECDSA",
                namedCurve: "P-256"
            }, true, ["sign"]);
        }
        return new Tokens(constructor_options);
    }
    // 
    keys;
    // 
    constructor(options) {
        if (typeof options.keys.cryption.publicKey == "string") {
        }
        this.keys = options.keys;
    }
    // 
    crypto = {
        encrypt: async (bytes) => {
            return new Uint8Array(await crypto_1.webcrypto.subtle.encrypt({
                name: "RSA-OAEP"
            }, this.keys.cryption.publicKey, bytes));
        },
        decrypt: async (encrypted) => {
            return new Uint8Array(await crypto_1.webcrypto.subtle.decrypt({
                name: "RSA-OAEP"
            }, this.keys.cryption.privateKey, encrypted));
        },
        sign: async (bytes) => {
            return new Uint8Array(await crypto_1.webcrypto.subtle.sign({
                name: "ECDSA",
                hash: { name: 'SHA-256' }
            }, this.keys.signature.privateKey, bytes));
        },
        verify: async (signature, bytes) => {
            return await crypto_1.webcrypto.subtle.verify({
                name: "ECDSA",
                hash: { name: 'SHA-256' }
            }, this.keys.signature.publicKey, signature, bytes);
        }
    };
    // 
    async generate(jsontoken, type = "token") {
        const encrypted = await this.crypto.encrypt(new TextEncoder().encode(JSON.stringify(jsontoken)));
        const signature = await this.crypto.sign(encrypted);
        return types_1.REST.Token.stringify({
            type: type,
            value: b64_1.default.fromBuffer(encrypted) + "." + b64_1.default.fromBuffer(signature)
        });
    }
    async json(token) {
        if (!await this.verify(token))
            return null;
        const splitted_token = types_1.REST.Token.json(token).value.split(".");
        const encrypted = b64_1.default.toBuffer(splitted_token[0]);
        return JSON.parse(new TextDecoder().decode(await this.crypto.decrypt(encrypted)));
    }
    async verify(token) {
        const splitted_token = types_1.REST.Token.json(token).value.split(".");
        const encrypted = b64_1.default.toBuffer(splitted_token[0]);
        const signature = b64_1.default.toBuffer(splitted_token[1]);
        return this.crypto.verify(signature, encrypted);
    }
    async valid(token) {
        const json = await this.json(token);
        if (!json)
            return false;
        return Date.now() < json.expiration;
    }
}
exports.default = Tokens;
