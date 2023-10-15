"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// 
const locale_1 = __importDefault(require("../../locale"));
const types_1 = require("../../shared/utils/api/types");
// 
const route = {
    methods: ["GET"],
    pattern: "/subname/{subname}/claimable",
    handler: locale_1.default.Route.tokenDependantHandler(async (request, parameters, queries) => {
        const token = types_1.REST.Request.authtoken(request);
        let claimable = await locale_1.default.registry.subname.claimable(parameters.subname, token);
        return {
            body: {
                success: claimable,
                message: claimable ? "claimable." : "not claimable.",
                result: parameters.subname
            }
        };
    })
};
// 
exports.default = route;
