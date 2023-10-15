import { Route } from "../../shared/utils/router";

// 

import Locale from "../../locale";
import { REST } from "../../shared/utils/api/types";

// 

const route: Route<{ subname: string }, {}, Locale.Route.Response.Schema<string>> = {
    methods: [ "GET" ],
    pattern: "/subname/owned",
    handler: Locale.Route.tokenDependantHandler(async (request, parameters, queries) => {
        const token = REST.Request.authtoken(request);

        return {
            body: {
                success: true,
                message: null,
                result: await Locale.registry.subname.pattern(token)
            }
        }
    })
};

// 

export default route;