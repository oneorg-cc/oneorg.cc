import { Json, REST } from "./api/types.js";

// 

type EndpointString<
    P extends REST.Endpoint.Parameters,
    Q extends REST.Endpoint.Queries,
    H extends REST.Endpoint.Headers,
    B extends REST.Endpoint.Body
> = `${REST.Method} ${string}`;

export class Endpoint<
    P extends REST.Endpoint.Parameters,
    Q extends REST.Endpoint.Queries,
    H extends REST.Endpoint.Headers,
    B extends REST.Endpoint.Body
> {

    #method: REST.Method;
    #uri: string;
    
    // 

    constructor(method: REST.Method, uri: string) {
        this.#method = method;
        this.#uri = uri;
    }

    // 
    
    get method() { return this.#method; }

    get uri() { return this.#uri; }

    // 

    static fromString<
        P extends REST.Endpoint.Parameters,
        Q extends REST.Endpoint.Queries,
        H extends REST.Endpoint.Headers,
        B extends REST.Endpoint.Body
    >(endpoint: EndpointString<P, Q, H, B>): Endpoint<P, Q, H, B> {
        let endpoint_split = endpoint.split(" ");
        return new Endpoint(endpoint_split.shift() as REST.Method, endpoint_split.join(" "));
    }

}

// 

type PartialRequestOptions<
    P extends REST.Endpoint.Parameters,
    Q extends REST.Endpoint.Queries,
    H extends REST.Endpoint.Headers,
    B extends REST.Endpoint.Body
> = {
    parameters?: P,
    queries?: Q,
    headers?: H,
    body?: B,
    token?: REST.Token.Json | REST.Token.String
};

type RequestOptions<
    P extends REST.Endpoint.Parameters,
    Q extends REST.Endpoint.Queries,
    H extends REST.Endpoint.Headers,
    B extends REST.Endpoint.Body
> = {
    parameters: P,
    queries: Q,
    headers: H,
    body: B,
    token: REST.Token.Json | undefined
};

type RequestHandler = (
    endpoint: Endpoint<REST.Endpoint.Parameters, REST.Endpoint.Queries, REST.Endpoint.Headers, REST.Endpoint.Body>,
    options: RequestOptions<REST.Endpoint.Parameters, REST.Endpoint.Queries, REST.Endpoint.Headers, REST.Endpoint.Body>
) => (void | Promise<void>);

// 

type Response<
    H extends REST.Endpoint.Headers,
    B extends REST.Endpoint.Body
> = {
    debug: {
        request: {
            url: URL,
            method: REST.Method,
            headers: H,
            body: B
        }
    },
    headers: REST.Headers.Response,
    code: number,
    status: string,
    result: {
        data: ArrayBuffer,
        text: string,
        json: {[k: string]: any}
    }
}

// 

export default class ApiUtil {

    #root: string;
    #onrequest: RequestHandler;

    // 

    constructor(root: string, onrequest: RequestHandler) {
        this.#root = root;
        this.#onrequest = onrequest;
    }

    // 

    get root() { return this.#root; }
    
    get onrequest() { return this.#onrequest; }

    // 

    async request<
        P extends REST.Endpoint.Parameters,
        Q extends REST.Endpoint.Queries,
        H extends REST.Endpoint.Headers,
        B extends REST.Endpoint.Body
    >(
        endpoint: EndpointString<P, Q, H, B> | Endpoint<P, Q, H, B>,
        options?: PartialRequestOptions<P, Q, H, B>
    ): Promise<Response<H, B> | null> {
        let opt: RequestOptions<P, Q, H, B> = options || {} as any;
        options = options || {};

        opt.parameters = options.parameters || {} as any;
        opt.queries = options.queries || {} as any;
        opt.headers = options.headers || {} as any;

        opt.token = typeof options.token == "string" ? REST.Token.fromString(options.token) : options.token;

        // 

        if(!opt.headers["User-Agent"])
            (opt.headers as any)["User-Agent"] = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36";

        if(!opt.headers["Content-Type"])
            (opt.headers as any)["Content-Type"] = "application/json; charset=utf-8";

        if(!opt.headers["Authorization"] && opt.token)
            (opt.headers as any)["Authorization"] = opt.token.type + " " + opt.token.value;

        // 

        if(typeof opt.body == "object")
            opt.body = JSON.stringify(opt.body) as any;

        // 

        if(typeof endpoint == "string")
            endpoint = Endpoint.fromString(endpoint);

        // 

        await this.onrequest(endpoint, opt);

        // 

        let uri = endpoint.uri;

        Object.keys(opt.parameters).forEach(k => {
            uri = uri.replace(new RegExp("\\{" + k + "\\}"),  opt.parameters[k]);
        });

        // 

        let url: URL;
        try { url = new URL(uri); }
        catch(e) {
            let _uri = this.root.endsWith("/") && uri.startsWith("/") ? uri.substring(1) : uri;
            url = new URL(this.root + _uri);
        }

        // 

        Object.keys(opt.queries).forEach(k => {
            url.searchParams.set(k, opt.queries[k]);
        });

        // 

        let response: globalThis.Response | null = null;
        try {
            response = await fetch(url, {
                method: endpoint.method,
                headers: new Headers(opt.headers as HeadersInit),
                body: opt.body as any
            });
        } catch(e) {
            // console.error(e);
            throw e;
        }

        return response ? {
            debug: {
                request: {
                url: url,
                    method: endpoint.method,
                    headers: opt.headers,
                    body: opt.body
                }
            },
            headers: getJsonHeader(response.headers),
            code: response.status,
            status: response.statusText,
            result: {
                data: await response.arrayBuffer(),
                get text() { return new TextDecoder().decode(this.data); },
                get json() { return JSON.parse(this.text); }
            }
        } as Response<H, B> : null;
    }

}

function getJsonHeader(headers: Headers): Json {
    let result: {[k: string]: string} = {};

    headers.forEach((hv, hk) => {
        result[hk] = hv;
    });

    return result;
}