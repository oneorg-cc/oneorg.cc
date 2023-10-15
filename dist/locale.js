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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// 
const registry_1 = __importDefault(require("./registry"));
const routes_1 = require("./routes");
const types_1 = require("./shared/utils/api/types");
const getdnsz_1 = require("./shared/utils/node/dnsz/getdnsz");
const tokens_1 = __importDefault(require("./shared/utils/node/tokens"));
const router_1 = __importDefault(require("./shared/utils/router"));
const scopes_1 = __importDefault(require("./shared/utils/scopes"));
// 
class Locale {
    static #dnsz;
    static #registry;
    // 
    static get registry() { return this.#registry; }
    static get dnsz() { return this.#dnsz; }
    // 
    static async initialize() {
        this.#dnsz = await (0, getdnsz_1.getdnsz)();
        // 
        this.#registry = new registry_1.default(this.config.registry, await tokens_1.default.create({
            keys: {
                cryption: {
                    publicKey: fs.readFileSync(path.join(__dirname, "../keys/cryption.pub.key")).toString(),
                    privateKey: fs.readFileSync(path.join(__dirname, "../keys/cryption.key")).toString()
                },
                signature: {
                    publicKey: fs.readFileSync(path.join(__dirname, "../keys/signature.pub.key")).toString(),
                    privateKey: fs.readFileSync(path.join(__dirname, "../keys/signature.key")).toString()
                }
            }
        }));
        // 
        const routes = (0, routes_1.getRoutes)(path.join(__dirname, "./routes/"));
        for (let i = 0; i < routes.length; ++i)
            Locale.router.register(routes[i]);
    }
}
// 
(function (Locale) {
    Locale.rootdir = path.join(__dirname, "..");
    Locale.config = JSON.parse(fs.readFileSync(path.join(__dirname, "../config.json")).toString());
    // 
    Locale.router = new router_1.default();
    Locale.router.setResponseMapper(response => {
        if (!response.headers.has("Content-Type"))
            response.headers.set("Content-Type", "application/json; charset=utf-8");
        if (!response.headers.has("Access-Control-Allow-Origin"))
            response.headers.set("Access-Control-Allow-Origin", "*");
        return response;
    });
    // 
    let Route;
    (function (Route) {
        let Response;
        (function (Response) {
            let Default;
            (function (Default) {
                Default.BAD_REQUEST = types_1.REST.Response.fromJson({
                    body: {
                        success: false,
                        message: "Bad request.",
                        result: null
                    },
                    code: types_1.REST.Response.Code.CLIENT_ERROR.BAD_REQUEST
                });
                Default.INVALID_TOKEN = types_1.REST.Response.fromJson({
                    body: {
                        success: false,
                        message: "Invalid token.",
                        result: null
                    },
                    code: types_1.REST.Response.Code.CLIENT_ERROR.BAD_REQUEST,
                    status: "Invalid token."
                });
                Default.INTERNAL_SERVER_ERROR = types_1.REST.Response.fromJson({
                    body: {
                        success: false,
                        message: "Internal server error.",
                        result: null
                    },
                    code: types_1.REST.Response.Code.SERVER_ERROR.INTERNAL_SERVER_ERROR
                });
            })(Default = Response.Default || (Response.Default = {}));
        })(Response = Route.Response || (Route.Response = {}));
        function tokenDependantHandler(fn) {
            return (async (request, parameters, queries) => {
                try {
                    if (!types_1.REST.Request.authtoken(request))
                        return Locale.Route.Response.Default.INVALID_TOKEN;
                    // 
                    const result = await fn(request, parameters, queries);
                    // 
                    return result;
                }
                catch (e) {
                    if (e instanceof scopes_1.default.MissingError) {
                        return {
                            body: {
                                success: false,
                                message: e.message,
                                result: null
                            },
                            code: types_1.REST.Response.Code.CLIENT_ERROR.FORBIDDEN,
                        };
                    }
                    else {
                        console.error(e);
                        return Locale.Route.Response.Default.INTERNAL_SERVER_ERROR;
                    }
                }
            });
        }
        Route.tokenDependantHandler = tokenDependantHandler;
        ;
    })(Route = Locale.Route || (Locale.Route = {}));
})(Locale || (Locale = {}));
exports.default = Locale;
