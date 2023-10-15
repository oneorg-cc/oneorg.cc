"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class cssutil {
    static getTransitionDuration(element) {
        let result;
        const str = window.getComputedStyle(element).transitionDuration;
        if (str.endsWith("ms"))
            result = parseInt(str.substring(0, str.length - 2));
        else if (str.endsWith("s"))
            result = parseFloat(str.substring(0, str.length - 1)) * 1000;
        else
            result = 0;
        return result;
    }
}
exports.default = cssutil;
