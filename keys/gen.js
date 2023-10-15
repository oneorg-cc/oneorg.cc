const fs = require("fs");
const path = require("path");

const crypto = require("crypto").webcrypto;

const B64 = require("../dist/shared/utils/b64").default;

// 

(async () => {
    const cryption = await crypto.subtle.generateKey({
        name: "RSA-OAEP",
        modulusLength: 4096,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256"
    }, true, ["encrypt", "decrypt"]);

    // 
    
    const signature = await crypto.subtle.generateKey({
        name: "ECDSA",
        namedCurve: "P-256"
    }, true, ["sign", "verify"]);

    // 
    
    fs.writeFileSync(path.join(__dirname, "cryption.key"), B64.fromBuffer(await crypto.subtle.exportKey("pkcs8", cryption.privateKey)));
    fs.writeFileSync(path.join(__dirname, "cryption.pub.key"), B64.fromBuffer(await crypto.subtle.exportKey("spki", cryption.publicKey)));
    
    fs.writeFileSync(path.join(__dirname, "signature.key"), B64.fromBuffer(await crypto.subtle.exportKey("pkcs8", signature.privateKey)));
    fs.writeFileSync(path.join(__dirname, "signature.pub.key"), B64.fromBuffer(await crypto.subtle.exportKey("spki", signature.publicKey)));
})();