export type Json = symbol | string | number | boolean | null | undefined | {[k: symbol | string | number]: Json | Json[]} | Json[];
export interface JsonObject {
    [k: symbol | string | number]: Json | Json[]
}

export const isJsonObject = (x: any): x is JsonObject => { return x !== undefined && x !== null && x.constructor == Object; }

// 

export namespace REST {

    export type Method = "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "CONNECT" | "OPTIONS" | "TRACE" | "PATCH";

    export namespace Method {

        export const ALL: Array<Method> = [ "GET", "HEAD", "POST", "PUT", "DELETE", "CONNECT", "OPTIONS", "TRACE", "PATCH" ];

    }

    export namespace Token {

        export type Type = "bearer" | "token";

        export type String = `${Type} ${string}`;

        export type Json = { type: Type, value: string }

        export function fromString(str: String): Json {
            let splitted = str.split(" ");
            return {
                type: splitted.shift() as any,
                value: splitted.join(" ")
            };
        }

    }

    export namespace Endpoint {
        export type Parameters = {[k: string]: string};
        export type Queries = {[k: string]: string};
        export type Headers = REST.Headers.Request;
        export type Body = Json;
    }

    export namespace Response {

        export type Json<B extends JsonObject | null> = {
            body: B,
            code?: number,
            status?: string,
            headers?: REST.Headers.Response
        }

        export const isJson = <B extends JsonObject>(x: any): x is Json<B> => {
            return (
                isJsonObject(x)
                && isJsonObject(x.body)
                && (typeof x.code === "number" || x.code === undefined)
                && (typeof x.status === "string" || x.status === undefined)
                && (isJsonObject(x.Headers) || x.headers === undefined)
            );
        };

        export function fromJson<B extends JsonObject | null>(json: Json<B>) {
            return new globalThis.Response(
                JSON.stringify(json.body, null, 2),
                {
                    status: json.code,
                    statusText: json.status,
                    headers: json.headers as HeadersInit
                }
            );
        }

        export namespace Code {

            export function isValid(code: number) { return parseInt("" + code) == code; }

            export function isInformation(code: number) { return Object.values(INFORMATION).includes(code as any); }
            export function isSuccess(code: number) { return Object.values(SUCCESS).includes(code as any); }
            export function isClientError(code: number) { return Object.values(CLIENT_ERROR).includes(code as any); }
            export function isServerError(code: number) { return Object.values(SERVER_ERROR).includes(code as any); }

            // 

            export namespace INFORMATION {

                export const CONTINUE = 100;
                export const SWITCHING_PROTOCOLS = 101;
                export const PROCESSING = 102;
                export const EARLY_HINTS = 103;

            }

            // 

            export namespace SUCCESS {

                export const OK = 200;
                export const CREATED = 201;
                export const ACCEPTED = 202;
                export const NON_AUTHORITATIVE_INFORMATION = 203;
                export const NO_CONTENT = 204;
                export const RESET_CONTENT = 205;
                export const PARTIAL_CONTENT = 206;
                export const MULTI_STATUS = 207;
                export const ALREADY_REPORTED = 208;

                export const CONTENT_DIFFERENT = 210;

                export const IM_USED = 226;

            }

            // 

            export namespace REDIRECTION {

                export const MULTPILE_CHOICES = 300;
                export const MOVED_PERMANENTLY = 301;
                export const FOUND = 302;
                export const SEE_OTHER = 303;
                export const NOT_MODIFIED = 304;
                export const USE_PROXY = 305;
                export const USELESS = 306;
                export const TEMPORARY_REDIRECT = 307;
                export const PERMANENT_REDIRECT = 308;

                export const TOO_MANY_REDIRECTS = 310;

            }

            // 

            export namespace CLIENT_ERROR {

                export const BAD_REQUEST = 400;
                export const UNAUTHORIZED = 401;
                export const PAYMENT_REQUIRED = 402;
                export const FORBIDDEN = 403;
                export const NOT_FOUND = 404;
                export const METHOD_NOT_ALLOWED = 405;
                export const NOT_ACCEPTABLE = 406;
                export const PROXY_AUTHENTICATION_REQUIRED = 407;
                export const REQUEST_TIMEOUT = 408;
                export const CONFLICT = 409;
                export const GONE = 410;
                export const LENGTH_REQUIRED = 411;
                export const PRECONDITION_FAILED = 412;
                export const REQUEST_ENTITY_TOO_LARGE = 413;
                export const REQUEST_URI_TOO_LONG = 414;
                export const UNSUPPORTED_MEDIA_TYPE = 415;
                export const REQUESTED_RANGE_UNSATISFIABLE = 416;
                export const EXPECTATION_FAILED = 417;
                export const IM_A_TEAPOT = 418;
                export const PAGE_EXPIRED = 419;

                export const MISDIRECTED_REQUEST = 421;
                export const UNPROCESSABLE_ENTITY = 422;
                export const LOCKED = 423;
                export const METHOD_FAILURE = 424;
                export const TOO_EARLY = 425;
                export const UPGRADE_REQUIRED = 426;
                export const PRECONDITION_REQUIRED = 428;
                export const TOO_MANY_REQUESTS = 429;

                export const REQUEST_HEADER_FIELDS_TOO_LARGE = 431;

                export const RETRY_WITH = 449;
                export const BLOCKED_BY_WINDOWS_PARENTAL_CONTROLS = 450;
                export const UNAVAILABLE_FOR_LEGAL_REASONS = 451;

                export const UNRECOVERABLE_ERROR = 456;

            }

            // 

            export namespace SERVER_ERROR {

                export const INTERNAL_SERVER_ERROR = 500;
                export const NOT_IMPLEMENTED = 501;
                export const BAD_GATEWAY = 502;
                export const SERVICE_UNAVAILABLE = 503;
                export const GATEWAY_TIMEOUT = 504;
                export const HTTP_VERSION_NOT_SUPPORTED = 505;
                export const VARIANT_ALSO_NEGOTIATES = 506;
                export const INSUFFICIENT_STORAGE = 507;
                export const LOOP_DETECTED = 508;
                export const BANDWIDTH_LIMIT_EXCEEDED = 509;
                export const NOT_EXTENDED = 510;
                export const NETWORK_AUTHENTICATION_REQUIRED = 511;

                export const UNKNOWN_ERROR = 520;
                export const WEB_SERVER_IS_DOWN = 521;
                export const CONNECTION_TIMED_OUT = 522;
                export const ORIGIN_IS_UNREACHABLE = 523;
                export const A_TIMEOUT_OCCURRED = 524;
                export const SSL_HANDSHAKE_FAILED = 525;
                export const INVALID_SSL_CERTIFICATE = 526;
                export const RAILGUN_ERROR = 527;

            }

        }

    }

    export namespace Headers {
        export type Request = {
            "A-IM"?: string,
            "Accept"?: string,
            "Accept-Charset"?: string,
            "Accept-Datetime"?: string,
            "Accept-Encoding"?: string,
            "Accept-Language"?: string,
            "Access-Control-Request-Method"?: string,
            "Access-Control-Request-Headers"?: string,
            "Authorization"?: string,
            "Cache-Control"?: string,
            "Connection"?: string,
            "Content-Encoding"?: string,
            "Content-Length"?: string,
            "Content-MD5"?: string,
            "Content-Type"?: string,
            "Cookie"?: string,
            "Date"?: string,
            "Expect"?: string,
            "Forwarded"?: string,
            "From"?: string,
            "Host"?: string,
            "HTTP2-Settings"?: string,
            "If-Match"?: string,
            "If-Modified-Since"?: string,
            "If-None-Match"?: string,
            "If-Range"?: string,
            "If-Unmodified-Since"?: string,
            "Max-Forwards"?: string,
            "Origin"?: string,
            "Pragma"?: string,
            "Prefer"?: string,
            "Proxy-Authorization"?: string,
            "Range"?: string,
            "Referer"?: string,
            "TE"?: string,
            "Trailer"?: string,
            "Transfer-Encoding"?: string,
            "User-Agent"?: string,
            "Upgrade"?: string,
            "Via"?: string,
            "Warning"?: string,
            "Upgrade-Insecure-Requests"?: string,
            "X-Requested-With"?: string,
            "DNT"?: string,
            "X-Forwarded-For"?: string,
            "X-Forwarded-Host"?: string,
            "X-Forwarded-Proto"?: string,
            "Front-End-Https"?: string,
            "X-Http-Method-Override"?: string,
            "X-ATT-DeviceId"?: string,
            "X-Wap-Profile"?: string,
            "Proxy-Connection"?: string,
            "X-UIDH"?: string,
            "X-Csrf-Token"?: string,
            "X-Request-ID"?: string,
            "X-Correlation-ID"?: string,
            "Correlation-ID"?: string,
            "Save-Data"?: string,
            "Sec-GPC"?: string
        } & Json;

        export type Response = {
            "Accept-CH"?: string,
            "Access-Control-Allow-Origin"?: string,
            "Access-Control-Allow-Credentials"?: string,
            "Access-Control-Expose-Headers"?: string,
            "Access-Control-Max-Age"?: string,
            "Access-Control-Allow-Methods"?: string,
            "Access-Control-Allow-Headers"?: string,
            "Accept-Patch"?: string,
            "Accept-Ranges"?: string,
            "Age"?: string,
            "Allow"?: string,
            "Alt-Svc"?: string,
            "Cache-Control"?: string,
            "Connection"?: string,
            "Content-Disposition"?: string,
            "Content-Encoding"?: string,
            "Content-Language"?: string,
            "Content-Length"?: string,
            "Content-Location"?: string,
            "Content-MD5"?: string,
            "Content-Range"?: string,
            "Content-Type"?: string,
            "Date"?: string,
            "Delta-Base"?: string,
            "ETag"?: string,
            "Expires"?: string,
            "IM"?: string,
            "Last-Modified"?: string,
            "Link"?: string,
            "Location"?: string,
            "P3P"?: string,
            "Pragma"?: string,
            "Preference-Applied"?: string,
            "Proxy-Authenticate"?: string,
            "Public-Key-Pins"?: string,
            "Retry-After"?: string,
            "Server"?: string,
            "Set-Cookie"?: string,
            "Strict-Transport-Security"?: string,
            "Trailer"?: string,
            "Transfer-Encoding"?: string,
            "Tk"?: string,
            "Upgrade"?: string,
            "Vary"?: string,
            "Via"?: string,
            "Warning"?: string,
            "WWW-Authenticate"?: string,
            "X-Frame-Options"?: string,
            "Content-Security-Policy"?: string,
            "X-Content-Security-Policy"?: string,
            "X-WebKit-CSP"?: string,
            "Expect-CT"?: string,
            "NEL"?: string,
            "Permissions-Policy"?: string,
            "Refresh"?: string,
            "Report-To"?: string,
            "Status"?: string,
            "Timing-Allow-Origin"?: string,
            "X-Content-Duration"?: string,
            "X-Content-Type-Options"?: string,
            "X-Powered-By"?: string,
            "X-Redirect-By"?: string,
            "X-Request-ID"?: string,
            "X-Correlation-ID"?: string,
            "X-UA-Compatible"?: string,
            "X-XSS-Protection"?: string
        } & Json;
    }

    export namespace Github {

        export namespace Repository {

            export type StrictObjectType = "file" | "dir" | "symlink" | "submodule";

            export type ObjectType = "any" | StrictObjectType;

            export type Object<T extends ObjectType = "any"> = {
                type: StrictObjectType,
                size: number,
                name: string,
                path: string,
                sha: string,
                
                url: string,
                git_url: string,
                html_url: string,
                download_url: string,
                
                _links: {
                    git: string,
                    self: string,
                    html: string
                },
                
                encoding?: T extends "any" ? "base64" | "none" : T extends "file" ? "base64" | "none" : undefined,
                content?: T extends "any" ? string : T extends "file" ? string : undefined,

                target?: T extends "any" ? string : T extends "symlink" ? string : undefined,
                submodule_git_url?: T extends "any" ? string : T extends "submodule" ? string : undefined

                entries?: T extends "any" ? Array<REST.Github.Repository.Object> : T extends "dir" ? Array<REST.Github.Repository.Object> : undefined
            }

        }

    }

}