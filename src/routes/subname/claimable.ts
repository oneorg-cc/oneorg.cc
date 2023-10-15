import { Route } from "../../shared/utils/router";

// 

import Locale from "../../locale";
import { REST } from "../../shared/utils/api/types";

// 

const route: Route<{ subname: string }, {}, Locale.Route.Response.Schema<string>> = {
    methods: [ "GET" ],
    pattern: "/subname/{subname}/claimable",
    handler: Locale.Route.tokenDependantHandler(async (request, parameters, queries) => {
        const token = REST.Request.authtoken(request);

        let claimable = await Locale.registry.subname.claimable(parameters.subname, token);

        return {
            body: {
                success: claimable,
                message: claimable ? "claimable." : "not claimable.",
                result: parameters.subname
            }
        }
    })
};

// 

export default route;