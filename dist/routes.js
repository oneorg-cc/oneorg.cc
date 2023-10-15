"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoutes = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const router_1 = require("./shared/utils/router");
// 
function getRoutes(root) {
    let result = new Array();
    let filenames = fs.readdirSync(root);
    for (let i = 0; i < filenames.length; ++i) {
        let filename = filenames[i];
        let filepath = path.join(root, filename);
        if (fs.statSync(filepath).isDirectory())
            result = result.concat(getRoutes(filepath));
        else if (path.extname(filepath) == ".js") {
            let route = require(filepath);
            route = route.default ? route.default : route;
            if (router_1.Route.isValid(route))
                result.push(route);
        }
    }
    return result;
}
exports.getRoutes = getRoutes;
