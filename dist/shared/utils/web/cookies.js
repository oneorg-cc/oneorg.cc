"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class cookies {
    static set(name, value, options) {
        options = options || {};
        options.path = typeof options.path == "string" ? options.path : "/";
        // 
        let cookie_string = "";
        cookie_string += `${name}=${value}; `;
        if (options.expiration)
            cookie_string += `expires=${new Date(options.expiration).toUTCString()}; `;
        cookie_string += `path=${options.path}`;
        document.cookie = cookie_string;
    }
    static get(name) {
        const cookies = document.cookie.split(";");
        let cookie_found = false;
        let result = null;
        for (let i = 0; i < cookies.length && !cookie_found; ++i) {
            let cookie = cookies[i];
            while (cookie.charAt(0) == " ")
                cookie.substring(1);
            const parsed_cookie = cookie.split("=");
            result = parsed_cookie[1];
            cookie_found = parsed_cookie[0] == name;
        }
        if (cookie_found)
            return result;
        return null;
    }
    static exists(name) {
        const value = this.get(name);
        return value !== null && value !== undefined;
    }
}
exports.default = cookies;
