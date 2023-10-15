"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// 
class Files {
    static mkdirs(directory) {
        if (fs_1.default.existsSync(directory))
            return;
        const parent = path_1.default.dirname(directory);
        if (!fs_1.default.existsSync(parent))
            this.mkdirs(parent);
        fs_1.default.mkdirSync(directory);
    }
}
exports.default = Files;
