"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REST = exports.isJsonObject = void 0;
const isJsonObject = (x) => { return x !== undefined && x !== null && x.constructor == Object; };
exports.isJsonObject = isJsonObject;
// 
var REST;
(function (REST) {
    let Method;
    (function (Method) {
        Method.ALL = ["GET", "HEAD", "POST", "PUT", "DELETE", "CONNECT", "OPTIONS", "TRACE", "PATCH"];
    })(Method = REST.Method || (REST.Method = {}));
    let Token;
    (function (Token) {
        let String;
        (function (String) {
            function check(token) {
                const splitted = token.split(" ");
                if (splitted.length != 2)
                    return false;
                if (!["bearer", "token"].includes(splitted[0]))
                    return false;
                return true;
            }
            String.check = check;
        })(String = Token.String || (Token.String = {}));
        function stringify(token) {
            if (typeof token == "string")
                return token;
            return `${token.type} ${token.value}`;
        }
        Token.stringify = stringify;
        function json(token) {
            if (typeof token == "object")
                return token;
            const splitted = token.split(" ");
            return {
                type: splitted.shift(),
                value: splitted.join(" ")
            };
        }
        Token.json = json;
    })(Token = REST.Token || (REST.Token = {}));
    let Request;
    (function (Request) {
        function isCORSPreflight(request) {
            return (request.method == "OPTIONS"
                && request.headers.has("Access-Control-Request-Method")
                && request.headers.has("Access-Control-Request-Headers"));
        }
        Request.isCORSPreflight = isCORSPreflight;
        function authtoken(request) {
            const token = request.headers.get("Authorization");
            if (!token)
                return null;
            if (!token || !REST.Token.String.check(token))
                return null;
            return token;
        }
        Request.authtoken = authtoken;
    })(Request = REST.Request || (REST.Request = {}));
    let Response;
    (function (Response) {
        Response.isJson = (x) => {
            return ((0, exports.isJsonObject)(x)
                && ((0, exports.isJsonObject)(x.body) || x.body === undefined)
                && (typeof x.code === "number" || x.code === undefined)
                && (typeof x.status === "string" || x.status === undefined)
                && ((0, exports.isJsonObject)(x.headers) || x.headers === undefined));
        };
        function fromJson(json) {
            let headers = json.headers;
            if (headers) {
                Object.keys(headers).forEach(key => {
                    if (typeof headers[key] === "undefined")
                        delete headers[key];
                });
            }
            return new globalThis.Response(json.body === undefined || json.body === null ? "" : JSON.stringify(json.body, null, 2), {
                status: json.code,
                statusText: json.status,
                headers: json.headers
            });
        }
        Response.fromJson = fromJson;
        let Code;
        (function (Code) {
            function isValid(code) { return parseInt("" + code) == code; }
            Code.isValid = isValid;
            function isInformation(code) { return Object.values(INFORMATION).includes(code); }
            Code.isInformation = isInformation;
            function isSuccess(code) { return Object.values(SUCCESS).includes(code); }
            Code.isSuccess = isSuccess;
            function isClientError(code) { return Object.values(CLIENT_ERROR).includes(code); }
            Code.isClientError = isClientError;
            function isServerError(code) { return Object.values(SERVER_ERROR).includes(code); }
            Code.isServerError = isServerError;
            // 
            let INFORMATION;
            (function (INFORMATION) {
                INFORMATION.CONTINUE = 100;
                INFORMATION.SWITCHING_PROTOCOLS = 101;
                INFORMATION.PROCESSING = 102;
                INFORMATION.EARLY_HINTS = 103;
            })(INFORMATION = Code.INFORMATION || (Code.INFORMATION = {}));
            // 
            let SUCCESS;
            (function (SUCCESS) {
                SUCCESS.OK = 200;
                SUCCESS.CREATED = 201;
                SUCCESS.ACCEPTED = 202;
                SUCCESS.NON_AUTHORITATIVE_INFORMATION = 203;
                SUCCESS.NO_CONTENT = 204;
                SUCCESS.RESET_CONTENT = 205;
                SUCCESS.PARTIAL_CONTENT = 206;
                SUCCESS.MULTI_STATUS = 207;
                SUCCESS.ALREADY_REPORTED = 208;
                SUCCESS.CONTENT_DIFFERENT = 210;
                SUCCESS.IM_USED = 226;
            })(SUCCESS = Code.SUCCESS || (Code.SUCCESS = {}));
            // 
            let REDIRECTION;
            (function (REDIRECTION) {
                REDIRECTION.MULTPILE_CHOICES = 300;
                REDIRECTION.MOVED_PERMANENTLY = 301;
                REDIRECTION.FOUND = 302;
                REDIRECTION.SEE_OTHER = 303;
                REDIRECTION.NOT_MODIFIED = 304;
                REDIRECTION.USE_PROXY = 305;
                REDIRECTION.USELESS = 306;
                REDIRECTION.TEMPORARY_REDIRECT = 307;
                REDIRECTION.PERMANENT_REDIRECT = 308;
                REDIRECTION.TOO_MANY_REDIRECTS = 310;
            })(REDIRECTION = Code.REDIRECTION || (Code.REDIRECTION = {}));
            // 
            let CLIENT_ERROR;
            (function (CLIENT_ERROR) {
                CLIENT_ERROR.BAD_REQUEST = 400;
                CLIENT_ERROR.UNAUTHORIZED = 401;
                CLIENT_ERROR.PAYMENT_REQUIRED = 402;
                CLIENT_ERROR.FORBIDDEN = 403;
                CLIENT_ERROR.NOT_FOUND = 404;
                CLIENT_ERROR.METHOD_NOT_ALLOWED = 405;
                CLIENT_ERROR.NOT_ACCEPTABLE = 406;
                CLIENT_ERROR.PROXY_AUTHENTICATION_REQUIRED = 407;
                CLIENT_ERROR.REQUEST_TIMEOUT = 408;
                CLIENT_ERROR.CONFLICT = 409;
                CLIENT_ERROR.GONE = 410;
                CLIENT_ERROR.LENGTH_REQUIRED = 411;
                CLIENT_ERROR.PRECONDITION_FAILED = 412;
                CLIENT_ERROR.REQUEST_ENTITY_TOO_LARGE = 413;
                CLIENT_ERROR.REQUEST_URI_TOO_LONG = 414;
                CLIENT_ERROR.UNSUPPORTED_MEDIA_TYPE = 415;
                CLIENT_ERROR.REQUESTED_RANGE_UNSATISFIABLE = 416;
                CLIENT_ERROR.EXPECTATION_FAILED = 417;
                CLIENT_ERROR.IM_A_TEAPOT = 418;
                CLIENT_ERROR.PAGE_EXPIRED = 419;
                CLIENT_ERROR.MISDIRECTED_REQUEST = 421;
                CLIENT_ERROR.UNPROCESSABLE_ENTITY = 422;
                CLIENT_ERROR.LOCKED = 423;
                CLIENT_ERROR.METHOD_FAILURE = 424;
                CLIENT_ERROR.TOO_EARLY = 425;
                CLIENT_ERROR.UPGRADE_REQUIRED = 426;
                CLIENT_ERROR.PRECONDITION_REQUIRED = 428;
                CLIENT_ERROR.TOO_MANY_REQUESTS = 429;
                CLIENT_ERROR.REQUEST_HEADER_FIELDS_TOO_LARGE = 431;
                CLIENT_ERROR.RETRY_WITH = 449;
                CLIENT_ERROR.BLOCKED_BY_WINDOWS_PARENTAL_CONTROLS = 450;
                CLIENT_ERROR.UNAVAILABLE_FOR_LEGAL_REASONS = 451;
                CLIENT_ERROR.UNRECOVERABLE_ERROR = 456;
            })(CLIENT_ERROR = Code.CLIENT_ERROR || (Code.CLIENT_ERROR = {}));
            // 
            let SERVER_ERROR;
            (function (SERVER_ERROR) {
                SERVER_ERROR.INTERNAL_SERVER_ERROR = 500;
                SERVER_ERROR.NOT_IMPLEMENTED = 501;
                SERVER_ERROR.BAD_GATEWAY = 502;
                SERVER_ERROR.SERVICE_UNAVAILABLE = 503;
                SERVER_ERROR.GATEWAY_TIMEOUT = 504;
                SERVER_ERROR.HTTP_VERSION_NOT_SUPPORTED = 505;
                SERVER_ERROR.VARIANT_ALSO_NEGOTIATES = 506;
                SERVER_ERROR.INSUFFICIENT_STORAGE = 507;
                SERVER_ERROR.LOOP_DETECTED = 508;
                SERVER_ERROR.BANDWIDTH_LIMIT_EXCEEDED = 509;
                SERVER_ERROR.NOT_EXTENDED = 510;
                SERVER_ERROR.NETWORK_AUTHENTICATION_REQUIRED = 511;
                SERVER_ERROR.UNKNOWN_ERROR = 520;
                SERVER_ERROR.WEB_SERVER_IS_DOWN = 521;
                SERVER_ERROR.CONNECTION_TIMED_OUT = 522;
                SERVER_ERROR.ORIGIN_IS_UNREACHABLE = 523;
                SERVER_ERROR.A_TIMEOUT_OCCURRED = 524;
                SERVER_ERROR.SSL_HANDSHAKE_FAILED = 525;
                SERVER_ERROR.INVALID_SSL_CERTIFICATE = 526;
                SERVER_ERROR.RAILGUN_ERROR = 527;
            })(SERVER_ERROR = Code.SERVER_ERROR || (Code.SERVER_ERROR = {}));
        })(Code = Response.Code || (Response.Code = {}));
    })(Response = REST.Response || (REST.Response = {}));
})(REST || (exports.REST = REST = {}));
