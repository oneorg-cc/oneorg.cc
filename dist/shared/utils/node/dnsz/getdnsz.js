"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getdnsz = void 0;
;
// 
function getdnsz() {
    return Object.getPrototypeOf(async function () { }).constructor(`return await import("dnsz");`)();
}
exports.getdnsz = getdnsz;
