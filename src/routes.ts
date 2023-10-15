import * as fs from "fs";
import * as path from "path";
import { Route } from "./shared/utils/router";

// 

export function getRoutes(root: string) {
    let result = new Array<Route<any, any, any>>();

    let filenames = fs.readdirSync(root);

    for(let i = 0; i < filenames.length; ++i) {
        let filename = filenames[i];
        let filepath = path.join(root, filename);

        if(fs.statSync(filepath).isDirectory())
            result = result.concat(getRoutes(filepath));
        else if(path.extname(filepath) == ".js") {
            let route = require(filepath);
                route = route.default ? route.default : route;

            if(Route.isValid(route)) result.push(route);
        }
    }

    return result;
}