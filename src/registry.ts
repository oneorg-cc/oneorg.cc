import Locale from "./locale"
import { ZoneConfiguration } from "./registry/zoneconfig"
import GithubApi from "./shared/utils/api/github"
import { REST } from "./shared/utils/api/types"
import B64 from "./shared/utils/b64"
import Cache, { CachePersistency } from "./shared/utils/node/cache"
import Tokens from "./shared/utils/node/tokens"
import Scopes from "./shared/utils/scopes"

// 

type OneOrgRegistryManagerConfiguration = Locale.config.registry;

type ApiRecord = {
    github: GithubApi
};

// 

export type RegistryTokenData = {
    system: "github",
    
    userid: number,
    username: string,
    email: string | null,

    scopes: Scopes[]

    github_token: string
}

const RegistryScopes: Scopes = {
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
}

export default class Registry {

    readonly config: OneOrgRegistryManagerConfiguration;

    #apis: ApiRecord;

    #cache: Cache<string, string | Array<string>>;

    readonly tokens: Tokens<RegistryTokenData>;

    // 

    constructor(
        config: OneOrgRegistryManagerConfiguration,
        tokens: Tokens<RegistryTokenData>
    ) {
        this.config = config;

        // 

        this.#apis = {
            github: new GithubApi(`token ${this.config.apis.github.token}`)
        };

        // 

        this.#cache = new Cache({ persistency: CachePersistency.VOLATILE, delay: Cache.DELAY.HOURS(1) });

        this.tokens = tokens;
    }

    // 
    
    get apis() { return this.#apis; }

    get cache() { return this.#cache }

    // 

    readonly subname = {
        pattern: async (token: REST.Token | null) => {
            await assertScopes(
                this.tokens, token,
                Scopes.filter(RegistryScopes, path => [
                    "registry.subname.pattern"
                ].includes(path))
            );

            // 

            let result = this.cache.get("subname.pattern") as string;

            if(!result) {
                let subname_pattern_content = (await this.apis.github.repo.fs.read({
                    owner: this.config.apis.github.repository.owner,
                    repo: this.config.apis.github.repository.name,
                    path: "rules/subname.pattern.txt",
                    options: { ref: this.config.apis.github.repository.branches.main }
                }));
    
                if(!subname_pattern_content) return null;
    
                result = subname_pattern_content.text;
                this.cache.store("subname.pattern", result);
            }
    
            return result;
        },

        reserved: {
            patterns: async (token: REST.Token | null) => {
                await assertScopes(
                    this.tokens, token,
                    Scopes.filter(RegistryScopes, path => [
                        "registry.subname.reserved.patterns"
                    ].includes(path))
                );
    
                // 
    
                let result = this.cache.get("subname.reserved.patterns") as Array<string>;
        
                if(!result) {
                    let raw = await this.apis.github.repo.fs.read({
                        owner: this.config.apis.github.repository.owner,
                        repo: this.config.apis.github.repository.name,
                        path: "rules/reserved.subnames.patterns.txt",
                        options: { ref: this.config.apis.github.repository.branches.main }
                    });
        
                    if(!raw) return null;
        
                    result = raw.text.split("\n");
                    this.cache.store("subname.reserved.patterns", result, { delay: Cache.DELAY.MINUTES(30) });
                }
        
                return result;
            },

            list: async (token: REST.Token | null) => {
                await assertScopes(
                    this.tokens, token,
                    Scopes.filter(RegistryScopes, path => [
                        "registry.subname.reserved.list"
                    ].includes(path))
                );
    
                // 
    
                let result = this.cache.get("subname.reserved.list") as Array<string>;
        
                if(!result) {
                    let raw = await this.apis.github.repo.fs.read({
                        owner: this.config.apis.github.repository.owner,
                        repo: this.config.apis.github.repository.name,
                        path: "rules/reserved.subnames.txt",
                        options: { ref: this.config.apis.github.repository.branches.main }
                    });
        
                    if(!raw) return null;
        
                    result = raw.text.split("\n");
                    this.cache.store("subname.reserved.list", result, { delay: Cache.DELAY.MINUTES(30) });
                }
        
                return result;
            }
        },

        list: async (token: REST.Token | null) => {
            await assertScopes(
                this.tokens, token,
                Scopes.filter(RegistryScopes, path => [
                    "registry.subname.list"
                ].includes(path))
            );

            // 

            let directory = await this.apis.github.repo.fs.object<"dir">({
                owner: this.config.apis.github.repository.owner,
                repo: this.config.apis.github.repository.name,
                path: "",
                options: { ref: this.config.apis.github.repository.branches.main }
            });
    
            if(!directory) return [];
    
            let files = directory.entries?.filter(f => f.type == "file");
            if(!files) return [];
    
            let subnames = [];
    
            for(let i = 0; i < files.length; ++i) {
                let f = files[i];
                if(f.type == "file" && f.name == f.path && await this.subname.valid(f.name, null))
                    subnames.push(f.name);
            }
    
            return subnames;
        },

        valid: async (subname: string, token: REST.Token | null) => {
            await assertScopes(
                this.tokens, token,
                Scopes.filter(RegistryScopes, path => [
                    "registry.subname.valid"
                ].includes(path))
            );

            // 

            let reserved_subnames_patterns = await this.subname.reserved.patterns(null);
            if(!reserved_subnames_patterns) return false;
    
            let matching = false;
            for(let i = 0; i < reserved_subnames_patterns.length && !matching; ++i)
                if(subname.match(reserved_subnames_patterns[i])) matching = true;
            
            if(matching) return false;
    
            let reserved_subnames = await this.subname.reserved.list(null);
            if(!reserved_subnames) return false;
    
            if(reserved_subnames.includes(subname)) return false;
    
            let subname_pattern = await this.subname.pattern(null);
            if(!subname_pattern) return false;
    
            return subname.match(new RegExp(subname_pattern, "g"))?.length == 1;
        },

        claimable: async (subname: string, token: REST.Token | null) => {
            await assertScopes(
                this.tokens, token,
                Scopes.filter(RegistryScopes, path => [
                    "registry.subname.claimable"
                ].includes(path))
            );

            // 

            if(!await this.subname.valid(subname, null))
                return false;
    
            return !(await this.apis.github.repo.fs.exists({
                owner: this.config.apis.github.repository.owner,
                repo: this.config.apis.github.repository.name,
                path: subname,
                options: { ref: this.config.apis.github.repository.branches.main }
            }));
        },

        claim: async (subname: string, token: REST.Token | null) => {
            await assertScopes(
                this.tokens, token,
                Scopes.filter(RegistryScopes, path => [
                    "registry.subname.claim"
                ].includes(path))
            );

            // 

            if(!await this.subname.claimable(subname, null)) return false;

            const default_zone: ZoneConfiguration = {
                main: {
                    records: [],
                    origin: `${subname}.${Locale.config.domain}.`,
                    header: "",
                    ttl: 3600
                }
            };
    
            return await this.subname.zone.set(subname, token, default_zone);
        },

        zone: {
            get: async (subname: string, token: REST.Token | null) => {
                await assertScopes(
                    this.tokens, token,
                    Scopes.filter(RegistryScopes, path => [
                        "registry.subname.zone.get"
                    ].includes(path))
                );

                // 

                let content = await this.apis.github.repo.fs.read({
                    owner: this.config.apis.github.repository.owner,
                    repo: this.config.apis.github.repository.name,
                    path: `data/subnames/${subname}`,
                    options: { ref: this.config.apis.github.repository.branches.main }
                });

                return (content ? content.text.length > 0 ? content.json : null : null) as (ZoneConfiguration | null);
            },

            set: async (subname: string, token: REST.Token | null, zone: ZoneConfiguration, triescount: number = 1): Promise<boolean> => {
                if(triescount <= 0) return false;

                if(!ZoneConfiguration.isValid(zone)) return false;

                // 

                await assertScopes(
                    this.tokens, token,
                    Scopes.filter(RegistryScopes, path => [
                        "registry.subname.zone.set"
                    ].includes(path))
                );

                // 

                const jsontoken = token ? await this.tokens.json(token) : null;

                const response = await this.#apis.github.repo.fs.write({
                    owner: Locale.config.registry.apis.github.repository.owner,
                    repo: Locale.config.registry.apis.github.repository.name,
                    path: `data/subnames/${subname}`,
                    body: {
                        branch: Locale.config.registry.apis.github.repository.branches.main,
                        
                        message: "update",
                        committer: {
                            name: jsontoken ? jsontoken.username : "admin",
                            email: jsontoken ? jsontoken.email || "<invalid>" : `admin@${Locale.config.domain}`
                        },
                        
                        content: B64.fromString(JSON.stringify(zone, null, 2)),

                        author: {
                            name: `registry@${Locale.config.domain}`,
                            email: `registry@${Locale.config.domain}`
                        }
                    }
                });

                if(response?.code == REST.Response.Code.CLIENT_ERROR.CONFLICT)
                    return await this.subname.zone.set(subname, token, zone, triescount-1);

                // 

                return response ? REST.Response.Code.isSuccess(response.code) : false;
            }
        },

        owned: {
            list: async (token: REST.Token | null) => {
                await assertScopes(
                    this.tokens, token,
                    Scopes.filter(RegistryScopes, path => [
                        "registry.subname.owned.list"
                    ].includes(path))
                );
    
                // 
    
                const response = await this.apis.github.repo.fs.read({
                    owner: this.config.apis.github.repository.owner,
                    repo: this.config.apis.github.repository.name,
                    path: ""
                })
            }
        }
    }

}

// 

async function checkTokenScopes(tokens: Tokens<any>, token: REST.Token | null, required: Scopes | Scopes[]) {
    if(token === null) return [];

    if(!(required instanceof Array)) required = [required];

    const jsontoken = await tokens.json(token);
    if(!jsontoken) return required;

    return Scopes.check(required, jsontoken.scopes);
}

async function assertScopes(tokens: Tokens<any>, token: REST.Token | null, required: Scopes | Scopes[]) {
    const missing_scopes = await checkTokenScopes(tokens, token, required);

    if(missing_scopes.length > 0)
        throw new Scopes.MissingError(missing_scopes);
}