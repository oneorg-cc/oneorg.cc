"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const locale_1 = __importDefault(require("../../../locale"));
const types_1 = require("../../../shared/utils/api/types");
// 
const route = {
    methods: ["GET"],
    pattern: "/authentication/github/authorization-link",
    handler: async (request, parameters, queries) => {
        const is_json_response = queries.json?.length == 0 || queries.json == "true";
        let authorization_link = new URL("https://github.com/login/oauth/authorize");
        authorization_link.searchParams.set("client_id", locale_1.default.config.registry.apis.github.apps.oauth.id);
        authorization_link.searchParams.set("scope", locale_1.default.config.registry.apis.github.apps.oauth.scopes.join(","));
        return {
            code: is_json_response ? types_1.REST.Response.Code.SUCCESS.OK : types_1.REST.Response.Code.REDIRECTION.TEMPORARY_REDIRECT,
            headers: {
                "Location": is_json_response ? undefined : authorization_link.href
            },
            body: is_json_response ? {
                success: true,
                message: null,
                result: authorization_link.href
            } : undefined
        };
    }
};
// 
exports.default = route;
