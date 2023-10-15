"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZoneConfiguration = void 0;
// 
var ZoneConfiguration;
(function (ZoneConfiguration) {
    function isValid(configuration) {
        return (configuration.main
            && configuration.main.records instanceof Array
            && typeof configuration.main.origin === "string"
            && typeof configuration.main.ttl === "number"
            && typeof configuration.main.header === "string");
    }
    ZoneConfiguration.isValid = isValid;
})(ZoneConfiguration || (exports.ZoneConfiguration = ZoneConfiguration = {}));
