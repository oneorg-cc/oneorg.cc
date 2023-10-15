"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const locale_1 = __importDefault(require("../../../locale"));
const types_1 = require("../../../shared/utils/api/types");
// 
const x = locale_1.default.Route.tokenDependantHandler(async (request, parameters, queries) => {
    const token = types_1.REST.Request.authtoken(request);
    if (!token || !types_1.REST.Token.String.check(token))
        return locale_1.default.Route.Response.Default.INVALID_TOKEN;
    if (!token || !types_1.REST.Token.String.check(token))
        return {
            code: types_1.REST.Response.Code.CLIENT_ERROR.BAD_REQUEST,
            status: "Invalid token."
        };
    return await locale_1.default.registry.tokens.valid(token)
        ? { code: types_1.REST.Response.Code.SUCCESS.OK, status: "Valid token." }
        : { code: types_1.REST.Response.Code.CLIENT_ERROR.UNAUTHORIZED, status: "Invalid token." };
});
const route = {
    methods: ["HEAD"],
    pattern: "/authentication/check",
    handler: x
};
// 
exports.default = route;
