import { Route } from "../../../shared/utils/router";

// 

import Locale from "../../../locale";
import { RegistryTokenData } from "../../../registry";
import { REST } from "../../../shared/utils/api/types";
import { JsonToken } from "../../../shared/utils/node/tokens";

// 

const route: Route<
    {},
    {
        code: string,
        lifetime?: string
    },
    Locale.Route.Response.Schema<{
        token: string,
        expiration: number
    }>
> = {
    methods: [ "POST" ],
    pattern: "/authentication/github",
    handler: async (request, parameters, queries) => {
        try {
            if(!queries.code)
                return Locale.Route.Response.Default.BAD_REQUEST as any;

            let github_token = await Locale.registry.apis.github.oauth.login(
                queries.code,
                {
                    id: Locale.config.registry.apis.github.apps.oauth.id,
                    secret: Locale.config.registry.apis.github.apps.oauth.secret
                }
            );

            // 

            if(!github_token)
                return {
                    code: REST.Response.Code.CLIENT_ERROR.UNAUTHORIZED,
                    body: {
                        success: false,
                        message: "Github oauth login failed.",
                        result: null
                    }
                }
            
            // 

            const user = await Locale.registry.apis.github.user.current(`bearer ${github_token}`);
            const user_primary_email = await Locale.registry.apis.github.user.emails.primary(`bearer ${github_token}`);

            if(!user) throw new Error("No user found with this oauth token.");

            // 

            let token_lifetime: number;
            
            try { token_lifetime = parseInt(queries.lifetime || "-1"); }
            catch(e) { token_lifetime = -1; }
            
            if(token_lifetime < 0) token_lifetime = 1000 * 60 * 60 * 2;

            // 

            const jsontoken: JsonToken<RegistryTokenData> = {
                expiration: Date.now() + token_lifetime,

                system: "github",

                userid: user.id,
                username: user.login,
                email: user_primary_email ? user_primary_email.email : null,

                scopes: [{ registry: true }],
                
                github_token: github_token
            };

            // 
            
            const token = await Locale.registry.tokens.generate(jsontoken as any);
            if(!token) throw new Error('Token not generated.');

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
            }
        } catch(e) {
            console.error(e);
            return Locale.Route.Response.Default.INTERNAL_SERVER_ERROR as any;
        }
    }
};

// 

export default route;