"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// 
const locale_1 = __importDefault(require("../../../locale"));
const types_1 = require("../../../shared/utils/api/types");
// 
const route = {
    methods: ["POST"],
    pattern: "/authentication/github",
    handler: async (request, parameters, queries) => {
        try {
            if (!queries.code)
                return locale_1.default.Route.Response.Default.BAD_REQUEST;
            let github_token = await locale_1.default.registry.apis.github.oauth.login(queries.code, {
                id: locale_1.default.config.registry.apis.github.apps.oauth.id,
                secret: locale_1.default.config.registry.apis.github.apps.oauth.secret
            });
            // 
            if (!github_token)
                return {
                    code: types_1.REST.Response.Code.CLIENT_ERROR.UNAUTHORIZED,
                    body: {
                        success: false,
                        message: "Github oauth login failed.",
                        result: null
                    }
                };
            // 
            const user = await locale_1.default.registry.apis.github.user.current(`bearer ${github_token}`);
            const user_primary_email = await locale_1.default.registry.apis.github.user.emails.primary(`bearer ${github_token}`);
            if (!user)
                throw new Error("No user found with this oauth token.");
            // 
            let token_lifetime;
            try {
                token_lifetime = parseInt(queries.lifetime || "-1");
            }
            catch (e) {
                token_lifetime = -1;
            }
            if (token_lifetime < 0)
                token_lifetime = 1000 * 60 * 60 * 2;
            // 
            const jsontoken = {
                expiration: Date.now() + token_lifetime,
                system: "github",
                userid: user.id,
                username: user.login,
                email: user_primary_email ? user_primary_email.email : null,
                scopes: [{ registry: true }],
                github_token: github_token
            };
            // 
            const token = await locale_1.default.registry.tokens.generate(jsontoken);
            if (!token)
                throw new Error('Token not generated.');
            // 
            return {
                body: {
                    success: true,
                    message: "Successfully logged.",
                    result: {
                        token: token,
                        expiration: jsontoken.expiration
                    }
                }
            };
        }
        catch (e) {
            console.error(e);
            return locale_1.default.Route.Response.Default.INTERNAL_SERVER_ERROR;
        }
    }
};
// 
exports.default = route;
