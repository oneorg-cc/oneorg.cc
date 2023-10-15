import { REST } from "../shared/utils/api/types";
import { Route } from "../shared/utils/router";

// 

const route: Route<{ subname: string }, {}, null> = {
    methods: REST.Method.ALL,
    pattern: "/",
    handler: async (request, parameters, queries) => {
        return new Response("");
    }
};

// 

export default route;