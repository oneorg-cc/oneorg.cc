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
const locale_1 = __importDefault(require("./locale"));
const zoneconfig_1 = require("./registry/zoneconfig");
const github_1 = __importDefault(require("./shared/utils/api/github"));
const types_1 = require("./shared/utils/api/types");
const b64_1 = __importDefault(require("./shared/utils/b64"));
const cache_1 = __importStar(require("./shared/utils/node/cache"));
const scopes_1 = __importDefault(require("./shared/utils/scopes"));
const RegistryScopes = {
    registry: {
        subname: {
            pattern: true,
            reserved: {
                patterns: true,
                list: true
            },
            list: true,
            valid: true,
            claimable: true,
            claim: true,
            zone: {
                get: true
            }
        }
    }
};
class Registry {
    config;
    #apis;
    #cache;
    tokens;
    // 
    constructor(config, tokens) {
        this.config = config;
        // 
        this.#apis = {
            github: new github_1.default(`token ${this.config.apis.github.token}`)
        };
        // 
        this.#cache = new cache_1.default({ persistency: cache_1.CachePersistency.VOLATILE, delay: cache_1.default.DELAY.HOURS(1) });
        this.tokens = tokens;
    }
    // 
    get apis() { return this.#apis; }
    get cache() { return this.#cache; }
    // 
    subname = {
        pattern: async (token) => {
            await assertScopes(this.tokens, token, scopes_1.default.filter(RegistryScopes, path => [
                "registry.subname.pattern"
            ].includes(path)));
            // 
            let result = this.cache.get("subname.pattern");
            if (!result) {
                let subname_pattern_content = (await this.apis.github.repo.fs.read({
                    owner: this.config.apis.github.repository.owner,
                    repo: this.config.apis.github.repository.name,
                    path: "rules/subname.pattern.txt",
                    options: { ref: this.config.apis.github.repository.branches.main }
                }));
                if (!subname_pattern_content)
                    return null;
                result = subname_pattern_content.text;
                this.cache.store("subname.pattern", result);
            }
            return result;
        },
        reserved: {
            patterns: async (token) => {
                await assertScopes(this.tokens, token, scopes_1.default.filter(RegistryScopes, path => [
                    "registry.subname.reserved.patterns"
                ].includes(path)));
                // 
                let result = this.cache.get("subname.reserved.patterns");
                if (!result) {
                    let raw = await this.apis.github.repo.fs.read({
                        owner: this.config.apis.github.repository.owner,
                        repo: this.config.apis.github.repository.name,
                        path: "rules/reserved.subnames.patterns.txt",
                        options: { ref: this.config.apis.github.repository.branches.main }
                    });
                    if (!raw)
                        return null;
                    result = raw.text.split("\n");
                    this.cache.store("subname.reserved.patterns", result, { delay: cache_1.default.DELAY.MINUTES(30) });
                }
                return result;
            },
            list: async (token) => {
                await assertScopes(this.tokens, token, scopes_1.default.filter(RegistryScopes, path => [
                    "registry.subname.reserved.list"
                ].includes(path)));
                // 
                let result = this.cache.get("subname.reserved.list");
                if (!result) {
                    let raw = await this.apis.github.repo.fs.read({
                        owner: this.config.apis.github.repository.owner,
                        repo: this.config.apis.github.repository.name,
                        path: "rules/reserved.subnames.txt",
                        options: { ref: this.config.apis.github.repository.branches.main }
                    });
                    if (!raw)
                        return null;
                    result = raw.text.split("\n");
                    this.cache.store("subname.reserved.list", result, { delay: cache_1.default.DELAY.MINUTES(30) });
                }
                return result;
            }
        },
        list: async (token) => {
            await assertScopes(this.tokens, token, scopes_1.default.filter(RegistryScopes, path => [
                "registry.subname.list"
            ].includes(path)));
            // 
            let directory = await this.apis.github.repo.fs.object({
                owner: this.config.apis.github.repository.owner,
                repo: this.config.apis.github.repository.name,
                path: "",
                options: { ref: this.config.apis.github.repository.branches.main }
            });
            if (!directory)
                return [];
            let files = directory.entries?.filter(f => f.type == "file");
            if (!files)
                return [];
            let subnames = [];
            for (let i = 0; i < files.length; ++i) {
                let f = files[i];
                if (f.type == "file" && f.name == f.path && await this.subname.valid(f.name, null))
                    subnames.push(f.name);
            }
            return subnames;
        },
        valid: async (subname, token) => {
            await assertScopes(this.tokens, token, scopes_1.default.filter(RegistryScopes, path => [
                "registry.subname.valid"
            ].includes(path)));
            // 
            let reserved_subnames_patterns = await this.subname.reserved.patterns(null);
            if (!reserved_subnames_patterns)
                return false;
            let matching = false;
            for (let i = 0; i < reserved_subnames_patterns.length && !matching; ++i)
                if (subname.match(reserved_subnames_patterns[i]))
                    matching = true;
            if (matching)
                return false;
            let reserved_subnames = await this.subname.reserved.list(null);
            if (!reserved_subnames)
                return false;
            if (reserved_subnames.includes(subname))
                return false;
            let subname_pattern = await this.subname.pattern(null);
            if (!subname_pattern)
                return false;
            return subname.match(new RegExp(subname_pattern, "g"))?.length == 1;
        },
        claimable: async (subname, token) => {
            await assertScopes(this.tokens, token, scopes_1.default.filter(RegistryScopes, path => [
                "registry.subname.claimable"
            ].includes(path)));
            // 
            if (!await this.subname.valid(subname, null))
                return false;
            return !(await this.apis.github.repo.fs.exists({
                owner: this.config.apis.github.repository.owner,
                repo: this.config.apis.github.repository.name,
                path: subname,
                options: { ref: this.config.apis.github.repository.branches.main }
            }));
        },
        claim: async (subname, token) => {
            await assertScopes(this.tokens, token, scopes_1.default.filter(RegistryScopes, path => [
                "registry.subname.claim"
            ].includes(path)));
            // 
            if (!await this.subname.claimable(subname, null))
                return false;
            const default_zone = {
                main: {
                    records: [],
                    origin: `${subname}.${locale_1.default.config.domain}.`,
                    header: "",
                    ttl: 3600
                }
            };
            return await this.subname.zone.set(subname, token, default_zone);
        },
        zone: {
            get: async (subname, token) => {
                await assertScopes(this.tokens, token, scopes_1.default.filter(RegistryScopes, path => [
                    "registry.subname.zone.get"
                ].includes(path)));
                // 
                let content = await this.apis.github.repo.fs.read({
                    owner: this.config.apis.github.repository.owner,
                    repo: this.config.apis.github.repository.name,
                    path: `data/subnames/${subname}`,
                    options: { ref: this.config.apis.github.repository.branches.main }
                });
                return (content ? content.text.length > 0 ? content.json : null : null);
            },
            set: async (subname, token, zone, triescount = 1) => {
                if (triescount <= 0)
                    return false;
                if (!zoneconfig_1.ZoneConfiguration.isValid(zone))
                    return false;
                // 
                await assertScopes(this.tokens, token, scopes_1.default.filter(RegistryScopes, path => [
                    "registry.subname.zone.set"
                ].includes(path)));
                // 
                const jsontoken = token ? await this.tokens.json(token) : null;
                const response = await this.#apis.github.repo.fs.write({
                    owner: locale_1.default.config.registry.apis.github.repository.owner,
                    repo: locale_1.default.config.registry.apis.github.repository.name,
                    path: `data/subnames/${subname}`,
                    body: {
                        branch: locale_1.default.config.registry.apis.github.repository.branches.main,
                        message: "update",
                        committer: {
                            name: jsontoken ? jsontoken.username : "admin",
                            email: jsontoken ? jsontoken.email || "<invalid>" : `admin@${locale_1.default.config.domain}`
                        },
                        content: b64_1.default.fromString(JSON.stringify(zone, null, 2)),
                        author: {
                            name: `registry@${locale_1.default.config.domain}`,
                            email: `registry@${locale_1.default.config.domain}`
                        }
                    }
                });
                if (response?.code == types_1.REST.Response.Code.CLIENT_ERROR.CONFLICT)
                    return await this.subname.zone.set(subname, token, zone, triescount - 1);
                // 
                return response ? types_1.REST.Response.Code.isSuccess(response.code) : false;
            }
        },
        owned: {
            list: async (token) => {
                await assertScopes(this.tokens, token, scopes_1.default.filter(RegistryScopes, path => [
                    "registry.subname.owned.list"
                ].includes(path)));
                // 
                const response = await this.apis.github.repo.fs.read({
                    owner: this.config.apis.github.repository.owner,
                    repo: this.config.apis.github.repository.name,
                    path: ""
                });
            }
        }
    };
}
exports.default = Registry;
// 
async function checkTokenScopes(tokens, token, required) {
    if (token === null)
        return [];
    if (!(required instanceof Array))
        required = [required];
    const jsontoken = await tokens.json(token);
    if (!jsontoken)
        return required;
    return scopes_1.default.check(required, jsontoken.scopes);
}
async function assertScopes(tokens, token, required) {
    const missing_scopes = await checkTokenScopes(tokens, token, required);
    if (missing_scopes.length > 0)
        throw new scopes_1.default.MissingError(missing_scopes);
}
