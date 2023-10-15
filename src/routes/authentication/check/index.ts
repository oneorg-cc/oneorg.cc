import Locale from "../../../locale";
import { REST } from "../../../shared/utils/api/types";
import { Route } from "../../../shared/utils/router";

// 

const x = Locale.Route.tokenDependantHandler(async (request, parameters, queries) => {
    const token = REST.Request.authtoken(request);

    if(!token || !REST.Token.String.check(token))
        return Locale.Route.Response.Default.INVALID_TOKEN as any;

    if(!token || !REST.Token.String.check(token))
        return {
            code: REST.Response.Code.CLIENT_ERROR.BAD_REQUEST,
            status: "Invalid token."
        }

    return await Locale.registry.tokens.valid(token)
        ? { code: REST.Response.Code.SUCCESS.OK, status: "Valid token." }
        : { code: REST.Response.Code.CLIENT_ERROR.UNAUTHORIZED, status: "Invalid token." }
});

const route: Route<{}, { json?: string }, Locale.Route.Response.Schema<boolean>> = {
    methods: [ "HEAD" ],
    pattern: "/authentication/check",
    handler: x as any
}

// 

export default route;