import * as fs from "fs";
import * as path from "path";


// 

import Registry from "./registry";

import { getRoutes } from "./routes";
import { Json, JsonObject, REST } from "./shared/utils/api/types";
import { DNSZ, getdnsz } from "./shared/utils/node/dnsz/getdnsz";
import Tokens from "./shared/utils/node/tokens";
import Router, { RouteHandler } from "./shared/utils/router";
import Scopes from "./shared/utils/scopes";

// 

class Locale {

    static #dnsz: DNSZ;

    static #registry: Registry;

    // 

    static get registry() { return this.#registry; }
    
    static get dnsz() { return this.#dnsz; }

    // 

    static async initialize() {
        this.#dnsz = await getdnsz();

        // 

        this.#registry = new Registry(this.config.registry, await Tokens.create<any>({
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

        const routes = getRoutes(path.join(__dirname, "./routes/"));

        for(let i = 0; i < routes.length; ++i)
            Locale.router.register(routes[i]);
    }

}

// 

namespace Locale {

    export const rootdir = path.join(__dirname, "..");

    // 

    export type config = {
        "domain": string
        "hostnames": Array<string>,
        "registry": config.registry
    };

    export namespace config {

        export type registry = {
            "apis": {
                "github": {
                    "token": string,
                    "repository": {
                        "owner": string,
                        "name": string,
                        "branches": {
                            "main": string,
                            "registry": string
                        }
                    },
                    "apps": {
                        "oauth": {
                            "id": string,
                            "secret": string,
                            "scopes": Array<string>
                        }
                    }
                }
            }
        };

    }

    export const config: config = JSON.parse(fs.readFileSync(path.join(__dirname, "../config.json")).toString());

    // 

    export const router = new Router();

    router.setResponseMapper(response => {
        if(!response.headers.has("Content-Type")) response.headers.set("Content-Type", "application/json; charset=utf-8");
        if(!response.headers.has("Access-Control-Allow-Origin")) response.headers.set("Access-Control-Allow-Origin", "*");

        return response;
    });

    // 

    export namespace Route {

        export namespace Response {

            export interface Schema<R extends Json> extends JsonObject {
                success: boolean,
                message: string | null,
                result: R | null
            }

            export namespace Default {
                export const BAD_REQUEST = REST.Response.fromJson<Schema<null>>({
                    body: {
                        success: false,
                        message: "Bad request.",
                        result: null
                    },
                    code: REST.Response.Code.CLIENT_ERROR.BAD_REQUEST
                });

                export const INVALID_TOKEN = REST.Response.fromJson<Schema<null>>({
                    body: {
                        success: false,
                        message: "Invalid token.",
                        result: null
                    },
                    code: REST.Response.Code.CLIENT_ERROR.BAD_REQUEST,
                    status: "Invalid token."
                })

                export const INTERNAL_SERVER_ERROR = REST.Response.fromJson<Schema<null>>({
                    body: {
                        success: false,
                        message: "Internal server error.",
                        result: null
                    },
                    code: REST.Response.Code.SERVER_ERROR.INTERNAL_SERVER_ERROR
                });
            }

        }

        export function tokenDependantHandler<
            P extends REST.Endpoint.Parameters,
            Q extends REST.Endpoint.Queries,
            B extends JsonObject | null
        >(fn: RouteHandler<P, Q, B>): RouteHandler<P, Q, B> {
            return (async (request, parameters, queries) => {
                try {
                    if(!REST.Request.authtoken(request)) return Locale.Route.Response.Default.INVALID_TOKEN as any;

                    // 
                    
                    const result = await fn(request, parameters, queries) as any;

                    // 

                    return result;
                } catch(e) {
                    if(e instanceof Scopes.MissingError) {
                        return {
                            body: {
                                success: false,
                                message: e.message,
                                result: null
                            },
                            code: REST.Response.Code.CLIENT_ERROR.FORBIDDEN,
                        } as REST.Response.Json<any>
                    }
                    else {
                        console.error(e);
                        return Locale.Route.Response.Default.INTERNAL_SERVER_ERROR as any;
                    }
                }
            }) as RouteHandler<P, Q, B>;
        };

    }

}

export default Locale;