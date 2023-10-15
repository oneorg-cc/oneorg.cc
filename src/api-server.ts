import Locale from "./locale";
import { REST } from "./shared/utils/api/types";

// 

import * as http from "http";

// 

const apiserver = http.createServer(async (req, res) => {
    let url = new URL(req.url || "", `http://${req.headers.host}`);
    
    let request_headers: REST.Headers.Request = {};

    Object.keys(req.headers).forEach(k => {
        let value = req.headers[k];
        if(value instanceof Array)
            value = value.join("; ");

        (request_headers as any)[k.split("-").map(v => v.substring(0, 1).toUpperCase() + v.substring(1)).join("-")] = value;
    });

    // 

    let hostname = request_headers["Host"]?.split(":").shift();
    if(!Locale.config.hostnames.includes(hostname as any)) return;

    // 

    let data = Buffer.from([]);
    await new Promise((resolve, reject) => {
        req.on("close", () => { resolve(true); });
        req.on("data", d => { data = Buffer.concat([data, d]); });
    });

    let request = new Request(url, {
        method: req.method,
        headers: request_headers as any,
        body: data.length > 0 ? data : undefined
    });

    // 

    let response = await Locale.router.handle(request.clone(), { logs: true });
    if(!response) { res.end(500); return; }
    response = response.clone();

    // 

    res.statusCode = response.status;
    res.statusMessage = response.statusText;
    
    response.headers.forEach((value, key) => {
        if(!response) return;
        if(value !== null && value !== undefined) res.setHeader(key, value);
    });

    // 

    const response_body = await response.arrayBuffer();
    if(response_body.byteLength > 0)
        res.write(Buffer.from(response_body));
    
    // 

    res.end();
});

// 

export default apiserver;