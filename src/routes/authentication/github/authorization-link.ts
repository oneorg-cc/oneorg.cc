import Locale from "../../../locale";
import { REST } from "../../../shared/utils/api/types";
import { Route } from "../../../shared/utils/router";

// 

const route: Route<{}, { json?: string }, Locale.Route.Response.Schema<string>> = {
    methods: [ "GET" ],
    pattern: "/authentication/github/authorization-link",
    handler: async (request, parameters, queries) => {
        const is_json_response = queries.json?.length == 0 || queries.json == "true";

        let authorization_link = new URL("https://github.com/login/oauth/authorize");
            authorization_link.searchParams.set("client_id", Locale.config.registry.apis.github.apps.oauth.id);
            authorization_link.searchParams.set("scope", Locale.config.registry.apis.github.apps.oauth.scopes.join(","));

        return {
            code: is_json_response ? REST.Response.Code.SUCCESS.OK : REST.Response.Code.REDIRECTION.TEMPORARY_REDIRECT,
            headers: {
                "Location": is_json_response ? undefined : authorization_link.href
            },
            body: is_json_response ? {
                success: true,
                message: null,
                result: authorization_link.href
            } : undefined
        }
    }
}

// 

export default route;