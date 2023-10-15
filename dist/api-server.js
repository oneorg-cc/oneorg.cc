"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const locale_1 = __importDefault(require("./locale"));
// 
const http = __importStar(require("http"));
// 
const apiserver = http.createServer(async (req, res) => {
    let url = new URL(req.url || "", `http://${req.headers.host}`);
    let request_headers = {};
    Object.keys(req.headers).forEach(k => {
        let value = req.headers[k];
        if (value instanceof Array)
            value = value.join("; ");
        request_headers[k.split("-").map(v => v.substring(0, 1).toUpperCase() + v.substring(1)).join("-")] = value;
    });
    // 
    let hostname = request_headers["Host"]?.split(":").shift();
    if (!locale_1.default.config.hostnames.includes(hostname))
        return;
    // 
    let data = Buffer.from([]);
    await new Promise((resolve, reject) => {
        req.on("close", () => { resolve(true); });
        req.on("data", d => { data = Buffer.concat([data, d]); });
    });
    let request = new Request(url, {
        method: req.method,
        headers: request_headers,
        body: data.length > 0 ? data : undefined
    });
    // 
    let response = await locale_1.default.router.handle(request.clone(), { logs: true });
    if (!response) {
        res.end(500);
        return;
    }
    response = response.clone();
    // 
    res.statusCode = response.status;
    res.statusMessage = response.statusText;
    response.headers.forEach((value, key) => {
        if (!response)
            return;
        if (value !== null && value !== undefined)
            res.setHeader(key, value);
    });
    // 
    const response_body = await response.arrayBuffer();
    if (response_body.byteLength > 0)
        res.write(Buffer.from(response_body));
    // 
    res.end();
});
// 
exports.default = apiserver;
