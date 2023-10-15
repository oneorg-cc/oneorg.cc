"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Route = void 0;
const types_1 = require("./api/types");
var Route;
(function (Route) {
    function isValid(route) {
        return (route.methods instanceof Array
            && typeof route.pattern === "string"
            && route.handler instanceof Function);
    }
    Route.isValid = isValid;
})(Route || (exports.Route = Route = {}));
// 
function getPatternRegexp(pattern) {
    return new RegExp("^" + pattern.replace(/\{([A-Za-z 0-9]+)\}/g, "([A-Za-z 0-9 \\!\\\"\\#\\$\\%\\&\\'\\(\\)\\*\\+\\,\\-\\.\\/\\:\\;\\<\\=\\>\\?\\@\\[\\\\\\]\\^\\_\\`\\{\\|\\}\\~]+|())") + "$", "g");
}
function isPatternMatching(pattern, path) {
    let pattern_regexp = getPatternRegexp(pattern);
    return path.match(pattern_regexp) ? true : false;
}
function extractParameters(pattern, path) {
    let parameter_keys = Array.from(pattern.matchAll(/\{([A-Za-z 0-9]+)\}/g)).map(v => v[1]);
    let pattern_regexp = getPatternRegexp(pattern);
    let parameter_values = path.matchAll(pattern_regexp).next().value.slice(1).filter((v) => v != undefined);
    let parameters = {};
    for (let i = 0; i < parameter_keys.length; ++i)
        parameters[parameter_keys[i]] = parameter_values[i];
    return parameters;
}
// 
class Router {
    #routes = new Array();
    #response_mapper = null;
    // 
    constructor() {
    }
    // 
    get routes() { return this.#routes; }
    // 
    setResponseMapper(mapper) { this.#response_mapper = mapper; }
    getResponseMapper(mapper) { this.#response_mapper = mapper; }
    removeResponseMapper() { this.setResponseMapper(null); }
    // 
    registered(route) { return this.#routes.includes(route); }
    register(route) {
        if (this.registered(route))
            return false;
        this.#routes.push(route);
        return true;
    }
    unregister(route) {
        if (!this.registered(route))
            return false;
        let route_index = this.routes.indexOf(route);
        this.#routes = this.routes.slice(0, route_index).concat(this.routes.slice(route_index + 1));
        return true;
    }
    // 
    async handle(request, options) {
        options = options || {};
        if (!options)
            return null;
        options.logs = options.logs || false;
        // 
        let url = new URL(request.url);
        let path = url.pathname;
        if (path.endsWith("/") && path.length > 1)
            path = path.substring(0, path.length - 1);
        let parameters = {};
        let queries = {};
        // 
        url.searchParams.forEach((value, key) => {
            queries[key] = value;
        });
        let route_find = false;
        let route = null;
        let response = null;
        for (let i = 0; i < this.routes.length && !route_find; ++i) {
            route = this.routes[i];
            let path_possibilities = [path].concat(path.endsWith("/") ? [] : path + "/");
            for (let j = 0; j < path_possibilities.length && !route_find; ++j) {
                let p = path_possibilities[j];
                if (isPatternMatching(route.pattern, p) && route.methods.includes(request.method)) {
                    route_find = true;
                    parameters = extractParameters(route.pattern, p);
                    response = await route.handler(request, parameters, queries);
                }
            }
        }
        // 
        if (!response) {
            if (types_1.REST.Request.isCORSPreflight(request))
                response = types_1.REST.Response.fromJson({
                    code: 200,
                    headers: {
                        "Content-Type": "application/json; charset=utf-8",
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "*",
                        "Access-Control-Allow-Headers": "*",
                    },
                    body: {}
                });
            else
                response = types_1.REST.Response.fromJson({
                    code: 404,
                    headers: {
                        "Content-Type": "application/json; charset=utf-8"
                    },
                    body: {
                        message: "Route not found."
                    }
                });
        }
        let final_response = types_1.REST.Response.isJson(response)
            ? types_1.REST.Response.fromJson(response)
            : response;
        //  
        if (options.logs)
            console.log(request.method, path, "code=" + final_response.status, "status='" + final_response.statusText + "'", "parameters=", parameters, "queries=", queries);
        // 
        if (final_response && this.#response_mapper)
            final_response = await this.#response_mapper(final_response);
        // 
        return final_response;
    }
}
exports.default = Router;
