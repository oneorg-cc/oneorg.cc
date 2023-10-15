"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../shared/utils/api/types");
// 
const route = {
    methods: types_1.REST.Method.ALL,
    pattern: "/",
    handler: async (request, parameters, queries) => {
        return new Response("");
    }
};
// 
exports.default = route;
