import { Route } from "../../shared/utils/router";

// 

import Locale from "../../locale";
import { REST } from "../../shared/utils/api/types";

// 

const route: Route<{ subname: string }, {}, Locale.Route.Response.Schema<string>> = {
    methods: [ "PUT" ],
    pattern: "/subname/{subname}/claim",
    handler: Locale.Route.tokenDependantHandler(async (request, parameters, queries) => {
        const token = REST.Request.authtoken(request);

        let success = await Locale.registry.subname.claim(parameters.subname, token);

        return {
            body: {
                success: success,
                message: success ? "successfully claimed." : "failed.",
                result: parameters.subname
            }
        }
    })
};

// 

export default route;