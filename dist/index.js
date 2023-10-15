"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_server_1 = __importDefault(require("./api-server"));
const locale_1 = __importDefault(require("./locale"));
// 
(async () => {
    await locale_1.default.initialize();
    // 
    api_server_1.default.listen(1024 + 106);
})();
