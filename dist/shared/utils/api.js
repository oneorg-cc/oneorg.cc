"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Endpoint = void 0;
const types_1 = require("./api/types");
class Endpoint {
    #method;
    #uri;
    // 
    constructor(method, uri) {
        this.#method = method;
        this.#uri = uri;
    }
    // 
    get method() { return this.#method; }
    get uri() { return this.#uri; }
    // 
    static fromString(endpoint) {
        let endpoint_split = endpoint.split(" ");
        return new Endpoint(endpoint_split.shift(), endpoint_split.join(" "));
    }
}
exports.Endpoint = Endpoint;
// 
class ApiUtil {
    #root;
    #onrequest;
    // 
    constructor(root, onrequest) {
        this.#root = root;
        this.#onrequest = onrequest;
    }
    // 
    get root() { return this.#root; }
    get onrequest() { return this.#onrequest; }
    // 
    async request(endpoint, options) {
        let opt = options || {};
        options = options || {};
        opt.parameters = options.parameters || {};
        opt.queries = options.queries || {};
        opt.headers = options.headers || {};
        opt.token = typeof options.token == "string" ? types_1.REST.Token.json(options.token) : options.token;
        // 
        if (!opt.headers["User-Agent"])
            opt.headers["User-Agent"] = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36";
        if (!opt.headers["Content-Type"])
            opt.headers["Content-Type"] = "application/json; charset=utf-8";
        if (!opt.headers["Authorization"] && opt.token)
            opt.headers["Authorization"] = opt.token.type + " " + opt.token.value;
        // 
        if (typeof opt.body == "object")
            opt.body = JSON.stringify(opt.body);
        // 
        if (typeof endpoint == "string")
            endpoint = Endpoint.fromString(endpoint);
        // 
        await this.onrequest(endpoint, opt);
        // 
        let uri = endpoint.uri;
        Object.keys(opt.parameters).forEach(k => {
            uri = uri.replace(new RegExp("\\{" + k + "\\}"), opt.parameters[k]);
        });
        // 
        let url;
        try {
            url = new URL(uri);
        }
        catch (e) {
            let _uri = this.root.endsWith("/") && uri.startsWith("/") ? uri.substring(1) : uri;
            url = new URL(this.root + _uri);
        }
        // 
        Object.keys(opt.queries).forEach(k => {
            url.searchParams.set(k, opt.queries[k]);
        });
        // 
        let response = null;
        try {
            response = await fetch(url, {
                method: endpoint.method,
                headers: new Headers(opt.headers),
                body: opt.body
            });
        }
        catch (e) {
            // console.error(e);
            throw e;
        }
        return response ? {
            debug: {
                request: {
                    url: url,
                    method: endpoint.method,
                    headers: opt.headers,
                    body: opt.body
                }
            },
            headers: getJsonHeader(response.headers),
            code: response.status,
            status: response.statusText,
            result: {
                data: await response.arrayBuffer(),
                get text() { return new TextDecoder().decode(this.data); },
                get json() { return JSON.parse(this.text); }
            }
        } : null;
    }
}
exports.default = ApiUtil;
function getJsonHeader(headers) {
    let result = {};
    headers.forEach((hv, hk) => {
        result[hk] = hv;
    });
    return result;
}
