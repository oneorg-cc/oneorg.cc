"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = __importDefault(require("../api"));
const types_1 = require("./types");
// 
var RequestParameters;
(function (RequestParameters) {
    // 
    let FS;
    (function (FS) {
        let Partial;
        (function (Partial) {
            function normalize(parameters) {
                let result = JSON.parse(JSON.stringify(parameters));
                // 
                result.options = parameters.options ? JSON.parse(JSON.stringify(parameters.options)) : {};
                result.options.ref = "main";
                result.body = parameters.body ? JSON.parse(JSON.stringify(parameters.body)) : {};
                result.body.message = "update";
                if (parameters.options) {
                    if (parameters.options.ref)
                        result.options.ref = parameters.options.ref;
                }
                // 
                return result;
            }
            Partial.normalize = normalize;
        })(Partial = FS.Partial || (FS.Partial = {}));
    })(FS = RequestParameters.FS || (RequestParameters.FS = {}));
})(RequestParameters || (RequestParameters = {}));
// 
class GithubApi {
    static ROOT = "https://api.github.com/";
    // 
    #token;
    #api;
    // 
    constructor(token) {
        this.#token = token || null;
        this.#api = new api_1.default(GithubApi.ROOT, (endpoint, options) => {
            if (!options.headers["Authorization"]) {
                if (this.token)
                    options.headers["Authorization"] = "token " + this.token;
                else
                    console.warn("Sending a request to Github API without any api-token : ", { endpoint, options });
            }
            if (!options.headers["Accept"])
                options.headers["Accept"] = "application/vnd.github+json";
        });
    }
    // 
    get token() { return this.#token; }
    get api() { return this.#api; }
    // 
    oauth = {
        login: async (code, client) => {
            let repsonse = await this.#api.request("POST https://github.com/login/oauth/access_token", {
                queries: {
                    code: code,
                    client_id: client.id,
                    client_secret: client.secret
                }
            });
            return repsonse ? repsonse.result.json.access_token : null;
        }
    };
    // 
    user = {
        get: async (username, token = this.token) => {
            const response = await this.api.request("GET /users/{username}", {
                token: token,
                parameters: { username: username }
            });
            if (!response)
                return null;
            if (response.code != types_1.REST.Response.Code.SUCCESS.OK)
                return null;
            return response.result.json;
        },
        byid: async (id, token = this.token) => {
            const response = await this.api.request("GET /users", {
                token: token,
                queries: { since: `${id - 1}`, per_page: "1" }
            });
            if (!response)
                return null;
            if (response.code != types_1.REST.Response.Code.SUCCESS.OK)
                return null;
            const json = response.result.json;
            return json.length > 0 ? await this.user.get(json[0].login) : null;
        },
        current: async (token = this.token) => {
            const response = await this.api.request("GET /user", { token: token });
            if (!response)
                return null;
            if (response.code != types_1.REST.Response.Code.SUCCESS.OK)
                return null;
            return response.result.json;
        },
        emails: {
            get: async (token = this.token) => {
                const response = await this.api.request("GET /user/emails", { token: token });
                if (!response)
                    return null;
                if (response.code != types_1.REST.Response.Code.SUCCESS.OK)
                    return null;
                return response.result.json;
            },
            primary: async (token = this.token) => {
                const emails = await this.user.emails.get(token);
                if (!emails)
                    return null;
                let i = 0;
                while (i < emails.length && !emails[i].primary)
                    ++i;
                return emails[i];
            }
        }
    };
    // 
    repo = {
        fs: {
            exists: async (parameters, token = this.token) => {
                let params = RequestParameters.FS.Partial.normalize(parameters);
                // 
                const response = await this.api.request("HEAD /repos/{owner}/{repo}/contents/{path}", {
                    token: token,
                    parameters: {
                        owner: params.owner,
                        repo: params.repo,
                        path: params.path
                    },
                    queries: { ref: params.options.ref }
                });
                if (!response)
                    return false;
                return types_1.REST.Response.Code.isSuccess(response.code);
            },
            object: async (parameters, token = this.token) => {
                let params = RequestParameters.FS.Partial.normalize(parameters);
                // 
                const response = await this.api.request("GET /repos/{owner}/{repo}/contents/{path}", {
                    token: token,
                    parameters: {
                        owner: params.owner,
                        repo: params.repo,
                        path: params.path
                    },
                    queries: { ref: params.options.ref },
                    headers: { Accept: "application/vnd.github.v3.object" }
                });
                if (!response)
                    return null;
                if (!types_1.REST.Response.Code.isSuccess(response.code))
                    return null;
                return response.result.json;
            },
            read: async (parameters, token = this.token) => {
                let params = RequestParameters.FS.Partial.normalize(parameters);
                // 
                const response = await this.api.request("GET /repos/{owner}/{repo}/contents/{path}", {
                    token: token,
                    parameters: {
                        owner: params.owner,
                        repo: params.repo,
                        path: params.path
                    },
                    queries: { ref: params.options.ref },
                    headers: { Accept: "application/vnd.github.raw" }
                });
                if (!response)
                    return null;
                if (!types_1.REST.Response.Code.isSuccess(response.code))
                    return null;
                return response.result;
            },
            write: async (parameters, token = this.token) => {
                let params = RequestParameters.FS.Partial.normalize(parameters);
                // 
                let filesha = undefined;
                let file = await this.repo.fs.object({
                    owner: params.owner,
                    repo: params.repo,
                    path: params.path,
                    options: { ref: params.options.ref }
                });
                if (file)
                    filesha = file.sha;
                params.body.sha = filesha;
                const response = await this.api.request("PUT /repos/{owner}/{repo}/contents/{path}", {
                    token: token,
                    parameters: {
                        owner: params.owner,
                        repo: params.repo,
                        path: params.path
                    },
                    body: params.body
                });
                return response;
            },
            delete: async (parameters, token = this.token) => {
                let params = RequestParameters.FS.Partial.normalize(parameters);
                // 
                let file = await this.repo.fs.object({
                    owner: params.owner,
                    repo: params.repo,
                    path: params.path,
                    options: { ref: params.options.ref }
                });
                if (!file)
                    return null;
                params.body.sha = file.sha;
                const response = await this.api.request("DELETE /repos/{owner}/{repo}/contents/{path}", {
                    token: token,
                    parameters: {
                        owner: params.owner,
                        repo: params.repo,
                        path: params.path
                    },
                    body: params.body
                });
                if (!response)
                    return null;
                if (!types_1.REST.Response.Code.isSuccess(response.code))
                    return null;
                return response.result;
            }
        }
    };
}
exports.default = GithubApi;
