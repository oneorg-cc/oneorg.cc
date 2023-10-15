"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_js_1 = __importDefault(require("../api.js"));
const OneOrgApiUtil = new api_js_1.default(window.location.hostname == "localhost" ? "http://localhost:1130" : "https://api.oneorg.cc/", (endpoint, options) => {
});
class OneOrg {
    static authentication = {
        github: async (code) => {
            const response = await OneOrgApiUtil.request("POST /authentication/github", { queries: { code: code } });
            const json = response?.result.json;
            return json;
        },
        authorizationLink: async () => {
            const response = await OneOrgApiUtil.request("GET /authentication/github/authorization-link", { queries: { json: "true" } });
            if (response?.code != 200)
                return null;
            return response?.result.json.result;
        },
        check: async (token) => {
            const response = await OneOrgApiUtil.request("HEAD /authentication/check", { token: `token ${token}` });
            return response?.code == 200;
        }
    };
}
exports.default = OneOrg;
