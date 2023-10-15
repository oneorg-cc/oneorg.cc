"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 
var Scopes;
(function (Scopes) {
    class MissingError extends Error {
        scopes;
        // 
        constructor(scopes) {
            const scope_array = scopes instanceof Array ? scopes : [scopes];
            super("missing scopes : " + scope_array.map(v => paths(v).join(", ")).join(", "));
            this.scopes = scope_array;
        }
    }
    Scopes.MissingError = MissingError;
    // 
    function check(required, given) {
        const required_scope_array = required instanceof Array ? required : [required];
        const given_scope_array = given instanceof Array ? given : [given];
        let missing = [];
        // 
        for (let i = 0; i < required_scope_array.length; ++i) {
            const required_scopes = required_scope_array[i];
            let missing_scopes = {};
            // 
            if (given_scope_array.length == 0)
                missing_scopes = required_scopes;
            else {
                for (let j = 0; j < given_scope_array.length; ++j) {
                    const given_scopes = given_scope_array[j];
                    // 
                    Object.keys(required_scopes).forEach(k => {
                        const required_scope = required_scopes[k];
                        const given_scope = given_scopes[k];
                        if (given_scope === undefined
                            || (required_scope === true && given_scope !== true)) {
                            missing_scopes[k] = required_scope;
                        }
                        else if ((required_scope !== true && required_scope)
                            && (given_scope !== true && given_scope)) {
                            const recusrive_missing_scope = check([required_scope], [given_scope]);
                            if (recusrive_missing_scope.length != 0)
                                missing_scopes[k] = recusrive_missing_scope[0];
                        }
                    });
                }
            }
            // 
            if (Object.keys(missing_scopes).length != 0)
                missing.push(missing_scopes);
        }
        // 
        return missing;
    }
    Scopes.check = check;
    // 
    function strictify(scopes) {
        let scopes_copy = Object.assign({}, scopes);
        // 
        Object.keys(scopes_copy).forEach(k => {
            const scope = scopes_copy[k];
            if (typeof scope == "boolean")
                scopes_copy[k] = true;
            else if (scope)
                scopes_copy[k] = strictify(scope);
        });
        // 
        return scopes_copy;
    }
    Scopes.strictify = strictify;
    // 
    function filter(scopes, f, rootpath) {
        let result = {};
        // 
        Object.keys(scopes).forEach(k => {
            const path = (rootpath ? rootpath + "." : "") + k;
            const scope = scopes[k];
            const accepted = f(path);
            if (scope === true && accepted)
                result[k] = scope;
            else if (scope !== true && scope) {
                if (accepted)
                    result[k] = scope;
                else {
                    const filtered = filter(scope, f, path);
                    if (Object.keys(filtered).length > 0)
                        result[k] = filtered;
                }
            }
        });
        // 
        return result;
    }
    Scopes.filter = filter;
    // 
    function paths(scopes, rootpath) {
        let result = [];
        // 
        Object.keys(scopes).forEach(k => {
            const path = (rootpath ? rootpath + "." : "") + k;
            const scope = scopes[k];
            if (scope !== true && scope)
                result.concat(paths(scope, path));
        });
        // 
        return result;
    }
    Scopes.paths = paths;
})(Scopes || (Scopes = {}));
// 
exports.default = Scopes;
