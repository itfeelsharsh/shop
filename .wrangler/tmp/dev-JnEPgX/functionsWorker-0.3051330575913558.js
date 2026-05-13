var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/pages-lN4gRn/functionsWorker-0.3051330575913558.mjs
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var __export = /* @__PURE__ */ __name((target, all) => {
  for (var name in all)
    __defProp2(target, name, { get: all[name], enumerable: true });
}, "__export");
var DEFAULT_BASE_ADDRESSES = {
  api: "api.stripe.com",
  files: "files.stripe.com",
  connect: "connect.stripe.com",
  meter_events: "meter-events.stripe.com"
};
function queryStringifyRequestData(data) {
  return stringifyRequestData(data);
}
__name(queryStringifyRequestData, "queryStringifyRequestData");
__name2(queryStringifyRequestData, "queryStringifyRequestData");
function encodeQueryValue(value) {
  return encodeURIComponent(value).replace(/!/g, "%21").replace(/\*/g, "%2A").replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/'/g, "%27").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
__name(encodeQueryValue, "encodeQueryValue");
__name2(encodeQueryValue, "encodeQueryValue");
function valueToString(value) {
  if (value instanceof Date) {
    return Math.floor(value.getTime() / 1e3).toString();
  }
  if (value === null) {
    return "";
  }
  return String(value);
}
__name(valueToString, "valueToString");
__name2(valueToString, "valueToString");
function stringifyRequestData(data) {
  const pairs = [];
  function encode(key, value) {
    if (value === void 0) {
      return;
    }
    if (value === null || typeof value !== "object" || value instanceof Date) {
      pairs.push(encodeQueryValue(key) + "=" + encodeQueryValue(valueToString(value)));
      return;
    }
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        if (value[i] !== void 0) {
          encode(key + "[" + i + "]", value[i]);
        }
      }
      return;
    }
    for (const k of Object.keys(value)) {
      encode(key + "[" + k + "]", value[k]);
    }
  }
  __name(encode, "encode");
  __name2(encode, "encode");
  if (typeof data === "object" && data !== null) {
    for (const key of Object.keys(data)) {
      encode(key, data[key]);
    }
  }
  return pairs.join("&");
}
__name(stringifyRequestData, "stringifyRequestData");
__name2(stringifyRequestData, "stringifyRequestData");
var makeURLInterpolator = /* @__PURE__ */ (() => {
  const rc = {
    "\n": "\\n",
    '"': '\\"',
    "\u2028": "\\u2028",
    "\u2029": "\\u2029"
  };
  return (str) => {
    const cleanString = str.replace(/["\n\r\u2028\u2029]/g, ($0) => rc[$0]);
    return (outputs) => {
      return cleanString.replace(/\{([\s\S]+?)\}/g, ($0, $1) => {
        const output = outputs[$1];
        if (isValidEncodeUriComponentType(output))
          return encodeURIComponent(output);
        return "";
      });
    };
  };
})();
function isValidEncodeUriComponentType(value) {
  return ["number", "string", "boolean"].includes(typeof value);
}
__name(isValidEncodeUriComponentType, "isValidEncodeUriComponentType");
__name2(isValidEncodeUriComponentType, "isValidEncodeUriComponentType");
function processOptions(options) {
  const result = {
    authenticator: null,
    headers: {},
    settings: {},
    streaming: false,
    apiBase: null
  };
  if (!options) {
    return result;
  }
  if (options.apiKey) {
    result.authenticator = createApiKeyAuthenticator(options.apiKey);
  }
  if (options.idempotencyKey) {
    result.headers["Idempotency-Key"] = options.idempotencyKey;
  }
  if (options.stripeAccount) {
    result.headers["Stripe-Account"] = options.stripeAccount;
  }
  if (options.stripeContext) {
    if (result.headers["Stripe-Account"]) {
      throw new Error("Can't specify both stripeAccount and stripeContext.");
    }
    result.headers["Stripe-Context"] = options.stripeContext;
  }
  if (options.apiVersion) {
    result.headers["Stripe-Version"] = options.apiVersion;
  }
  if (Number.isInteger(options.maxNetworkRetries)) {
    result.settings.maxNetworkRetries = options.maxNetworkRetries;
  }
  if (Number.isInteger(options.timeout)) {
    result.settings.timeout = options.timeout;
  }
  if (options.authenticator) {
    if (options.apiKey) {
      throw new Error("Can't specify both apiKey and authenticator.");
    }
    if (typeof options.authenticator !== "function") {
      throw new Error("The authenticator must be a function receiving a request as the first parameter.");
    }
    result.authenticator = options.authenticator;
  }
  if (options.headers) {
    Object.assign(result.headers, options.headers);
  }
  if (options.streaming) {
    result.streaming = true;
  }
  return result;
}
__name(processOptions, "processOptions");
__name2(processOptions, "processOptions");
function removeNullish(obj) {
  if (typeof obj !== "object") {
    throw new Error("Argument must be an object");
  }
  return Object.keys(obj).reduce((result, key) => {
    if (obj[key] != null) {
      result[key] = obj[key];
    }
    return result;
  }, {});
}
__name(removeNullish, "removeNullish");
__name2(removeNullish, "removeNullish");
function normalizeHeaders(obj) {
  if (!(obj && typeof obj === "object")) {
    return obj;
  }
  return Object.keys(obj).reduce((result, header) => {
    result[normalizeHeader(header)] = obj[header];
    return result;
  }, {});
}
__name(normalizeHeaders, "normalizeHeaders");
__name2(normalizeHeaders, "normalizeHeaders");
function normalizeHeader(header) {
  return header.split("-").map((text) => text.charAt(0).toUpperCase() + text.substr(1).toLowerCase()).join("-");
}
__name(normalizeHeader, "normalizeHeader");
__name2(normalizeHeader, "normalizeHeader");
function pascalToCamelCase(name) {
  if (name === "OAuth") {
    return "oauth";
  } else {
    return name[0].toLowerCase() + name.substring(1);
  }
}
__name(pascalToCamelCase, "pascalToCamelCase");
__name2(pascalToCamelCase, "pascalToCamelCase");
function emitWarning(warning) {
  if (typeof process.emitWarning !== "function") {
    return console.warn(`Stripe: ${warning}`);
  }
  return process.emitWarning(warning, "Stripe");
}
__name(emitWarning, "emitWarning");
__name2(emitWarning, "emitWarning");
function isObject(obj) {
  const type = typeof obj;
  return (type === "function" || type === "object") && !!obj;
}
__name(isObject, "isObject");
__name2(isObject, "isObject");
function flattenAndStringify(data) {
  const result = {};
  const step = /* @__PURE__ */ __name2((obj, prevKey) => {
    Object.entries(obj).forEach(([key, value]) => {
      const newKey = prevKey ? `${prevKey}[${key}]` : key;
      if (isObject(value)) {
        if (!(value instanceof Uint8Array) && !Object.prototype.hasOwnProperty.call(value, "data")) {
          return step(value, newKey);
        } else {
          result[newKey] = value;
        }
      } else {
        result[newKey] = String(value);
      }
    });
  }, "step");
  step(data, null);
  return result;
}
__name(flattenAndStringify, "flattenAndStringify");
__name2(flattenAndStringify, "flattenAndStringify");
function validateInteger(name, n, defaultVal) {
  if (!Number.isInteger(n)) {
    if (defaultVal !== void 0) {
      return defaultVal;
    } else {
      throw new Error(`${name} must be an integer`);
    }
  }
  return n;
}
__name(validateInteger, "validateInteger");
__name2(validateInteger, "validateInteger");
function determineProcessUserAgentProperties() {
  return typeof process === "undefined" ? {} : {
    lang_version: process.version
  };
}
__name(determineProcessUserAgentProperties, "determineProcessUserAgentProperties");
__name2(determineProcessUserAgentProperties, "determineProcessUserAgentProperties");
var AI_AGENTS = [
  // The beginning of the section generated from our OpenAPI spec
  ["ANTIGRAVITY_CLI_ALIAS", "antigravity"],
  ["CLAUDECODE", "claude_code"],
  ["CLINE_ACTIVE", "cline"],
  ["CODEX_SANDBOX", "codex_cli"],
  ["CODEX_THREAD_ID", "codex_cli"],
  ["CODEX_SANDBOX_NETWORK_DISABLED", "codex_cli"],
  ["CODEX_CI", "codex_cli"],
  ["CURSOR_AGENT", "cursor"],
  ["GEMINI_CLI", "gemini_cli"],
  ["OPENCLAW_SHELL", "openclaw"],
  ["OPENCODE", "open_code"]
  // The end of the section generated from our OpenAPI spec
];
function detectAIAgent(env) {
  for (const [envVar, agentName] of AI_AGENTS) {
    if (env[envVar]) {
      return agentName;
    }
  }
  return "";
}
__name(detectAIAgent, "detectAIAgent");
__name2(detectAIAgent, "detectAIAgent");
function createApiKeyAuthenticator(apiKey) {
  const authenticator = /* @__PURE__ */ __name2((request) => {
    request.headers.Authorization = "Bearer " + apiKey;
    return Promise.resolve();
  }, "authenticator");
  authenticator._apiKey = apiKey;
  return authenticator;
}
__name(createApiKeyAuthenticator, "createApiKeyAuthenticator");
__name2(createApiKeyAuthenticator, "createApiKeyAuthenticator");
function dateTimeReplacer(key, value) {
  if (this[key] instanceof Date) {
    return Math.floor(this[key].getTime() / 1e3).toString();
  }
  return value;
}
__name(dateTimeReplacer, "dateTimeReplacer");
__name2(dateTimeReplacer, "dateTimeReplacer");
function jsonStringifyRequestData(data) {
  return JSON.stringify(data, dateTimeReplacer);
}
__name(jsonStringifyRequestData, "jsonStringifyRequestData");
__name2(jsonStringifyRequestData, "jsonStringifyRequestData");
function getAPIMode(path) {
  if (!path) {
    return "v1";
  }
  return path.startsWith("/v2") ? "v2" : "v1";
}
__name(getAPIMode, "getAPIMode");
__name2(getAPIMode, "getAPIMode");
function parseHttpHeaderAsString(header) {
  if (Array.isArray(header)) {
    return header.join(", ");
  }
  return String(header);
}
__name(parseHttpHeaderAsString, "parseHttpHeaderAsString");
__name2(parseHttpHeaderAsString, "parseHttpHeaderAsString");
function parseHttpHeaderAsNumber(header) {
  const number = Array.isArray(header) ? header[0] : header;
  return Number(number);
}
__name(parseHttpHeaderAsNumber, "parseHttpHeaderAsNumber");
__name2(parseHttpHeaderAsNumber, "parseHttpHeaderAsNumber");
function parseHeadersForFetch(headers) {
  return Object.entries(headers).map(([key, value]) => {
    return [key, parseHttpHeaderAsString(value)];
  });
}
__name(parseHeadersForFetch, "parseHeadersForFetch");
__name2(parseHeadersForFetch, "parseHeadersForFetch");
var CALL_SITE_MARKER = "\nOriginating from:";
function attachCallSiteToError(err, callSiteStack) {
  if (!err || !err.stack || !callSiteStack) {
    return;
  }
  const callerFrames = callSiteStack.substring(callSiteStack.indexOf("\n") + 1);
  const existingMarkerIdx = err.stack.indexOf(CALL_SITE_MARKER);
  const baseStack = existingMarkerIdx >= 0 ? err.stack.substring(0, existingMarkerIdx) : err.stack;
  err.stack = `${baseStack}${CALL_SITE_MARKER}
${callerFrames}`;
}
__name(attachCallSiteToError, "attachCallSiteToError");
__name2(attachCallSiteToError, "attachCallSiteToError");
var HttpClient = class _HttpClient {
  static {
    __name(this, "_HttpClient");
  }
  static {
    __name2(this, "HttpClient");
  }
  /** The client name used for diagnostics. */
  getClientName() {
    throw new Error("getClientName not implemented.");
  }
  makeRequest(host, port, path, method, headers, requestData, protocol, timeout) {
    throw new Error("makeRequest not implemented.");
  }
  /** Helper to make a consistent timeout error across implementations. */
  static makeTimeoutError() {
    const timeoutErr = new TypeError(_HttpClient.TIMEOUT_ERROR_CODE);
    timeoutErr.code = _HttpClient.TIMEOUT_ERROR_CODE;
    return timeoutErr;
  }
};
HttpClient.CONNECTION_CLOSED_ERROR_CODES = ["ECONNRESET", "EPIPE"];
HttpClient.TIMEOUT_ERROR_CODE = "ETIMEDOUT";
var HttpClientResponse = class {
  static {
    __name(this, "HttpClientResponse");
  }
  static {
    __name2(this, "HttpClientResponse");
  }
  constructor(statusCode, headers) {
    this._statusCode = statusCode;
    this._headers = headers;
  }
  getStatusCode() {
    return this._statusCode;
  }
  getHeaders() {
    return this._headers;
  }
  getRawResponse() {
    throw new Error("getRawResponse not implemented.");
  }
  toStream(streamCompleteCallback) {
    throw new Error("toStream not implemented.");
  }
  toJSON() {
    throw new Error("toJSON not implemented.");
  }
};
var FetchHttpClient = class _FetchHttpClient extends HttpClient {
  static {
    __name(this, "_FetchHttpClient");
  }
  static {
    __name2(this, "FetchHttpClient");
  }
  constructor(fetchFn) {
    super();
    if (!fetchFn) {
      if (!globalThis.fetch) {
        throw new Error("fetch() function not provided and is not defined in the global scope. You must provide a fetch implementation.");
      }
      fetchFn = globalThis.fetch;
    }
    if (globalThis.AbortController) {
      this._fetchFn = _FetchHttpClient.makeFetchWithAbortTimeout(fetchFn);
    } else {
      this._fetchFn = _FetchHttpClient.makeFetchWithRaceTimeout(fetchFn);
    }
  }
  static makeFetchWithRaceTimeout(fetchFn) {
    return (url, init, timeout) => {
      let pendingTimeoutId;
      const timeoutPromise = new Promise((_, reject) => {
        pendingTimeoutId = setTimeout(() => {
          pendingTimeoutId = null;
          reject(HttpClient.makeTimeoutError());
        }, timeout);
      });
      const fetchPromise = fetchFn(url, init);
      return Promise.race([fetchPromise, timeoutPromise]).finally(() => {
        if (pendingTimeoutId) {
          clearTimeout(pendingTimeoutId);
        }
      });
    };
  }
  static makeFetchWithAbortTimeout(fetchFn) {
    return async (url, init, timeout) => {
      const abort = new AbortController();
      let timeoutId = setTimeout(() => {
        timeoutId = null;
        abort.abort(HttpClient.makeTimeoutError());
      }, timeout);
      try {
        return await fetchFn(url, {
          ...init,
          signal: abort.signal
        });
      } catch (err) {
        if (err.name === "AbortError") {
          throw HttpClient.makeTimeoutError();
        } else {
          throw err;
        }
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      }
    };
  }
  /** @override. */
  getClientName() {
    return "fetch";
  }
  async makeRequest(host, port, path, method, headers, requestData, protocol, timeout) {
    const isInsecureConnection = protocol === "http";
    if (!path.startsWith("/")) {
      throw new Error(`Only relative paths are supported, got: "${path}"`);
    }
    const url = new URL(`${isInsecureConnection ? "http" : "https"}://${host}${path}`);
    url.port = port;
    const methodHasPayload = method == "POST" || method == "PUT" || method == "PATCH";
    const body = requestData || (methodHasPayload ? "" : void 0);
    const res = await this._fetchFn(url.toString(), {
      method,
      headers: parseHeadersForFetch(headers),
      body
    }, timeout);
    return new FetchHttpClientResponse(res);
  }
};
var FetchHttpClientResponse = class _FetchHttpClientResponse extends HttpClientResponse {
  static {
    __name(this, "_FetchHttpClientResponse");
  }
  static {
    __name2(this, "FetchHttpClientResponse");
  }
  constructor(res) {
    super(res.status, _FetchHttpClientResponse._transformHeadersToObject(res.headers));
    this._res = res;
  }
  getRawResponse() {
    return this._res;
  }
  toStream(streamCompleteCallback) {
    streamCompleteCallback();
    return this._res.body;
  }
  toJSON() {
    return this._res.text().then((text) => {
      try {
        return JSON.parse(text);
      } catch (e) {
        if (e instanceof Error) {
          e.rawBody = text;
        }
        throw e;
      }
    });
  }
  static _transformHeadersToObject(headers) {
    const headersObj = {};
    for (const entry of headers) {
      if (!Array.isArray(entry) || entry.length != 2) {
        throw new Error("Response objects produced by the fetch function given to FetchHttpClient do not have an iterable headers map. Response#headers should be an iterable object.");
      }
      headersObj[entry[0]] = entry[1];
    }
    return headersObj;
  }
};
var CryptoProvider = class {
  static {
    __name(this, "CryptoProvider");
  }
  static {
    __name2(this, "CryptoProvider");
  }
  /**
   * Computes a SHA-256 HMAC given a secret and a payload (encoded in UTF-8).
   * The output HMAC should be encoded in hexadecimal.
   *
   * Sample values for implementations:
   * - computeHMACSignature('', 'test_secret') => 'f7f9bd47fb987337b5796fdc1fdb9ba221d0d5396814bfcaf9521f43fd8927fd'
   * - computeHMACSignature('\ud83d\ude00', 'test_secret') => '837da296d05c4fe31f61d5d7ead035099d9585a5bcde87de952012a78f0b0c43
   */
  computeHMACSignature(payload, secret) {
    throw new Error("computeHMACSignature not implemented.");
  }
  /**
   * Asynchronous version of `computeHMACSignature`. Some implementations may
   * only allow support async signature computation.
   *
   * Computes a SHA-256 HMAC given a secret and a payload (encoded in UTF-8).
   * The output HMAC should be encoded in hexadecimal.
   *
   * Sample values for implementations:
   * - computeHMACSignature('', 'test_secret') => 'f7f9bd47fb987337b5796fdc1fdb9ba221d0d5396814bfcaf9521f43fd8927fd'
   * - computeHMACSignature('\ud83d\ude00', 'test_secret') => '837da296d05c4fe31f61d5d7ead035099d9585a5bcde87de952012a78f0b0c43
   */
  computeHMACSignatureAsync(payload, secret) {
    throw new Error("computeHMACSignatureAsync not implemented.");
  }
  /**
   * Computes a SHA-256 hash of the data.
   */
  computeSHA256Async(data) {
    throw new Error("computeSHA256 not implemented.");
  }
};
var CryptoProviderOnlySupportsAsyncError = class extends Error {
  static {
    __name(this, "CryptoProviderOnlySupportsAsyncError");
  }
  static {
    __name2(this, "CryptoProviderOnlySupportsAsyncError");
  }
};
var SubtleCryptoProvider = class extends CryptoProvider {
  static {
    __name(this, "SubtleCryptoProvider");
  }
  static {
    __name2(this, "SubtleCryptoProvider");
  }
  constructor(subtleCrypto) {
    super();
    this.subtleCrypto = subtleCrypto || crypto.subtle;
  }
  /** @override */
  computeHMACSignature(payload, secret) {
    throw new CryptoProviderOnlySupportsAsyncError("SubtleCryptoProvider cannot be used in a synchronous context.");
  }
  /** @override */
  async computeHMACSignatureAsync(payload, secret) {
    const encoder = new TextEncoder();
    const key = await this.subtleCrypto.importKey("raw", encoder.encode(secret), {
      name: "HMAC",
      hash: { name: "SHA-256" }
    }, false, ["sign"]);
    const signatureBuffer = await this.subtleCrypto.sign("hmac", key, encoder.encode(payload));
    const signatureBytes = new Uint8Array(signatureBuffer);
    const signatureHexCodes = new Array(signatureBytes.length);
    for (let i = 0; i < signatureBytes.length; i++) {
      signatureHexCodes[i] = byteHexMapping[signatureBytes[i]];
    }
    return signatureHexCodes.join("");
  }
  /** @override */
  async computeSHA256Async(data) {
    return new Uint8Array(await this.subtleCrypto.digest("SHA-256", data));
  }
};
var byteHexMapping = new Array(256);
for (let i = 0; i < byteHexMapping.length; i++) {
  byteHexMapping[i] = i.toString(16).padStart(2, "0");
}
var PlatformFunctions = class {
  static {
    __name(this, "PlatformFunctions");
  }
  static {
    __name2(this, "PlatformFunctions");
  }
  constructor() {
    this._fetchFn = null;
    this._agent = null;
  }
  /**
   * Returns platform info string for telemetry, or null if unavailable.
   */
  getPlatformInfo() {
    return null;
  }
  /**
   * Generates a v4 UUID. See https://stackoverflow.com/a/2117523
   */
  uuid4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === "x" ? r : r & 3 | 8;
      return v.toString(16);
    });
  }
  /**
   * Compares strings in constant time.
   */
  secureCompare(a, b) {
    if (a.length !== b.length) {
      return false;
    }
    const len = a.length;
    let result = 0;
    for (let i = 0; i < len; ++i) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }
  /**
   * Creates an event emitter.
   */
  createEmitter() {
    throw new Error("createEmitter not implemented.");
  }
  /**
   * Checks if the request data is a stream. If so, read the entire stream
   * to a buffer and return the buffer.
   */
  tryBufferData(data) {
    throw new Error("tryBufferData not implemented.");
  }
  /**
   * Creates an HTTP client which uses the Node `http` and `https` packages
   * to issue requests.
   */
  createNodeHttpClient(agent) {
    throw new Error("createNodeHttpClient not implemented.");
  }
  /**
   * Creates an HTTP client for issuing Stripe API requests which uses the Web
   * Fetch API.
   *
   * A fetch function can optionally be passed in as a parameter. If none is
   * passed, will default to the default `fetch` function in the global scope.
   */
  createFetchHttpClient(fetchFn) {
    return new FetchHttpClient(fetchFn);
  }
  /**
   * Creates an HTTP client using runtime-specific APIs.
   */
  createDefaultHttpClient() {
    throw new Error("createDefaultHttpClient not implemented.");
  }
  /**
   * Creates a CryptoProvider which uses the Node `crypto` package for its computations.
   */
  createNodeCryptoProvider() {
    throw new Error("createNodeCryptoProvider not implemented.");
  }
  /**
   * Creates a CryptoProvider which uses the SubtleCrypto interface of the Web Crypto API.
   */
  createSubtleCryptoProvider(subtleCrypto) {
    return new SubtleCryptoProvider(subtleCrypto);
  }
  createDefaultCryptoProvider() {
    throw new Error("createDefaultCryptoProvider not implemented.");
  }
};
var _StripeEvent = class extends Event {
  static {
    __name(this, "_StripeEvent");
  }
  static {
    __name2(this, "_StripeEvent");
  }
  constructor(eventName, data) {
    super(eventName);
    this.data = data;
  }
};
var StripeEmitter = class {
  static {
    __name(this, "StripeEmitter");
  }
  static {
    __name2(this, "StripeEmitter");
  }
  constructor() {
    this.eventTarget = new EventTarget();
    this.listenerMapping = /* @__PURE__ */ new Map();
  }
  on(eventName, listener) {
    const listenerWrapper = /* @__PURE__ */ __name2((event) => {
      listener(event.data);
    }, "listenerWrapper");
    this.listenerMapping.set(listener, listenerWrapper);
    return this.eventTarget.addEventListener(eventName, listenerWrapper);
  }
  removeListener(eventName, listener) {
    const listenerWrapper = this.listenerMapping.get(listener);
    this.listenerMapping.delete(listener);
    return this.eventTarget.removeEventListener(eventName, listenerWrapper);
  }
  once(eventName, listener) {
    const listenerWrapper = /* @__PURE__ */ __name2((event) => {
      listener(event.data);
    }, "listenerWrapper");
    this.listenerMapping.set(listener, listenerWrapper);
    return this.eventTarget.addEventListener(eventName, listenerWrapper, {
      once: true
    });
  }
  emit(eventName, data) {
    return this.eventTarget.dispatchEvent(new _StripeEvent(eventName, data));
  }
};
var WebPlatformFunctions = class extends PlatformFunctions {
  static {
    __name(this, "WebPlatformFunctions");
  }
  static {
    __name2(this, "WebPlatformFunctions");
  }
  /** @override */
  createEmitter() {
    return new StripeEmitter();
  }
  /** @override */
  tryBufferData(data) {
    if (data.file.data instanceof ReadableStream) {
      throw new Error("Uploading a file as a stream is not supported in non-Node environments. Please open or upvote an issue at github.com/stripe/stripe-node if you use this, detailing your use-case.");
    }
    return Promise.resolve(data);
  }
  /** @override */
  createNodeHttpClient() {
    throw new Error("Stripe: `createNodeHttpClient()` is not available in non-Node environments. Please use `createFetchHttpClient()` instead.");
  }
  /** @override */
  createDefaultHttpClient() {
    return super.createFetchHttpClient();
  }
  /** @override */
  createNodeCryptoProvider() {
    throw new Error("Stripe: `createNodeCryptoProvider()` is not available in non-Node environments. Please use `createSubtleCryptoProvider()` instead.");
  }
  /** @override */
  createDefaultCryptoProvider() {
    return this.createSubtleCryptoProvider();
  }
};
var ROUNDING_PRESETS = {
  "ubb-usage-count": { mode: "significant-figures", value: 15 },
  "v1-api": { mode: "decimal-places", value: 12 }
};
var PLAIN_NOTATION_DIGIT_LIMIT = 30;
var MAX_EXPONENT = 1e6;
var DecimalImpl = class _DecimalImpl {
  static {
    __name(this, "_DecimalImpl");
  }
  static {
    __name2(this, "DecimalImpl");
  }
  /**
   * Construct and normalise a decimal value.
   *
   * @param coefficient - The unscaled integer value.
   * @param exponent - The power-of-ten scale factor.
   *
   * @internal
   */
  constructor(coefficient, exponent) {
    const [normalizedCoef, normalizedExp] = _DecimalImpl.normalize(coefficient, exponent);
    this._coefficient = normalizedCoef;
    this._exponent = normalizedExp;
    Object.freeze(this);
  }
  /**
   * Strip trailing zeros from `coefficient`, incrementing `exponent`
   * for each zero removed. Zero always normalises to `(0n, 0)`.
   *
   * @param coefficient - Raw coefficient before normalisation.
   * @param exponent - Raw exponent before normalisation.
   * @returns A `[coefficient, exponent]` tuple with trailing zeros removed.
   *
   * @internal
   */
  static normalize(coefficient, exponent) {
    if (coefficient === 0n) {
      return [0n, 0];
    }
    let coef = coefficient;
    let exp = exponent;
    while (coef !== 0n && coef % 10n === 0n) {
      coef /= 10n;
      exp += 1;
    }
    return [coef, exp];
  }
  /**
   * Apply rounding to the result of an integer division.
   *
   * @remarks
   * BigInt division truncates toward zero. This helper inspects the
   * `remainder` to decide whether to adjust the truncated `quotient`
   * by ±1 according to the chosen {@link RoundDirection}.
   *
   * The rounding direction is derived from the signs of `remainder`
   * and `divisor`: when they agree the exact fractional part is
   * positive (the truncation point is below the true value, so +1
   * rounds to nearest); when they disagree the fractional part is
   * negative (−1 rounds to nearest).
   *
   * @param quotient - Truncated integer quotient (`dividend / divisor`).
   * @param remainder - Division remainder (`dividend % divisor`).
   * @param divisor - The divisor used in the division.
   * @param direction - The rounding strategy to apply.
   * @returns The rounded quotient.
   *
   * @internal
   */
  static roundDivision(quotient, remainder, divisor, direction) {
    if (remainder === 0n) {
      return quotient;
    }
    if (direction === "round-down") {
      return quotient;
    }
    const roundDir = remainder > 0n === divisor > 0n ? 1n : -1n;
    if (direction === "round-up") {
      return quotient + roundDir;
    }
    if (direction === "ceil") {
      return roundDir === 1n ? quotient + 1n : quotient;
    }
    if (direction === "floor") {
      return roundDir === -1n ? quotient - 1n : quotient;
    }
    const absRemainder = remainder < 0n ? -remainder : remainder;
    const absDivisor = divisor < 0n ? -divisor : divisor;
    const doubled = absRemainder * 2n;
    let cmp;
    if (doubled === absDivisor) {
      cmp = 0;
    } else if (doubled < absDivisor) {
      cmp = -1;
    } else {
      cmp = 1;
    }
    if (cmp < 0) {
      return quotient;
    }
    if (cmp > 0) {
      return quotient + roundDir;
    }
    if (direction === "half-up") {
      return quotient + roundDir;
    }
    if (direction === "half-down") {
      return quotient;
    }
    if (quotient % 2n === 0n) {
      return quotient;
    } else {
      return quotient + roundDir;
    }
  }
  // -------------------------------------------------------------------
  // Arithmetic
  // -------------------------------------------------------------------
  /**
   * Return the sum of this value and `other`.
   *
   * @param other - The addend.
   * @returns A new {@link Decimal} equal to `this + other`.
   *
   * @public
   */
  add(other) {
    const otherImpl = other;
    if (this._exponent === otherImpl._exponent) {
      return new _DecimalImpl(this._coefficient + otherImpl._coefficient, this._exponent);
    }
    if (this._exponent < otherImpl._exponent) {
      const scale = 10n ** BigInt(otherImpl._exponent - this._exponent);
      return new _DecimalImpl(this._coefficient + otherImpl._coefficient * scale, this._exponent);
    } else {
      const scale = 10n ** BigInt(this._exponent - otherImpl._exponent);
      return new _DecimalImpl(this._coefficient * scale + otherImpl._coefficient, otherImpl._exponent);
    }
  }
  /**
   * Return the difference of this value and `other`.
   *
   * @param other - The subtrahend.
   * @returns A new {@link Decimal} equal to `this - other`.
   *
   * @public
   */
  sub(other) {
    const otherImpl = other;
    if (this._exponent === otherImpl._exponent) {
      return new _DecimalImpl(this._coefficient - otherImpl._coefficient, this._exponent);
    }
    if (this._exponent < otherImpl._exponent) {
      const scale = 10n ** BigInt(otherImpl._exponent - this._exponent);
      return new _DecimalImpl(this._coefficient - otherImpl._coefficient * scale, this._exponent);
    } else {
      const scale = 10n ** BigInt(this._exponent - otherImpl._exponent);
      return new _DecimalImpl(this._coefficient * scale - otherImpl._coefficient, otherImpl._exponent);
    }
  }
  /**
   * Return the product of this value and `other`.
   *
   * @param other - The multiplicand.
   * @returns A new {@link Decimal} equal to `this × other`.
   *
   * @public
   */
  mul(other) {
    const otherImpl = other;
    return new _DecimalImpl(this._coefficient * otherImpl._coefficient, this._exponent + otherImpl._exponent);
  }
  /**
   * Return the quotient of this value divided by `other`.
   *
   * @remarks
   * Division scales the dividend to produce `precision` decimal digits
   * in the result, then applies integer division and rounds the
   * remainder according to `direction`.
   *
   * Division requires explicit rounding control — no invisible defaults
   * in financial code. For full precision use {@link DEFAULT_DIV_PRECISION}
   * (34, matching the IEEE 754 decimal128 coefficient size).
   *
   * @example
   * ```ts
   * Decimal.from('1').div(Decimal.from('3'), 5, 'half-up');   // "0.33333"
   * Decimal.from('5').div(Decimal.from('2'), 0, 'half-up');   // "3"
   * Decimal.from('5').div(Decimal.from('2'), 0, 'half-even'); // "2"
   * ```
   *
   * @param other - The divisor. Must not be zero.
   * @param precision - Maximum number of decimal digits in the result.
   * @param direction - How to round when the exact quotient cannot
   *   be represented at the requested precision.
   * @returns A new {@link Decimal} equal to `this ÷ other`, rounded to
   *   `precision` decimal places.
   * @throws {@link Error} if `other` is zero.
   * @throws {@link Error} if `precision` is negative or non-integer.
   *
   * @public
   */
  div(other, precision, direction) {
    if (precision < 0 || !Number.isInteger(precision)) {
      throw new Error("precision must be a non-negative integer");
    }
    const otherImpl = other;
    if (otherImpl._coefficient === 0n) {
      throw new Error("Division by zero");
    }
    const scale = this._exponent - otherImpl._exponent + precision;
    let quotient;
    let remainder;
    let roundingDivisor;
    if (scale >= 0) {
      const scaledDividend = this._coefficient * 10n ** BigInt(scale);
      quotient = scaledDividend / otherImpl._coefficient;
      remainder = scaledDividend % otherImpl._coefficient;
      roundingDivisor = otherImpl._coefficient;
    } else {
      const scaledDivisor = otherImpl._coefficient * 10n ** BigInt(-scale);
      quotient = this._coefficient / scaledDivisor;
      remainder = this._coefficient % scaledDivisor;
      roundingDivisor = scaledDivisor;
    }
    const roundedQuotient = _DecimalImpl.roundDivision(quotient, remainder, roundingDivisor, direction);
    return new _DecimalImpl(roundedQuotient, -precision);
  }
  // -------------------------------------------------------------------
  // Comparison
  // -------------------------------------------------------------------
  /**
   * Three-way comparison of this value with `other`.
   *
   * @example
   * ```ts
   * const a = Decimal.from('1.5');
   * const b = Decimal.from('2');
   * a.cmp(b); // -1
   * b.cmp(a); //  1
   * a.cmp(a); //  0
   * ```
   *
   * @param other - The value to compare against.
   * @returns `-1` if `this \< other`, `0` if equal, `1` if `this \> other`.
   *
   * @public
   */
  cmp(other) {
    const otherImpl = other;
    if (this._exponent === otherImpl._exponent) {
      if (this._coefficient < otherImpl._coefficient)
        return -1;
      if (this._coefficient > otherImpl._coefficient)
        return 1;
      return 0;
    }
    if (this._exponent < otherImpl._exponent) {
      const scale = 10n ** BigInt(otherImpl._exponent - this._exponent);
      const scaledOther = otherImpl._coefficient * scale;
      if (this._coefficient < scaledOther)
        return -1;
      if (this._coefficient > scaledOther)
        return 1;
      return 0;
    } else {
      const scale = 10n ** BigInt(this._exponent - otherImpl._exponent);
      const scaledThis = this._coefficient * scale;
      if (scaledThis < otherImpl._coefficient)
        return -1;
      if (scaledThis > otherImpl._coefficient)
        return 1;
      return 0;
    }
  }
  /**
   * Return `true` if this value is numerically equal to `other`.
   *
   * @param other - The value to compare against.
   * @returns `true` if `this === other` in value, `false` otherwise.
   *
   * @public
   */
  eq(other) {
    return this.cmp(other) === 0;
  }
  /**
   * Return `true` if this value is strictly less than `other`.
   *
   * @param other - The value to compare against.
   * @returns `true` if `this \< other`, `false` otherwise.
   *
   * @public
   */
  lt(other) {
    return this.cmp(other) === -1;
  }
  /**
   * Return `true` if this value is less than or equal to `other`.
   *
   * @param other - The value to compare against.
   * @returns `true` if `this ≤ other`, `false` otherwise.
   *
   * @public
   */
  lte(other) {
    return this.cmp(other) <= 0;
  }
  /**
   * Return `true` if this value is strictly greater than `other`.
   *
   * @param other - The value to compare against.
   * @returns `true` if `this \> other`, `false` otherwise.
   *
   * @public
   */
  gt(other) {
    return this.cmp(other) === 1;
  }
  /**
   * Return `true` if this value is greater than or equal to `other`.
   *
   * @param other - The value to compare against.
   * @returns `true` if `this ≥ other`, `false` otherwise.
   *
   * @public
   */
  gte(other) {
    return this.cmp(other) >= 0;
  }
  // -------------------------------------------------------------------
  // Predicates
  // -------------------------------------------------------------------
  /**
   * Return `true` if this value is exactly zero.
   *
   * @returns `true` if the value is zero, `false` otherwise.
   *
   * @public
   */
  isZero() {
    return this._coefficient === 0n;
  }
  /**
   * Return `true` if this value is strictly less than zero.
   *
   * @returns `true` if negative, `false` if zero or positive.
   *
   * @public
   */
  isNegative() {
    return this._coefficient < 0n;
  }
  /**
   * Return `true` if this value is strictly greater than zero.
   *
   * @returns `true` if positive, `false` if zero or negative.
   *
   * @public
   */
  isPositive() {
    return this._coefficient > 0n;
  }
  // -------------------------------------------------------------------
  // Unary operations
  // -------------------------------------------------------------------
  /**
   * Return the additive inverse of this value.
   *
   * @returns A new {@link Decimal} equal to `-this`.
   *
   * @public
   */
  neg() {
    return new _DecimalImpl(-this._coefficient, this._exponent);
  }
  /**
   * Return the absolute value.
   *
   * @returns A new {@link Decimal} equal to `|this|`. If this value is
   *   already non-negative, returns `this` (no allocation).
   *
   * @public
   */
  abs() {
    if (this._coefficient < 0n) {
      return new _DecimalImpl(-this._coefficient, this._exponent);
    }
    return this;
  }
  // -------------------------------------------------------------------
  // Rounding
  // -------------------------------------------------------------------
  /**
   * Round this value to a specified precision.
   *
   * @remarks
   * **Rounding directions** (IEEE 754-2019 §4.3):
   *
   * | Direction      | Behavior                                       |
   * | -------------- | ---------------------------------------------- |
   * | `'ceil'`       |  1.1→2, -1.1→-1, 1.0→1 (toward +∞)             |
   * | `'floor'`      |  1.9→1, -1.1→-2, 1.0→1 (toward -∞)             |
   * | `'round-down'` |  1.9→1, -1.9→-1 (toward zero / truncate)       |
   * | `'round-up'`   |  1.1→2, -1.1→-2 (away from zero)               |
   * | `'half-up'`    |  0.5→1, 1.5→2, -0.5→-1 (ties away from zero)   |
   * | `'half-down'`  |  0.5→0, 1.5→1, -0.5→0 (ties toward zero)       |
   * | `'half-even'`  |  0.5→0, 1.5→2, 2.5→2, 3.5→4 (ties to even)     |
   *
   * **Precision** is specified as a {@link DecimalRoundingOptions} object
   * or a preset name from {@link DecimalRoundingPresets}:
   *
   * @example
   * ```ts
   * // Using a preset
   * amount.round('half-even', 'v1-api');
   *
   * // Using explicit options
   * amount.round('half-even', { mode: 'decimal-places', value: 2 });
   * amount.round('half-up', { mode: 'significant-figures', value: 4 });
   * ```
   *
   * @param direction - How to round.
   * @param options - A {@link DecimalRoundingOptions} object or key of {@link DecimalRoundingPresets}.
   * @returns A new {@link Decimal} rounded to the specified precision.
   * @throws {@link Error} if `options.value` is negative or non-integer.
   * @throws {@link Error} if the preset name is not recognized.
   *
   * @public
   */
  round(direction, options) {
    const resolved = typeof options === "string" ? (
      // Declaration merging allows consumers to add keys at compile time, but
      // ROUNDING_PRESETS only knows about built-in keys at runtime.  The double
      // cast through `unknown` is intentional: we want an undefined-safe lookup
      // so the runtime guard below can produce a clear error for unrecognised
      // (e.g. declaration-merged) preset names that were not also added to
      // ROUNDING_PRESETS.
      ROUNDING_PRESETS[options]
    ) : options;
    if (resolved === void 0) {
      throw new Error(`Unknown rounding preset: "${options}"`);
    }
    if (resolved.value < 0 || !Number.isInteger(resolved.value)) {
      throw new Error("DecimalRoundingOptions.value must be a non-negative integer");
    }
    if (resolved.mode === "decimal-places") {
      const fixed = this.toFixed(resolved.value, direction);
      return Decimal.from(fixed);
    }
    if (this._coefficient === 0n) {
      return this;
    }
    const coeffStr = this._coefficient < 0n ? (-this._coefficient).toString() : this._coefficient.toString();
    const currentSigFigs = coeffStr.length;
    if (resolved.value === 0) {
      return Decimal.zero;
    }
    if (currentSigFigs <= resolved.value) {
      return this;
    }
    const digitsToTrim = currentSigFigs - resolved.value;
    const divisor = 10n ** BigInt(digitsToTrim);
    const quotient = this._coefficient / divisor;
    const remainder = this._coefficient % divisor;
    const rounded = _DecimalImpl.roundDivision(quotient, remainder, divisor, direction);
    return new _DecimalImpl(rounded, this._exponent + digitsToTrim);
  }
  // -------------------------------------------------------------------
  // Conversion / serialisation
  // -------------------------------------------------------------------
  /**
   * Return a human-readable string representation.
   *
   * @remarks
   * Plain notation for values whose digit count is at most 30, and
   * scientific notation (`1.23E+40`) for larger values. Trailing zeros
   * are never present because the internal representation is normalised.
   *
   * @public
   */
  toString() {
    if (this._coefficient === 0n) {
      return "0";
    }
    const coeffStr = this._coefficient.toString();
    const isNeg = coeffStr.startsWith("-");
    const absCoeffStr = isNeg ? coeffStr.slice(1) : coeffStr;
    if (this._exponent < 0) {
      const decimalPlaces = -this._exponent;
      const leadingZeroCount = decimalPlaces >= absCoeffStr.length ? decimalPlaces - absCoeffStr.length : 0;
      if (leadingZeroCount > PLAIN_NOTATION_DIGIT_LIMIT) {
        if (absCoeffStr.length === 1) {
          return `${coeffStr}E${String(this._exponent)}`;
        }
        const intPart = absCoeffStr[0] ?? "";
        const fracPart = absCoeffStr.slice(1);
        const adjustedExp = this._exponent + absCoeffStr.length - 1;
        return `${isNeg ? "-" : ""}${intPart}.${fracPart}E${String(adjustedExp)}`;
      }
      if (decimalPlaces >= absCoeffStr.length) {
        const leadingZeros = "0".repeat(decimalPlaces - absCoeffStr.length);
        return `${isNeg ? "-" : ""}0.${leadingZeros}${absCoeffStr}`;
      } else {
        const integerPart = absCoeffStr.slice(0, absCoeffStr.length - decimalPlaces);
        const fractionalPart = absCoeffStr.slice(absCoeffStr.length - decimalPlaces);
        return `${isNeg ? "-" : ""}${integerPart}.${fractionalPart}`;
      }
    }
    const plainLength = absCoeffStr.length + this._exponent;
    if (plainLength <= PLAIN_NOTATION_DIGIT_LIMIT) {
      if (this._exponent === 0) {
        return coeffStr;
      }
      const trailingZeros = "0".repeat(this._exponent);
      return `${isNeg ? "-" : ""}${absCoeffStr}${trailingZeros}`;
    } else {
      if (absCoeffStr.length === 1) {
        return `${coeffStr}E+${String(this._exponent)}`;
      }
      const integerPart = absCoeffStr[0] ?? "";
      const fractionalPart = absCoeffStr.slice(1);
      const adjustedExponent = this._exponent + absCoeffStr.length - 1;
      return `${isNeg ? "-" : ""}${integerPart}.${fractionalPart}E+${String(adjustedExponent)}`;
    }
  }
  /**
   * Return the JSON-serialisable representation.
   *
   * @remarks
   * Returns a plain string matching the Stripe API convention where
   * decimal values are serialised as strings in JSON. Called
   * automatically by `JSON.stringify`.
   *
   * @public
   */
  toJSON() {
    return this.toString();
  }
  /**
   * Convert to a JavaScript `number`.
   *
   * @remarks
   * This is an explicit, intentionally lossy conversion. Use it only
   * when you need a numeric value for display or interop with APIs
   * that require `number`. Prefer {@link Decimal.toString | toString}
   * or {@link Decimal.toFixed | toFixed} for lossless output.
   *
   * @public
   */
  toNumber() {
    return Number(this.toString());
  }
  /**
   * Format this value as a fixed-point string with exactly
   * `decimalPlaces` digits after the decimal point.
   *
   * @remarks
   * Values are rounded according to `direction` when the internal
   * precision exceeds the requested number of decimal places.
   * The rounding direction is always required — no invisible defaults
   * in financial code.
   *
   * @example
   * ```ts
   * Decimal.from('1.235').toFixed(2, 'half-up');   // "1.24"
   * Decimal.from('1.225').toFixed(2, 'half-even'); // "1.22"
   * Decimal.from('42').toFixed(3, 'half-up');      // "42.000"
   * ```
   *
   * @param decimalPlaces - Number of digits after the decimal point.
   *   Must be a non-negative integer.
   * @param direction - How to round when truncating excess digits.
   * @returns A string with exactly `decimalPlaces` fractional digits.
   * @throws {@link Error} if `decimalPlaces` is negative or non-integer.
   *
   * @public
   */
  toFixed(decimalPlaces, direction) {
    if (decimalPlaces < 0 || !Number.isInteger(decimalPlaces)) {
      throw new Error("decimalPlaces must be a non-negative integer");
    }
    const formatFixed = /* @__PURE__ */ __name2((coef) => {
      const coeffStr = coef.toString();
      const isNeg = coeffStr.startsWith("-");
      const absCoeffStr = isNeg ? coeffStr.slice(1) : coeffStr;
      if (decimalPlaces === 0) {
        return coeffStr;
      }
      if (decimalPlaces >= absCoeffStr.length) {
        const leadingZeros = "0".repeat(decimalPlaces - absCoeffStr.length);
        return `${isNeg ? "-" : ""}0.${leadingZeros}${absCoeffStr}`;
      } else {
        const integerPart = absCoeffStr.slice(0, absCoeffStr.length - decimalPlaces);
        const fractionalPart = absCoeffStr.slice(absCoeffStr.length - decimalPlaces);
        return `${isNeg ? "-" : ""}${integerPart}.${fractionalPart}`;
      }
    }, "formatFixed");
    const targetExponent = -decimalPlaces;
    if (this._exponent === targetExponent) {
      return formatFixed(this._coefficient);
    }
    if (this._exponent < targetExponent) {
      const scaleDiff = targetExponent - this._exponent;
      const divisor = 10n ** BigInt(scaleDiff);
      const quotient = this._coefficient / divisor;
      const remainder = this._coefficient % divisor;
      const rounded = _DecimalImpl.roundDivision(quotient, remainder, divisor, direction);
      return formatFixed(rounded);
    } else {
      const scaleDiff = this._exponent - targetExponent;
      const scaled = this._coefficient * 10n ** BigInt(scaleDiff);
      return formatFixed(scaled);
    }
  }
  /**
   * Return a string primitive when the runtime coerces the value.
   *
   * @remarks
   * Deliberately returns a `string` (not a `number`) to discourage
   * silent precision loss through implicit arithmetic coercion.
   * When used in a numeric context (for example, `+myDecimal`), the
   * JavaScript runtime will first call this method and then coerce
   * the resulting string to a `number`, which may lose precision.
   * Callers should prefer the explicit
   * {@link Decimal.toNumber | toNumber} method when an IEEE 754
   * `number` is required.
   *
   * @public
   */
  valueOf() {
    return this.toString();
  }
};
var Decimal = {
  /**
   * Create a {@link Decimal} from a string, number, or bigint.
   *
   * @remarks
   * - **string**: Parsed as a decimal literal. Accepts an optional sign,
   *   integer digits, an optional fractional part, and an optional `e`/`E`
   *   exponent. Leading/trailing whitespace is trimmed.
   * - **number**: Must be finite. Converted via `Number.prototype.toString()`
   *   then parsed, so `Decimal.from(0.1)` produces `"0.1"` (not the
   *   53-bit binary approximation).
   * - **bigint**: Treated as an integer with exponent 0.
   *
   * @example
   * ```ts
   * Decimal.from('1.23');   // string
   * Decimal.from(42);       // number
   * Decimal.from(100n);     // bigint
   * Decimal.from('1.5e3');  // scientific notation → 1500
   * ```
   *
   * @param value - The value to convert.
   * @returns A new frozen {@link Decimal} instance.
   * @throws {@link Error} if `value` is a non-finite number, an empty
   *   string, or a string that does not match the decimal literal grammar.
   *
   * @public
   */
  from(value) {
    if (typeof value === "bigint") {
      return new DecimalImpl(value, 0);
    }
    if (typeof value === "number") {
      if (!Number.isFinite(value)) {
        throw new Error("Number must be finite");
      }
      return Decimal.from(value.toString());
    }
    const trimmed = value.trim();
    if (trimmed === "") {
      throw new Error("Cannot parse empty string as Decimal");
    }
    const match2 = /^([+-]?)(\d+)(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/.exec(trimmed);
    if (!match2) {
      throw new Error(`Invalid decimal string: ${value}`);
    }
    const sign = match2[1] === "-" ? -1n : 1n;
    const integerPart = match2[2] ?? "";
    const fractionalPart = match2[3] ?? "";
    const exponentPart = match2[4] ? Number(match2[4]) : 0;
    if (!Number.isSafeInteger(exponentPart) || exponentPart > MAX_EXPONENT || exponentPart < -MAX_EXPONENT) {
      throw new Error(`Exponent out of range: ${String(match2[4])} exceeds safe integer bounds`);
    }
    const coefficientStr = integerPart + fractionalPart;
    const coefficient = sign * BigInt(coefficientStr);
    const exponent = exponentPart - fractionalPart.length;
    if (!Number.isSafeInteger(exponent) || exponent > MAX_EXPONENT || exponent < -MAX_EXPONENT) {
      throw new Error(`Computed exponent out of range: ${String(exponent)} exceeds safe integer bounds`);
    }
    return new DecimalImpl(coefficient, exponent);
  },
  /**
   * The {@link Decimal} value representing zero.
   *
   * @remarks
   * Pre-allocated singleton — prefer `Decimal.zero` over
   * `Decimal.from(0)` to avoid an unnecessary allocation.
   *
   * @public
   */
  zero: new DecimalImpl(0n, 0)
};
var Error_exports = {};
__export(Error_exports, {
  RateLimitError: /* @__PURE__ */ __name(() => RateLimitError, "RateLimitError"),
  StripeAPIError: /* @__PURE__ */ __name(() => StripeAPIError, "StripeAPIError"),
  StripeAuthenticationError: /* @__PURE__ */ __name(() => StripeAuthenticationError, "StripeAuthenticationError"),
  StripeCardError: /* @__PURE__ */ __name(() => StripeCardError, "StripeCardError"),
  StripeConnectionError: /* @__PURE__ */ __name(() => StripeConnectionError, "StripeConnectionError"),
  StripeError: /* @__PURE__ */ __name(() => StripeError, "StripeError"),
  StripeIdempotencyError: /* @__PURE__ */ __name(() => StripeIdempotencyError, "StripeIdempotencyError"),
  StripeInvalidClientError: /* @__PURE__ */ __name(() => StripeInvalidClientError, "StripeInvalidClientError"),
  StripeInvalidGrantError: /* @__PURE__ */ __name(() => StripeInvalidGrantError, "StripeInvalidGrantError"),
  StripeInvalidRequestError: /* @__PURE__ */ __name(() => StripeInvalidRequestError, "StripeInvalidRequestError"),
  StripeInvalidScopeError: /* @__PURE__ */ __name(() => StripeInvalidScopeError, "StripeInvalidScopeError"),
  StripeOAuthError: /* @__PURE__ */ __name(() => StripeOAuthError, "StripeOAuthError"),
  StripeOAuthInvalidRequestError: /* @__PURE__ */ __name(() => StripeOAuthInvalidRequestError, "StripeOAuthInvalidRequestError"),
  StripePermissionError: /* @__PURE__ */ __name(() => StripePermissionError, "StripePermissionError"),
  StripeRateLimitError: /* @__PURE__ */ __name(() => StripeRateLimitError, "StripeRateLimitError"),
  StripeSignatureVerificationError: /* @__PURE__ */ __name(() => StripeSignatureVerificationError, "StripeSignatureVerificationError"),
  StripeUnsupportedGrantTypeError: /* @__PURE__ */ __name(() => StripeUnsupportedGrantTypeError, "StripeUnsupportedGrantTypeError"),
  StripeUnsupportedResponseTypeError: /* @__PURE__ */ __name(() => StripeUnsupportedResponseTypeError, "StripeUnsupportedResponseTypeError"),
  TemporarySessionExpiredError: /* @__PURE__ */ __name(() => TemporarySessionExpiredError, "TemporarySessionExpiredError"),
  generateOAuthError: /* @__PURE__ */ __name(() => generateOAuthError, "generateOAuthError"),
  generateV1Error: /* @__PURE__ */ __name(() => generateV1Error, "generateV1Error"),
  generateV2Error: /* @__PURE__ */ __name(() => generateV2Error, "generateV2Error")
});
var generateV1Error = /* @__PURE__ */ __name2((rawStripeError) => {
  const statusCode = rawStripeError.statusCode;
  if (statusCode === 429 || statusCode === 400 && rawStripeError.code === "rate_limit") {
    return new StripeRateLimitError(rawStripeError);
  }
  if (statusCode === 400 || statusCode === 404) {
    if (rawStripeError.type === "idempotency_error") {
      return new StripeIdempotencyError(rawStripeError);
    }
    return new StripeInvalidRequestError(rawStripeError);
  }
  if (statusCode === 401) {
    return new StripeAuthenticationError(rawStripeError);
  }
  if (statusCode === 402) {
    return new StripeCardError(rawStripeError);
  }
  if (statusCode === 403) {
    return new StripePermissionError(rawStripeError);
  }
  return new StripeAPIError(rawStripeError);
}, "generateV1Error");
var generateOAuthError = /* @__PURE__ */ __name2((rawStripeError) => {
  const oauthType = rawStripeError.type;
  switch (oauthType) {
    case "invalid_grant":
      return new StripeInvalidGrantError(rawStripeError);
    case "invalid_client":
      return new StripeInvalidClientError(rawStripeError);
    case "invalid_request":
      return new StripeOAuthInvalidRequestError(rawStripeError);
    case "invalid_scope":
      return new StripeInvalidScopeError(rawStripeError);
    case "unsupported_grant_type":
      return new StripeUnsupportedGrantTypeError(rawStripeError);
    case "unsupported_response_type":
      return new StripeUnsupportedResponseTypeError(rawStripeError);
    default:
      return new StripeOAuthError(rawStripeError);
  }
}, "generateOAuthError");
var generateV2Error = /* @__PURE__ */ __name2((rawStripeError) => {
  switch (rawStripeError.type) {
    case "idempotency_error":
      return new StripeIdempotencyError(rawStripeError);
    // switchCases: The beginning of the section generated from our OpenAPI spec
    case "rate_limit":
      return new RateLimitError(rawStripeError);
    case "temporary_session_expired":
      return new TemporarySessionExpiredError(rawStripeError);
  }
  switch (rawStripeError.code) {
    case "invalid_fields":
      return new StripeInvalidRequestError(rawStripeError);
  }
  return generateV1Error(rawStripeError);
}, "generateV2Error");
var StripeError = class extends Error {
  static {
    __name(this, "StripeError");
  }
  static {
    __name2(this, "StripeError");
  }
  constructor(raw = {}, type = null) {
    super(raw.message);
    this.type = type || this.constructor.name;
    this.raw = raw;
    this.rawType = raw.type;
    this.code = raw.code;
    this.doc_url = raw.doc_url;
    this.param = raw.param;
    this.detail = raw.detail;
    this.headers = raw.headers;
    this.requestId = raw.requestId;
    this.statusCode = raw.statusCode;
    this.message = raw.message ?? "";
    this.userMessage = raw.user_message;
    this.charge = raw.charge;
    this.decline_code = raw.decline_code;
    this.payment_intent = raw.payment_intent;
    this.payment_method = raw.payment_method;
    this.payment_method_type = raw.payment_method_type;
    this.setup_intent = raw.setup_intent;
    this.source = raw.source;
  }
};
StripeError.generate = generateV1Error;
var StripeCardError = class extends StripeError {
  static {
    __name(this, "StripeCardError");
  }
  static {
    __name2(this, "StripeCardError");
  }
  constructor(raw = {}) {
    super(raw, "StripeCardError");
    this.decline_code = raw.decline_code ?? "";
  }
};
var StripeInvalidRequestError = class extends StripeError {
  static {
    __name(this, "StripeInvalidRequestError");
  }
  static {
    __name2(this, "StripeInvalidRequestError");
  }
  constructor(raw = {}) {
    super(raw, "StripeInvalidRequestError");
  }
};
var StripeAPIError = class extends StripeError {
  static {
    __name(this, "StripeAPIError");
  }
  static {
    __name2(this, "StripeAPIError");
  }
  constructor(raw = {}) {
    super(raw, "StripeAPIError");
  }
};
var StripeAuthenticationError = class extends StripeError {
  static {
    __name(this, "StripeAuthenticationError");
  }
  static {
    __name2(this, "StripeAuthenticationError");
  }
  constructor(raw = {}) {
    super(raw, "StripeAuthenticationError");
  }
};
var StripePermissionError = class extends StripeError {
  static {
    __name(this, "StripePermissionError");
  }
  static {
    __name2(this, "StripePermissionError");
  }
  constructor(raw = {}) {
    super(raw, "StripePermissionError");
  }
};
var StripeRateLimitError = class extends StripeError {
  static {
    __name(this, "StripeRateLimitError");
  }
  static {
    __name2(this, "StripeRateLimitError");
  }
  constructor(raw = {}) {
    super(raw, "StripeRateLimitError");
  }
};
var StripeConnectionError = class extends StripeError {
  static {
    __name(this, "StripeConnectionError");
  }
  static {
    __name2(this, "StripeConnectionError");
  }
  constructor(raw = {}) {
    super(raw, "StripeConnectionError");
  }
};
var StripeSignatureVerificationError = class extends StripeError {
  static {
    __name(this, "StripeSignatureVerificationError");
  }
  static {
    __name2(this, "StripeSignatureVerificationError");
  }
  constructor(header, payload, raw = {}) {
    super(raw, "StripeSignatureVerificationError");
    this.header = header;
    this.payload = payload;
  }
};
var StripeIdempotencyError = class extends StripeError {
  static {
    __name(this, "StripeIdempotencyError");
  }
  static {
    __name2(this, "StripeIdempotencyError");
  }
  constructor(raw = {}) {
    super(raw, "StripeIdempotencyError");
  }
};
var StripeOAuthError = class extends StripeError {
  static {
    __name(this, "StripeOAuthError");
  }
  static {
    __name2(this, "StripeOAuthError");
  }
  constructor(raw = {}, type = "StripeOAuthError") {
    super(raw, type);
  }
};
var StripeInvalidGrantError = class extends StripeOAuthError {
  static {
    __name(this, "StripeInvalidGrantError");
  }
  static {
    __name2(this, "StripeInvalidGrantError");
  }
  constructor(raw = {}) {
    super(raw, "StripeInvalidGrantError");
  }
};
var StripeInvalidClientError = class extends StripeOAuthError {
  static {
    __name(this, "StripeInvalidClientError");
  }
  static {
    __name2(this, "StripeInvalidClientError");
  }
  constructor(raw = {}) {
    super(raw, "StripeInvalidClientError");
  }
};
var StripeOAuthInvalidRequestError = class extends StripeOAuthError {
  static {
    __name(this, "StripeOAuthInvalidRequestError");
  }
  static {
    __name2(this, "StripeOAuthInvalidRequestError");
  }
  constructor(raw = {}) {
    super(raw, "StripeOAuthInvalidRequestError");
  }
};
var StripeInvalidScopeError = class extends StripeOAuthError {
  static {
    __name(this, "StripeInvalidScopeError");
  }
  static {
    __name2(this, "StripeInvalidScopeError");
  }
  constructor(raw = {}) {
    super(raw, "StripeInvalidScopeError");
  }
};
var StripeUnsupportedGrantTypeError = class extends StripeOAuthError {
  static {
    __name(this, "StripeUnsupportedGrantTypeError");
  }
  static {
    __name2(this, "StripeUnsupportedGrantTypeError");
  }
  constructor(raw = {}) {
    super(raw, "StripeUnsupportedGrantTypeError");
  }
};
var StripeUnsupportedResponseTypeError = class extends StripeOAuthError {
  static {
    __name(this, "StripeUnsupportedResponseTypeError");
  }
  static {
    __name2(this, "StripeUnsupportedResponseTypeError");
  }
  constructor(raw = {}) {
    super(raw, "StripeUnsupportedResponseTypeError");
  }
};
var RateLimitError = class extends StripeError {
  static {
    __name(this, "RateLimitError");
  }
  static {
    __name2(this, "RateLimitError");
  }
  constructor(rawStripeError = {}) {
    super(rawStripeError, "RateLimitError");
  }
};
var TemporarySessionExpiredError = class extends StripeError {
  static {
    __name(this, "TemporarySessionExpiredError");
  }
  static {
    __name2(this, "TemporarySessionExpiredError");
  }
  constructor(rawStripeError = {}) {
    super(rawStripeError, "TemporarySessionExpiredError");
  }
};
var MAX_RETRY_AFTER_WAIT = 60;
var RequestSender = class _RequestSender {
  static {
    __name(this, "_RequestSender");
  }
  static {
    __name2(this, "RequestSender");
  }
  constructor(stripe, maxBufferedRequestMetric) {
    this._stripe = stripe;
    this._maxBufferedRequestMetric = maxBufferedRequestMetric;
  }
  _normalizeStripeContext(optsContext, clientContext) {
    if (optsContext) {
      return optsContext.toString() || null;
    }
    return clientContext?.toString() || null;
  }
  _addHeadersDirectlyToObject(obj, headers) {
    obj.requestId = headers["request-id"];
    obj.stripeAccount = obj.stripeAccount || headers["stripe-account"];
    obj.apiVersion = obj.apiVersion || headers["stripe-version"];
    obj.idempotencyKey = obj.idempotencyKey || headers["idempotency-key"];
  }
  _makeResponseEvent(requestEvent, statusCode, headers) {
    const requestEndTime = Date.now();
    const requestDurationMs = requestEndTime - requestEvent.request_start_time;
    return removeNullish({
      api_version: headers["stripe-version"],
      account: headers["stripe-account"],
      idempotency_key: headers["idempotency-key"],
      method: requestEvent.method,
      path: requestEvent.path,
      status: statusCode,
      request_id: this._getRequestId(headers),
      elapsed: requestDurationMs,
      request_start_time: requestEvent.request_start_time,
      request_end_time: requestEndTime
    });
  }
  _getRequestId(headers) {
    return headers["request-id"];
  }
  /**
   * Used by methods with spec.streaming === true. For these methods, we do not
   * buffer successful responses into memory or do parse them into stripe
   * objects, we delegate that all of that to the user and pass back the raw
   * http.Response object to the callback.
   *
   * (Unsuccessful responses shouldn't make it here, they should
   * still be buffered/parsed and handled by _jsonResponseHandler -- see
   * makeRequest)
   */
  _streamingResponseHandler(requestEvent, usage, callback) {
    return (res) => {
      const headers = res.getHeaders();
      const streamCompleteCallback = /* @__PURE__ */ __name2(() => {
        const responseEvent = this._makeResponseEvent(requestEvent, res.getStatusCode(), headers);
        this._stripe._emitter.emit("response", responseEvent);
        this._recordRequestMetrics(this._getRequestId(headers), responseEvent.elapsed, usage);
      }, "streamCompleteCallback");
      const stream = res.toStream(streamCompleteCallback);
      this._addHeadersDirectlyToObject(stream, headers);
      return callback(null, stream);
    };
  }
  /**
   * Default handler for Stripe responses. Buffers the response into memory,
   * parses the JSON and returns it (i.e. passes it to the callback) if there
   * is no "error" field. Otherwise constructs/passes an appropriate Error.
   */
  _jsonResponseHandler(requestEvent, apiMode, usage, callback) {
    return (res) => {
      const headers = res.getHeaders();
      const requestId = this._getRequestId(headers);
      const statusCode = res.getStatusCode();
      const responseEvent = this._makeResponseEvent(requestEvent, statusCode, headers);
      res.toJSON().then((jsonResponse) => {
        if (this._stripe.getEmitEventBodiesEnabled()) {
          responseEvent.body = jsonResponse;
        }
        if (jsonResponse.error) {
          const isOAuth = typeof jsonResponse.error === "string";
          if (isOAuth) {
            jsonResponse.error = {
              type: jsonResponse.error,
              message: jsonResponse.error_description
            };
          }
          jsonResponse.error.headers = headers;
          jsonResponse.error.statusCode = statusCode;
          jsonResponse.error.requestId = requestId;
          let err;
          if (isOAuth) {
            err = generateOAuthError(jsonResponse.error);
          } else if (apiMode === "v2") {
            err = generateV2Error(jsonResponse.error);
          } else {
            err = generateV1Error(jsonResponse.error);
          }
          throw err;
        }
        return jsonResponse;
      }, (e) => {
        if (this._stripe.getEmitEventBodiesEnabled() && e.rawBody) {
          responseEvent.body = e.rawBody;
        }
        throw new StripeAPIError({
          message: "Invalid JSON received from the Stripe API",
          exception: e,
          requestId: headers["request-id"]
        });
      }).then((jsonResponse) => {
        this._stripe._emitter.emit("response", responseEvent);
        this._recordRequestMetrics(requestId, responseEvent.elapsed, usage);
        const rawResponse = res.getRawResponse();
        this._addHeadersDirectlyToObject(rawResponse, headers);
        Object.defineProperty(jsonResponse, "lastResponse", {
          enumerable: false,
          writable: false,
          value: rawResponse
        });
        callback(null, jsonResponse);
      }, (e) => {
        this._stripe._emitter.emit("response", responseEvent);
        callback(e, null);
      });
    };
  }
  static _generateConnectionErrorMessage(requestRetries) {
    return `An error occurred with our connection to Stripe.${requestRetries > 0 ? ` Request was retried ${requestRetries} times.` : ""}`;
  }
  // For more on when and how to retry API requests, see https://stripe.com/docs/error-handling#safely-retrying-requests-with-idempotency
  static _shouldRetry(res, numRetries, maxRetries, error) {
    if (error && numRetries === 0 && HttpClient.CONNECTION_CLOSED_ERROR_CODES.includes(error.code)) {
      return true;
    }
    if (numRetries >= maxRetries) {
      return false;
    }
    if (!res) {
      return true;
    }
    if (res.getHeaders()["stripe-should-retry"] === "false") {
      return false;
    }
    if (res.getHeaders()["stripe-should-retry"] === "true") {
      return true;
    }
    if (res.getStatusCode() === 409) {
      return true;
    }
    if (res.getStatusCode() >= 500) {
      return true;
    }
    return false;
  }
  _getSleepTimeInMS(numRetries, retryAfter = null) {
    const initialNetworkRetryDelay = this._stripe.getInitialNetworkRetryDelay();
    const maxNetworkRetryDelay = this._stripe.getMaxNetworkRetryDelay();
    let sleepSeconds = Math.min(initialNetworkRetryDelay * Math.pow(2, numRetries - 1), maxNetworkRetryDelay);
    sleepSeconds *= 0.5 * (1 + Math.random());
    sleepSeconds = Math.max(initialNetworkRetryDelay, sleepSeconds);
    if (Number.isInteger(retryAfter) && retryAfter <= MAX_RETRY_AFTER_WAIT) {
      sleepSeconds = Math.max(sleepSeconds, retryAfter);
    }
    return sleepSeconds * 1e3;
  }
  // Max retries can be set on a per request basis. Favor those over the global setting
  _getMaxNetworkRetries(settings = {}) {
    return settings.maxNetworkRetries !== void 0 && Number.isInteger(settings.maxNetworkRetries) ? settings.maxNetworkRetries : this._stripe.getMaxNetworkRetries();
  }
  _defaultIdempotencyKey(method, settings, apiMode) {
    const maxRetries = this._getMaxNetworkRetries(settings);
    const genKey = /* @__PURE__ */ __name2(() => `stripe-node-retry-${this._stripe._platformFunctions.uuid4()}`, "genKey");
    if (apiMode === "v2") {
      if (method === "POST" || method === "DELETE") {
        return genKey();
      }
    } else if (apiMode === "v1") {
      if (method === "POST" && maxRetries > 0) {
        return genKey();
      }
    }
    return null;
  }
  _makeHeaders({ contentType, contentLength, apiVersion, clientUserAgent, method, userSuppliedHeaders, userSuppliedSettings, stripeAccount, stripeContext, apiMode }) {
    const defaultHeaders = {
      Accept: "application/json",
      "Content-Type": contentType,
      "User-Agent": this._getUserAgentString(apiMode),
      "X-Stripe-Client-User-Agent": clientUserAgent,
      "X-Stripe-Client-Telemetry": this._getTelemetryHeader(),
      "Stripe-Version": apiVersion,
      "Stripe-Account": stripeAccount,
      "Stripe-Context": stripeContext,
      "Idempotency-Key": this._defaultIdempotencyKey(method, userSuppliedSettings, apiMode)
    };
    const methodHasPayload = method == "POST" || method == "PUT" || method == "PATCH";
    if (methodHasPayload || contentLength) {
      if (!methodHasPayload) {
        emitWarning(`${method} method had non-zero contentLength but no payload is expected for this verb`);
      }
      defaultHeaders["Content-Length"] = contentLength;
    }
    return Object.assign(
      removeNullish(defaultHeaders),
      // If the user supplied, say 'idempotency-key', override instead of appending by ensuring caps are the same.
      normalizeHeaders(userSuppliedHeaders)
    );
  }
  _getUserAgentString(apiMode) {
    const packageVersion = this._stripe.getConstant("PACKAGE_VERSION");
    const appInfo = this._stripe._appInfo ? this._stripe.getAppInfoAsString() : "";
    const aiAgent = this._stripe.getConstant("AI_AGENT");
    let uaString = `Stripe/${apiMode} NodeBindings/${packageVersion}`;
    if (appInfo) {
      uaString += ` ${appInfo}`;
    }
    if (aiAgent) {
      uaString += ` AIAgent/${aiAgent}`;
    }
    return uaString;
  }
  _getTelemetryHeader() {
    if (this._stripe.getTelemetryEnabled() && this._stripe._prevRequestMetrics.length > 0) {
      const metrics = this._stripe._prevRequestMetrics.shift();
      return JSON.stringify({
        last_request_metrics: metrics
      });
    }
  }
  _recordRequestMetrics(requestId, requestDurationMs, usage) {
    if (this._stripe.getTelemetryEnabled() && requestId) {
      if (this._stripe._prevRequestMetrics.length > this._maxBufferedRequestMetric) {
        emitWarning("Request metrics buffer is full, dropping telemetry message.");
      } else {
        const m = {
          request_id: requestId,
          request_duration_ms: requestDurationMs
        };
        if (usage && usage.length > 0) {
          m.usage = usage;
        }
        this._stripe._prevRequestMetrics.push(m);
      }
    }
  }
  _rawRequest(method, path, params, options, usage) {
    return new Promise((resolve, reject) => {
      try {
        const requestMethod = method.toUpperCase();
        if (requestMethod !== "POST" && params && Object.keys(params).length !== 0) {
          throw new Error("rawRequest only supports params on POST requests. Please pass null and add your parameters to path.");
        }
        const data = requestMethod === "POST" ? Object.assign({}, params) : null;
        const processed = processOptions(options);
        if (options?.additionalHeaders) {
          Object.assign(processed.headers, options.additionalHeaders);
        }
        const apiBase = processed.apiBase || (options?.apiBase ?? null);
        const host = apiBase ? this._stripe.resolveBaseAddress(apiBase) : null;
        this._request(requestMethod, host, path, data, processed.authenticator, {
          headers: processed.headers,
          settings: processed.settings,
          streaming: processed.streaming
        }, usage || ["raw_request"], (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }
  _getContentLength(data) {
    return typeof data === "string" ? new TextEncoder().encode(data).length : data.length;
  }
  /**
   * This is the main HTTP method that all resources eventually call
   */
  _request(method, host, path, data, authenticator, options, usage = [], callback, requestDataProcessor = null) {
    let requestData;
    authenticator = authenticator ?? this._stripe._authenticator;
    const apiMode = getAPIMode(path);
    const retryRequest = /* @__PURE__ */ __name2((requestFn, apiVersion, headers, requestRetries, retryAfter) => {
      return setTimeout(requestFn, this._getSleepTimeInMS(requestRetries, retryAfter), apiVersion, headers, requestRetries + 1);
    }, "retryRequest");
    const makeRequest = /* @__PURE__ */ __name2((apiVersion, headers, numRetries) => {
      const timeout = options.settings && options.settings.timeout && Number.isInteger(options.settings.timeout) && options.settings.timeout >= 0 ? options.settings.timeout : this._stripe.getApiField("timeout");
      const request = {
        host: host || this._stripe.getApiField("host"),
        port: this._stripe.getApiField("port"),
        path,
        method,
        headers: Object.assign({}, headers),
        body: requestData,
        protocol: this._stripe.getApiField("protocol")
      };
      if (!authenticator) {
        throw Error("Authenticator was't initialized. Please pass an API Key or an Authenticator when initializing StripeClient.");
      }
      authenticator(request).then(() => {
        const req = this._stripe.getApiField("httpClient").makeRequest(request.host, request.port, request.path, request.method, request.headers, request.body, request.protocol, timeout);
        const requestStartTime = Date.now();
        const requestEvent = removeNullish({
          api_version: apiVersion,
          account: parseHttpHeaderAsString(headers["Stripe-Account"]),
          idempotency_key: parseHttpHeaderAsString(headers["Idempotency-Key"]),
          method,
          path,
          body: this._stripe.getEmitEventBodiesEnabled() ? data ?? void 0 : void 0,
          request_start_time: requestStartTime
        });
        const requestRetries = numRetries || 0;
        const maxRetries = this._getMaxNetworkRetries(options.settings || {});
        this._stripe._emitter.emit("request", requestEvent);
        req.then((res) => {
          if (_RequestSender._shouldRetry(res, requestRetries, maxRetries)) {
            return retryRequest(makeRequest, apiVersion, headers, requestRetries, parseHttpHeaderAsNumber(res.getHeaders()["retry-after"]));
          } else if (options.streaming && res.getStatusCode() < 400) {
            return this._streamingResponseHandler(requestEvent, usage, callback)(res);
          } else {
            return this._jsonResponseHandler(requestEvent, apiMode, usage, callback)(res);
          }
        }).catch((error) => {
          if (_RequestSender._shouldRetry(null, requestRetries, maxRetries, error)) {
            return retryRequest(makeRequest, apiVersion, headers, requestRetries, null);
          } else {
            const isTimeoutError = error.code && error.code === HttpClient.TIMEOUT_ERROR_CODE;
            return callback(new StripeConnectionError({
              message: isTimeoutError ? `Request aborted due to timeout being reached (${timeout}ms)` : _RequestSender._generateConnectionErrorMessage(requestRetries),
              detail: error
            }));
          }
        });
      }).catch((e) => {
        throw new StripeError({
          message: "Unable to authenticate the request",
          exception: e
        });
      });
    }, "makeRequest");
    const prepareAndMakeRequest = /* @__PURE__ */ __name2((error, data2) => {
      if (error) {
        return callback(error);
      }
      requestData = data2;
      this._stripe.getClientUserAgent((clientUserAgent) => {
        const apiVersion = this._stripe.getApiField("version");
        const headers = this._makeHeaders({
          contentType: apiMode == "v2" ? "application/json" : "application/x-www-form-urlencoded",
          contentLength: this._getContentLength(data2),
          apiVersion,
          clientUserAgent,
          method,
          // other callers expect null, but .headers being optional means it's undefined if not supplied. So we normalize to null.
          userSuppliedHeaders: options.headers ?? null,
          userSuppliedSettings: options.settings ?? {},
          stripeAccount: options.stripeAccount ?? this._stripe.getApiField("stripeAccount"),
          stripeContext: this._normalizeStripeContext(options.stripeContext, this._stripe.getApiField("stripeContext")),
          apiMode
        });
        makeRequest(apiVersion, headers, 0);
      });
    }, "prepareAndMakeRequest");
    if (requestDataProcessor) {
      requestDataProcessor(method, data, options.headers, prepareAndMakeRequest);
    } else {
      let stringifiedData;
      if (apiMode == "v2") {
        stringifiedData = data ? jsonStringifyRequestData(data) : "";
      } else {
        stringifiedData = queryStringifyRequestData(data || {});
      }
      prepareAndMakeRequest(null, stringifiedData);
    }
  }
};
var coerceV2RequestData = /* @__PURE__ */ __name2((data, schema) => {
  if (data == null) {
    return data;
  }
  switch (schema.kind) {
    case "int64_string":
      return typeof data === "bigint" || typeof data === "number" ? String(data) : data;
    case "decimal_string":
      return typeof data.toFixed === "function" && typeof data.isZero === "function" ? data.toString() : data;
    case "object": {
      if (typeof data !== "object" || Array.isArray(data)) {
        return data;
      }
      const obj = data;
      const result = {};
      for (const key of Object.keys(obj)) {
        const fieldSchema = schema.fields[key];
        result[key] = fieldSchema ? coerceV2RequestData(obj[key], fieldSchema) : obj[key];
      }
      return result;
    }
    case "array": {
      if (!Array.isArray(data)) {
        return data;
      }
      return data.map((element) => coerceV2RequestData(element, schema.element));
    }
    case "nullable":
      return coerceV2RequestData(data, schema.inner);
  }
}, "coerceV2RequestData");
var coerceV2ResponseData = /* @__PURE__ */ __name2((data, schema) => {
  if (data == null) {
    return data;
  }
  switch (schema.kind) {
    case "int64_string":
      if (typeof data === "string") {
        try {
          return BigInt(data);
        } catch {
          throw new Error(`Failed to coerce int64_string value: expected an integer string, got '${data}'`);
        }
      }
      return data;
    case "decimal_string":
      if (typeof data === "string") {
        try {
          return Decimal.from(data);
        } catch {
          throw new Error(`Failed to coerce decimal_string value: expected a decimal string, got '${data}'`);
        }
      }
      return data;
    case "object": {
      if (typeof data !== "object" || Array.isArray(data)) {
        return data;
      }
      const obj = data;
      for (const key of Object.keys(schema.fields)) {
        if (key in obj) {
          obj[key] = coerceV2ResponseData(obj[key], schema.fields[key]);
        }
      }
      return obj;
    }
    case "array": {
      if (!Array.isArray(data)) {
        return data;
      }
      for (let i = 0; i < data.length; i++) {
        data[i] = coerceV2ResponseData(data[i], schema.element);
      }
      return data;
    }
    case "nullable":
      return coerceV2ResponseData(data, schema.inner);
  }
}, "coerceV2ResponseData");
var V1Iterator = class {
  static {
    __name(this, "V1Iterator");
  }
  static {
    __name2(this, "V1Iterator");
  }
  constructor(firstPagePromise, params, options, method, path, spec, stripeResource) {
    this.index = 0;
    this.pagePromise = firstPagePromise;
    this.promiseCache = { currentPromise: null };
    this.params = params;
    this.options = options;
    this.method = method;
    this.path = path;
    this.spec = spec;
    this.stripeResource = stripeResource;
  }
  async iterate(pageResult) {
    if (!(pageResult && pageResult.data && typeof pageResult.data.length === "number")) {
      throw Error("Unexpected: Stripe API response does not have a well-formed `data` array.");
    }
    const reverseIteration = !!this.params.ending_before;
    if (this.index < pageResult.data.length) {
      const idx = reverseIteration ? pageResult.data.length - 1 - this.index : this.index;
      const value = pageResult.data[idx];
      this.index += 1;
      return { value, done: false };
    } else if (pageResult.has_more) {
      this.index = 0;
      this.pagePromise = this.getNextPage(pageResult);
      const nextPageResult = await this.pagePromise;
      return this.iterate(nextPageResult);
    }
    return { done: true, value: void 0 };
  }
  /** @abstract */
  getNextPage(_pageResult) {
    throw new Error("Unimplemented");
  }
  async _next() {
    return this.iterate(await this.pagePromise);
  }
  next() {
    if (this.promiseCache.currentPromise) {
      return this.promiseCache.currentPromise;
    }
    const nextPromise = (async () => {
      const ret = await this._next();
      this.promiseCache.currentPromise = null;
      return ret;
    })();
    this.promiseCache.currentPromise = nextPromise;
    return nextPromise;
  }
};
var V1ListIterator = class extends V1Iterator {
  static {
    __name(this, "V1ListIterator");
  }
  static {
    __name2(this, "V1ListIterator");
  }
  getNextPage(pageResult) {
    const reverseIteration = !!this.params.ending_before;
    const lastId = getLastId(pageResult, reverseIteration);
    const nextParams = {
      ...this.params,
      [reverseIteration ? "ending_before" : "starting_after"]: lastId
    };
    return this.stripeResource._makeRequest(this.method, this.path, nextParams, this.options, this.spec);
  }
};
var V1SearchIterator = class extends V1Iterator {
  static {
    __name(this, "V1SearchIterator");
  }
  static {
    __name2(this, "V1SearchIterator");
  }
  getNextPage(pageResult) {
    if (!pageResult.next_page) {
      throw Error("Unexpected: Stripe API response does not have a well-formed `next_page` field, but `has_more` was true.");
    }
    const nextParams = {
      ...this.params,
      page: pageResult.next_page
    };
    return this.stripeResource._makeRequest(this.method, this.path, nextParams, this.options, this.spec);
  }
};
var V2ListIterator = class {
  static {
    __name(this, "V2ListIterator");
  }
  static {
    __name2(this, "V2ListIterator");
  }
  constructor(firstPagePromise, options, spec, stripeResource) {
    this.firstPagePromise = firstPagePromise;
    this.currentPageIterator = null;
    this.nextPageUrl = null;
    this.options = options;
    this.spec = spec;
    this.stripeResource = stripeResource;
  }
  async initFirstPage() {
    if (this.firstPagePromise) {
      const page = await this.firstPagePromise;
      this.firstPagePromise = null;
      this.currentPageIterator = page.data[Symbol.iterator]();
      this.nextPageUrl = page.next_page_url || null;
    }
  }
  async turnPage() {
    if (!this.nextPageUrl)
      return null;
    const page = await this.stripeResource._makeRequest("GET", this.nextPageUrl, void 0, this.options, this.spec);
    this.nextPageUrl = page.next_page_url || null;
    this.currentPageIterator = page.data[Symbol.iterator]();
    return this.currentPageIterator;
  }
  async next() {
    await this.initFirstPage();
    if (this.currentPageIterator) {
      const result2 = this.currentPageIterator.next();
      if (!result2.done)
        return { done: false, value: result2.value };
    }
    const nextPageIterator = await this.turnPage();
    if (!nextPageIterator) {
      return { done: true, value: void 0 };
    }
    const result = nextPageIterator.next();
    if (!result.done)
      return { done: false, value: result.value };
    return { done: true, value: void 0 };
  }
};
var makeAutoPaginationMethods = /* @__PURE__ */ __name2((stripeResource, params, options, method, path, spec, firstPagePromise) => {
  const apiMode = getAPIMode(path);
  const methodType = spec?.methodType;
  if (apiMode !== "v2" && methodType === "search") {
    return makeAutoPaginationMethodsFromIterator(new V1SearchIterator(firstPagePromise, params, options, method, path, spec, stripeResource));
  }
  if (apiMode !== "v2" && methodType === "list") {
    return makeAutoPaginationMethodsFromIterator(new V1ListIterator(firstPagePromise, params, options, method, path, spec, stripeResource));
  }
  if (apiMode === "v2" && methodType === "list") {
    return makeAutoPaginationMethodsFromIterator(new V2ListIterator(firstPagePromise, options, spec, stripeResource));
  }
  return null;
}, "makeAutoPaginationMethods");
var makeAutoPaginationMethodsFromIterator = /* @__PURE__ */ __name2((iterator) => {
  const autoPagingEach = makeAutoPagingEach((...args) => iterator.next(...args));
  const autoPagingToArray = makeAutoPagingToArray(autoPagingEach);
  const autoPaginationMethods = {
    autoPagingEach,
    autoPagingToArray,
    // Async iterator functions:
    next: /* @__PURE__ */ __name2(() => iterator.next(), "next"),
    return: /* @__PURE__ */ __name2(() => {
      return {};
    }, "return"),
    [getAsyncIteratorSymbol()]: () => {
      return autoPaginationMethods;
    }
  };
  return autoPaginationMethods;
}, "makeAutoPaginationMethodsFromIterator");
function getAsyncIteratorSymbol() {
  if (typeof Symbol !== "undefined" && Symbol.asyncIterator) {
    return Symbol.asyncIterator;
  }
  return "@@asyncIterator";
}
__name(getAsyncIteratorSymbol, "getAsyncIteratorSymbol");
__name2(getAsyncIteratorSymbol, "getAsyncIteratorSymbol");
function getDoneCallback(args) {
  if (args.length < 2) {
    return null;
  }
  const onDone = args[1];
  if (typeof onDone !== "function") {
    throw Error(`The second argument to autoPagingEach, if present, must be a callback function; received ${typeof onDone}`);
  }
  return onDone;
}
__name(getDoneCallback, "getDoneCallback");
__name2(getDoneCallback, "getDoneCallback");
function getItemCallback(args) {
  if (args.length === 0) {
    return void 0;
  }
  const onItem = args[0];
  if (typeof onItem !== "function") {
    throw Error(`The first argument to autoPagingEach, if present, must be a callback function; received ${typeof onItem}`);
  }
  if (onItem.length === 2) {
    return onItem;
  }
  if (onItem.length > 2) {
    throw Error(`The \`onItem\` callback function passed to autoPagingEach must accept at most two arguments; got ${onItem}`);
  }
  return /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function _onItem(item, next) {
    const shouldContinue = onItem(item);
    next(shouldContinue);
  }, "_onItem"), "_onItem");
}
__name(getItemCallback, "getItemCallback");
__name2(getItemCallback, "getItemCallback");
function getLastId(listResult, reverseIteration) {
  const lastIdx = reverseIteration ? 0 : listResult.data.length - 1;
  const lastItem = listResult.data[lastIdx];
  const lastId = lastItem && lastItem.id;
  if (!lastId) {
    throw Error("Unexpected: No `id` found on the last item while auto-paging a list.");
  }
  return lastId;
}
__name(getLastId, "getLastId");
__name2(getLastId, "getLastId");
function makeAutoPagingEach(asyncIteratorNext) {
  return /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function autoPagingEach() {
    const callSiteStack = new Error().stack;
    const args = [].slice.call(arguments);
    const onItem = getItemCallback(args);
    const onDone = getDoneCallback(args);
    if (args.length > 2) {
      throw Error(`autoPagingEach takes up to two arguments; received ${args}`);
    }
    const autoPagePromise = wrapAsyncIteratorWithCallback(
      asyncIteratorNext,
      // @ts-ignore we might need a null check
      onItem
    ).catch((err) => {
      attachCallSiteToError(err, callSiteStack);
      throw err;
    });
    if (onDone) {
      autoPagePromise.then(() => onDone(), (err) => onDone(err));
    }
    return autoPagePromise;
  }, "autoPagingEach"), "autoPagingEach");
}
__name(makeAutoPagingEach, "makeAutoPagingEach");
__name2(makeAutoPagingEach, "makeAutoPagingEach");
function makeAutoPagingToArray(autoPagingEach) {
  return /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function autoPagingToArray(opts, onDone) {
    const callSiteStack = new Error().stack;
    const limit = opts && opts.limit;
    if (!limit) {
      throw Error("You must pass a `limit` option to autoPagingToArray, e.g., `autoPagingToArray({limit: 1000});`.");
    }
    if (limit > 1e4) {
      throw Error("You cannot specify a limit of more than 10,000 items to fetch in `autoPagingToArray`; use `autoPagingEach` to iterate through longer lists.");
    }
    const promise = new Promise((resolve, reject) => {
      const items = [];
      autoPagingEach((item) => {
        items.push(item);
        if (items.length >= limit) {
          return false;
        }
      }).then(() => {
        resolve(items);
      }).catch((err) => {
        attachCallSiteToError(err, callSiteStack);
        reject(err);
      });
    });
    if (onDone) {
      promise.then((items) => onDone(null, items), (err) => onDone(err));
    }
    return promise;
  }, "autoPagingToArray"), "autoPagingToArray");
}
__name(makeAutoPagingToArray, "makeAutoPagingToArray");
__name2(makeAutoPagingToArray, "makeAutoPagingToArray");
function wrapAsyncIteratorWithCallback(asyncIteratorNext, onItem) {
  return new Promise((resolve, reject) => {
    function handleIteration(iterResult) {
      if (iterResult.done) {
        resolve();
        return;
      }
      const item = iterResult.value;
      return new Promise((next) => {
        onItem(item, next);
      }).then((shouldContinue) => {
        if (shouldContinue === false) {
          return handleIteration({ done: true, value: void 0 });
        } else {
          return asyncIteratorNext().then(handleIteration);
        }
      });
    }
    __name(handleIteration, "handleIteration");
    __name2(handleIteration, "handleIteration");
    asyncIteratorNext().then(handleIteration).catch(reject);
  });
}
__name(wrapAsyncIteratorWithCallback, "wrapAsyncIteratorWithCallback");
__name2(wrapAsyncIteratorWithCallback, "wrapAsyncIteratorWithCallback");
var StripeResource = class {
  static {
    __name(this, "StripeResource");
  }
  static {
    __name2(this, "StripeResource");
  }
  constructor(stripe, deprecatedUrlData) {
    this.resourcePath = "";
    this.requestDataProcessor = null;
    this._stripe = stripe;
    if (deprecatedUrlData) {
      throw new Error("Support for curried url params was dropped in stripe-node v7.0.0. Instead, pass two ids.");
    }
    this.basePath = makeURLInterpolator(
      // @ts-expect-error changing type of basePath
      this.basePath || stripe.getApiField("basePath")
    );
    const rawPath = this.path || "";
    this.resourcePath = rawPath;
    this.path = makeURLInterpolator(rawPath);
    this.initialize(stripe, deprecatedUrlData);
  }
  initialize(_stripe, _deprecatedUrlData) {
  }
  _makeRequest(method, path, params, options, spec) {
    const requestMethod = method.toUpperCase();
    const encode = spec?.encode || ((data2) => data2);
    const data = encode(params ? { ...params } : {});
    const processed = processOptions(options);
    const apiBase = processed.apiBase || spec?.apiBase || null;
    const host = apiBase ? this._stripe.resolveBaseAddress(apiBase) : null;
    const streaming = processed.streaming || !!spec?.streaming;
    const headers = Object.assign(processed.headers, spec?.headers);
    const usage = spec?.usage || [];
    const dataInQuery = requestMethod === "GET" || requestMethod === "DELETE";
    let bodyData = dataInQuery ? null : data;
    const queryData = dataInQuery ? data : {};
    try {
      if (spec?.validator) {
        spec.validator(data, { headers });
      }
      if (spec?.requestSchema && bodyData) {
        bodyData = coerceV2RequestData(bodyData, spec.requestSchema);
      }
    } catch (err) {
      return Promise.reject(err);
    }
    const callSiteStack = new Error().stack;
    const innerPromise = new Promise((resolve, reject) => {
      function requestCallback(err, response) {
        if (err) {
          attachCallSiteToError(err, callSiteStack);
          reject(err);
        } else {
          try {
            if (spec?.responseSchema) {
              coerceV2ResponseData(response, spec.responseSchema);
            }
            resolve(spec?.transformResponseData ? spec.transformResponseData(response) : response);
          } catch (e) {
            reject(e);
          }
        }
      }
      __name(requestCallback, "requestCallback");
      __name2(requestCallback, "requestCallback");
      const emptyQuery = Object.keys(queryData).length === 0;
      const fullPath = [
        path,
        emptyQuery ? "" : "?",
        queryStringifyRequestData(queryData)
      ].join("");
      this._stripe._requestSender._request(requestMethod, host, fullPath, bodyData, processed.authenticator, {
        headers,
        settings: processed.settings,
        streaming
      }, usage, requestCallback, this.requestDataProcessor?.bind(this));
    });
    if (spec?.methodType) {
      Object.assign(innerPromise, makeAutoPaginationMethods(this, params ? { ...params } : {}, options, requestMethod, path, spec, innerPromise));
    }
    return innerPromise;
  }
};
StripeResource.MAX_BUFFERED_REQUEST_METRICS = 100;
var StripeContext = class _StripeContext {
  static {
    __name(this, "_StripeContext");
  }
  static {
    __name2(this, "StripeContext");
  }
  /**
   * Creates a new StripeContext with the given segments.
   */
  constructor(segments = []) {
    this._segments = [...segments];
  }
  /**
   * Gets a copy of the segments of this Context.
   */
  get segments() {
    return [...this._segments];
  }
  /**
   * Creates a new StripeContext with an additional segment appended.
   */
  push(segment) {
    if (!segment) {
      throw new Error("Segment cannot be null or undefined");
    }
    return new _StripeContext([...this._segments, segment]);
  }
  /**
   * Creates a new StripeContext with the last segment removed.
   * If there are no segments, throws an error.
   */
  pop() {
    if (this._segments.length === 0) {
      throw new Error("Cannot pop from an empty context");
    }
    return new _StripeContext(this._segments.slice(0, -1));
  }
  /**
   * Converts this context to its string representation.
   */
  toString() {
    return this._segments.join("/");
  }
  /**
   * Parses a context string into a StripeContext instance.
   */
  static parse(contextStr) {
    if (!contextStr) {
      return new _StripeContext([]);
    }
    return new _StripeContext(contextStr.split("/"));
  }
};
function createWebhooks(platformFunctions) {
  const Webhook = {
    DEFAULT_TOLERANCE: 300,
    signature: null,
    constructEvent(payload, header, secret, tolerance, cryptoProvider, receivedAt) {
      try {
        if (!this.signature) {
          throw new Error("ERR: missing signature helper, unable to verify");
        }
        cryptoProvider = cryptoProvider || getCryptoProvider();
        this.signature.verifyHeader(payload, header, secret, tolerance || Webhook.DEFAULT_TOLERANCE, cryptoProvider, receivedAt);
      } catch (e) {
        if (e instanceof CryptoProviderOnlySupportsAsyncError) {
          e.message += "\nUse `await constructEventAsync(...)` instead of `constructEvent(...)`";
        }
        throw e;
      }
      const jsonPayload = payload instanceof Uint8Array ? JSON.parse(new TextDecoder("utf8").decode(payload)) : JSON.parse(payload);
      if (jsonPayload && jsonPayload.object === "v2.core.event") {
        throw new Error("You passed an event notification to stripe.webhooks.constructEvent, which expects a webhook payload. Use stripe.parseEventNotification instead.");
      }
      return jsonPayload;
    },
    async constructEventAsync(payload, header, secret, tolerance, cryptoProvider, receivedAt) {
      if (!this.signature) {
        throw new Error("ERR: missing signature helper, unable to verify");
      }
      cryptoProvider = cryptoProvider || getCryptoProvider();
      await this.signature.verifyHeaderAsync(payload, header, secret, tolerance || Webhook.DEFAULT_TOLERANCE, cryptoProvider, receivedAt);
      const jsonPayload = payload instanceof Uint8Array ? JSON.parse(new TextDecoder("utf8").decode(payload)) : JSON.parse(payload);
      if (jsonPayload && jsonPayload.object === "v2.core.event") {
        throw new Error("You passed an event notification to stripe.webhooks.constructEvent, which expects a webhook payload. Use stripe.parseEventNotificationAsync instead.");
      }
      return jsonPayload;
    },
    /**
     * Generates a header to be used for webhook mocking
     *
     * @typedef {object} opts
     * @property {number} timestamp - Timestamp of the header. Defaults to Date.now()
     * @property {string} payload - JSON stringified payload object, containing the 'id' and 'object' parameters
     * @property {string} secret - Stripe webhook secret 'whsec_...'
     * @property {string} scheme - Version of API to hit. Defaults to 'v1'.
     * @property {string} signature - Computed webhook signature
     * @property {CryptoProvider} cryptoProvider - Crypto provider to use for computing the signature if none was provided. Defaults to NodeCryptoProvider.
     */
    generateTestHeaderString: /* @__PURE__ */ __name2(function(opts) {
      const preparedOpts = prepareOptions(opts);
      const signature2 = preparedOpts.signature || preparedOpts.cryptoProvider.computeHMACSignature(preparedOpts.payloadString, preparedOpts.secret);
      return preparedOpts.generateHeaderString(signature2);
    }, "generateTestHeaderString"),
    generateTestHeaderStringAsync: /* @__PURE__ */ __name2(async function(opts) {
      const preparedOpts = prepareOptions(opts);
      const signature2 = preparedOpts.signature || await preparedOpts.cryptoProvider.computeHMACSignatureAsync(preparedOpts.payloadString, preparedOpts.secret);
      return preparedOpts.generateHeaderString(signature2);
    }, "generateTestHeaderStringAsync")
  };
  const signature = {
    EXPECTED_SCHEME: "v1",
    verifyHeader(encodedPayload, encodedHeader, secret, tolerance, cryptoProvider, receivedAt) {
      const { decodedHeader: header, decodedPayload: payload, details, suspectPayloadType } = parseEventDetails(encodedPayload, encodedHeader, this.EXPECTED_SCHEME);
      const secretContainsWhitespace = /\s/.test(secret);
      cryptoProvider = cryptoProvider || getCryptoProvider();
      const expectedSignature = cryptoProvider.computeHMACSignature(makeHMACContent(payload, details), secret);
      validateComputedSignature(payload, header, details, expectedSignature, tolerance || 0, suspectPayloadType, secretContainsWhitespace, receivedAt);
      return true;
    },
    async verifyHeaderAsync(encodedPayload, encodedHeader, secret, tolerance, cryptoProvider, receivedAt) {
      const { decodedHeader: header, decodedPayload: payload, details, suspectPayloadType } = parseEventDetails(encodedPayload, encodedHeader, this.EXPECTED_SCHEME);
      const secretContainsWhitespace = /\s/.test(secret);
      cryptoProvider = cryptoProvider || getCryptoProvider();
      const expectedSignature = await cryptoProvider.computeHMACSignatureAsync(makeHMACContent(payload, details), secret);
      return validateComputedSignature(payload, header, details, expectedSignature, tolerance || 0, suspectPayloadType, secretContainsWhitespace, receivedAt);
    }
  };
  function makeHMACContent(payload, details) {
    return `${details.timestamp}.${payload}`;
  }
  __name(makeHMACContent, "makeHMACContent");
  __name2(makeHMACContent, "makeHMACContent");
  function parseEventDetails(encodedPayload, encodedHeader, expectedScheme) {
    if (Array.isArray(encodedHeader)) {
      throw new Error("Unexpected: An array was passed as a header, which should not be possible for the stripe-signature header.");
    }
    if (!encodedPayload) {
      throw new StripeSignatureVerificationError(encodedHeader, encodedPayload, {
        message: "No webhook payload was provided."
      });
    }
    const suspectPayloadType = typeof encodedPayload != "string" && !(encodedPayload instanceof Uint8Array);
    const textDecoder = new TextDecoder("utf8");
    const decodedPayload = encodedPayload instanceof Uint8Array ? textDecoder.decode(encodedPayload) : encodedPayload;
    if (encodedHeader == null || encodedHeader == "") {
      throw new StripeSignatureVerificationError(encodedHeader, encodedPayload, {
        message: "No stripe-signature header value was provided."
      });
    }
    const decodedHeader = encodedHeader instanceof Uint8Array ? textDecoder.decode(encodedHeader) : encodedHeader;
    const details = parseHeader(decodedHeader, expectedScheme);
    if (!details || details.timestamp === -1) {
      throw new StripeSignatureVerificationError(decodedHeader, decodedPayload, {
        message: "Unable to extract timestamp and signatures from header"
      });
    }
    if (!details.signatures.length) {
      throw new StripeSignatureVerificationError(decodedHeader, decodedPayload, {
        message: "No signatures found with expected scheme"
      });
    }
    return {
      decodedPayload,
      decodedHeader,
      details,
      suspectPayloadType
    };
  }
  __name(parseEventDetails, "parseEventDetails");
  __name2(parseEventDetails, "parseEventDetails");
  function validateComputedSignature(payload, header, details, expectedSignature, tolerance, suspectPayloadType, secretContainsWhitespace, receivedAt) {
    const signatureFound = !!details.signatures.filter(platformFunctions.secureCompare.bind(platformFunctions, expectedSignature)).length;
    const docsLocation = "\nLearn more about webhook signing and explore webhook integration examples for various frameworks at https://docs.stripe.com/webhooks/signature";
    const whitespaceMessage = secretContainsWhitespace ? "\n\nNote: The provided signing secret contains whitespace. This often indicates an extra newline or space is in the value" : "";
    if (!signatureFound) {
      if (suspectPayloadType) {
        throw new StripeSignatureVerificationError(header, payload, {
          message: "Webhook payload must be provided as a string or a Buffer (https://nodejs.org/api/buffer.html) instance representing the _raw_ request body.Payload was provided as a parsed JavaScript object instead. \nSignature verification is impossible without access to the original signed material. \n" + docsLocation + "\n" + whitespaceMessage
        });
      }
      throw new StripeSignatureVerificationError(header, payload, {
        message: "No signatures found matching the expected signature for payload. Are you passing the raw request body you received from Stripe? \n If a webhook request is being forwarded by a third-party tool, ensure that the exact request body, including JSON formatting and new line style, is preserved.\n" + docsLocation + "\n" + whitespaceMessage
      });
    }
    const timestampAge = Math.floor((typeof receivedAt === "number" ? receivedAt : Date.now()) / 1e3) - details.timestamp;
    if (tolerance > 0 && timestampAge > tolerance) {
      throw new StripeSignatureVerificationError(header, payload, {
        message: "Timestamp outside the tolerance zone"
      });
    }
    return true;
  }
  __name(validateComputedSignature, "validateComputedSignature");
  __name2(validateComputedSignature, "validateComputedSignature");
  function parseHeader(header, scheme) {
    if (typeof header !== "string") {
      return null;
    }
    scheme = scheme || signature.EXPECTED_SCHEME;
    return header.split(",").reduce((accum, item) => {
      const kv = item.split("=");
      if (kv[0] === "t") {
        accum.timestamp = parseInt(kv[1], 10);
      }
      if (kv[0] === scheme) {
        accum.signatures.push(kv[1]);
      }
      return accum;
    }, {
      timestamp: -1,
      signatures: []
    });
  }
  __name(parseHeader, "parseHeader");
  __name2(parseHeader, "parseHeader");
  let webhooksCryptoProviderInstance = null;
  function getCryptoProvider() {
    if (!webhooksCryptoProviderInstance) {
      webhooksCryptoProviderInstance = platformFunctions.createDefaultCryptoProvider();
    }
    return webhooksCryptoProviderInstance;
  }
  __name(getCryptoProvider, "getCryptoProvider");
  __name2(getCryptoProvider, "getCryptoProvider");
  function prepareOptions(opts) {
    if (!opts) {
      throw new StripeError({
        message: "Options are required"
      });
    }
    const timestamp = opts.timestamp && Math.floor(opts.timestamp) || Math.floor(Date.now() / 1e3);
    const scheme = opts.scheme || signature.EXPECTED_SCHEME;
    const cryptoProvider = opts.cryptoProvider || getCryptoProvider();
    const payloadString = `${timestamp}.${opts.payload}`;
    const generateHeaderString = /* @__PURE__ */ __name2((signature2) => {
      return `t=${timestamp},${scheme}=${signature2}`;
    }, "generateHeaderString");
    return {
      ...opts,
      timestamp,
      scheme,
      cryptoProvider,
      payloadString,
      generateHeaderString
    };
  }
  __name(prepareOptions, "prepareOptions");
  __name2(prepareOptions, "prepareOptions");
  Webhook.signature = signature;
  return Webhook;
}
__name(createWebhooks, "createWebhooks");
__name2(createWebhooks, "createWebhooks");
var ApiVersion = "2026-04-22.dahlia";
var resources_exports = {};
__export(resources_exports, {
  Account: /* @__PURE__ */ __name(() => AccountResource3, "Account"),
  AccountLinks: /* @__PURE__ */ __name(() => AccountLinkResource2, "AccountLinks"),
  AccountSessions: /* @__PURE__ */ __name(() => AccountSessionResource, "AccountSessions"),
  Accounts: /* @__PURE__ */ __name(() => AccountResource3, "Accounts"),
  ApplePayDomains: /* @__PURE__ */ __name(() => ApplePayDomainResource, "ApplePayDomains"),
  ApplicationFees: /* @__PURE__ */ __name(() => ApplicationFeeResource, "ApplicationFees"),
  Apps: /* @__PURE__ */ __name(() => Apps, "Apps"),
  Balance: /* @__PURE__ */ __name(() => BalanceResource, "Balance"),
  BalanceSettings: /* @__PURE__ */ __name(() => BalanceSettingResource, "BalanceSettings"),
  BalanceTransactions: /* @__PURE__ */ __name(() => BalanceTransactionResource, "BalanceTransactions"),
  Balances: /* @__PURE__ */ __name(() => BalanceResource, "Balances"),
  Billing: /* @__PURE__ */ __name(() => Billing, "Billing"),
  BillingPortal: /* @__PURE__ */ __name(() => BillingPortal, "BillingPortal"),
  Charges: /* @__PURE__ */ __name(() => ChargeResource, "Charges"),
  Checkout: /* @__PURE__ */ __name(() => Checkout, "Checkout"),
  Climate: /* @__PURE__ */ __name(() => Climate, "Climate"),
  ConfirmationTokens: /* @__PURE__ */ __name(() => ConfirmationTokenResource2, "ConfirmationTokens"),
  CountrySpecs: /* @__PURE__ */ __name(() => CountrySpecResource, "CountrySpecs"),
  Coupons: /* @__PURE__ */ __name(() => CouponResource, "Coupons"),
  CreditNotes: /* @__PURE__ */ __name(() => CreditNoteResource, "CreditNotes"),
  CustomerSessions: /* @__PURE__ */ __name(() => CustomerSessionResource, "CustomerSessions"),
  Customers: /* @__PURE__ */ __name(() => CustomerResource2, "Customers"),
  Disputes: /* @__PURE__ */ __name(() => DisputeResource2, "Disputes"),
  Entitlements: /* @__PURE__ */ __name(() => Entitlements, "Entitlements"),
  EphemeralKeys: /* @__PURE__ */ __name(() => EphemeralKeyResource, "EphemeralKeys"),
  Events: /* @__PURE__ */ __name(() => EventResource2, "Events"),
  ExchangeRates: /* @__PURE__ */ __name(() => ExchangeRateResource, "ExchangeRates"),
  FileLinks: /* @__PURE__ */ __name(() => FileLinkResource, "FileLinks"),
  Files: /* @__PURE__ */ __name(() => FileResource, "Files"),
  FinancialConnections: /* @__PURE__ */ __name(() => FinancialConnections, "FinancialConnections"),
  Forwarding: /* @__PURE__ */ __name(() => Forwarding, "Forwarding"),
  Identity: /* @__PURE__ */ __name(() => Identity, "Identity"),
  InvoiceItems: /* @__PURE__ */ __name(() => InvoiceItemResource, "InvoiceItems"),
  InvoicePayments: /* @__PURE__ */ __name(() => InvoicePaymentResource, "InvoicePayments"),
  InvoiceRenderingTemplates: /* @__PURE__ */ __name(() => InvoiceRenderingTemplateResource, "InvoiceRenderingTemplates"),
  Invoices: /* @__PURE__ */ __name(() => InvoiceResource, "Invoices"),
  Issuing: /* @__PURE__ */ __name(() => Issuing, "Issuing"),
  Mandates: /* @__PURE__ */ __name(() => MandateResource, "Mandates"),
  OAuthResource: /* @__PURE__ */ __name(() => OAuthResource, "OAuthResource"),
  PaymentAttemptRecords: /* @__PURE__ */ __name(() => PaymentAttemptRecordResource, "PaymentAttemptRecords"),
  PaymentIntents: /* @__PURE__ */ __name(() => PaymentIntentResource, "PaymentIntents"),
  PaymentLinks: /* @__PURE__ */ __name(() => PaymentLinkResource, "PaymentLinks"),
  PaymentMethodConfigurations: /* @__PURE__ */ __name(() => PaymentMethodConfigurationResource, "PaymentMethodConfigurations"),
  PaymentMethodDomains: /* @__PURE__ */ __name(() => PaymentMethodDomainResource, "PaymentMethodDomains"),
  PaymentMethods: /* @__PURE__ */ __name(() => PaymentMethodResource, "PaymentMethods"),
  PaymentRecords: /* @__PURE__ */ __name(() => PaymentRecordResource, "PaymentRecords"),
  Payouts: /* @__PURE__ */ __name(() => PayoutResource, "Payouts"),
  Plans: /* @__PURE__ */ __name(() => PlanResource, "Plans"),
  Prices: /* @__PURE__ */ __name(() => PriceResource, "Prices"),
  Products: /* @__PURE__ */ __name(() => ProductResource2, "Products"),
  PromotionCodes: /* @__PURE__ */ __name(() => PromotionCodeResource, "PromotionCodes"),
  Quotes: /* @__PURE__ */ __name(() => QuoteResource, "Quotes"),
  Radar: /* @__PURE__ */ __name(() => Radar, "Radar"),
  Refunds: /* @__PURE__ */ __name(() => RefundResource2, "Refunds"),
  Reporting: /* @__PURE__ */ __name(() => Reporting, "Reporting"),
  Reviews: /* @__PURE__ */ __name(() => ReviewResource, "Reviews"),
  SetupAttempts: /* @__PURE__ */ __name(() => SetupAttemptResource, "SetupAttempts"),
  SetupIntents: /* @__PURE__ */ __name(() => SetupIntentResource, "SetupIntents"),
  ShippingRates: /* @__PURE__ */ __name(() => ShippingRateResource, "ShippingRates"),
  Sigma: /* @__PURE__ */ __name(() => Sigma, "Sigma"),
  Sources: /* @__PURE__ */ __name(() => SourceResource, "Sources"),
  SubscriptionItems: /* @__PURE__ */ __name(() => SubscriptionItemResource, "SubscriptionItems"),
  SubscriptionSchedules: /* @__PURE__ */ __name(() => SubscriptionScheduleResource, "SubscriptionSchedules"),
  Subscriptions: /* @__PURE__ */ __name(() => SubscriptionResource, "Subscriptions"),
  Tax: /* @__PURE__ */ __name(() => Tax, "Tax"),
  TaxCodes: /* @__PURE__ */ __name(() => TaxCodeResource, "TaxCodes"),
  TaxIds: /* @__PURE__ */ __name(() => TaxIdResource, "TaxIds"),
  TaxRates: /* @__PURE__ */ __name(() => TaxRateResource, "TaxRates"),
  Terminal: /* @__PURE__ */ __name(() => Terminal, "Terminal"),
  TestHelpers: /* @__PURE__ */ __name(() => TestHelpers, "TestHelpers"),
  Tokens: /* @__PURE__ */ __name(() => TokenResource2, "Tokens"),
  Topups: /* @__PURE__ */ __name(() => TopupResource, "Topups"),
  Transfers: /* @__PURE__ */ __name(() => TransferResource, "Transfers"),
  Treasury: /* @__PURE__ */ __name(() => Treasury, "Treasury"),
  V2: /* @__PURE__ */ __name(() => V2, "V2"),
  WebhookEndpoints: /* @__PURE__ */ __name(() => WebhookEndpointResource, "WebhookEndpoints")
});
function ResourceNamespace(stripe, resources) {
  for (const name in resources) {
    if (!Object.prototype.hasOwnProperty.call(resources, name)) {
      continue;
    }
    const camelCaseName = name[0].toLowerCase() + name.substring(1);
    const resource = new resources[name](stripe);
    this[camelCaseName] = resource;
  }
}
__name(ResourceNamespace, "ResourceNamespace");
__name2(ResourceNamespace, "ResourceNamespace");
function resourceNamespace(namespace, resources) {
  return function(stripe) {
    return new ResourceNamespace(stripe, resources);
  };
}
__name(resourceNamespace, "resourceNamespace");
__name2(resourceNamespace, "resourceNamespace");
var AccountLinkResource = class extends StripeResource {
  static {
    __name(this, "AccountLinkResource");
  }
  static {
    __name2(this, "AccountLinkResource");
  }
  /**
   * Creates an AccountLink object that includes a single-use URL that an account can use to access a Stripe-hosted flow for collecting or updating required information.
   * @throws Stripe.RateLimitError
   */
  create(params, options) {
    return this._makeRequest("POST", "/v2/core/account_links", params, options);
  }
};
var AccountTokenResource = class extends StripeResource {
  static {
    __name(this, "AccountTokenResource");
  }
  static {
    __name2(this, "AccountTokenResource");
  }
  /**
   * Creates an Account Token.
   * @throws Stripe.RateLimitError
   */
  create(params, options) {
    return this._makeRequest("POST", "/v2/core/account_tokens", params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          identity: {
            kind: "object",
            fields: {
              individual: {
                kind: "object",
                fields: {
                  relationship: {
                    kind: "object",
                    fields: { percent_ownership: { kind: "decimal_string" } }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Retrieves an Account Token.
   * @throws Stripe.RateLimitError
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v2/core/account_tokens/${id}`, params, options);
  }
};
var AccountResource = class extends StripeResource {
  static {
    __name(this, "AccountResource");
  }
  static {
    __name2(this, "AccountResource");
  }
  /**
   * Returns a list of Financial Connections Account objects.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/financial_connections/accounts", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves the details of an Financial Connections Account.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/financial_connections/accounts/${id}`, params, options);
  }
  /**
   * Disables your access to a Financial Connections Account. You will no longer be able to access data associated with the account (e.g. balances, transactions).
   */
  disconnect(id, params, options) {
    return this._makeRequest("POST", `/v1/financial_connections/accounts/${id}/disconnect`, params, options);
  }
  /**
   * Refreshes the data associated with a Financial Connections Account.
   */
  refresh(id, params, options) {
    return this._makeRequest("POST", `/v1/financial_connections/accounts/${id}/refresh`, params, options);
  }
  /**
   * Subscribes to periodic refreshes of data associated with a Financial Connections Account. When the account status is active, data is typically refreshed once a day.
   */
  subscribe(id, params, options) {
    return this._makeRequest("POST", `/v1/financial_connections/accounts/${id}/subscribe`, params, options);
  }
  /**
   * Unsubscribes from periodic refreshes of data associated with a Financial Connections Account.
   */
  unsubscribe(id, params, options) {
    return this._makeRequest("POST", `/v1/financial_connections/accounts/${id}/unsubscribe`, params, options);
  }
  /**
   * Lists all owners for a given Account
   */
  listOwners(id, params, options) {
    return this._makeRequest("GET", `/v1/financial_connections/accounts/${id}/owners`, params, options, {
      methodType: "list"
    });
  }
};
var PersonResource = class extends StripeResource {
  static {
    __name(this, "PersonResource");
  }
  static {
    __name2(this, "PersonResource");
  }
  /**
   * Returns a paginated list of Persons associated with an Account.
   * @throws Stripe.RateLimitError
   */
  list(id, params, options) {
    return this._makeRequest("GET", `/v2/core/accounts/${id}/persons`, params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                relationship: {
                  kind: "object",
                  fields: { percent_ownership: { kind: "decimal_string" } }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Create a Person. Adds an individual to an Account's identity. You can set relationship attributes and identity information at creation.
   * @throws Stripe.RateLimitError
   */
  create(id, params, options) {
    return this._makeRequest("POST", `/v2/core/accounts/${id}/persons`, params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          relationship: {
            kind: "object",
            fields: { percent_ownership: { kind: "decimal_string" } }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          relationship: {
            kind: "object",
            fields: { percent_ownership: { kind: "decimal_string" } }
          }
        }
      }
    });
  }
  /**
   * Delete a Person associated with an Account.
   * @throws Stripe.RateLimitError
   */
  del(accountId, id, params, options) {
    return this._makeRequest("DELETE", `/v2/core/accounts/${accountId}/persons/${id}`, params, options);
  }
  /**
   * Retrieves a Person associated with an Account.
   * @throws Stripe.RateLimitError
   */
  retrieve(accountId, id, params, options) {
    return this._makeRequest("GET", `/v2/core/accounts/${accountId}/persons/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          relationship: {
            kind: "object",
            fields: { percent_ownership: { kind: "decimal_string" } }
          }
        }
      }
    });
  }
  /**
   * Updates a Person associated with an Account.
   * @throws Stripe.RateLimitError
   */
  update(accountId, id, params, options) {
    return this._makeRequest("POST", `/v2/core/accounts/${accountId}/persons/${id}`, params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          relationship: {
            kind: "object",
            fields: { percent_ownership: { kind: "decimal_string" } }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          relationship: {
            kind: "object",
            fields: { percent_ownership: { kind: "decimal_string" } }
          }
        }
      }
    });
  }
};
var PersonTokenResource = class extends StripeResource {
  static {
    __name(this, "PersonTokenResource");
  }
  static {
    __name2(this, "PersonTokenResource");
  }
  /**
   * Creates a Person Token associated with an Account.
   * @throws Stripe.RateLimitError
   */
  create(id, params, options) {
    return this._makeRequest("POST", `/v2/core/accounts/${id}/person_tokens`, params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          relationship: {
            kind: "object",
            fields: { percent_ownership: { kind: "decimal_string" } }
          }
        }
      }
    });
  }
  /**
   * Retrieves a Person Token associated with an Account.
   * @throws Stripe.RateLimitError
   */
  retrieve(accountId, id, params, options) {
    return this._makeRequest("GET", `/v2/core/accounts/${accountId}/person_tokens/${id}`, params, options);
  }
};
var AccountResource2 = class extends StripeResource {
  static {
    __name(this, "AccountResource2");
  }
  static {
    __name2(this, "AccountResource");
  }
  constructor(stripe) {
    super(stripe);
    this.stripe = stripe;
    this.persons = new PersonResource(stripe);
    this.personTokens = new PersonTokenResource(stripe);
  }
  /**
   * Returns a list of Accounts.
   * @throws Stripe.RateLimitError
   */
  list(params, options) {
    return this._makeRequest("GET", "/v2/core/accounts", params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                identity: {
                  kind: "object",
                  fields: {
                    individual: {
                      kind: "object",
                      fields: {
                        relationship: {
                          kind: "object",
                          fields: { percent_ownership: { kind: "decimal_string" } }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * An Account is a representation of a company, individual or other entity that a user interacts with. Accounts contain identifying information about the entity, and configurations that store the features an account has access to. An account can be configured as any or all of the following configurations: Customer, Merchant and/or Recipient.
   * @throws Stripe.RateLimitError
   */
  create(params, options) {
    return this._makeRequest("POST", "/v2/core/accounts", params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          identity: {
            kind: "object",
            fields: {
              individual: {
                kind: "object",
                fields: {
                  relationship: {
                    kind: "object",
                    fields: { percent_ownership: { kind: "decimal_string" } }
                  }
                }
              }
            }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          identity: {
            kind: "object",
            fields: {
              individual: {
                kind: "object",
                fields: {
                  relationship: {
                    kind: "object",
                    fields: { percent_ownership: { kind: "decimal_string" } }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Retrieves the details of an Account.
   * @throws Stripe.RateLimitError
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v2/core/accounts/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          identity: {
            kind: "object",
            fields: {
              individual: {
                kind: "object",
                fields: {
                  relationship: {
                    kind: "object",
                    fields: { percent_ownership: { kind: "decimal_string" } }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Updates the details of an Account.
   * @throws Stripe.RateLimitError
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v2/core/accounts/${id}`, params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          identity: {
            kind: "object",
            fields: {
              individual: {
                kind: "object",
                fields: {
                  relationship: {
                    kind: "object",
                    fields: { percent_ownership: { kind: "decimal_string" } }
                  }
                }
              }
            }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          identity: {
            kind: "object",
            fields: {
              individual: {
                kind: "object",
                fields: {
                  relationship: {
                    kind: "object",
                    fields: { percent_ownership: { kind: "decimal_string" } }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Removes access to the Account and its associated resources. Closed Accounts can no longer be operated on, but limited information can still be retrieved through the API in order to be able to track their history.
   * @throws Stripe.RateLimitError
   */
  close(id, params, options) {
    return this._makeRequest("POST", `/v2/core/accounts/${id}/close`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          identity: {
            kind: "object",
            fields: {
              individual: {
                kind: "object",
                fields: {
                  relationship: {
                    kind: "object",
                    fields: { percent_ownership: { kind: "decimal_string" } }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
};
var ActiveEntitlementResource = class extends StripeResource {
  static {
    __name(this, "ActiveEntitlementResource");
  }
  static {
    __name2(this, "ActiveEntitlementResource");
  }
  /**
   * Retrieve a list of active entitlements for a customer
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/entitlements/active_entitlements", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieve an active entitlement
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/entitlements/active_entitlements/${id}`, params, options);
  }
};
var AlertResource = class extends StripeResource {
  static {
    __name(this, "AlertResource");
  }
  static {
    __name2(this, "AlertResource");
  }
  /**
   * Lists billing active and inactive alerts
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/billing/alerts", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a billing alert
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/billing/alerts", params, options);
  }
  /**
   * Retrieves a billing alert given an ID
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/billing/alerts/${id}`, params, options);
  }
  /**
   * Reactivates this alert, allowing it to trigger again.
   */
  activate(id, params, options) {
    return this._makeRequest("POST", `/v1/billing/alerts/${id}/activate`, params, options);
  }
  /**
   * Archives this alert, removing it from the list view and APIs. This is non-reversible.
   */
  archive(id, params, options) {
    return this._makeRequest("POST", `/v1/billing/alerts/${id}/archive`, params, options);
  }
  /**
   * Deactivates this alert, preventing it from triggering.
   */
  deactivate(id, params, options) {
    return this._makeRequest("POST", `/v1/billing/alerts/${id}/deactivate`, params, options);
  }
};
var AssociationResource = class extends StripeResource {
  static {
    __name(this, "AssociationResource");
  }
  static {
    __name2(this, "AssociationResource");
  }
  /**
   * Finds a tax association object by PaymentIntent id.
   */
  find(params, options) {
    return this._makeRequest("GET", "/v1/tax/associations/find", params, options);
  }
};
var AuthorizationResource = class extends StripeResource {
  static {
    __name(this, "AuthorizationResource");
  }
  static {
    __name2(this, "AuthorizationResource");
  }
  /**
   * Returns a list of Issuing Authorization objects. The objects are sorted in descending order by creation date, with the most recently created object appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/issuing/authorizations", params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                fleet: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      reported_breakdown: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            fuel: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  gross_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            },
                            non_fuel: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  gross_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            },
                            tax: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  local_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  },
                                  national_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                fuel: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      quantity_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      },
                      unit_cost_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      }
                    }
                  }
                },
                transactions: {
                  kind: "array",
                  element: {
                    kind: "object",
                    fields: {
                      purchase_details: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            fleet: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  reported_breakdown: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        fuel: {
                                          kind: "nullable",
                                          inner: {
                                            kind: "object",
                                            fields: {
                                              gross_amount_decimal: {
                                                kind: "nullable",
                                                inner: {
                                                  kind: "decimal_string"
                                                }
                                              }
                                            }
                                          }
                                        },
                                        non_fuel: {
                                          kind: "nullable",
                                          inner: {
                                            kind: "object",
                                            fields: {
                                              gross_amount_decimal: {
                                                kind: "nullable",
                                                inner: {
                                                  kind: "decimal_string"
                                                }
                                              }
                                            }
                                          }
                                        },
                                        tax: {
                                          kind: "nullable",
                                          inner: {
                                            kind: "object",
                                            fields: {
                                              local_amount_decimal: {
                                                kind: "nullable",
                                                inner: {
                                                  kind: "decimal_string"
                                                }
                                              },
                                              national_amount_decimal: {
                                                kind: "nullable",
                                                inner: {
                                                  kind: "decimal_string"
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            },
                            fuel: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  quantity_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  },
                                  unit_cost_decimal: { kind: "decimal_string" }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Retrieves an Issuing Authorization object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/issuing/authorizations/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          fleet: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                reported_breakdown: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      non_fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      tax: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            local_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            national_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          fuel: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                quantity_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                },
                unit_cost_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          },
          transactions: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                purchase_details: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fleet: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            reported_breakdown: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  non_fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  tax: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        local_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        national_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      },
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            quantity_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            unit_cost_decimal: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Updates the specified Issuing Authorization object by setting the values of the parameters passed. Any parameters not provided will be left unchanged.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/issuing/authorizations/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          fleet: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                reported_breakdown: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      non_fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      tax: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            local_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            national_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          fuel: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                quantity_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                },
                unit_cost_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          },
          transactions: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                purchase_details: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fleet: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            reported_breakdown: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  non_fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  tax: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        local_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        national_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      },
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            quantity_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            unit_cost_decimal: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * [Deprecated] Approves a pending Issuing Authorization object. This request should be made within the timeout window of the [real-time authorization](https://docs.stripe.com/docs/issuing/controls/real-time-authorizations) flow.
   * This method is deprecated. Instead, [respond directly to the webhook request to approve an authorization](https://docs.stripe.com/docs/issuing/controls/real-time-authorizations#authorization-handling).
   * @deprecated
   */
  approve(id, params, options) {
    return this._makeRequest("POST", `/v1/issuing/authorizations/${id}/approve`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          fleet: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                reported_breakdown: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      non_fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      tax: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            local_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            national_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          fuel: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                quantity_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                },
                unit_cost_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          },
          transactions: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                purchase_details: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fleet: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            reported_breakdown: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  non_fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  tax: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        local_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        national_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      },
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            quantity_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            unit_cost_decimal: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * [Deprecated] Declines a pending Issuing Authorization object. This request should be made within the timeout window of the [real time authorization](https://docs.stripe.com/docs/issuing/controls/real-time-authorizations) flow.
   * This method is deprecated. Instead, [respond directly to the webhook request to decline an authorization](https://docs.stripe.com/docs/issuing/controls/real-time-authorizations#authorization-handling).
   * @deprecated
   */
  decline(id, params, options) {
    return this._makeRequest("POST", `/v1/issuing/authorizations/${id}/decline`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          fleet: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                reported_breakdown: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      non_fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      tax: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            local_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            national_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          fuel: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                quantity_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                },
                unit_cost_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          },
          transactions: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                purchase_details: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fleet: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            reported_breakdown: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  non_fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  tax: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        local_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        national_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      },
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            quantity_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            unit_cost_decimal: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
};
var AuthorizationResource2 = class extends StripeResource {
  static {
    __name(this, "AuthorizationResource2");
  }
  static {
    __name2(this, "AuthorizationResource");
  }
  /**
   * Create a test-mode authorization.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/test_helpers/issuing/authorizations", params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          fleet: {
            kind: "object",
            fields: {
              reported_breakdown: {
                kind: "object",
                fields: {
                  fuel: {
                    kind: "object",
                    fields: { gross_amount_decimal: { kind: "decimal_string" } }
                  },
                  non_fuel: {
                    kind: "object",
                    fields: { gross_amount_decimal: { kind: "decimal_string" } }
                  },
                  tax: {
                    kind: "object",
                    fields: {
                      local_amount_decimal: { kind: "decimal_string" },
                      national_amount_decimal: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          },
          fuel: {
            kind: "object",
            fields: {
              quantity_decimal: { kind: "decimal_string" },
              unit_cost_decimal: { kind: "decimal_string" }
            }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          fleet: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                reported_breakdown: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      non_fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      tax: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            local_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            national_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          fuel: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                quantity_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                },
                unit_cost_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          },
          transactions: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                purchase_details: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fleet: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            reported_breakdown: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  non_fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  tax: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        local_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        national_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      },
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            quantity_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            unit_cost_decimal: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Capture a test-mode authorization.
   */
  capture(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/issuing/authorizations/${id}/capture`, params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          purchase_details: {
            kind: "object",
            fields: {
              fleet: {
                kind: "object",
                fields: {
                  reported_breakdown: {
                    kind: "object",
                    fields: {
                      fuel: {
                        kind: "object",
                        fields: {
                          gross_amount_decimal: { kind: "decimal_string" }
                        }
                      },
                      non_fuel: {
                        kind: "object",
                        fields: {
                          gross_amount_decimal: { kind: "decimal_string" }
                        }
                      },
                      tax: {
                        kind: "object",
                        fields: {
                          local_amount_decimal: { kind: "decimal_string" },
                          national_amount_decimal: { kind: "decimal_string" }
                        }
                      }
                    }
                  }
                }
              },
              fuel: {
                kind: "object",
                fields: {
                  quantity_decimal: { kind: "decimal_string" },
                  unit_cost_decimal: { kind: "decimal_string" }
                }
              },
              receipt: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: { quantity: { kind: "decimal_string" } }
                }
              }
            }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          fleet: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                reported_breakdown: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      non_fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      tax: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            local_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            national_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          fuel: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                quantity_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                },
                unit_cost_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          },
          transactions: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                purchase_details: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fleet: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            reported_breakdown: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  non_fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  tax: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        local_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        national_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      },
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            quantity_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            unit_cost_decimal: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Expire a test-mode Authorization.
   */
  expire(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/issuing/authorizations/${id}/expire`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          fleet: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                reported_breakdown: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      non_fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      tax: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            local_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            national_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          fuel: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                quantity_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                },
                unit_cost_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          },
          transactions: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                purchase_details: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fleet: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            reported_breakdown: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  non_fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  tax: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        local_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        national_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      },
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            quantity_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            unit_cost_decimal: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Finalize the amount on an Authorization prior to capture, when the initial authorization was for an estimated amount.
   */
  finalizeAmount(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/issuing/authorizations/${id}/finalize_amount`, params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          fleet: {
            kind: "object",
            fields: {
              reported_breakdown: {
                kind: "object",
                fields: {
                  fuel: {
                    kind: "object",
                    fields: { gross_amount_decimal: { kind: "decimal_string" } }
                  },
                  non_fuel: {
                    kind: "object",
                    fields: { gross_amount_decimal: { kind: "decimal_string" } }
                  },
                  tax: {
                    kind: "object",
                    fields: {
                      local_amount_decimal: { kind: "decimal_string" },
                      national_amount_decimal: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          },
          fuel: {
            kind: "object",
            fields: {
              quantity_decimal: { kind: "decimal_string" },
              unit_cost_decimal: { kind: "decimal_string" }
            }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          fleet: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                reported_breakdown: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      non_fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      tax: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            local_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            national_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          fuel: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                quantity_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                },
                unit_cost_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          },
          transactions: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                purchase_details: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fleet: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            reported_breakdown: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  non_fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  tax: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        local_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        national_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      },
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            quantity_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            unit_cost_decimal: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Respond to a fraud challenge on a testmode Issuing authorization, simulating either a confirmation of fraud or a correction of legitimacy.
   */
  respond(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/issuing/authorizations/${id}/fraud_challenges/respond`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          fleet: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                reported_breakdown: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      non_fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      tax: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            local_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            national_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          fuel: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                quantity_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                },
                unit_cost_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          },
          transactions: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                purchase_details: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fleet: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            reported_breakdown: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  non_fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  tax: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        local_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        national_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      },
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            quantity_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            unit_cost_decimal: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Increment a test-mode Authorization.
   */
  increment(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/issuing/authorizations/${id}/increment`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          fleet: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                reported_breakdown: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      non_fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      tax: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            local_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            national_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          fuel: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                quantity_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                },
                unit_cost_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          },
          transactions: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                purchase_details: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fleet: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            reported_breakdown: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  non_fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  tax: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        local_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        national_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      },
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            quantity_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            unit_cost_decimal: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Reverse a test-mode Authorization.
   */
  reverse(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/issuing/authorizations/${id}/reverse`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          fleet: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                reported_breakdown: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      non_fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      tax: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            local_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            national_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          fuel: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                quantity_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                },
                unit_cost_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          },
          transactions: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                purchase_details: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fleet: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            reported_breakdown: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  non_fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  tax: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        local_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        national_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      },
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            quantity_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            unit_cost_decimal: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
};
var CalculationResource = class extends StripeResource {
  static {
    __name(this, "CalculationResource");
  }
  static {
    __name2(this, "CalculationResource");
  }
  /**
   * Retrieves a Tax Calculation object, if the calculation hasn't expired.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/tax/calculations/${id}`, params, options);
  }
  /**
   * Calculates tax based on the input and returns a Tax Calculation object.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/tax/calculations", params, options);
  }
  /**
   * Retrieves the line items of a tax calculation as a collection, if the calculation hasn't expired.
   */
  listLineItems(id, params, options) {
    return this._makeRequest("GET", `/v1/tax/calculations/${id}/line_items`, params, options, {
      methodType: "list"
    });
  }
};
var CardholderResource = class extends StripeResource {
  static {
    __name(this, "CardholderResource");
  }
  static {
    __name2(this, "CardholderResource");
  }
  /**
   * Returns a list of Issuing Cardholder objects. The objects are sorted in descending order by creation date, with the most recently created object appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/issuing/cardholders", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a new Issuing Cardholder object that can be issued cards.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/issuing/cardholders", params, options);
  }
  /**
   * Retrieves an Issuing Cardholder object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/issuing/cardholders/${id}`, params, options);
  }
  /**
   * Updates the specified Issuing Cardholder object by setting the values of the parameters passed. Any parameters not provided will be left unchanged.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/issuing/cardholders/${id}`, params, options);
  }
};
var CardResource = class extends StripeResource {
  static {
    __name(this, "CardResource");
  }
  static {
    __name2(this, "CardResource");
  }
  /**
   * Returns a list of Issuing Card objects. The objects are sorted in descending order by creation date, with the most recently created object appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/issuing/cards", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates an Issuing Card object.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/issuing/cards", params, options);
  }
  /**
   * Retrieves an Issuing Card object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/issuing/cards/${id}`, params, options);
  }
  /**
   * Updates the specified Issuing Card object by setting the values of the parameters passed. Any parameters not provided will be left unchanged.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/issuing/cards/${id}`, params, options);
  }
};
var CardResource2 = class extends StripeResource {
  static {
    __name(this, "CardResource2");
  }
  static {
    __name2(this, "CardResource");
  }
  /**
   * Updates the shipping status of the specified Issuing Card object to delivered.
   */
  deliverCard(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/issuing/cards/${id}/shipping/deliver`, params, options);
  }
  /**
   * Updates the shipping status of the specified Issuing Card object to failure.
   */
  failCard(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/issuing/cards/${id}/shipping/fail`, params, options);
  }
  /**
   * Updates the shipping status of the specified Issuing Card object to returned.
   */
  returnCard(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/issuing/cards/${id}/shipping/return`, params, options);
  }
  /**
   * Updates the shipping status of the specified Issuing Card object to shipped.
   */
  shipCard(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/issuing/cards/${id}/shipping/ship`, params, options);
  }
  /**
   * Updates the shipping status of the specified Issuing Card object to submitted. This method requires Stripe Version ‘2024-09-30.acacia' or later.
   */
  submitCard(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/issuing/cards/${id}/shipping/submit`, params, options);
  }
};
var ConfigurationResource = class extends StripeResource {
  static {
    __name(this, "ConfigurationResource");
  }
  static {
    __name2(this, "ConfigurationResource");
  }
  /**
   * Returns a list of configurations that describe the functionality of the customer portal.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/billing_portal/configurations", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a configuration that describes the functionality and behavior of a PortalSession
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/billing_portal/configurations", params, options);
  }
  /**
   * Retrieves a configuration that describes the functionality of the customer portal.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/billing_portal/configurations/${id}`, params, options);
  }
  /**
   * Updates a configuration that describes the functionality of the customer portal.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/billing_portal/configurations/${id}`, params, options);
  }
};
var ConfigurationResource2 = class extends StripeResource {
  static {
    __name(this, "ConfigurationResource2");
  }
  static {
    __name2(this, "ConfigurationResource");
  }
  /**
   * Deletes a Configuration object.
   */
  del(id, params, options) {
    return this._makeRequest("DELETE", `/v1/terminal/configurations/${id}`, params, options);
  }
  /**
   * Retrieves a Configuration object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/terminal/configurations/${id}`, params, options);
  }
  /**
   * Updates a new Configuration object.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/terminal/configurations/${id}`, params, options);
  }
  /**
   * Returns a list of Configuration objects.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/terminal/configurations", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a new Configuration object.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/terminal/configurations", params, options);
  }
};
var ConfirmationTokenResource = class extends StripeResource {
  static {
    __name(this, "ConfirmationTokenResource");
  }
  static {
    __name2(this, "ConfirmationTokenResource");
  }
  /**
   * Creates a test mode Confirmation Token server side for your integration tests.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/test_helpers/confirmation_tokens", params, options);
  }
};
var ConnectionTokenResource = class extends StripeResource {
  static {
    __name(this, "ConnectionTokenResource");
  }
  static {
    __name2(this, "ConnectionTokenResource");
  }
  /**
   * To connect to a reader the Stripe Terminal SDK needs to retrieve a short-lived connection token from Stripe, proxied through your server. On your backend, add an endpoint that creates and returns a connection token.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/terminal/connection_tokens", params, options);
  }
};
var CreditBalanceSummaryResource = class extends StripeResource {
  static {
    __name(this, "CreditBalanceSummaryResource");
  }
  static {
    __name2(this, "CreditBalanceSummaryResource");
  }
  /**
   * Retrieves the credit balance summary for a customer.
   */
  retrieve(params, options) {
    return this._makeRequest("GET", "/v1/billing/credit_balance_summary", params, options);
  }
};
var CreditBalanceTransactionResource = class extends StripeResource {
  static {
    __name(this, "CreditBalanceTransactionResource");
  }
  static {
    __name2(this, "CreditBalanceTransactionResource");
  }
  /**
   * Retrieve a list of credit balance transactions.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/billing/credit_balance_transactions", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves a credit balance transaction.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/billing/credit_balance_transactions/${id}`, params, options);
  }
};
var CreditGrantResource = class extends StripeResource {
  static {
    __name(this, "CreditGrantResource");
  }
  static {
    __name2(this, "CreditGrantResource");
  }
  /**
   * Retrieve a list of credit grants.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/billing/credit_grants", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a credit grant.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/billing/credit_grants", params, options);
  }
  /**
   * Retrieves a credit grant.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/billing/credit_grants/${id}`, params, options);
  }
  /**
   * Updates a credit grant.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/billing/credit_grants/${id}`, params, options);
  }
  /**
   * Expires a credit grant.
   */
  expire(id, params, options) {
    return this._makeRequest("POST", `/v1/billing/credit_grants/${id}/expire`, params, options);
  }
  /**
   * Voids a credit grant.
   */
  voidGrant(id, params, options) {
    return this._makeRequest("POST", `/v1/billing/credit_grants/${id}/void`, params, options);
  }
};
var CreditReversalResource = class extends StripeResource {
  static {
    __name(this, "CreditReversalResource");
  }
  static {
    __name2(this, "CreditReversalResource");
  }
  /**
   * Returns a list of CreditReversals.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/treasury/credit_reversals", params, options, {
      methodType: "list"
    });
  }
  /**
   * Reverses a ReceivedCredit and creates a CreditReversal object.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/treasury/credit_reversals", params, options);
  }
  /**
   * Retrieves the details of an existing CreditReversal by passing the unique CreditReversal ID from either the CreditReversal creation request or CreditReversal list
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/treasury/credit_reversals/${id}`, params, options);
  }
};
var CustomerResource = class extends StripeResource {
  static {
    __name(this, "CustomerResource");
  }
  static {
    __name2(this, "CustomerResource");
  }
  /**
   * Create an incoming testmode bank transfer
   */
  fundCashBalance(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/customers/${id}/fund_cash_balance`, params, options);
  }
};
var DebitReversalResource = class extends StripeResource {
  static {
    __name(this, "DebitReversalResource");
  }
  static {
    __name2(this, "DebitReversalResource");
  }
  /**
   * Returns a list of DebitReversals.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/treasury/debit_reversals", params, options, {
      methodType: "list"
    });
  }
  /**
   * Reverses a ReceivedDebit and creates a DebitReversal object.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/treasury/debit_reversals", params, options);
  }
  /**
   * Retrieves a DebitReversal object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/treasury/debit_reversals/${id}`, params, options);
  }
};
var DisputeResource = class extends StripeResource {
  static {
    __name(this, "DisputeResource");
  }
  static {
    __name2(this, "DisputeResource");
  }
  /**
   * Returns a list of Issuing Dispute objects. The objects are sorted in descending order by creation date, with the most recently created object appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/issuing/disputes", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates an Issuing Dispute object. Individual pieces of evidence within the evidence object are optional at this point. Stripe only validates that required evidence is present during submission. Refer to [Dispute reasons and evidence](https://docs.stripe.com/docs/issuing/purchases/disputes#dispute-reasons-and-evidence) for more details about evidence requirements.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/issuing/disputes", params, options);
  }
  /**
   * Retrieves an Issuing Dispute object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/issuing/disputes/${id}`, params, options);
  }
  /**
   * Updates the specified Issuing Dispute object by setting the values of the parameters passed. Any parameters not provided will be left unchanged. Properties on the evidence object can be unset by passing in an empty string.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/issuing/disputes/${id}`, params, options);
  }
  /**
   * Submits an Issuing Dispute to the card network. Stripe validates that all evidence fields required for the dispute's reason are present. For more details, see [Dispute reasons and evidence](https://docs.stripe.com/docs/issuing/purchases/disputes#dispute-reasons-and-evidence).
   */
  submit(id, params, options) {
    return this._makeRequest("POST", `/v1/issuing/disputes/${id}/submit`, params, options);
  }
};
var EarlyFraudWarningResource = class extends StripeResource {
  static {
    __name(this, "EarlyFraudWarningResource");
  }
  static {
    __name2(this, "EarlyFraudWarningResource");
  }
  /**
   * Returns a list of early fraud warnings.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/radar/early_fraud_warnings", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves the details of an early fraud warning that has previously been created.
   *
   * Please refer to the [early fraud warning](https://docs.stripe.com/api#early_fraud_warning_object) object reference for more details.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/radar/early_fraud_warnings/${id}`, params, options);
  }
};
var EventDestinationResource = class extends StripeResource {
  static {
    __name(this, "EventDestinationResource");
  }
  static {
    __name2(this, "EventDestinationResource");
  }
  /**
   * Lists all event destinations.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v2/core/event_destinations", params, options, {
      methodType: "list"
    });
  }
  /**
   * Create a new event destination.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v2/core/event_destinations", params, options);
  }
  /**
   * Delete an event destination.
   */
  del(id, params, options) {
    return this._makeRequest("DELETE", `/v2/core/event_destinations/${id}`, params, options);
  }
  /**
   * Retrieves the details of an event destination.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v2/core/event_destinations/${id}`, params, options);
  }
  /**
   * Update the details of an event destination.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v2/core/event_destinations/${id}`, params, options);
  }
  /**
   * Disable an event destination.
   */
  disable(id, params, options) {
    return this._makeRequest("POST", `/v2/core/event_destinations/${id}/disable`, params, options);
  }
  /**
   * Enable an event destination.
   */
  enable(id, params, options) {
    return this._makeRequest("POST", `/v2/core/event_destinations/${id}/enable`, params, options);
  }
  /**
   * Send a `ping` event to an event destination.
   */
  ping(id, params, options) {
    return this._makeRequest("POST", `/v2/core/event_destinations/${id}/ping`, params, options);
  }
};
var EventResource = class extends StripeResource {
  static {
    __name(this, "EventResource");
  }
  static {
    __name2(this, "EventResource");
  }
  /**
   * List events, going back up to 30 days.
   */
  list(params, options) {
    const transformResponseData = /* @__PURE__ */ __name2((response) => {
      return {
        ...response,
        data: response.data.map(this.addFetchRelatedObjectIfNeeded.bind(this))
      };
    }, "transformResponseData");
    return this._makeRequest("GET", "/v2/core/events", params, options, {
      methodType: "list",
      transformResponseData
    });
  }
  /**
   * Retrieves the details of an event.
   */
  retrieve(id, params, options) {
    const transformResponseData = /* @__PURE__ */ __name2((response) => {
      return this.addFetchRelatedObjectIfNeeded(response);
    }, "transformResponseData");
    return this._makeRequest("GET", `/v2/core/events/${id}`, params, options, {
      transformResponseData
    });
  }
  /**
   * @private
   *
   * For internal use in stripe-node.
   *
   * @param pulledEvent The retrieved event object
   * @returns The retrieved event object with a fetchRelatedObject method,
   * if pulledEvent.related_object is valid (non-null and has a url)
   */
  addFetchRelatedObjectIfNeeded(pulledEvent) {
    if (!pulledEvent.related_object || !pulledEvent.related_object.url) {
      return pulledEvent;
    }
    return {
      ...pulledEvent,
      fetchRelatedObject: /* @__PURE__ */ __name2(() => this._makeRequest("GET", pulledEvent.related_object.url, void 0, {
        stripeContext: pulledEvent.context,
        headers: {
          "Stripe-Request-Trigger": `event=${pulledEvent.id}`
        }
      }), "fetchRelatedObject")
    };
  }
};
var FeatureResource = class extends StripeResource {
  static {
    __name(this, "FeatureResource");
  }
  static {
    __name2(this, "FeatureResource");
  }
  /**
   * Retrieve a list of features
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/entitlements/features", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a feature
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/entitlements/features", params, options);
  }
  /**
   * Retrieves a feature
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/entitlements/features/${id}`, params, options);
  }
  /**
   * Update a feature's metadata or permanently deactivate it.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/entitlements/features/${id}`, params, options);
  }
};
var FinancialAccountResource = class extends StripeResource {
  static {
    __name(this, "FinancialAccountResource");
  }
  static {
    __name2(this, "FinancialAccountResource");
  }
  /**
   * Returns a list of FinancialAccounts.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/treasury/financial_accounts", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a new FinancialAccount. Each connected account can have up to three FinancialAccounts by default.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/treasury/financial_accounts", params, options);
  }
  /**
   * Retrieves the details of a FinancialAccount.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/treasury/financial_accounts/${id}`, params, options);
  }
  /**
   * Updates the details of a FinancialAccount.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/treasury/financial_accounts/${id}`, params, options);
  }
  /**
   * Closes a FinancialAccount. A FinancialAccount can only be closed if it has a zero balance, has no pending InboundTransfers, and has canceled all attached Issuing cards.
   */
  close(id, params, options) {
    return this._makeRequest("POST", `/v1/treasury/financial_accounts/${id}/close`, params, options);
  }
  /**
   * Updates the Features associated with a FinancialAccount.
   */
  updateFeatures(id, params, options) {
    return this._makeRequest("POST", `/v1/treasury/financial_accounts/${id}/features`, params, options);
  }
  /**
   * Retrieves Features information associated with the FinancialAccount.
   */
  retrieveFeatures(id, params, options) {
    return this._makeRequest("GET", `/v1/treasury/financial_accounts/${id}/features`, params, options);
  }
};
var InboundTransferResource = class extends StripeResource {
  static {
    __name(this, "InboundTransferResource");
  }
  static {
    __name2(this, "InboundTransferResource");
  }
  /**
   * Transitions a test mode created InboundTransfer to the failed status. The InboundTransfer must already be in the processing state.
   */
  fail(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/treasury/inbound_transfers/${id}/fail`, params, options);
  }
  /**
   * Marks the test mode InboundTransfer object as returned and links the InboundTransfer to a ReceivedDebit. The InboundTransfer must already be in the succeeded state.
   */
  returnInboundTransfer(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/treasury/inbound_transfers/${id}/return`, params, options);
  }
  /**
   * Transitions a test mode created InboundTransfer to the succeeded status. The InboundTransfer must already be in the processing state.
   */
  succeed(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/treasury/inbound_transfers/${id}/succeed`, params, options);
  }
};
var InboundTransferResource2 = class extends StripeResource {
  static {
    __name(this, "InboundTransferResource2");
  }
  static {
    __name2(this, "InboundTransferResource");
  }
  /**
   * Returns a list of InboundTransfers sent from the specified FinancialAccount.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/treasury/inbound_transfers", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates an InboundTransfer.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/treasury/inbound_transfers", params, options);
  }
  /**
   * Retrieves the details of an existing InboundTransfer.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/treasury/inbound_transfers/${id}`, params, options);
  }
  /**
   * Cancels an InboundTransfer.
   */
  cancel(id, params, options) {
    return this._makeRequest("POST", `/v1/treasury/inbound_transfers/${id}/cancel`, params, options);
  }
};
var LocationResource = class extends StripeResource {
  static {
    __name(this, "LocationResource");
  }
  static {
    __name2(this, "LocationResource");
  }
  /**
   * Deletes a Location object.
   */
  del(id, params, options) {
    return this._makeRequest("DELETE", `/v1/terminal/locations/${id}`, params, options);
  }
  /**
   * Retrieves a Location object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/terminal/locations/${id}`, params, options);
  }
  /**
   * Updates a Location object by setting the values of the parameters passed. Any parameters not provided will be left unchanged.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/terminal/locations/${id}`, params, options);
  }
  /**
   * Returns a list of Location objects.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/terminal/locations", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a new Location object.
   * For further details, including which address fields are required in each country, see the [Manage locations](https://docs.stripe.com/docs/terminal/fleet/locations) guide.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/terminal/locations", params, options);
  }
};
var MeterEventAdjustmentResource = class extends StripeResource {
  static {
    __name(this, "MeterEventAdjustmentResource");
  }
  static {
    __name2(this, "MeterEventAdjustmentResource");
  }
  /**
   * Creates a billing meter event adjustment.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/billing/meter_event_adjustments", params, options);
  }
};
var MeterEventAdjustmentResource2 = class extends StripeResource {
  static {
    __name(this, "MeterEventAdjustmentResource2");
  }
  static {
    __name2(this, "MeterEventAdjustmentResource");
  }
  /**
   * Creates a meter event adjustment to cancel a previously sent meter event.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v2/billing/meter_event_adjustments", params, options);
  }
};
var MeterEventSessionResource = class extends StripeResource {
  static {
    __name(this, "MeterEventSessionResource");
  }
  static {
    __name2(this, "MeterEventSessionResource");
  }
  /**
   * Creates a meter event session to send usage on the high-throughput meter event stream. Authentication tokens are only valid for 15 minutes, so you will need to create a new meter event session when your token expires.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v2/billing/meter_event_session", params, options);
  }
};
var MeterEventStreamResource = class extends StripeResource {
  static {
    __name(this, "MeterEventStreamResource");
  }
  static {
    __name2(this, "MeterEventStreamResource");
  }
  /**
   * Creates meter events. Events are processed asynchronously, including validation. Requires a meter event session for authentication. Supports up to 10,000 requests per second in livemode. For even higher rate-limits, contact sales.
   * @throws Stripe.TemporarySessionExpiredError
   */
  create(params, options) {
    return this._makeRequest("POST", "/v2/billing/meter_event_stream", params, options, {
      apiBase: "meter_events"
    });
  }
};
var MeterEventResource = class extends StripeResource {
  static {
    __name(this, "MeterEventResource");
  }
  static {
    __name2(this, "MeterEventResource");
  }
  /**
   * Creates a billing meter event.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/billing/meter_events", params, options);
  }
};
var MeterEventResource2 = class extends StripeResource {
  static {
    __name(this, "MeterEventResource2");
  }
  static {
    __name2(this, "MeterEventResource");
  }
  /**
   * Creates a meter event. Events are validated synchronously, but are processed asynchronously. Supports up to 1,000 events per second in livemode. For higher rate-limits, please use meter event streams instead.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v2/billing/meter_events", params, options);
  }
};
var MeterResource = class extends StripeResource {
  static {
    __name(this, "MeterResource");
  }
  static {
    __name2(this, "MeterResource");
  }
  /**
   * Retrieve a list of billing meters.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/billing/meters", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a billing meter.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/billing/meters", params, options);
  }
  /**
   * Retrieves a billing meter given an ID.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/billing/meters/${id}`, params, options);
  }
  /**
   * Updates a billing meter.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/billing/meters/${id}`, params, options);
  }
  /**
   * When a meter is deactivated, no more meter events will be accepted for this meter. You can't attach a deactivated meter to a price.
   */
  deactivate(id, params, options) {
    return this._makeRequest("POST", `/v1/billing/meters/${id}/deactivate`, params, options);
  }
  /**
   * When a meter is reactivated, events for this meter can be accepted and you can attach the meter to a price.
   */
  reactivate(id, params, options) {
    return this._makeRequest("POST", `/v1/billing/meters/${id}/reactivate`, params, options);
  }
  /**
   * Retrieve a list of billing meter event summaries.
   */
  listEventSummaries(id, params, options) {
    return this._makeRequest("GET", `/v1/billing/meters/${id}/event_summaries`, params, options, {
      methodType: "list"
    });
  }
};
var OnboardingLinkResource = class extends StripeResource {
  static {
    __name(this, "OnboardingLinkResource");
  }
  static {
    __name2(this, "OnboardingLinkResource");
  }
  /**
   * Creates a new OnboardingLink object that contains a redirect_url used for onboarding onto Tap to Pay on iPhone.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/terminal/onboarding_links", params, options);
  }
};
var OrderResource = class extends StripeResource {
  static {
    __name(this, "OrderResource");
  }
  static {
    __name2(this, "OrderResource");
  }
  /**
   * Lists all Climate order objects. The orders are returned sorted by creation date, with the
   * most recently created orders appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/climate/orders", params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: { metric_tons: { kind: "decimal_string" } }
            }
          }
        }
      }
    });
  }
  /**
   * Creates a Climate order object for a given Climate product. The order will be processed immediately
   * after creation and payment will be deducted your Stripe balance.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/climate/orders", params, options, {
      requestSchema: {
        kind: "object",
        fields: { metric_tons: { kind: "decimal_string" } }
      },
      responseSchema: {
        kind: "object",
        fields: { metric_tons: { kind: "decimal_string" } }
      }
    });
  }
  /**
   * Retrieves the details of a Climate order object with the given ID.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/climate/orders/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: { metric_tons: { kind: "decimal_string" } }
      }
    });
  }
  /**
   * Updates the specified order by setting the values of the parameters passed.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/climate/orders/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: { metric_tons: { kind: "decimal_string" } }
      }
    });
  }
  /**
   * Cancels a Climate order. You can cancel an order within 24 hours of creation. Stripe refunds the
   * reservation amount_subtotal, but not the amount_fees for user-triggered cancellations. Frontier
   * might cancel reservations if suppliers fail to deliver. If Frontier cancels the reservation, Stripe
   * provides 90 days advance notice and refunds the amount_total.
   */
  cancel(id, params, options) {
    return this._makeRequest("POST", `/v1/climate/orders/${id}/cancel`, params, options, {
      responseSchema: {
        kind: "object",
        fields: { metric_tons: { kind: "decimal_string" } }
      }
    });
  }
};
var OutboundPaymentResource = class extends StripeResource {
  static {
    __name(this, "OutboundPaymentResource");
  }
  static {
    __name2(this, "OutboundPaymentResource");
  }
  /**
   * Updates a test mode created OutboundPayment with tracking details. The OutboundPayment must not be cancelable, and cannot be in the canceled or failed states.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/treasury/outbound_payments/${id}`, params, options);
  }
  /**
   * Transitions a test mode created OutboundPayment to the failed status. The OutboundPayment must already be in the processing state.
   */
  fail(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/treasury/outbound_payments/${id}/fail`, params, options);
  }
  /**
   * Transitions a test mode created OutboundPayment to the posted status. The OutboundPayment must already be in the processing state.
   */
  post(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/treasury/outbound_payments/${id}/post`, params, options);
  }
  /**
   * Transitions a test mode created OutboundPayment to the returned status. The OutboundPayment must already be in the processing state.
   */
  returnOutboundPayment(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/treasury/outbound_payments/${id}/return`, params, options);
  }
};
var OutboundPaymentResource2 = class extends StripeResource {
  static {
    __name(this, "OutboundPaymentResource2");
  }
  static {
    __name2(this, "OutboundPaymentResource");
  }
  /**
   * Returns a list of OutboundPayments sent from the specified FinancialAccount.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/treasury/outbound_payments", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates an OutboundPayment.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/treasury/outbound_payments", params, options);
  }
  /**
   * Retrieves the details of an existing OutboundPayment by passing the unique OutboundPayment ID from either the OutboundPayment creation request or OutboundPayment list.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/treasury/outbound_payments/${id}`, params, options);
  }
  /**
   * Cancel an OutboundPayment.
   */
  cancel(id, params, options) {
    return this._makeRequest("POST", `/v1/treasury/outbound_payments/${id}/cancel`, params, options);
  }
};
var OutboundTransferResource = class extends StripeResource {
  static {
    __name(this, "OutboundTransferResource");
  }
  static {
    __name2(this, "OutboundTransferResource");
  }
  /**
   * Updates a test mode created OutboundTransfer with tracking details. The OutboundTransfer must not be cancelable, and cannot be in the canceled or failed states.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/treasury/outbound_transfers/${id}`, params, options);
  }
  /**
   * Transitions a test mode created OutboundTransfer to the failed status. The OutboundTransfer must already be in the processing state.
   */
  fail(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/treasury/outbound_transfers/${id}/fail`, params, options);
  }
  /**
   * Transitions a test mode created OutboundTransfer to the posted status. The OutboundTransfer must already be in the processing state.
   */
  post(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/treasury/outbound_transfers/${id}/post`, params, options);
  }
  /**
   * Transitions a test mode created OutboundTransfer to the returned status. The OutboundTransfer must already be in the processing state.
   */
  returnOutboundTransfer(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/treasury/outbound_transfers/${id}/return`, params, options);
  }
};
var OutboundTransferResource2 = class extends StripeResource {
  static {
    __name(this, "OutboundTransferResource2");
  }
  static {
    __name2(this, "OutboundTransferResource");
  }
  /**
   * Returns a list of OutboundTransfers sent from the specified FinancialAccount.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/treasury/outbound_transfers", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates an OutboundTransfer.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/treasury/outbound_transfers", params, options);
  }
  /**
   * Retrieves the details of an existing OutboundTransfer by passing the unique OutboundTransfer ID from either the OutboundTransfer creation request or OutboundTransfer list.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/treasury/outbound_transfers/${id}`, params, options);
  }
  /**
   * An OutboundTransfer can be canceled if the funds have not yet been paid out.
   */
  cancel(id, params, options) {
    return this._makeRequest("POST", `/v1/treasury/outbound_transfers/${id}/cancel`, params, options);
  }
};
var PaymentEvaluationResource = class extends StripeResource {
  static {
    __name(this, "PaymentEvaluationResource");
  }
  static {
    __name2(this, "PaymentEvaluationResource");
  }
  /**
   * Request a Radar API fraud risk score from Stripe for a payment before sending it for external processor authorization.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/radar/payment_evaluations", params, options);
  }
};
var PersonalizationDesignResource = class extends StripeResource {
  static {
    __name(this, "PersonalizationDesignResource");
  }
  static {
    __name2(this, "PersonalizationDesignResource");
  }
  /**
   * Returns a list of personalization design objects. The objects are sorted in descending order by creation date, with the most recently created object appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/issuing/personalization_designs", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a personalization design object.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/issuing/personalization_designs", params, options);
  }
  /**
   * Retrieves a personalization design object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/issuing/personalization_designs/${id}`, params, options);
  }
  /**
   * Updates a card personalization object.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/issuing/personalization_designs/${id}`, params, options);
  }
};
var PersonalizationDesignResource2 = class extends StripeResource {
  static {
    __name(this, "PersonalizationDesignResource2");
  }
  static {
    __name2(this, "PersonalizationDesignResource");
  }
  /**
   * Updates the status of the specified testmode personalization design object to active.
   */
  activate(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/issuing/personalization_designs/${id}/activate`, params, options);
  }
  /**
   * Updates the status of the specified testmode personalization design object to inactive.
   */
  deactivate(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/issuing/personalization_designs/${id}/deactivate`, params, options);
  }
  /**
   * Updates the status of the specified testmode personalization design object to rejected.
   */
  reject(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/issuing/personalization_designs/${id}/reject`, params, options);
  }
};
var PhysicalBundleResource = class extends StripeResource {
  static {
    __name(this, "PhysicalBundleResource");
  }
  static {
    __name2(this, "PhysicalBundleResource");
  }
  /**
   * Returns a list of physical bundle objects. The objects are sorted in descending order by creation date, with the most recently created object appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/issuing/physical_bundles", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves a physical bundle object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/issuing/physical_bundles/${id}`, params, options);
  }
};
var ProductResource = class extends StripeResource {
  static {
    __name(this, "ProductResource");
  }
  static {
    __name2(this, "ProductResource");
  }
  /**
   * Lists all available Climate product objects.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/climate/products", params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: { metric_tons_available: { kind: "decimal_string" } }
            }
          }
        }
      }
    });
  }
  /**
   * Retrieves the details of a Climate product with the given ID.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/climate/products/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: { metric_tons_available: { kind: "decimal_string" } }
      }
    });
  }
};
var ReaderResource = class extends StripeResource {
  static {
    __name(this, "ReaderResource");
  }
  static {
    __name2(this, "ReaderResource");
  }
  /**
   * Deletes a Reader object.
   */
  del(id, params, options) {
    return this._makeRequest("DELETE", `/v1/terminal/readers/${id}`, params, options);
  }
  /**
   * Retrieves a Reader object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/terminal/readers/${id}`, params, options);
  }
  /**
   * Updates a Reader object by setting the values of the parameters passed. Any parameters not provided will be left unchanged.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/terminal/readers/${id}`, params, options);
  }
  /**
   * Returns a list of Reader objects.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/terminal/readers", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a new Reader object.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/terminal/readers", params, options);
  }
  /**
   * Cancels the current reader action. See [Programmatic Cancellation](https://docs.stripe.com/docs/terminal/payments/collect-card-payment?terminal-sdk-platform=server-driven#programmatic-cancellation) for more details.
   */
  cancelAction(id, params, options) {
    return this._makeRequest("POST", `/v1/terminal/readers/${id}/cancel_action`, params, options);
  }
  /**
   * Initiates an [input collection flow](https://docs.stripe.com/docs/terminal/features/collect-inputs) on a Reader to display input forms and collect information from your customers.
   */
  collectInputs(id, params, options) {
    return this._makeRequest("POST", `/v1/terminal/readers/${id}/collect_inputs`, params, options);
  }
  /**
   * Initiates a payment flow on a Reader and updates the PaymentIntent with card details before manual confirmation. See [Collecting a Payment method](https://docs.stripe.com/docs/terminal/payments/collect-card-payment?terminal-sdk-platform=server-driven&process=inspect#collect-a-paymentmethod) for more details.
   */
  collectPaymentMethod(id, params, options) {
    return this._makeRequest("POST", `/v1/terminal/readers/${id}/collect_payment_method`, params, options);
  }
  /**
   * Finalizes a payment on a Reader. See [Confirming a Payment](https://docs.stripe.com/docs/terminal/payments/collect-card-payment?terminal-sdk-platform=server-driven&process=inspect#confirm-the-paymentintent) for more details.
   */
  confirmPaymentIntent(id, params, options) {
    return this._makeRequest("POST", `/v1/terminal/readers/${id}/confirm_payment_intent`, params, options);
  }
  /**
   * Initiates a payment flow on a Reader. See [process the payment](https://docs.stripe.com/docs/terminal/payments/collect-card-payment?terminal-sdk-platform=server-driven&process=immediately#process-payment) for more details.
   */
  processPaymentIntent(id, params, options) {
    return this._makeRequest("POST", `/v1/terminal/readers/${id}/process_payment_intent`, params, options);
  }
  /**
   * Initiates a SetupIntent flow on a Reader. See [Save directly without charging](https://docs.stripe.com/docs/terminal/features/saving-payment-details/save-directly) for more details.
   */
  processSetupIntent(id, params, options) {
    return this._makeRequest("POST", `/v1/terminal/readers/${id}/process_setup_intent`, params, options);
  }
  /**
   * Initiates an in-person refund on a Reader. See [Refund an Interac Payment](https://docs.stripe.com/docs/terminal/payments/regional?integration-country=CA#refund-an-interac-payment) for more details.
   */
  refundPayment(id, params, options) {
    return this._makeRequest("POST", `/v1/terminal/readers/${id}/refund_payment`, params, options);
  }
  /**
   * Sets the reader display to show [cart details](https://docs.stripe.com/docs/terminal/features/display).
   */
  setReaderDisplay(id, params, options) {
    return this._makeRequest("POST", `/v1/terminal/readers/${id}/set_reader_display`, params, options);
  }
};
var ReaderResource2 = class extends StripeResource {
  static {
    __name(this, "ReaderResource2");
  }
  static {
    __name2(this, "ReaderResource");
  }
  /**
   * Presents a payment method on a simulated reader. Can be used to simulate accepting a payment, saving a card or refunding a transaction.
   */
  presentPaymentMethod(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/terminal/readers/${id}/present_payment_method`, params, options);
  }
  /**
   * Use this endpoint to trigger a successful input collection on a simulated reader.
   */
  succeedInputCollection(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/terminal/readers/${id}/succeed_input_collection`, params, options);
  }
  /**
   * Use this endpoint to complete an input collection with a timeout error on a simulated reader.
   */
  timeoutInputCollection(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/terminal/readers/${id}/timeout_input_collection`, params, options);
  }
};
var ReceivedCreditResource = class extends StripeResource {
  static {
    __name(this, "ReceivedCreditResource");
  }
  static {
    __name2(this, "ReceivedCreditResource");
  }
  /**
   * Use this endpoint to simulate a test mode ReceivedCredit initiated by a third party. In live mode, you can't directly create ReceivedCredits initiated by third parties.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/test_helpers/treasury/received_credits", params, options);
  }
};
var ReceivedCreditResource2 = class extends StripeResource {
  static {
    __name(this, "ReceivedCreditResource2");
  }
  static {
    __name2(this, "ReceivedCreditResource");
  }
  /**
   * Returns a list of ReceivedCredits.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/treasury/received_credits", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves the details of an existing ReceivedCredit by passing the unique ReceivedCredit ID from the ReceivedCredit list.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/treasury/received_credits/${id}`, params, options);
  }
};
var ReceivedDebitResource = class extends StripeResource {
  static {
    __name(this, "ReceivedDebitResource");
  }
  static {
    __name2(this, "ReceivedDebitResource");
  }
  /**
   * Use this endpoint to simulate a test mode ReceivedDebit initiated by a third party. In live mode, you can't directly create ReceivedDebits initiated by third parties.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/test_helpers/treasury/received_debits", params, options);
  }
};
var ReceivedDebitResource2 = class extends StripeResource {
  static {
    __name(this, "ReceivedDebitResource2");
  }
  static {
    __name2(this, "ReceivedDebitResource");
  }
  /**
   * Returns a list of ReceivedDebits.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/treasury/received_debits", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves the details of an existing ReceivedDebit by passing the unique ReceivedDebit ID from the ReceivedDebit list
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/treasury/received_debits/${id}`, params, options);
  }
};
var RefundResource = class extends StripeResource {
  static {
    __name(this, "RefundResource");
  }
  static {
    __name2(this, "RefundResource");
  }
  /**
   * Expire a refund with a status of requires_action.
   */
  expire(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/refunds/${id}/expire`, params, options);
  }
};
var RegistrationResource = class extends StripeResource {
  static {
    __name(this, "RegistrationResource");
  }
  static {
    __name2(this, "RegistrationResource");
  }
  /**
   * Returns a list of Tax Registration objects.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/tax/registrations", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a new Tax Registration object.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/tax/registrations", params, options);
  }
  /**
   * Returns a Tax Registration object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/tax/registrations/${id}`, params, options);
  }
  /**
   * Updates an existing Tax Registration object.
   *
   * A registration cannot be deleted after it has been created. If you wish to end a registration you may do so by setting expires_at.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/tax/registrations/${id}`, params, options);
  }
};
var ReportRunResource = class extends StripeResource {
  static {
    __name(this, "ReportRunResource");
  }
  static {
    __name2(this, "ReportRunResource");
  }
  /**
   * Returns a list of Report Runs, with the most recent appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/reporting/report_runs", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a new object and begin running the report. (Certain report types require a [live-mode API key](https://stripe.com/docs/keys#test-live-modes).)
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/reporting/report_runs", params, options);
  }
  /**
   * Retrieves the details of an existing Report Run.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/reporting/report_runs/${id}`, params, options);
  }
};
var ReportTypeResource = class extends StripeResource {
  static {
    __name(this, "ReportTypeResource");
  }
  static {
    __name2(this, "ReportTypeResource");
  }
  /**
   * Returns a full list of Report Types.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/reporting/report_types", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves the details of a Report Type. (Certain report types require a [live-mode API key](https://stripe.com/docs/keys#test-live-modes).)
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/reporting/report_types/${id}`, params, options);
  }
};
var RequestResource = class extends StripeResource {
  static {
    __name(this, "RequestResource");
  }
  static {
    __name2(this, "RequestResource");
  }
  /**
   * Lists all ForwardingRequest objects.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/forwarding/requests", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a ForwardingRequest object.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/forwarding/requests", params, options);
  }
  /**
   * Retrieves a ForwardingRequest object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/forwarding/requests/${id}`, params, options);
  }
};
var ScheduledQueryRunResource = class extends StripeResource {
  static {
    __name(this, "ScheduledQueryRunResource");
  }
  static {
    __name2(this, "ScheduledQueryRunResource");
  }
  /**
   * Returns a list of scheduled query runs.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/sigma/scheduled_query_runs", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves the details of an scheduled query run.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/sigma/scheduled_query_runs/${id}`, params, options);
  }
};
var SecretResource = class extends StripeResource {
  static {
    __name(this, "SecretResource");
  }
  static {
    __name2(this, "SecretResource");
  }
  /**
   * List all secrets stored on the given scope.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/apps/secrets", params, options, {
      methodType: "list"
    });
  }
  /**
   * Create or replace a secret in the secret store.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/apps/secrets", params, options);
  }
  /**
   * Finds a secret in the secret store by name and scope.
   */
  find(params, options) {
    return this._makeRequest("GET", "/v1/apps/secrets/find", params, options);
  }
  /**
   * Deletes a secret from the secret store by name and scope.
   */
  deleteWhere(params, options) {
    return this._makeRequest("POST", "/v1/apps/secrets/delete", params, options);
  }
};
var SessionResource = class extends StripeResource {
  static {
    __name(this, "SessionResource");
  }
  static {
    __name2(this, "SessionResource");
  }
  /**
   * Creates a session of the customer portal.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/billing_portal/sessions", params, options);
  }
};
var SessionResource2 = class extends StripeResource {
  static {
    __name(this, "SessionResource2");
  }
  static {
    __name2(this, "SessionResource");
  }
  /**
   * Returns a list of Checkout Sessions.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/checkout/sessions", params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                currency_conversion: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: { fx_rate: { kind: "decimal_string" } }
                  }
                },
                line_items: {
                  kind: "object",
                  fields: {
                    data: {
                      kind: "array",
                      element: {
                        kind: "object",
                        fields: {
                          price: {
                            kind: "nullable",
                            inner: {
                              kind: "object",
                              fields: {
                                currency_options: {
                                  kind: "array",
                                  element: {
                                    kind: "object",
                                    fields: {
                                      tiers: {
                                        kind: "array",
                                        element: {
                                          kind: "object",
                                          fields: {
                                            flat_amount_decimal: {
                                              kind: "nullable",
                                              inner: { kind: "decimal_string" }
                                            },
                                            unit_amount_decimal: {
                                              kind: "nullable",
                                              inner: { kind: "decimal_string" }
                                            }
                                          }
                                        }
                                      },
                                      unit_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      }
                                    }
                                  }
                                },
                                tiers: {
                                  kind: "array",
                                  element: {
                                    kind: "object",
                                    fields: {
                                      flat_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      },
                                      unit_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      }
                                    }
                                  }
                                },
                                unit_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Creates a Checkout Session object.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/checkout/sessions", params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          line_items: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                price_data: {
                  kind: "object",
                  fields: { unit_amount_decimal: { kind: "decimal_string" } }
                }
              }
            }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          currency_conversion: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: { fx_rate: { kind: "decimal_string" } }
            }
          },
          line_items: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    price: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          currency_options: {
                            kind: "array",
                            element: {
                              kind: "object",
                              fields: {
                                tiers: {
                                  kind: "array",
                                  element: {
                                    kind: "object",
                                    fields: {
                                      flat_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      },
                                      unit_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      }
                                    }
                                  }
                                },
                                unit_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                }
                              }
                            }
                          },
                          tiers: {
                            kind: "array",
                            element: {
                              kind: "object",
                              fields: {
                                flat_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                },
                                unit_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                }
                              }
                            }
                          },
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Retrieves a Checkout Session object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/checkout/sessions/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          currency_conversion: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: { fx_rate: { kind: "decimal_string" } }
            }
          },
          line_items: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    price: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          currency_options: {
                            kind: "array",
                            element: {
                              kind: "object",
                              fields: {
                                tiers: {
                                  kind: "array",
                                  element: {
                                    kind: "object",
                                    fields: {
                                      flat_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      },
                                      unit_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      }
                                    }
                                  }
                                },
                                unit_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                }
                              }
                            }
                          },
                          tiers: {
                            kind: "array",
                            element: {
                              kind: "object",
                              fields: {
                                flat_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                },
                                unit_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                }
                              }
                            }
                          },
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Updates a Checkout Session object.
   *
   * Related guide: [Dynamically update a Checkout Session](https://docs.stripe.com/payments/advanced/dynamic-updates)
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/checkout/sessions/${id}`, params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          line_items: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                price_data: {
                  kind: "object",
                  fields: { unit_amount_decimal: { kind: "decimal_string" } }
                }
              }
            }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          currency_conversion: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: { fx_rate: { kind: "decimal_string" } }
            }
          },
          line_items: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    price: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          currency_options: {
                            kind: "array",
                            element: {
                              kind: "object",
                              fields: {
                                tiers: {
                                  kind: "array",
                                  element: {
                                    kind: "object",
                                    fields: {
                                      flat_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      },
                                      unit_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      }
                                    }
                                  }
                                },
                                unit_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                }
                              }
                            }
                          },
                          tiers: {
                            kind: "array",
                            element: {
                              kind: "object",
                              fields: {
                                flat_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                },
                                unit_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                }
                              }
                            }
                          },
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * A Checkout Session can be expired when it is in one of these statuses: open
   *
   * After it expires, a customer can't complete a Checkout Session and customers loading the Checkout Session see a message saying the Checkout Session is expired.
   */
  expire(id, params, options) {
    return this._makeRequest("POST", `/v1/checkout/sessions/${id}/expire`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          currency_conversion: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: { fx_rate: { kind: "decimal_string" } }
            }
          },
          line_items: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    price: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          currency_options: {
                            kind: "array",
                            element: {
                              kind: "object",
                              fields: {
                                tiers: {
                                  kind: "array",
                                  element: {
                                    kind: "object",
                                    fields: {
                                      flat_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      },
                                      unit_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      }
                                    }
                                  }
                                },
                                unit_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                }
                              }
                            }
                          },
                          tiers: {
                            kind: "array",
                            element: {
                              kind: "object",
                              fields: {
                                flat_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                },
                                unit_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                }
                              }
                            }
                          },
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * When retrieving a Checkout Session, there is an includable line_items property containing the first handful of those items. There is also a URL where you can retrieve the full (paginated) list of line items.
   */
  listLineItems(id, params, options) {
    return this._makeRequest("GET", `/v1/checkout/sessions/${id}/line_items`, params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                price: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      currency_options: {
                        kind: "array",
                        element: {
                          kind: "object",
                          fields: {
                            tiers: {
                              kind: "array",
                              element: {
                                kind: "object",
                                fields: {
                                  flat_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  },
                                  unit_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            },
                            unit_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      tiers: {
                        kind: "array",
                        element: {
                          kind: "object",
                          fields: {
                            flat_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            unit_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      unit_amount_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
};
var SessionResource3 = class extends StripeResource {
  static {
    __name(this, "SessionResource3");
  }
  static {
    __name2(this, "SessionResource");
  }
  /**
   * Retrieves the details of a Financial Connections Session
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/financial_connections/sessions/${id}`, params, options);
  }
  /**
   * To launch the Financial Connections authorization flow, create a Session. The session's client_secret can be used to launch the flow using Stripe.js.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/financial_connections/sessions", params, options);
  }
};
var SettingResource = class extends StripeResource {
  static {
    __name(this, "SettingResource");
  }
  static {
    __name2(this, "SettingResource");
  }
  /**
   * Retrieves Tax Settings for a merchant.
   */
  retrieve(params, options) {
    return this._makeRequest("GET", "/v1/tax/settings", params, options);
  }
  /**
   * Updates Tax Settings parameters used in tax calculations. All parameters are editable but none can be removed once set.
   */
  update(params, options) {
    return this._makeRequest("POST", "/v1/tax/settings", params, options);
  }
};
var SupplierResource = class extends StripeResource {
  static {
    __name(this, "SupplierResource");
  }
  static {
    __name2(this, "SupplierResource");
  }
  /**
   * Lists all available Climate supplier objects.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/climate/suppliers", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves a Climate supplier object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/climate/suppliers/${id}`, params, options);
  }
};
var TestClockResource = class extends StripeResource {
  static {
    __name(this, "TestClockResource");
  }
  static {
    __name2(this, "TestClockResource");
  }
  /**
   * Deletes a test clock.
   */
  del(id, params, options) {
    return this._makeRequest("DELETE", `/v1/test_helpers/test_clocks/${id}`, params, options);
  }
  /**
   * Retrieves a test clock.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/test_helpers/test_clocks/${id}`, params, options);
  }
  /**
   * Returns a list of your test clocks.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/test_helpers/test_clocks", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a new test clock that can be attached to new customers and quotes.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/test_helpers/test_clocks", params, options);
  }
  /**
   * Starts advancing a test clock to a specified time in the future. Advancement is done when status changes to Ready.
   */
  advance(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/test_clocks/${id}/advance`, params, options);
  }
};
var TokenResource = class extends StripeResource {
  static {
    __name(this, "TokenResource");
  }
  static {
    __name2(this, "TokenResource");
  }
  /**
   * Lists all Issuing Token objects for a given card.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/issuing/tokens", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves an Issuing Token object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/issuing/tokens/${id}`, params, options);
  }
  /**
   * Attempts to update the specified Issuing Token object to the status specified.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/issuing/tokens/${id}`, params, options);
  }
};
var TransactionEntryResource = class extends StripeResource {
  static {
    __name(this, "TransactionEntryResource");
  }
  static {
    __name2(this, "TransactionEntryResource");
  }
  /**
   * Retrieves a list of TransactionEntry objects.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/treasury/transaction_entries", params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                flow_details: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      issuing_authorization: {
                        kind: "object",
                        fields: {
                          fleet: {
                            kind: "nullable",
                            inner: {
                              kind: "object",
                              fields: {
                                reported_breakdown: {
                                  kind: "nullable",
                                  inner: {
                                    kind: "object",
                                    fields: {
                                      fuel: {
                                        kind: "nullable",
                                        inner: {
                                          kind: "object",
                                          fields: {
                                            gross_amount_decimal: {
                                              kind: "nullable",
                                              inner: { kind: "decimal_string" }
                                            }
                                          }
                                        }
                                      },
                                      non_fuel: {
                                        kind: "nullable",
                                        inner: {
                                          kind: "object",
                                          fields: {
                                            gross_amount_decimal: {
                                              kind: "nullable",
                                              inner: { kind: "decimal_string" }
                                            }
                                          }
                                        }
                                      },
                                      tax: {
                                        kind: "nullable",
                                        inner: {
                                          kind: "object",
                                          fields: {
                                            local_amount_decimal: {
                                              kind: "nullable",
                                              inner: { kind: "decimal_string" }
                                            },
                                            national_amount_decimal: {
                                              kind: "nullable",
                                              inner: { kind: "decimal_string" }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          },
                          fuel: {
                            kind: "nullable",
                            inner: {
                              kind: "object",
                              fields: {
                                quantity_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                },
                                unit_cost_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                }
                              }
                            }
                          },
                          transactions: {
                            kind: "array",
                            element: {
                              kind: "object",
                              fields: {
                                purchase_details: {
                                  kind: "nullable",
                                  inner: {
                                    kind: "object",
                                    fields: {
                                      fleet: {
                                        kind: "nullable",
                                        inner: {
                                          kind: "object",
                                          fields: {
                                            reported_breakdown: {
                                              kind: "nullable",
                                              inner: {
                                                kind: "object",
                                                fields: {
                                                  fuel: {
                                                    kind: "nullable",
                                                    inner: {
                                                      kind: "object",
                                                      fields: {
                                                        gross_amount_decimal: {
                                                          kind: "nullable",
                                                          inner: {
                                                            kind: "decimal_string"
                                                          }
                                                        }
                                                      }
                                                    }
                                                  },
                                                  non_fuel: {
                                                    kind: "nullable",
                                                    inner: {
                                                      kind: "object",
                                                      fields: {
                                                        gross_amount_decimal: {
                                                          kind: "nullable",
                                                          inner: {
                                                            kind: "decimal_string"
                                                          }
                                                        }
                                                      }
                                                    }
                                                  },
                                                  tax: {
                                                    kind: "nullable",
                                                    inner: {
                                                      kind: "object",
                                                      fields: {
                                                        local_amount_decimal: {
                                                          kind: "nullable",
                                                          inner: {
                                                            kind: "decimal_string"
                                                          }
                                                        },
                                                        national_amount_decimal: {
                                                          kind: "nullable",
                                                          inner: {
                                                            kind: "decimal_string"
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      },
                                      fuel: {
                                        kind: "nullable",
                                        inner: {
                                          kind: "object",
                                          fields: {
                                            quantity_decimal: {
                                              kind: "nullable",
                                              inner: { kind: "decimal_string" }
                                            },
                                            unit_cost_decimal: {
                                              kind: "decimal_string"
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Retrieves a TransactionEntry object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/treasury/transaction_entries/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          flow_details: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                issuing_authorization: {
                  kind: "object",
                  fields: {
                    fleet: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          reported_breakdown: {
                            kind: "nullable",
                            inner: {
                              kind: "object",
                              fields: {
                                fuel: {
                                  kind: "nullable",
                                  inner: {
                                    kind: "object",
                                    fields: {
                                      gross_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      }
                                    }
                                  }
                                },
                                non_fuel: {
                                  kind: "nullable",
                                  inner: {
                                    kind: "object",
                                    fields: {
                                      gross_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      }
                                    }
                                  }
                                },
                                tax: {
                                  kind: "nullable",
                                  inner: {
                                    kind: "object",
                                    fields: {
                                      local_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      },
                                      national_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    },
                    fuel: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          quantity_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          },
                          unit_cost_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    },
                    transactions: {
                      kind: "array",
                      element: {
                        kind: "object",
                        fields: {
                          purchase_details: {
                            kind: "nullable",
                            inner: {
                              kind: "object",
                              fields: {
                                fleet: {
                                  kind: "nullable",
                                  inner: {
                                    kind: "object",
                                    fields: {
                                      reported_breakdown: {
                                        kind: "nullable",
                                        inner: {
                                          kind: "object",
                                          fields: {
                                            fuel: {
                                              kind: "nullable",
                                              inner: {
                                                kind: "object",
                                                fields: {
                                                  gross_amount_decimal: {
                                                    kind: "nullable",
                                                    inner: {
                                                      kind: "decimal_string"
                                                    }
                                                  }
                                                }
                                              }
                                            },
                                            non_fuel: {
                                              kind: "nullable",
                                              inner: {
                                                kind: "object",
                                                fields: {
                                                  gross_amount_decimal: {
                                                    kind: "nullable",
                                                    inner: {
                                                      kind: "decimal_string"
                                                    }
                                                  }
                                                }
                                              }
                                            },
                                            tax: {
                                              kind: "nullable",
                                              inner: {
                                                kind: "object",
                                                fields: {
                                                  local_amount_decimal: {
                                                    kind: "nullable",
                                                    inner: {
                                                      kind: "decimal_string"
                                                    }
                                                  },
                                                  national_amount_decimal: {
                                                    kind: "nullable",
                                                    inner: {
                                                      kind: "decimal_string"
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                },
                                fuel: {
                                  kind: "nullable",
                                  inner: {
                                    kind: "object",
                                    fields: {
                                      quantity_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      },
                                      unit_cost_decimal: {
                                        kind: "decimal_string"
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
};
var TransactionResource = class extends StripeResource {
  static {
    __name(this, "TransactionResource");
  }
  static {
    __name2(this, "TransactionResource");
  }
  /**
   * Returns a list of Financial Connections Transaction objects.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/financial_connections/transactions", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves the details of a Financial Connections Transaction
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/financial_connections/transactions/${id}`, params, options);
  }
};
var TransactionResource2 = class extends StripeResource {
  static {
    __name(this, "TransactionResource2");
  }
  static {
    __name2(this, "TransactionResource");
  }
  /**
   * Returns a list of Issuing Transaction objects. The objects are sorted in descending order by creation date, with the most recently created object appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/issuing/transactions", params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                purchase_details: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fleet: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            reported_breakdown: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  non_fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  tax: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        local_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        national_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      },
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            quantity_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            unit_cost_decimal: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Retrieves an Issuing Transaction object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/issuing/transactions/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          purchase_details: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                fleet: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      reported_breakdown: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            fuel: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  gross_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            },
                            non_fuel: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  gross_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            },
                            tax: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  local_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  },
                                  national_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                fuel: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      quantity_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      },
                      unit_cost_decimal: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Updates the specified Issuing Transaction object by setting the values of the parameters passed. Any parameters not provided will be left unchanged.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/issuing/transactions/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          purchase_details: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                fleet: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      reported_breakdown: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            fuel: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  gross_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            },
                            non_fuel: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  gross_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            },
                            tax: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  local_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  },
                                  national_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                fuel: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      quantity_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      },
                      unit_cost_decimal: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
};
var TransactionResource3 = class extends StripeResource {
  static {
    __name(this, "TransactionResource3");
  }
  static {
    __name2(this, "TransactionResource");
  }
  /**
   * Retrieves a Tax Transaction object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/tax/transactions/${id}`, params, options);
  }
  /**
   * Creates a Tax Transaction from a calculation, if that calculation hasn't expired. Calculations expire after 90 days.
   */
  createFromCalculation(params, options) {
    return this._makeRequest("POST", "/v1/tax/transactions/create_from_calculation", params, options);
  }
  /**
   * Partially or fully reverses a previously created Transaction.
   */
  createReversal(params, options) {
    return this._makeRequest("POST", "/v1/tax/transactions/create_reversal", params, options);
  }
  /**
   * Retrieves the line items of a committed standalone transaction as a collection.
   */
  listLineItems(id, params, options) {
    return this._makeRequest("GET", `/v1/tax/transactions/${id}/line_items`, params, options, {
      methodType: "list"
    });
  }
};
var TransactionResource4 = class extends StripeResource {
  static {
    __name(this, "TransactionResource4");
  }
  static {
    __name2(this, "TransactionResource");
  }
  /**
   * Refund a test-mode Transaction.
   */
  refund(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/issuing/transactions/${id}/refund`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          purchase_details: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                fleet: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      reported_breakdown: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            fuel: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  gross_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            },
                            non_fuel: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  gross_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            },
                            tax: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  local_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  },
                                  national_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                fuel: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      quantity_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      },
                      unit_cost_decimal: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Allows the user to capture an arbitrary amount, also known as a forced capture.
   */
  createForceCapture(params, options) {
    return this._makeRequest("POST", "/v1/test_helpers/issuing/transactions/create_force_capture", params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          purchase_details: {
            kind: "object",
            fields: {
              fleet: {
                kind: "object",
                fields: {
                  reported_breakdown: {
                    kind: "object",
                    fields: {
                      fuel: {
                        kind: "object",
                        fields: {
                          gross_amount_decimal: { kind: "decimal_string" }
                        }
                      },
                      non_fuel: {
                        kind: "object",
                        fields: {
                          gross_amount_decimal: { kind: "decimal_string" }
                        }
                      },
                      tax: {
                        kind: "object",
                        fields: {
                          local_amount_decimal: { kind: "decimal_string" },
                          national_amount_decimal: { kind: "decimal_string" }
                        }
                      }
                    }
                  }
                }
              },
              fuel: {
                kind: "object",
                fields: {
                  quantity_decimal: { kind: "decimal_string" },
                  unit_cost_decimal: { kind: "decimal_string" }
                }
              },
              receipt: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: { quantity: { kind: "decimal_string" } }
                }
              }
            }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          purchase_details: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                fleet: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      reported_breakdown: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            fuel: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  gross_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            },
                            non_fuel: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  gross_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            },
                            tax: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  local_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  },
                                  national_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                fuel: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      quantity_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      },
                      unit_cost_decimal: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Allows the user to refund an arbitrary amount, also known as a unlinked refund.
   */
  createUnlinkedRefund(params, options) {
    return this._makeRequest("POST", "/v1/test_helpers/issuing/transactions/create_unlinked_refund", params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          purchase_details: {
            kind: "object",
            fields: {
              fleet: {
                kind: "object",
                fields: {
                  reported_breakdown: {
                    kind: "object",
                    fields: {
                      fuel: {
                        kind: "object",
                        fields: {
                          gross_amount_decimal: { kind: "decimal_string" }
                        }
                      },
                      non_fuel: {
                        kind: "object",
                        fields: {
                          gross_amount_decimal: { kind: "decimal_string" }
                        }
                      },
                      tax: {
                        kind: "object",
                        fields: {
                          local_amount_decimal: { kind: "decimal_string" },
                          national_amount_decimal: { kind: "decimal_string" }
                        }
                      }
                    }
                  }
                }
              },
              fuel: {
                kind: "object",
                fields: {
                  quantity_decimal: { kind: "decimal_string" },
                  unit_cost_decimal: { kind: "decimal_string" }
                }
              },
              receipt: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: { quantity: { kind: "decimal_string" } }
                }
              }
            }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          purchase_details: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                fleet: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      reported_breakdown: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            fuel: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  gross_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            },
                            non_fuel: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  gross_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            },
                            tax: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  local_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  },
                                  national_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                fuel: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      quantity_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      },
                      unit_cost_decimal: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
};
var TransactionResource5 = class extends StripeResource {
  static {
    __name(this, "TransactionResource5");
  }
  static {
    __name2(this, "TransactionResource");
  }
  /**
   * Retrieves a list of Transaction objects.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/treasury/transactions", params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                entries: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      data: {
                        kind: "array",
                        element: {
                          kind: "object",
                          fields: {
                            flow_details: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  issuing_authorization: {
                                    kind: "object",
                                    fields: {
                                      fleet: {
                                        kind: "nullable",
                                        inner: {
                                          kind: "object",
                                          fields: {
                                            reported_breakdown: {
                                              kind: "nullable",
                                              inner: {
                                                kind: "object",
                                                fields: {
                                                  fuel: {
                                                    kind: "nullable",
                                                    inner: {
                                                      kind: "object",
                                                      fields: {
                                                        gross_amount_decimal: {
                                                          kind: "nullable",
                                                          inner: {
                                                            kind: "decimal_string"
                                                          }
                                                        }
                                                      }
                                                    }
                                                  },
                                                  non_fuel: {
                                                    kind: "nullable",
                                                    inner: {
                                                      kind: "object",
                                                      fields: {
                                                        gross_amount_decimal: {
                                                          kind: "nullable",
                                                          inner: {
                                                            kind: "decimal_string"
                                                          }
                                                        }
                                                      }
                                                    }
                                                  },
                                                  tax: {
                                                    kind: "nullable",
                                                    inner: {
                                                      kind: "object",
                                                      fields: {
                                                        local_amount_decimal: {
                                                          kind: "nullable",
                                                          inner: {
                                                            kind: "decimal_string"
                                                          }
                                                        },
                                                        national_amount_decimal: {
                                                          kind: "nullable",
                                                          inner: {
                                                            kind: "decimal_string"
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      },
                                      fuel: {
                                        kind: "nullable",
                                        inner: {
                                          kind: "object",
                                          fields: {
                                            quantity_decimal: {
                                              kind: "nullable",
                                              inner: { kind: "decimal_string" }
                                            },
                                            unit_cost_decimal: {
                                              kind: "nullable",
                                              inner: { kind: "decimal_string" }
                                            }
                                          }
                                        }
                                      },
                                      transactions: {
                                        kind: "array",
                                        element: {
                                          kind: "object",
                                          fields: {
                                            purchase_details: {
                                              kind: "nullable",
                                              inner: {
                                                kind: "object",
                                                fields: {
                                                  fleet: {
                                                    kind: "nullable",
                                                    inner: {
                                                      kind: "object",
                                                      fields: {
                                                        reported_breakdown: {
                                                          kind: "nullable",
                                                          inner: {
                                                            kind: "object",
                                                            fields: {
                                                              fuel: {
                                                                kind: "nullable",
                                                                inner: {
                                                                  kind: "object",
                                                                  fields: {
                                                                    gross_amount_decimal: {
                                                                      kind: "nullable",
                                                                      inner: {
                                                                        kind: "decimal_string"
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              },
                                                              non_fuel: {
                                                                kind: "nullable",
                                                                inner: {
                                                                  kind: "object",
                                                                  fields: {
                                                                    gross_amount_decimal: {
                                                                      kind: "nullable",
                                                                      inner: {
                                                                        kind: "decimal_string"
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              },
                                                              tax: {
                                                                kind: "nullable",
                                                                inner: {
                                                                  kind: "object",
                                                                  fields: {
                                                                    local_amount_decimal: {
                                                                      kind: "nullable",
                                                                      inner: {
                                                                        kind: "decimal_string"
                                                                      }
                                                                    },
                                                                    national_amount_decimal: {
                                                                      kind: "nullable",
                                                                      inner: {
                                                                        kind: "decimal_string"
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  },
                                                  fuel: {
                                                    kind: "nullable",
                                                    inner: {
                                                      kind: "object",
                                                      fields: {
                                                        quantity_decimal: {
                                                          kind: "nullable",
                                                          inner: {
                                                            kind: "decimal_string"
                                                          }
                                                        },
                                                        unit_cost_decimal: {
                                                          kind: "decimal_string"
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Retrieves the details of an existing Transaction.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/treasury/transactions/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          entries: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                data: {
                  kind: "array",
                  element: {
                    kind: "object",
                    fields: {
                      flow_details: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            issuing_authorization: {
                              kind: "object",
                              fields: {
                                fleet: {
                                  kind: "nullable",
                                  inner: {
                                    kind: "object",
                                    fields: {
                                      reported_breakdown: {
                                        kind: "nullable",
                                        inner: {
                                          kind: "object",
                                          fields: {
                                            fuel: {
                                              kind: "nullable",
                                              inner: {
                                                kind: "object",
                                                fields: {
                                                  gross_amount_decimal: {
                                                    kind: "nullable",
                                                    inner: {
                                                      kind: "decimal_string"
                                                    }
                                                  }
                                                }
                                              }
                                            },
                                            non_fuel: {
                                              kind: "nullable",
                                              inner: {
                                                kind: "object",
                                                fields: {
                                                  gross_amount_decimal: {
                                                    kind: "nullable",
                                                    inner: {
                                                      kind: "decimal_string"
                                                    }
                                                  }
                                                }
                                              }
                                            },
                                            tax: {
                                              kind: "nullable",
                                              inner: {
                                                kind: "object",
                                                fields: {
                                                  local_amount_decimal: {
                                                    kind: "nullable",
                                                    inner: {
                                                      kind: "decimal_string"
                                                    }
                                                  },
                                                  national_amount_decimal: {
                                                    kind: "nullable",
                                                    inner: {
                                                      kind: "decimal_string"
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                },
                                fuel: {
                                  kind: "nullable",
                                  inner: {
                                    kind: "object",
                                    fields: {
                                      quantity_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      },
                                      unit_cost_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      }
                                    }
                                  }
                                },
                                transactions: {
                                  kind: "array",
                                  element: {
                                    kind: "object",
                                    fields: {
                                      purchase_details: {
                                        kind: "nullable",
                                        inner: {
                                          kind: "object",
                                          fields: {
                                            fleet: {
                                              kind: "nullable",
                                              inner: {
                                                kind: "object",
                                                fields: {
                                                  reported_breakdown: {
                                                    kind: "nullable",
                                                    inner: {
                                                      kind: "object",
                                                      fields: {
                                                        fuel: {
                                                          kind: "nullable",
                                                          inner: {
                                                            kind: "object",
                                                            fields: {
                                                              gross_amount_decimal: {
                                                                kind: "nullable",
                                                                inner: {
                                                                  kind: "decimal_string"
                                                                }
                                                              }
                                                            }
                                                          }
                                                        },
                                                        non_fuel: {
                                                          kind: "nullable",
                                                          inner: {
                                                            kind: "object",
                                                            fields: {
                                                              gross_amount_decimal: {
                                                                kind: "nullable",
                                                                inner: {
                                                                  kind: "decimal_string"
                                                                }
                                                              }
                                                            }
                                                          }
                                                        },
                                                        tax: {
                                                          kind: "nullable",
                                                          inner: {
                                                            kind: "object",
                                                            fields: {
                                                              local_amount_decimal: {
                                                                kind: "nullable",
                                                                inner: {
                                                                  kind: "decimal_string"
                                                                }
                                                              },
                                                              national_amount_decimal: {
                                                                kind: "nullable",
                                                                inner: {
                                                                  kind: "decimal_string"
                                                                }
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            },
                                            fuel: {
                                              kind: "nullable",
                                              inner: {
                                                kind: "object",
                                                fields: {
                                                  quantity_decimal: {
                                                    kind: "nullable",
                                                    inner: {
                                                      kind: "decimal_string"
                                                    }
                                                  },
                                                  unit_cost_decimal: {
                                                    kind: "decimal_string"
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
};
var ValueListItemResource = class extends StripeResource {
  static {
    __name(this, "ValueListItemResource");
  }
  static {
    __name2(this, "ValueListItemResource");
  }
  /**
   * Deletes a ValueListItem object, removing it from its parent value list.
   */
  del(id, params, options) {
    return this._makeRequest("DELETE", `/v1/radar/value_list_items/${id}`, params, options);
  }
  /**
   * Retrieves a ValueListItem object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/radar/value_list_items/${id}`, params, options);
  }
  /**
   * Returns a list of ValueListItem objects. The objects are sorted in descending order by creation date, with the most recently created object appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/radar/value_list_items", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a new ValueListItem object, which is added to the specified parent value list.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/radar/value_list_items", params, options);
  }
};
var ValueListResource = class extends StripeResource {
  static {
    __name(this, "ValueListResource");
  }
  static {
    __name2(this, "ValueListResource");
  }
  /**
   * Deletes a ValueList object, also deleting any items contained within the value list. To be deleted, a value list must not be referenced in any rules.
   */
  del(id, params, options) {
    return this._makeRequest("DELETE", `/v1/radar/value_lists/${id}`, params, options);
  }
  /**
   * Retrieves a ValueList object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/radar/value_lists/${id}`, params, options);
  }
  /**
   * Updates a ValueList object by setting the values of the parameters passed. Any parameters not provided will be left unchanged. Note that item_type is immutable.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/radar/value_lists/${id}`, params, options);
  }
  /**
   * Returns a list of ValueList objects. The objects are sorted in descending order by creation date, with the most recently created object appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/radar/value_lists", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a new ValueList object, which can then be referenced in rules.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/radar/value_lists", params, options);
  }
};
var VerificationReportResource = class extends StripeResource {
  static {
    __name(this, "VerificationReportResource");
  }
  static {
    __name2(this, "VerificationReportResource");
  }
  /**
   * List all verification reports.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/identity/verification_reports", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves an existing VerificationReport
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/identity/verification_reports/${id}`, params, options);
  }
};
var VerificationSessionResource = class extends StripeResource {
  static {
    __name(this, "VerificationSessionResource");
  }
  static {
    __name2(this, "VerificationSessionResource");
  }
  /**
   * Returns a list of VerificationSessions
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/identity/verification_sessions", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a VerificationSession object.
   *
   * After the VerificationSession is created, display a verification modal using the session client_secret or send your users to the session's url.
   *
   * If your API key is in test mode, verification checks won't actually process, though everything else will occur as if in live mode.
   *
   * Related guide: [Verify your users' identity documents](https://docs.stripe.com/docs/identity/verify-identity-documents)
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/identity/verification_sessions", params, options);
  }
  /**
   * Retrieves the details of a VerificationSession that was previously created.
   *
   * When the session status is requires_input, you can use this method to retrieve a valid
   * client_secret or url to allow re-submission.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/identity/verification_sessions/${id}`, params, options);
  }
  /**
   * Updates a VerificationSession object.
   *
   * When the session status is requires_input, you can use this method to update the
   * verification check and options.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/identity/verification_sessions/${id}`, params, options);
  }
  /**
   * A VerificationSession object can be canceled when it is in requires_input [status](https://docs.stripe.com/docs/identity/how-sessions-work).
   *
   * Once canceled, future submission attempts are disabled. This cannot be undone. [Learn more](https://docs.stripe.com/docs/identity/verification-sessions#cancel).
   */
  cancel(id, params, options) {
    return this._makeRequest("POST", `/v1/identity/verification_sessions/${id}/cancel`, params, options);
  }
  /**
   * Redact a VerificationSession to remove all collected information from Stripe. This will redact
   * the VerificationSession and all objects related to it, including VerificationReports, Events,
   * request logs, etc.
   *
   * A VerificationSession object can be redacted when it is in requires_input or verified
   * [status](https://docs.stripe.com/docs/identity/how-sessions-work). Redacting a VerificationSession in requires_action
   * state will automatically cancel it.
   *
   * The redaction process may take up to four days. When the redaction process is in progress, the
   * VerificationSession's redaction.status field will be set to processing; when the process is
   * finished, it will change to redacted and an identity.verification_session.redacted event
   * will be emitted.
   *
   * Redaction is irreversible. Redacted objects are still accessible in the Stripe API, but all the
   * fields that contain personal data will be replaced by the string [redacted] or a similar
   * placeholder. The metadata field will also be erased. Redacted objects cannot be updated or
   * used for any purpose.
   *
   * [Learn more](https://docs.stripe.com/docs/identity/verification-sessions#redact).
   */
  redact(id, params, options) {
    return this._makeRequest("POST", `/v1/identity/verification_sessions/${id}/redact`, params, options);
  }
};
var AccountResource3 = class extends StripeResource {
  static {
    __name(this, "AccountResource3");
  }
  static {
    __name2(this, "AccountResource");
  }
  /**
   * With [Connect](https://docs.stripe.com/connect), you can delete accounts you manage.
   *
   * Test-mode accounts can be deleted at any time.
   *
   * Live-mode accounts that have access to the standard dashboard and Stripe is responsible for negative account balances cannot be deleted, which includes Standard accounts. All other Live-mode accounts, can be deleted when all [balances](https://docs.stripe.com/api/balance/balance_object) are zero.
   *
   * If you want to delete your own account, use the [account information tab in your account settings](https://dashboard.stripe.com/settings/account) instead.
   */
  del(id, params, options) {
    return this._makeRequest("DELETE", `/v1/accounts/${id}`, params, options);
  }
  /**
   * Retrieves the details of an account. Pass `null` as the account id to retrieve details about your own account.
   */
  retrieve(id, params, options) {
    if (typeof id === "string") {
      return this._makeRequest("GET", `/v1/accounts/${id}`, params, options);
    } else {
      return this._makeRequest("GET", "/v1/account", params, options);
    }
  }
  /**
   * Updates a [connected account](https://docs.stripe.com/connect/accounts) by setting the values of the parameters passed. Any parameters not provided are
   * left unchanged.
   *
   * For accounts where [controller.requirement_collection](https://docs.stripe.com/api/accounts/object#account_object-controller-requirement_collection)
   * is application, which includes Custom accounts, you can update any information on the account.
   *
   * For accounts where [controller.requirement_collection](https://docs.stripe.com/api/accounts/object#account_object-controller-requirement_collection)
   * is stripe, which includes Standard and Express accounts, you can update all information until you create
   * an [Account Link or <a href="/api/account_sessions">Account Session](https://docs.stripe.com/api/account_links) to start Connect onboarding,
   * after which some properties can no longer be updated.
   *
   * To update your own account, use the [Dashboard](https://dashboard.stripe.com/settings/account). Refer to our
   * [Connect](https://docs.stripe.com/docs/connect/updating-accounts) documentation to learn more about updating accounts.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/accounts/${id}`, params, options);
  }
  /**
   * Retrieves the details of an account.
   */
  retrieveCurrent(params, options) {
    return this._makeRequest("GET", "/v1/account", params, options);
  }
  /**
   * Returns a list of accounts connected to your platform via [Connect](https://docs.stripe.com/docs/connect). If you're not a platform, the list is empty.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/accounts", params, options, {
      methodType: "list"
    });
  }
  /**
   * With [Connect](https://docs.stripe.com/docs/connect), you can create Stripe accounts for your users.
   * To do this, you'll first need to [register your platform](https://dashboard.stripe.com/account/applications/settings).
   *
   * If you've already collected information for your connected accounts, you [can prefill that information](https://docs.stripe.com/docs/connect/best-practices#onboarding) when
   * creating the account. Connect Onboarding won't ask for the prefilled information during account onboarding.
   * You can prefill any information on the account.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/accounts", params, options);
  }
  /**
   * With [Connect](https://docs.stripe.com/connect), you can reject accounts that you have flagged as suspicious.
   *
   * Only accounts where your platform is liable for negative account balances, which includes Custom and Express accounts, can be rejected. Test-mode accounts can be rejected at any time. Live-mode accounts can only be rejected after all balances are zero.
   */
  reject(id, params, options) {
    return this._makeRequest("POST", `/v1/accounts/${id}/reject`, params, options);
  }
  /**
   * Returns a list of capabilities associated with the account. The capabilities are returned sorted by creation date, with the most recent capability appearing first.
   */
  listCapabilities(id, params, options) {
    return this._makeRequest("GET", `/v1/accounts/${id}/capabilities`, params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves information about the specified Account Capability.
   */
  retrieveCapability(accountId, id, params, options) {
    return this._makeRequest("GET", `/v1/accounts/${accountId}/capabilities/${id}`, params, options);
  }
  /**
   * Updates an existing Account Capability. Request or remove a capability by updating its requested parameter.
   */
  updateCapability(accountId, id, params, options) {
    return this._makeRequest("POST", `/v1/accounts/${accountId}/capabilities/${id}`, params, options);
  }
  /**
   * Delete a specified external account for a given account.
   */
  deleteExternalAccount(accountId, id, params, options) {
    return this._makeRequest("DELETE", `/v1/accounts/${accountId}/external_accounts/${id}`, params, options);
  }
  /**
   * Retrieve a specified external account for a given account.
   */
  retrieveExternalAccount(accountId, id, params, options) {
    return this._makeRequest("GET", `/v1/accounts/${accountId}/external_accounts/${id}`, params, options);
  }
  /**
   * Updates the metadata, account holder name, account holder type of a bank account belonging to
   * a connected account and optionally sets it as the default for its currency. Other bank account
   * details are not editable by design.
   *
   * You can only update bank accounts when [account.controller.requirement_collection is application, which includes <a href="/connect/custom-accounts">Custom accounts](https://docs.stripe.com/api/accounts/object#account_object-controller-requirement_collection).
   *
   * You can re-enable a disabled bank account by performing an update call without providing any
   * arguments or changes.
   */
  updateExternalAccount(accountId, id, params, options) {
    return this._makeRequest("POST", `/v1/accounts/${accountId}/external_accounts/${id}`, params, options);
  }
  /**
   * List external accounts for an account.
   */
  listExternalAccounts(id, params, options) {
    return this._makeRequest("GET", `/v1/accounts/${id}/external_accounts`, params, options, {
      methodType: "list"
    });
  }
  /**
   * Create an external account for a given account.
   */
  createExternalAccount(id, params, options) {
    return this._makeRequest("POST", `/v1/accounts/${id}/external_accounts`, params, options);
  }
  /**
   * Creates a login link for a connected account to access the Express Dashboard.
   *
   * You can only create login links for accounts that use the [Express Dashboard](https://docs.stripe.com/connect/express-dashboard) and are connected to your platform.
   */
  createLoginLink(id, params, options) {
    return this._makeRequest("POST", `/v1/accounts/${id}/login_links`, params, options);
  }
  /**
   * Deletes an existing person's relationship to the account's legal entity. Any person with a relationship for an account can be deleted through the API, except if the person is the account_opener. If your integration is using the executive parameter, you cannot delete the only verified executive on file.
   */
  deletePerson(accountId, id, params, options) {
    return this._makeRequest("DELETE", `/v1/accounts/${accountId}/persons/${id}`, params, options);
  }
  /**
   * Retrieves an existing person.
   */
  retrievePerson(accountId, id, params, options) {
    return this._makeRequest("GET", `/v1/accounts/${accountId}/persons/${id}`, params, options);
  }
  /**
   * Updates an existing person.
   */
  updatePerson(accountId, id, params, options) {
    return this._makeRequest("POST", `/v1/accounts/${accountId}/persons/${id}`, params, options);
  }
  /**
   * Returns a list of people associated with the account's legal entity. The people are returned sorted by creation date, with the most recent people appearing first.
   */
  listPersons(id, params, options) {
    return this._makeRequest("GET", `/v1/accounts/${id}/persons`, params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a new person.
   */
  createPerson(id, params, options) {
    return this._makeRequest("POST", `/v1/accounts/${id}/persons`, params, options);
  }
};
var AccountLinkResource2 = class extends StripeResource {
  static {
    __name(this, "AccountLinkResource2");
  }
  static {
    __name2(this, "AccountLinkResource");
  }
  /**
   * Creates an AccountLink object that includes a single-use Stripe URL that the platform can redirect their user to in order to take them through the Connect Onboarding flow.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/account_links", params, options);
  }
};
var AccountSessionResource = class extends StripeResource {
  static {
    __name(this, "AccountSessionResource");
  }
  static {
    __name2(this, "AccountSessionResource");
  }
  /**
   * Creates a AccountSession object that includes a single-use token that the platform can use on their front-end to grant client-side API access.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/account_sessions", params, options);
  }
};
var ApplePayDomainResource = class extends StripeResource {
  static {
    __name(this, "ApplePayDomainResource");
  }
  static {
    __name2(this, "ApplePayDomainResource");
  }
  /**
   * Delete an apple pay domain.
   */
  del(id, params, options) {
    return this._makeRequest("DELETE", `/v1/apple_pay/domains/${id}`, params, options);
  }
  /**
   * Retrieve an apple pay domain.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/apple_pay/domains/${id}`, params, options);
  }
  /**
   * List apple pay domains.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/apple_pay/domains", params, options, {
      methodType: "list"
    });
  }
  /**
   * Create an apple pay domain.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/apple_pay/domains", params, options);
  }
};
var ApplicationFeeResource = class extends StripeResource {
  static {
    __name(this, "ApplicationFeeResource");
  }
  static {
    __name2(this, "ApplicationFeeResource");
  }
  /**
   * Returns a list of application fees you've previously collected. The application fees are returned in sorted order, with the most recent fees appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/application_fees", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves the details of an application fee that your account has collected. The same information is returned when refunding the application fee.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/application_fees/${id}`, params, options);
  }
  /**
   * By default, you can see the 10 most recent refunds stored directly on the application fee object, but you can also retrieve details about a specific refund stored on the application fee.
   */
  retrieveRefund(feeId, id, params, options) {
    return this._makeRequest("GET", `/v1/application_fees/${feeId}/refunds/${id}`, params, options);
  }
  /**
   * Updates the specified application fee refund by setting the values of the parameters passed. Any parameters not provided will be left unchanged.
   *
   * This request only accepts metadata as an argument.
   */
  updateRefund(feeId, id, params, options) {
    return this._makeRequest("POST", `/v1/application_fees/${feeId}/refunds/${id}`, params, options);
  }
  /**
   * You can see a list of the refunds belonging to a specific application fee. Note that the 10 most recent refunds are always available by default on the application fee object. If you need more than those 10, you can use this API method and the limit and starting_after parameters to page through additional refunds.
   */
  listRefunds(id, params, options) {
    return this._makeRequest("GET", `/v1/application_fees/${id}/refunds`, params, options, {
      methodType: "list"
    });
  }
  /**
   * Refunds an application fee that has previously been collected but not yet refunded.
   * Funds will be refunded to the Stripe account from which the fee was originally collected.
   *
   * You can optionally refund only part of an application fee.
   * You can do so multiple times, until the entire fee has been refunded.
   *
   * Once entirely refunded, an application fee can't be refunded again.
   * This method will raise an error when called on an already-refunded application fee,
   * or when trying to refund more money than is left on an application fee.
   */
  createRefund(id, params, options) {
    return this._makeRequest("POST", `/v1/application_fees/${id}/refunds`, params, options);
  }
};
var BalanceResource = class extends StripeResource {
  static {
    __name(this, "BalanceResource");
  }
  static {
    __name2(this, "BalanceResource");
  }
  /**
   * Retrieves the current account balance, based on the authentication that was used to make the request.
   *  For a sample request, see [Accounting for negative balances](https://docs.stripe.com/docs/connect/account-balances#accounting-for-negative-balances).
   */
  retrieve(params, options) {
    return this._makeRequest("GET", "/v1/balance", params, options);
  }
};
var BalanceSettingResource = class extends StripeResource {
  static {
    __name(this, "BalanceSettingResource");
  }
  static {
    __name2(this, "BalanceSettingResource");
  }
  /**
   * Retrieves balance settings for a given connected account.
   *  Related guide: [Making API calls for connected accounts](https://docs.stripe.com/connect/authentication)
   */
  retrieve(params, options) {
    return this._makeRequest("GET", "/v1/balance_settings", params, options);
  }
  /**
   * Updates balance settings for a given connected account.
   *  Related guide: [Making API calls for connected accounts](https://docs.stripe.com/connect/authentication)
   */
  update(params, options) {
    return this._makeRequest("POST", "/v1/balance_settings", params, options);
  }
};
var BalanceTransactionResource = class extends StripeResource {
  static {
    __name(this, "BalanceTransactionResource");
  }
  static {
    __name2(this, "BalanceTransactionResource");
  }
  /**
   * Returns a list of transactions that have contributed to the Stripe account balance (e.g., charges, transfers, and so forth). The transactions are returned in sorted order, with the most recent transactions appearing first.
   *
   * Note that this endpoint was previously called “Balance history” and used the path /v1/balance/history.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/balance_transactions", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves the balance transaction with the given ID.
   *
   * Note that this endpoint previously used the path /v1/balance/history/:id.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/balance_transactions/${id}`, params, options);
  }
};
var ChargeResource = class extends StripeResource {
  static {
    __name(this, "ChargeResource");
  }
  static {
    __name2(this, "ChargeResource");
  }
  /**
   * Returns a list of charges you've previously created. The charges are returned in sorted order, with the most recent charges appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/charges", params, options, {
      methodType: "list"
    });
  }
  /**
   * This method is no longer recommended—use the [Payment Intents API](https://docs.stripe.com/docs/api/payment_intents)
   * to initiate a new payment instead. Confirmation of the PaymentIntent creates the Charge
   * object used to request payment.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/charges", params, options);
  }
  /**
   * Retrieves the details of a charge that has previously been created. Supply the unique charge ID that was returned from your previous request, and Stripe will return the corresponding charge information. The same information is returned when creating or refunding the charge.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/charges/${id}`, params, options);
  }
  /**
   * Updates the specified charge by setting the values of the parameters passed. Any parameters not provided will be left unchanged.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/charges/${id}`, params, options);
  }
  /**
   * Search for charges you've previously created using Stripe's [Search Query Language](https://docs.stripe.com/docs/search#search-query-language).
   * Don't use search in read-after-write flows where strict consistency is necessary. Under normal operating
   * conditions, data is searchable in less than a minute. Occasionally, propagation of new or updated data can be up
   * to an hour behind during outages. Search functionality is not available to merchants in India.
   */
  search(params, options) {
    return this._makeRequest("GET", "/v1/charges/search", params, options, {
      methodType: "search"
    });
  }
  /**
   * Capture the payment of an existing, uncaptured charge that was created with the capture option set to false.
   *
   * Uncaptured payments expire a set number of days after they are created ([7 by default](https://docs.stripe.com/docs/charges/placing-a-hold)), after which they are marked as refunded and capture attempts will fail.
   *
   * Don't use this method to capture a PaymentIntent-initiated charge. Use [Capture a PaymentIntent](https://docs.stripe.com/docs/api/payment_intents/capture).
   */
  capture(id, params, options) {
    return this._makeRequest("POST", `/v1/charges/${id}/capture`, params, options);
  }
};
var ConfirmationTokenResource2 = class extends StripeResource {
  static {
    __name(this, "ConfirmationTokenResource2");
  }
  static {
    __name2(this, "ConfirmationTokenResource");
  }
  /**
   * Retrieves an existing ConfirmationToken object
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/confirmation_tokens/${id}`, params, options);
  }
};
var CountrySpecResource = class extends StripeResource {
  static {
    __name(this, "CountrySpecResource");
  }
  static {
    __name2(this, "CountrySpecResource");
  }
  /**
   * Lists all Country Spec objects available in the API.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/country_specs", params, options, {
      methodType: "list"
    });
  }
  /**
   * Returns a Country Spec for a given Country code.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/country_specs/${id}`, params, options);
  }
};
var CouponResource = class extends StripeResource {
  static {
    __name(this, "CouponResource");
  }
  static {
    __name2(this, "CouponResource");
  }
  /**
   * You can delete coupons via the [coupon management](https://dashboard.stripe.com/coupons) page of the Stripe dashboard. However, deleting a coupon does not affect any customers who have already applied the coupon; it means that new customers can't redeem the coupon. You can also delete coupons via the API.
   */
  del(id, params, options) {
    return this._makeRequest("DELETE", `/v1/coupons/${id}`, params, options);
  }
  /**
   * Retrieves the coupon with the given ID.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/coupons/${id}`, params, options);
  }
  /**
   * Updates the metadata of a coupon. Other coupon details (currency, duration, amount_off) are, by design, not editable.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/coupons/${id}`, params, options);
  }
  /**
   * Returns a list of your coupons.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/coupons", params, options, {
      methodType: "list"
    });
  }
  /**
   * You can create coupons easily via the [coupon management](https://dashboard.stripe.com/coupons) page of the Stripe dashboard. Coupon creation is also accessible via the API if you need to create coupons on the fly.
   *
   * A coupon has either a percent_off or an amount_off and currency. If you set an amount_off, that amount will be subtracted from any invoice's subtotal. For example, an invoice with a subtotal of 100 will have a final total of 0 if a coupon with an amount_off of 200 is applied to it and an invoice with a subtotal of 300 will have a final total of 100 if a coupon with an amount_off of 200 is applied to it.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/coupons", params, options);
  }
};
var CreditNoteResource = class extends StripeResource {
  static {
    __name(this, "CreditNoteResource");
  }
  static {
    __name2(this, "CreditNoteResource");
  }
  /**
   * Returns a list of credit notes.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/credit_notes", params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                lines: {
                  kind: "object",
                  fields: {
                    data: {
                      kind: "array",
                      element: {
                        kind: "object",
                        fields: {
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Issue a credit note to adjust the amount of a finalized invoice. A credit note will first reduce the invoice's amount_remaining (and amount_due), but not below zero.
   * This amount is indicated by the credit note's pre_payment_amount. The excess amount is indicated by post_payment_amount, and it can result in any combination of the following:
   *
   *
   * Refunds: create a new refund (using refund_amount) or link existing refunds (using refunds).
   * Customer balance credit: credit the customer's balance (using credit_amount) which will be automatically applied to their next invoice when it's finalized.
   * Outside of Stripe credit: record the amount that is or will be credited outside of Stripe (using out_of_band_amount).
   *
   *
   * The sum of refunds, customer balance credits, and outside of Stripe credits must equal the post_payment_amount.
   *
   * You may issue multiple credit notes for an invoice. Each credit note may increment the invoice's pre_payment_credit_notes_amount,
   * post_payment_credit_notes_amount, or both, depending on the invoice's amount_remaining at the time of credit note creation.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/credit_notes", params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "array",
            element: {
              kind: "object",
              fields: { unit_amount_decimal: { kind: "decimal_string" } }
            }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    unit_amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Retrieves the credit note object with the given identifier.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/credit_notes/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    unit_amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Updates an existing credit note.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/credit_notes/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    unit_amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Get a preview of a credit note without creating it.
   */
  preview(params, options) {
    return this._makeRequest("GET", "/v1/credit_notes/preview", params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "array",
            element: {
              kind: "object",
              fields: { unit_amount_decimal: { kind: "decimal_string" } }
            }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    unit_amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Marks a credit note as void. Learn more about [voiding credit notes](https://docs.stripe.com/docs/billing/invoices/credit-notes#voiding).
   */
  voidCreditNote(id, params, options) {
    return this._makeRequest("POST", `/v1/credit_notes/${id}/void`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    unit_amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * When retrieving a credit note preview, you'll get a lines property containing the first handful of those items. This URL you can retrieve the full (paginated) list of line items.
   */
  listPreviewLineItems(params, options) {
    return this._makeRequest("GET", "/v1/credit_notes/preview/lines", params, options, {
      methodType: "list",
      requestSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "array",
            element: {
              kind: "object",
              fields: { unit_amount_decimal: { kind: "decimal_string" } }
            }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                unit_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * When retrieving a credit note, you'll get a lines property containing the first handful of those items. There is also a URL where you can retrieve the full (paginated) list of line items.
   */
  listLineItems(id, params, options) {
    return this._makeRequest("GET", `/v1/credit_notes/${id}/lines`, params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                unit_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          }
        }
      }
    });
  }
};
var CustomerResource2 = class extends StripeResource {
  static {
    __name(this, "CustomerResource2");
  }
  static {
    __name2(this, "CustomerResource");
  }
  /**
   * Permanently deletes a customer. It cannot be undone. Also immediately cancels any active subscriptions on the customer.
   */
  del(id, params, options) {
    return this._makeRequest("DELETE", `/v1/customers/${id}`, params, options);
  }
  /**
   * Retrieves a Customer object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/customers/${id}`, params, options);
  }
  /**
   * Updates the specified customer by setting the values of the parameters passed. Any parameters not provided are left unchanged. For example, if you pass the source parameter, that becomes the customer's active source (such as a card) to be used for all charges in the future. When you update a customer to a new valid card source by passing the source parameter: for each of the customer's current subscriptions, if the subscription bills automatically and is in the past_due state, then the latest open invoice for the subscription with automatic collection enabled is retried. This retry doesn't count as an automatic retry, and doesn't affect the next regularly scheduled payment for the invoice. Changing the default_source for a customer doesn't trigger this behavior.
   *
   * This request accepts mostly the same arguments as the customer creation call.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/customers/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          subscriptions: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    items: {
                      kind: "object",
                      fields: {
                        data: {
                          kind: "array",
                          element: {
                            kind: "object",
                            fields: {
                              plan: {
                                kind: "object",
                                fields: {
                                  amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  },
                                  tiers: {
                                    kind: "array",
                                    element: {
                                      kind: "object",
                                      fields: {
                                        flat_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        unit_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  }
                                }
                              },
                              price: {
                                kind: "object",
                                fields: {
                                  currency_options: {
                                    kind: "array",
                                    element: {
                                      kind: "object",
                                      fields: {
                                        tiers: {
                                          kind: "array",
                                          element: {
                                            kind: "object",
                                            fields: {
                                              flat_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              },
                                              unit_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              }
                                            }
                                          }
                                        },
                                        unit_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  tiers: {
                                    kind: "array",
                                    element: {
                                      kind: "object",
                                      fields: {
                                        flat_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        unit_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  unit_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Removes the currently applied discount on a customer.
   */
  deleteDiscount(id, params, options) {
    return this._makeRequest("DELETE", `/v1/customers/${id}/discount`, params, options);
  }
  /**
   * Returns a list of your customers. The customers are returned sorted by creation date, with the most recent customers appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/customers", params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                subscriptions: {
                  kind: "object",
                  fields: {
                    data: {
                      kind: "array",
                      element: {
                        kind: "object",
                        fields: {
                          items: {
                            kind: "object",
                            fields: {
                              data: {
                                kind: "array",
                                element: {
                                  kind: "object",
                                  fields: {
                                    plan: {
                                      kind: "object",
                                      fields: {
                                        amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        tiers: {
                                          kind: "array",
                                          element: {
                                            kind: "object",
                                            fields: {
                                              flat_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              },
                                              unit_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    },
                                    price: {
                                      kind: "object",
                                      fields: {
                                        currency_options: {
                                          kind: "array",
                                          element: {
                                            kind: "object",
                                            fields: {
                                              tiers: {
                                                kind: "array",
                                                element: {
                                                  kind: "object",
                                                  fields: {
                                                    flat_amount_decimal: {
                                                      kind: "nullable",
                                                      inner: {
                                                        kind: "decimal_string"
                                                      }
                                                    },
                                                    unit_amount_decimal: {
                                                      kind: "nullable",
                                                      inner: {
                                                        kind: "decimal_string"
                                                      }
                                                    }
                                                  }
                                                }
                                              },
                                              unit_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              }
                                            }
                                          }
                                        },
                                        tiers: {
                                          kind: "array",
                                          element: {
                                            kind: "object",
                                            fields: {
                                              flat_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              },
                                              unit_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              }
                                            }
                                          }
                                        },
                                        unit_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Creates a new customer object.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/customers", params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          subscriptions: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    items: {
                      kind: "object",
                      fields: {
                        data: {
                          kind: "array",
                          element: {
                            kind: "object",
                            fields: {
                              plan: {
                                kind: "object",
                                fields: {
                                  amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  },
                                  tiers: {
                                    kind: "array",
                                    element: {
                                      kind: "object",
                                      fields: {
                                        flat_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        unit_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  }
                                }
                              },
                              price: {
                                kind: "object",
                                fields: {
                                  currency_options: {
                                    kind: "array",
                                    element: {
                                      kind: "object",
                                      fields: {
                                        tiers: {
                                          kind: "array",
                                          element: {
                                            kind: "object",
                                            fields: {
                                              flat_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              },
                                              unit_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              }
                                            }
                                          }
                                        },
                                        unit_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  tiers: {
                                    kind: "array",
                                    element: {
                                      kind: "object",
                                      fields: {
                                        flat_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        unit_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  unit_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Search for customers you've previously created using Stripe's [Search Query Language](https://docs.stripe.com/docs/search#search-query-language).
   * Don't use search in read-after-write flows where strict consistency is necessary. Under normal operating
   * conditions, data is searchable in less than a minute. Occasionally, propagation of new or updated data can be up
   * to an hour behind during outages. Search functionality is not available to merchants in India.
   */
  search(params, options) {
    return this._makeRequest("GET", "/v1/customers/search", params, options, {
      methodType: "search",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                subscriptions: {
                  kind: "object",
                  fields: {
                    data: {
                      kind: "array",
                      element: {
                        kind: "object",
                        fields: {
                          items: {
                            kind: "object",
                            fields: {
                              data: {
                                kind: "array",
                                element: {
                                  kind: "object",
                                  fields: {
                                    plan: {
                                      kind: "object",
                                      fields: {
                                        amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        tiers: {
                                          kind: "array",
                                          element: {
                                            kind: "object",
                                            fields: {
                                              flat_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              },
                                              unit_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    },
                                    price: {
                                      kind: "object",
                                      fields: {
                                        currency_options: {
                                          kind: "array",
                                          element: {
                                            kind: "object",
                                            fields: {
                                              tiers: {
                                                kind: "array",
                                                element: {
                                                  kind: "object",
                                                  fields: {
                                                    flat_amount_decimal: {
                                                      kind: "nullable",
                                                      inner: {
                                                        kind: "decimal_string"
                                                      }
                                                    },
                                                    unit_amount_decimal: {
                                                      kind: "nullable",
                                                      inner: {
                                                        kind: "decimal_string"
                                                      }
                                                    }
                                                  }
                                                }
                                              },
                                              unit_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              }
                                            }
                                          }
                                        },
                                        tiers: {
                                          kind: "array",
                                          element: {
                                            kind: "object",
                                            fields: {
                                              flat_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              },
                                              unit_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              }
                                            }
                                          }
                                        },
                                        unit_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Returns a list of transactions that updated the customer's [balances](https://docs.stripe.com/docs/billing/customer/balance).
   */
  listBalanceTransactions(id, params, options) {
    return this._makeRequest("GET", `/v1/customers/${id}/balance_transactions`, params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates an immutable transaction that updates the customer's credit [balance](https://docs.stripe.com/docs/billing/customer/balance).
   */
  createBalanceTransaction(id, params, options) {
    return this._makeRequest("POST", `/v1/customers/${id}/balance_transactions`, params, options);
  }
  /**
   * Retrieves a specific customer balance transaction that updated the customer's [balances](https://docs.stripe.com/docs/billing/customer/balance).
   */
  retrieveBalanceTransaction(customerId, id, params, options) {
    return this._makeRequest("GET", `/v1/customers/${customerId}/balance_transactions/${id}`, params, options);
  }
  /**
   * Most credit balance transaction fields are immutable, but you may update its description and metadata.
   */
  updateBalanceTransaction(customerId, id, params, options) {
    return this._makeRequest("POST", `/v1/customers/${customerId}/balance_transactions/${id}`, params, options);
  }
  /**
   * Retrieves a customer's cash balance.
   */
  retrieveCashBalance(id, params, options) {
    return this._makeRequest("GET", `/v1/customers/${id}/cash_balance`, params, options);
  }
  /**
   * Changes the settings on a customer's cash balance.
   */
  updateCashBalance(id, params, options) {
    return this._makeRequest("POST", `/v1/customers/${id}/cash_balance`, params, options);
  }
  /**
   * Returns a list of transactions that modified the customer's [cash balance](https://docs.stripe.com/docs/payments/customer-balance).
   */
  listCashBalanceTransactions(id, params, options) {
    return this._makeRequest("GET", `/v1/customers/${id}/cash_balance_transactions`, params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves a specific cash balance transaction, which updated the customer's [cash balance](https://docs.stripe.com/docs/payments/customer-balance).
   */
  retrieveCashBalanceTransaction(customerId, id, params, options) {
    return this._makeRequest("GET", `/v1/customers/${customerId}/cash_balance_transactions/${id}`, params, options);
  }
  /**
   * Retrieve funding instructions for a customer cash balance. If funding instructions do not yet exist for the customer, new
   * funding instructions will be created. If funding instructions have already been created for a given customer, the same
   * funding instructions will be retrieved. In other words, we will return the same funding instructions each time.
   */
  createFundingInstructions(id, params, options) {
    return this._makeRequest("POST", `/v1/customers/${id}/funding_instructions`, params, options);
  }
  /**
   * Returns a list of PaymentMethods for a given Customer
   */
  listPaymentMethods(id, params, options) {
    return this._makeRequest("GET", `/v1/customers/${id}/payment_methods`, params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves a PaymentMethod object for a given Customer.
   */
  retrievePaymentMethod(customerId, id, params, options) {
    return this._makeRequest("GET", `/v1/customers/${customerId}/payment_methods/${id}`, params, options);
  }
  /**
   * List sources for a specified customer.
   */
  listSources(id, params, options) {
    return this._makeRequest("GET", `/v1/customers/${id}/sources`, params, options, {
      methodType: "list"
    });
  }
  /**
   * When you create a new credit card, you must specify a customer or recipient on which to create it.
   *
   * If the card's owner has no default card, then the new card will become the default.
   * However, if the owner already has a default, then it will not change.
   * To change the default, you should [update the customer](https://docs.stripe.com/api/customers/update) to have a new default_source.
   */
  createSource(id, params, options) {
    return this._makeRequest("POST", `/v1/customers/${id}/sources`, params, options);
  }
  /**
   * Retrieve a specified source for a given customer.
   */
  retrieveSource(customerId, id, params, options) {
    return this._makeRequest("GET", `/v1/customers/${customerId}/sources/${id}`, params, options);
  }
  /**
   * Update a specified source for a given customer.
   */
  updateSource(customerId, id, params, options) {
    return this._makeRequest("POST", `/v1/customers/${customerId}/sources/${id}`, params, options);
  }
  /**
   * Delete a specified source for a given customer.
   */
  deleteSource(customerId, id, params, options) {
    return this._makeRequest("DELETE", `/v1/customers/${customerId}/sources/${id}`, params, options);
  }
  /**
   * Verify a specified bank account for a given customer.
   */
  verifySource(customerId, id, params, options) {
    return this._makeRequest("POST", `/v1/customers/${customerId}/sources/${id}/verify`, params, options);
  }
  /**
   * Deletes an existing tax_id object.
   */
  deleteTaxId(customerId, id, params, options) {
    return this._makeRequest("DELETE", `/v1/customers/${customerId}/tax_ids/${id}`, params, options);
  }
  /**
   * Retrieves the tax_id object with the given identifier.
   */
  retrieveTaxId(customerId, id, params, options) {
    return this._makeRequest("GET", `/v1/customers/${customerId}/tax_ids/${id}`, params, options);
  }
  /**
   * Returns a list of tax IDs for a customer.
   */
  listTaxIds(id, params, options) {
    return this._makeRequest("GET", `/v1/customers/${id}/tax_ids`, params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a new tax_id object for a customer.
   */
  createTaxId(id, params, options) {
    return this._makeRequest("POST", `/v1/customers/${id}/tax_ids`, params, options);
  }
};
var CustomerSessionResource = class extends StripeResource {
  static {
    __name(this, "CustomerSessionResource");
  }
  static {
    __name2(this, "CustomerSessionResource");
  }
  /**
   * Creates a Customer Session object that includes a single-use client secret that you can use on your front-end to grant client-side API access for certain customer resources.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/customer_sessions", params, options);
  }
};
var DisputeResource2 = class extends StripeResource {
  static {
    __name(this, "DisputeResource2");
  }
  static {
    __name2(this, "DisputeResource");
  }
  /**
   * Returns a list of your disputes.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/disputes", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves the dispute with the given ID.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/disputes/${id}`, params, options);
  }
  /**
   * When you get a dispute, contacting your customer is always the best first step. If that doesn't work, you can submit evidence to help us resolve the dispute in your favor. You can do this in your [dashboard](https://dashboard.stripe.com/disputes), but if you prefer, you can use the API to submit evidence programmatically.
   *
   * Depending on your dispute type, different evidence fields will give you a better chance of winning your dispute. To figure out which evidence fields to provide, see our [guide to dispute types](https://docs.stripe.com/docs/disputes/categories).
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/disputes/${id}`, params, options);
  }
  /**
   * Closing the dispute for a charge indicates that you do not have any evidence to submit and are essentially dismissing the dispute, acknowledging it as lost.
   *
   * The status of the dispute will change from needs_response to lost. Closing a dispute is irreversible.
   */
  close(id, params, options) {
    return this._makeRequest("POST", `/v1/disputes/${id}/close`, params, options);
  }
};
var EphemeralKeyResource = class extends StripeResource {
  static {
    __name(this, "EphemeralKeyResource");
  }
  static {
    __name2(this, "EphemeralKeyResource");
  }
  /**
   * Invalidates a short-lived API key for a given resource.
   */
  del(id, params, options) {
    return this._makeRequest("DELETE", `/v1/ephemeral_keys/${id}`, params, options);
  }
  create(params, options) {
    return this._makeRequest("POST", "/v1/ephemeral_keys", params, options, {
      validator: /* @__PURE__ */ __name2((data, options2) => {
        if (!options2.headers || !options2.headers["Stripe-Version"]) {
          throw new Error("Passing apiVersion in a separate options hash is required to create an ephemeral key. See https://stripe.com/docs/api/versioning?lang=node");
        }
      }, "validator")
    });
  }
};
var EventResource2 = class extends StripeResource {
  static {
    __name(this, "EventResource2");
  }
  static {
    __name2(this, "EventResource");
  }
  /**
   * List events, going back up to 30 days. Each event data is rendered according to Stripe API version at its creation time, specified in [event object](https://docs.stripe.com/api/events/object) api_version attribute (not according to your current Stripe API version or Stripe-Version header).
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/events", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves the details of an event if it was created in the last 30 days. Supply the unique identifier of the event, which you might have received in a webhook.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/events/${id}`, params, options);
  }
};
var ExchangeRateResource = class extends StripeResource {
  static {
    __name(this, "ExchangeRateResource");
  }
  static {
    __name2(this, "ExchangeRateResource");
  }
  /**
   * [Deprecated] The ExchangeRate APIs are deprecated. Please use the [FX Quotes API](https://docs.stripe.com/payments/currencies/localize-prices/fx-quotes-api) instead.
   *
   * Returns a list of objects that contain the rates at which foreign currencies are converted to one another. Only shows the currencies for which Stripe supports.
   * @deprecated
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/exchange_rates", params, options, {
      methodType: "list"
    });
  }
  /**
   * [Deprecated] The ExchangeRate APIs are deprecated. Please use the [FX Quotes API](https://docs.stripe.com/payments/currencies/localize-prices/fx-quotes-api) instead.
   *
   * Retrieves the exchange rates from the given currency to every supported currency.
   * @deprecated
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/exchange_rates/${id}`, params, options);
  }
};
var multipartDataGenerator = /* @__PURE__ */ __name2((method, data, headers) => {
  const segno = (Math.round(Math.random() * 1e16) + Math.round(Math.random() * 1e16)).toString();
  headers["Content-Type"] = `multipart/form-data; boundary=${segno}`;
  const textEncoder = new TextEncoder();
  let buffer = new Uint8Array(0);
  const endBuffer = textEncoder.encode("\r\n");
  function push(l) {
    const prevBuffer = buffer;
    const newBuffer = l instanceof Uint8Array ? l : new Uint8Array(textEncoder.encode(l));
    buffer = new Uint8Array(prevBuffer.length + newBuffer.length + 2);
    buffer.set(prevBuffer);
    buffer.set(newBuffer, prevBuffer.length);
    buffer.set(endBuffer, buffer.length - 2);
  }
  __name(push, "push");
  __name2(push, "push");
  function q(s) {
    return `"${s.replace(/"|"/g, "%22").replace(/\r\n|\r|\n/g, " ")}"`;
  }
  __name(q, "q");
  __name2(q, "q");
  const flattenedData = flattenAndStringify(data);
  for (const k in flattenedData) {
    if (!Object.prototype.hasOwnProperty.call(flattenedData, k)) {
      continue;
    }
    const v = flattenedData[k];
    push(`--${segno}`);
    if (Object.prototype.hasOwnProperty.call(v, "data")) {
      const typedEntry = v;
      push(`Content-Disposition: form-data; name=${q(k)}; filename=${q(typedEntry.name || "blob")}`);
      push(`Content-Type: ${typedEntry.type || "application/octet-stream"}`);
      push("");
      push(typedEntry.data);
    } else {
      push(`Content-Disposition: form-data; name=${q(k)}`);
      push("");
      push(v);
    }
  }
  push(`--${segno}--`);
  return buffer;
}, "multipartDataGenerator");
function multipartRequestDataProcessor(method, data, headers, callback) {
  data = data || {};
  if (method !== "POST") {
    return callback(null, queryStringifyRequestData(data));
  }
  this._stripe._platformFunctions.tryBufferData(data).then((bufferedData) => {
    const buffer = multipartDataGenerator(method, bufferedData, headers);
    return callback(null, buffer);
  }).catch((err) => callback(err, null));
}
__name(multipartRequestDataProcessor, "multipartRequestDataProcessor");
__name2(multipartRequestDataProcessor, "multipartRequestDataProcessor");
var FileResource = class extends StripeResource {
  static {
    __name(this, "FileResource");
  }
  static {
    __name2(this, "FileResource");
  }
  constructor() {
    super(...arguments);
    this.requestDataProcessor = multipartRequestDataProcessor;
  }
  /**
   * Returns a list of the files that your account has access to. Stripe sorts and returns the files by their creation dates, placing the most recently created files at the top.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/files", params, options, {
      methodType: "list"
    });
  }
  /**
   * To upload a file to Stripe, you need to send a request of type multipart/form-data. Include the file you want to upload in the request, and the parameters for creating a file.
   *
   * All of Stripe's officially supported Client libraries support sending multipart/form-data.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/files", params, options, {
      headers: {
        "Content-Type": "multipart/form-data"
      },
      apiBase: "files"
    });
  }
  /**
   * Retrieves the details of an existing file object. After you supply a unique file ID, Stripe returns the corresponding file object. Learn how to [access file contents](https://docs.stripe.com/docs/file-upload#download-file-contents).
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/files/${id}`, params, options);
  }
};
var FileLinkResource = class extends StripeResource {
  static {
    __name(this, "FileLinkResource");
  }
  static {
    __name2(this, "FileLinkResource");
  }
  /**
   * Returns a list of file links.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/file_links", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a new file link object.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/file_links", params, options);
  }
  /**
   * Retrieves the file link with the given ID.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/file_links/${id}`, params, options);
  }
  /**
   * Updates an existing file link object. Expired links can no longer be updated.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/file_links/${id}`, params, options);
  }
};
var InvoiceResource = class extends StripeResource {
  static {
    __name(this, "InvoiceResource");
  }
  static {
    __name2(this, "InvoiceResource");
  }
  /**
   * Permanently deletes a one-off invoice draft. This cannot be undone. Attempts to delete invoices that are no longer in a draft state will fail; once an invoice has been finalized or if an invoice is for a subscription, it must be [voided](https://docs.stripe.com/api/invoices/void).
   */
  del(id, params, options) {
    return this._makeRequest("DELETE", `/v1/invoices/${id}`, params, options);
  }
  /**
   * Retrieves the invoice with the given ID.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/invoices/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    pricing: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    },
                    quantity_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Draft invoices are fully editable. Once an invoice is [finalized](https://docs.stripe.com/docs/billing/invoices/workflow#finalized),
   * monetary values, as well as collection_method, become uneditable.
   *
   * If you would like to stop the Stripe Billing engine from automatically finalizing, reattempting payments on,
   * sending reminders for, or [automatically reconciling](https://docs.stripe.com/docs/billing/invoices/reconciliation) invoices, pass
   * auto_advance=false.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/invoices/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    pricing: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    },
                    quantity_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * You can list all invoices, or list the invoices for a specific customer. The invoices are returned sorted by creation date, with the most recently created invoices appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/invoices", params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                lines: {
                  kind: "object",
                  fields: {
                    data: {
                      kind: "array",
                      element: {
                        kind: "object",
                        fields: {
                          pricing: {
                            kind: "nullable",
                            inner: {
                              kind: "object",
                              fields: {
                                unit_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                }
                              }
                            }
                          },
                          quantity_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * This endpoint creates a draft invoice for a given customer. The invoice remains a draft until you [finalize the invoice, which allows you to [pay](/api/invoices/pay) or <a href="/api/invoices/send">send](https://docs.stripe.com/api/invoices/finalize) the invoice to your customers.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/invoices", params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    pricing: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    },
                    quantity_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Search for invoices you've previously created using Stripe's [Search Query Language](https://docs.stripe.com/docs/search#search-query-language).
   * Don't use search in read-after-write flows where strict consistency is necessary. Under normal operating
   * conditions, data is searchable in less than a minute. Occasionally, propagation of new or updated data can be up
   * to an hour behind during outages. Search functionality is not available to merchants in India.
   */
  search(params, options) {
    return this._makeRequest("GET", "/v1/invoices/search", params, options, {
      methodType: "search",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                lines: {
                  kind: "object",
                  fields: {
                    data: {
                      kind: "array",
                      element: {
                        kind: "object",
                        fields: {
                          pricing: {
                            kind: "nullable",
                            inner: {
                              kind: "object",
                              fields: {
                                unit_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                }
                              }
                            }
                          },
                          quantity_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Adds multiple line items to an invoice. This is only possible when an invoice is still a draft.
   */
  addLines(id, params, options) {
    return this._makeRequest("POST", `/v1/invoices/${id}/add_lines`, params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                price_data: {
                  kind: "object",
                  fields: { unit_amount_decimal: { kind: "decimal_string" } }
                },
                quantity_decimal: { kind: "decimal_string" }
              }
            }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    pricing: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    },
                    quantity_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Attaches a PaymentIntent or an Out of Band Payment to the invoice, adding it to the list of payments.
   *
   * For the PaymentIntent, when the PaymentIntent's status changes to succeeded, the payment is credited
   * to the invoice, increasing its amount_paid. When the invoice is fully paid, the
   * invoice's status becomes paid.
   *
   * If the PaymentIntent's status is already succeeded when it's attached, it's
   * credited to the invoice immediately.
   *
   * See: [Partial payments](https://docs.stripe.com/docs/invoicing/partial-payments) to learn more.
   */
  attachPayment(id, params, options) {
    return this._makeRequest("POST", `/v1/invoices/${id}/attach_payment`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    pricing: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    },
                    quantity_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Stripe automatically finalizes drafts before sending and attempting payment on invoices. However, if you'd like to finalize a draft invoice manually, you can do so using this method.
   */
  finalizeInvoice(id, params, options) {
    return this._makeRequest("POST", `/v1/invoices/${id}/finalize`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    pricing: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    },
                    quantity_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Marking an invoice as uncollectible is useful for keeping track of bad debts that can be written off for accounting purposes.
   */
  markUncollectible(id, params, options) {
    return this._makeRequest("POST", `/v1/invoices/${id}/mark_uncollectible`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    pricing: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    },
                    quantity_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Stripe automatically creates and then attempts to collect payment on invoices for customers on subscriptions according to your [subscriptions settings](https://dashboard.stripe.com/account/billing/automatic). However, if you'd like to attempt payment on an invoice out of the normal collection schedule or for some other reason, you can do so.
   */
  pay(id, params, options) {
    return this._makeRequest("POST", `/v1/invoices/${id}/pay`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    pricing: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    },
                    quantity_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Removes multiple line items from an invoice. This is only possible when an invoice is still a draft.
   */
  removeLines(id, params, options) {
    return this._makeRequest("POST", `/v1/invoices/${id}/remove_lines`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    pricing: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    },
                    quantity_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Stripe will automatically send invoices to customers according to your [subscriptions settings](https://dashboard.stripe.com/account/billing/automatic). However, if you'd like to manually send an invoice to your customer out of the normal schedule, you can do so. When sending invoices that have already been paid, there will be no reference to the payment in the email.
   *
   * Requests made in test-mode result in no emails being sent, despite sending an invoice.sent event.
   */
  sendInvoice(id, params, options) {
    return this._makeRequest("POST", `/v1/invoices/${id}/send`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    pricing: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    },
                    quantity_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Updates multiple line items on an invoice. This is only possible when an invoice is still a draft.
   */
  updateLines(id, params, options) {
    return this._makeRequest("POST", `/v1/invoices/${id}/update_lines`, params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                price_data: {
                  kind: "object",
                  fields: { unit_amount_decimal: { kind: "decimal_string" } }
                },
                quantity_decimal: { kind: "decimal_string" }
              }
            }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    pricing: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    },
                    quantity_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Mark a finalized invoice as void. This cannot be undone. Voiding an invoice is similar to [deletion](https://docs.stripe.com/api/invoices/delete), however it only applies to finalized invoices and maintains a papertrail where the invoice can still be found.
   *
   * Consult with local regulations to determine whether and how an invoice might be amended, canceled, or voided in the jurisdiction you're doing business in. You might need to [issue another invoice or <a href="/api/credit_notes/create">credit note](https://docs.stripe.com/api/invoices/create) instead. Stripe recommends that you consult with your legal counsel for advice specific to your business.
   */
  voidInvoice(id, params, options) {
    return this._makeRequest("POST", `/v1/invoices/${id}/void`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    pricing: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    },
                    quantity_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * At any time, you can preview the upcoming invoice for a subscription or subscription schedule. This will show you all the charges that are pending, including subscription renewal charges, invoice item charges, etc. It will also show you any discounts that are applicable to the invoice.
   *
   * You can also preview the effects of creating or updating a subscription or subscription schedule, including a preview of any prorations that will take place. To ensure that the actual proration is calculated exactly the same as the previewed proration, you should pass the subscription_details.proration_date parameter when doing the actual subscription update.
   *
   * The recommended way to get only the prorations being previewed on the invoice is to consider line items where parent.subscription_item_details.proration is true.
   *
   * Note that when you are viewing an upcoming invoice, you are simply viewing a preview – the invoice has not yet been created. As such, the upcoming invoice will not show up in invoice listing calls, and you cannot use the API to pay or edit the invoice. If you want to change the amount that your customer will be billed, you can add, remove, or update pending invoice items, or update the customer's discount.
   *
   * Note: Currency conversion calculations use the latest exchange rates. Exchange rates may vary between the time of the preview and the time of the actual invoice creation. [Learn more](https://docs.stripe.com/currencies/conversions)
   */
  createPreview(params, options) {
    return this._makeRequest("POST", "/v1/invoices/create_preview", params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          invoice_items: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                price_data: {
                  kind: "object",
                  fields: { unit_amount_decimal: { kind: "decimal_string" } }
                },
                quantity_decimal: { kind: "decimal_string" },
                unit_amount_decimal: { kind: "decimal_string" }
              }
            }
          },
          schedule_details: {
            kind: "object",
            fields: {
              phases: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    add_invoice_items: {
                      kind: "array",
                      element: {
                        kind: "object",
                        fields: {
                          price_data: {
                            kind: "object",
                            fields: {
                              unit_amount_decimal: { kind: "decimal_string" }
                            }
                          }
                        }
                      }
                    },
                    items: {
                      kind: "array",
                      element: {
                        kind: "object",
                        fields: {
                          price_data: {
                            kind: "object",
                            fields: {
                              unit_amount_decimal: { kind: "decimal_string" }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          subscription_details: {
            kind: "object",
            fields: {
              items: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    price_data: {
                      kind: "object",
                      fields: { unit_amount_decimal: { kind: "decimal_string" } }
                    }
                  }
                }
              }
            }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    pricing: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    },
                    quantity_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * When retrieving an invoice, you'll get a lines property containing the total count of line items and the first handful of those items. There is also a URL where you can retrieve the full (paginated) list of line items.
   */
  listLineItems(id, params, options) {
    return this._makeRequest("GET", `/v1/invoices/${id}/lines`, params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                pricing: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      unit_amount_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      }
                    }
                  }
                },
                quantity_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Updates an invoice's line item. Some fields, such as tax_amounts, only live on the invoice line item,
   * so they can only be updated through this endpoint. Other fields, such as amount, live on both the invoice
   * item and the invoice line item, so updates on this endpoint will propagate to the invoice item as well.
   * Updating an invoice's line item is only possible before the invoice is finalized.
   */
  updateLineItem(invoiceId, id, params, options) {
    return this._makeRequest("POST", `/v1/invoices/${invoiceId}/lines/${id}`, params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          price_data: {
            kind: "object",
            fields: { unit_amount_decimal: { kind: "decimal_string" } }
          },
          quantity_decimal: { kind: "decimal_string" }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          pricing: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                unit_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          },
          quantity_decimal: {
            kind: "nullable",
            inner: { kind: "decimal_string" }
          }
        }
      }
    });
  }
};
var InvoiceItemResource = class extends StripeResource {
  static {
    __name(this, "InvoiceItemResource");
  }
  static {
    __name2(this, "InvoiceItemResource");
  }
  /**
   * Deletes an invoice item, removing it from an invoice. Deleting invoice items is only possible when they're not attached to invoices, or if it's attached to a draft invoice.
   */
  del(id, params, options) {
    return this._makeRequest("DELETE", `/v1/invoiceitems/${id}`, params, options);
  }
  /**
   * Retrieves the invoice item with the given ID.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/invoiceitems/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          pricing: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                unit_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          },
          quantity_decimal: { kind: "decimal_string" }
        }
      }
    });
  }
  /**
   * Updates the amount or description of an invoice item on an upcoming invoice. Updating an invoice item is only possible before the invoice it's attached to is closed.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/invoiceitems/${id}`, params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          price_data: {
            kind: "object",
            fields: { unit_amount_decimal: { kind: "decimal_string" } }
          },
          quantity_decimal: { kind: "decimal_string" },
          unit_amount_decimal: { kind: "decimal_string" }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          pricing: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                unit_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          },
          quantity_decimal: { kind: "decimal_string" }
        }
      }
    });
  }
  /**
   * Returns a list of your invoice items. Invoice items are returned sorted by creation date, with the most recently created invoice items appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/invoiceitems", params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                pricing: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      unit_amount_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      }
                    }
                  }
                },
                quantity_decimal: { kind: "decimal_string" }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Creates an item to be added to a draft invoice (up to 250 items per invoice). If no invoice is specified, the item will be on the next invoice created for the customer specified.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/invoiceitems", params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          price_data: {
            kind: "object",
            fields: { unit_amount_decimal: { kind: "decimal_string" } }
          },
          quantity_decimal: { kind: "decimal_string" },
          unit_amount_decimal: { kind: "decimal_string" }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          pricing: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                unit_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          },
          quantity_decimal: { kind: "decimal_string" }
        }
      }
    });
  }
};
var InvoicePaymentResource = class extends StripeResource {
  static {
    __name(this, "InvoicePaymentResource");
  }
  static {
    __name2(this, "InvoicePaymentResource");
  }
  /**
   * When retrieving an invoice, there is an includable payments property containing the first handful of those items. There is also a URL where you can retrieve the full (paginated) list of payments.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/invoice_payments", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves the invoice payment with the given ID.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/invoice_payments/${id}`, params, options);
  }
};
var InvoiceRenderingTemplateResource = class extends StripeResource {
  static {
    __name(this, "InvoiceRenderingTemplateResource");
  }
  static {
    __name2(this, "InvoiceRenderingTemplateResource");
  }
  /**
   * List all templates, ordered by creation date, with the most recently created template appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/invoice_rendering_templates", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves an invoice rendering template with the given ID. It by default returns the latest version of the template. Optionally, specify a version to see previous versions.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/invoice_rendering_templates/${id}`, params, options);
  }
  /**
   * Updates the status of an invoice rendering template to ‘archived' so no new Stripe objects (customers, invoices, etc.) can reference it. The template can also no longer be updated. However, if the template is already set on a Stripe object, it will continue to be applied on invoices generated by it.
   */
  archive(id, params, options) {
    return this._makeRequest("POST", `/v1/invoice_rendering_templates/${id}/archive`, params, options);
  }
  /**
   * Unarchive an invoice rendering template so it can be used on new Stripe objects again.
   */
  unarchive(id, params, options) {
    return this._makeRequest("POST", `/v1/invoice_rendering_templates/${id}/unarchive`, params, options);
  }
};
var MandateResource = class extends StripeResource {
  static {
    __name(this, "MandateResource");
  }
  static {
    __name2(this, "MandateResource");
  }
  /**
   * Retrieves a Mandate object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/mandates/${id}`, params, options);
  }
};
var OAuthResource = class extends StripeResource {
  static {
    __name(this, "OAuthResource");
  }
  static {
    __name2(this, "OAuthResource");
  }
  constructor() {
    super(...arguments);
    this.basePath = makeURLInterpolator("/");
  }
  authorizeUrl(params, options) {
    params = params || {};
    options = options || {};
    let path = "oauth/authorize";
    if (options.express) {
      path = `express/${path}`;
    }
    if (!params.response_type) {
      params.response_type = "code";
    }
    if (!params.client_id) {
      params.client_id = this._stripe.getClientId();
    }
    if (!params.scope) {
      params.scope = "read_write";
    }
    const connectHost = this._stripe.resolveBaseAddress("connect");
    return `https://${connectHost}/${path}?${queryStringifyRequestData(params)}`;
  }
  token(params, options) {
    return this._makeRequest("POST", "/oauth/token", params, options, {
      apiBase: "connect"
    });
  }
  deauthorize(params, options) {
    if (!params.client_id) {
      params.client_id = this._stripe.getClientId();
    }
    return this._makeRequest("POST", "/oauth/deauthorize", params, options, {
      apiBase: "connect"
    });
  }
};
var PaymentAttemptRecordResource = class extends StripeResource {
  static {
    __name(this, "PaymentAttemptRecordResource");
  }
  static {
    __name2(this, "PaymentAttemptRecordResource");
  }
  /**
   * List all the Payment Attempt Records attached to the specified Payment Record.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/payment_attempt_records", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves a Payment Attempt Record with the given ID
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/payment_attempt_records/${id}`, params, options);
  }
};
var PaymentIntentResource = class extends StripeResource {
  static {
    __name(this, "PaymentIntentResource");
  }
  static {
    __name2(this, "PaymentIntentResource");
  }
  /**
   * Returns a list of PaymentIntents.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/payment_intents", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a PaymentIntent object.
   *
   * After the PaymentIntent is created, attach a payment method and [confirm](https://docs.stripe.com/docs/api/payment_intents/confirm)
   * to continue the payment. Learn more about <a href="/docs/payments/payment-intents">the available payment flows
   * with the Payment Intents API.
   *
   * When you use confirm=true during creation, it's equivalent to creating
   * and confirming the PaymentIntent in the same call. You can use any parameters
   * available in the [confirm API](https://docs.stripe.com/docs/api/payment_intents/confirm) when you supply
   * confirm=true.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/payment_intents", params, options);
  }
  /**
   * Retrieves the details of a PaymentIntent that has previously been created.
   *
   * You can retrieve a PaymentIntent client-side using a publishable key when the client_secret is in the query string.
   *
   * If you retrieve a PaymentIntent with a publishable key, it only returns a subset of properties. Refer to the [payment intent](https://docs.stripe.com/api#payment_intent_object) object reference for more details.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/payment_intents/${id}`, params, options);
  }
  /**
   * Updates properties on a PaymentIntent object without confirming.
   *
   * Depending on which properties you update, you might need to confirm the
   * PaymentIntent again. For example, updating the payment_method
   * always requires you to confirm the PaymentIntent again. If you prefer to
   * update and confirm at the same time, we recommend updating properties through
   * the [confirm API](https://docs.stripe.com/docs/api/payment_intents/confirm) instead.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/payment_intents/${id}`, params, options);
  }
  /**
   * Search for PaymentIntents you've previously created using Stripe's [Search Query Language](https://docs.stripe.com/docs/search#search-query-language).
   * Don't use search in read-after-write flows where strict consistency is necessary. Under normal operating
   * conditions, data is searchable in less than a minute. Occasionally, propagation of new or updated data can be up
   * to an hour behind during outages. Search functionality is not available to merchants in India.
   */
  search(params, options) {
    return this._makeRequest("GET", "/v1/payment_intents/search", params, options, {
      methodType: "search"
    });
  }
  /**
   * Manually reconcile the remaining amount for a customer_balance PaymentIntent.
   */
  applyCustomerBalance(id, params, options) {
    return this._makeRequest("POST", `/v1/payment_intents/${id}/apply_customer_balance`, params, options);
  }
  /**
   * You can cancel a PaymentIntent object when it's in one of these statuses: requires_payment_method, requires_capture, requires_confirmation, requires_action or, [in rare cases](https://docs.stripe.com/docs/payments/intents), processing.
   *
   * After it's canceled, no additional charges are made by the PaymentIntent and any operations on the PaymentIntent fail with an error. For PaymentIntents with a status of requires_capture, the remaining amount_capturable is automatically refunded.
   *
   * You can directly cancel the PaymentIntent for a Checkout Session only when the PaymentIntent has a status of requires_capture. Otherwise, you must [expire the Checkout Session](https://docs.stripe.com/docs/api/checkout/sessions/expire).
   */
  cancel(id, params, options) {
    return this._makeRequest("POST", `/v1/payment_intents/${id}/cancel`, params, options);
  }
  /**
   * Capture the funds of an existing uncaptured PaymentIntent when its status is requires_capture.
   *
   * Uncaptured PaymentIntents are cancelled a set number of days (7 by default) after their creation.
   *
   * Learn more about [separate authorization and capture](https://docs.stripe.com/docs/payments/capture-later).
   */
  capture(id, params, options) {
    return this._makeRequest("POST", `/v1/payment_intents/${id}/capture`, params, options);
  }
  /**
   * Confirm that your customer intends to pay with current or provided
   * payment method. Upon confirmation, the PaymentIntent will attempt to initiate
   * a payment.
   *
   * If the selected payment method requires additional authentication steps, the
   * PaymentIntent will transition to the requires_action status and
   * suggest additional actions via next_action. If payment fails,
   * the PaymentIntent transitions to the requires_payment_method status or the
   * canceled status if the confirmation limit is reached. If
   * payment succeeds, the PaymentIntent will transition to the succeeded
   * status (or requires_capture, if capture_method is set to manual).
   *
   * If the confirmation_method is automatic, payment may be attempted
   * using our [client SDKs](https://docs.stripe.com/docs/stripe-js/reference#stripe-handle-card-payment)
   * and the PaymentIntent's [client_secret](https://docs.stripe.com/api#payment_intent_object-client_secret).
   * After next_actions are handled by the client, no additional
   * confirmation is required to complete the payment.
   *
   * If the confirmation_method is manual, all payment attempts must be
   * initiated using a secret key.
   *
   * If any actions are required for the payment, the PaymentIntent will
   * return to the requires_confirmation state
   * after those actions are completed. Your server needs to then
   * explicitly re-confirm the PaymentIntent to initiate the next payment
   * attempt.
   *
   * There is a variable upper limit on how many times a PaymentIntent can be confirmed.
   * After this limit is reached, any further calls to this endpoint will
   * transition the PaymentIntent to the canceled state.
   */
  confirm(id, params, options) {
    return this._makeRequest("POST", `/v1/payment_intents/${id}/confirm`, params, options);
  }
  /**
   * Perform an incremental authorization on an eligible
   * [PaymentIntent](https://docs.stripe.com/docs/api/payment_intents/object). To be eligible, the
   * PaymentIntent's status must be requires_capture and
   * [incremental_authorization_supported](https://docs.stripe.com/docs/api/charges/object#charge_object-payment_method_details-card_present-incremental_authorization_supported)
   * must be true.
   *
   * Incremental authorizations attempt to increase the authorized amount on
   * your customer's card to the new, higher amount provided. Similar to the
   * initial authorization, incremental authorizations can be declined. A
   * single PaymentIntent can call this endpoint multiple times to further
   * increase the authorized amount.
   *
   * If the incremental authorization succeeds, the PaymentIntent object
   * returns with the updated
   * [amount](https://docs.stripe.com/docs/api/payment_intents/object#payment_intent_object-amount).
   * If the incremental authorization fails, a
   * [card_declined](https://docs.stripe.com/docs/error-codes#card-declined) error returns, and no other
   * fields on the PaymentIntent or Charge update. The PaymentIntent
   * object remains capturable for the previously authorized amount.
   *
   * Each PaymentIntent can have a maximum of 10 incremental authorization attempts, including declines.
   * After it's captured, a PaymentIntent can no longer be incremented.
   *
   * Learn more about [incremental authorizations](https://docs.stripe.com/docs/terminal/features/incremental-authorizations).
   */
  incrementAuthorization(id, params, options) {
    return this._makeRequest("POST", `/v1/payment_intents/${id}/increment_authorization`, params, options);
  }
  /**
   * Verifies microdeposits on a PaymentIntent object.
   */
  verifyMicrodeposits(id, params, options) {
    return this._makeRequest("POST", `/v1/payment_intents/${id}/verify_microdeposits`, params, options);
  }
  /**
   * Lists all LineItems of a given PaymentIntent.
   */
  listAmountDetailsLineItems(id, params, options) {
    return this._makeRequest("GET", `/v1/payment_intents/${id}/amount_details_line_items`, params, options, {
      methodType: "list"
    });
  }
};
var PaymentLinkResource = class extends StripeResource {
  static {
    __name(this, "PaymentLinkResource");
  }
  static {
    __name2(this, "PaymentLinkResource");
  }
  /**
   * Returns a list of your payment links.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/payment_links", params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                line_items: {
                  kind: "object",
                  fields: {
                    data: {
                      kind: "array",
                      element: {
                        kind: "object",
                        fields: {
                          price: {
                            kind: "nullable",
                            inner: {
                              kind: "object",
                              fields: {
                                currency_options: {
                                  kind: "array",
                                  element: {
                                    kind: "object",
                                    fields: {
                                      tiers: {
                                        kind: "array",
                                        element: {
                                          kind: "object",
                                          fields: {
                                            flat_amount_decimal: {
                                              kind: "nullable",
                                              inner: { kind: "decimal_string" }
                                            },
                                            unit_amount_decimal: {
                                              kind: "nullable",
                                              inner: { kind: "decimal_string" }
                                            }
                                          }
                                        }
                                      },
                                      unit_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      }
                                    }
                                  }
                                },
                                tiers: {
                                  kind: "array",
                                  element: {
                                    kind: "object",
                                    fields: {
                                      flat_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      },
                                      unit_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      }
                                    }
                                  }
                                },
                                unit_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Creates a payment link.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/payment_links", params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          line_items: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                price_data: {
                  kind: "object",
                  fields: { unit_amount_decimal: { kind: "decimal_string" } }
                }
              }
            }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          line_items: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    price: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          currency_options: {
                            kind: "array",
                            element: {
                              kind: "object",
                              fields: {
                                tiers: {
                                  kind: "array",
                                  element: {
                                    kind: "object",
                                    fields: {
                                      flat_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      },
                                      unit_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      }
                                    }
                                  }
                                },
                                unit_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                }
                              }
                            }
                          },
                          tiers: {
                            kind: "array",
                            element: {
                              kind: "object",
                              fields: {
                                flat_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                },
                                unit_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                }
                              }
                            }
                          },
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Retrieve a payment link.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/payment_links/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          line_items: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    price: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          currency_options: {
                            kind: "array",
                            element: {
                              kind: "object",
                              fields: {
                                tiers: {
                                  kind: "array",
                                  element: {
                                    kind: "object",
                                    fields: {
                                      flat_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      },
                                      unit_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      }
                                    }
                                  }
                                },
                                unit_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                }
                              }
                            }
                          },
                          tiers: {
                            kind: "array",
                            element: {
                              kind: "object",
                              fields: {
                                flat_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                },
                                unit_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                }
                              }
                            }
                          },
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Updates a payment link.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/payment_links/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          line_items: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    price: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          currency_options: {
                            kind: "array",
                            element: {
                              kind: "object",
                              fields: {
                                tiers: {
                                  kind: "array",
                                  element: {
                                    kind: "object",
                                    fields: {
                                      flat_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      },
                                      unit_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      }
                                    }
                                  }
                                },
                                unit_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                }
                              }
                            }
                          },
                          tiers: {
                            kind: "array",
                            element: {
                              kind: "object",
                              fields: {
                                flat_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                },
                                unit_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                }
                              }
                            }
                          },
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * When retrieving a payment link, there is an includable line_items property containing the first handful of those items. There is also a URL where you can retrieve the full (paginated) list of line items.
   */
  listLineItems(id, params, options) {
    return this._makeRequest("GET", `/v1/payment_links/${id}/line_items`, params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                price: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      currency_options: {
                        kind: "array",
                        element: {
                          kind: "object",
                          fields: {
                            tiers: {
                              kind: "array",
                              element: {
                                kind: "object",
                                fields: {
                                  flat_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  },
                                  unit_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            },
                            unit_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      tiers: {
                        kind: "array",
                        element: {
                          kind: "object",
                          fields: {
                            flat_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            unit_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      unit_amount_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
};
var PaymentMethodResource = class extends StripeResource {
  static {
    __name(this, "PaymentMethodResource");
  }
  static {
    __name2(this, "PaymentMethodResource");
  }
  /**
   * Returns a list of all PaymentMethods.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/payment_methods", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a PaymentMethod object. Read the [Stripe.js reference](https://docs.stripe.com/docs/stripe-js/reference#stripe-create-payment-method) to learn how to create PaymentMethods via Stripe.js.
   *
   * Instead of creating a PaymentMethod directly, we recommend using the [PaymentIntents API to accept a payment immediately or the <a href="/docs/payments/save-and-reuse">SetupIntent](https://docs.stripe.com/docs/payments/accept-a-payment) API to collect payment method details ahead of a future payment.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/payment_methods", params, options);
  }
  /**
   * Retrieves a PaymentMethod object attached to the StripeAccount. To retrieve a payment method attached to a Customer, you should use [Retrieve a Customer's PaymentMethods](https://docs.stripe.com/docs/api/payment_methods/customer)
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/payment_methods/${id}`, params, options);
  }
  /**
   * Updates a PaymentMethod object. A PaymentMethod must be attached to a customer to be updated.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/payment_methods/${id}`, params, options);
  }
  /**
   * Attaches a PaymentMethod object to a Customer.
   *
   * To attach a new PaymentMethod to a customer for future payments, we recommend you use a [SetupIntent](https://docs.stripe.com/docs/api/setup_intents)
   * or a PaymentIntent with [setup_future_usage](https://docs.stripe.com/docs/api/payment_intents/create#create_payment_intent-setup_future_usage).
   * These approaches will perform any necessary steps to set up the PaymentMethod for future payments. Using the /v1/payment_methods/:id/attach
   * endpoint without first using a SetupIntent or PaymentIntent with setup_future_usage does not optimize the PaymentMethod for
   * future use, which makes later declines and payment friction more likely.
   * See [Optimizing cards for future payments](https://docs.stripe.com/docs/payments/payment-intents#future-usage) for more information about setting up
   * future payments.
   *
   * To use this PaymentMethod as the default for invoice or subscription payments,
   * set [invoice_settings.default_payment_method](https://docs.stripe.com/docs/api/customers/update#update_customer-invoice_settings-default_payment_method),
   * on the Customer to the PaymentMethod's ID.
   */
  attach(id, params, options) {
    return this._makeRequest("POST", `/v1/payment_methods/${id}/attach`, params, options);
  }
  /**
   * Detaches a PaymentMethod object from a Customer. After a PaymentMethod is detached, it can no longer be used for a payment or re-attached to a Customer.
   */
  detach(id, params, options) {
    return this._makeRequest("POST", `/v1/payment_methods/${id}/detach`, params, options);
  }
};
var PaymentMethodConfigurationResource = class extends StripeResource {
  static {
    __name(this, "PaymentMethodConfigurationResource");
  }
  static {
    __name2(this, "PaymentMethodConfigurationResource");
  }
  /**
   * List payment method configurations
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/payment_method_configurations", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a payment method configuration
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/payment_method_configurations", params, options);
  }
  /**
   * Retrieve payment method configuration
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/payment_method_configurations/${id}`, params, options);
  }
  /**
   * Update payment method configuration
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/payment_method_configurations/${id}`, params, options);
  }
};
var PaymentMethodDomainResource = class extends StripeResource {
  static {
    __name(this, "PaymentMethodDomainResource");
  }
  static {
    __name2(this, "PaymentMethodDomainResource");
  }
  /**
   * Lists the details of existing payment method domains.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/payment_method_domains", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a payment method domain.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/payment_method_domains", params, options);
  }
  /**
   * Retrieves the details of an existing payment method domain.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/payment_method_domains/${id}`, params, options);
  }
  /**
   * Updates an existing payment method domain.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/payment_method_domains/${id}`, params, options);
  }
  /**
   * Some payment methods might require additional steps to register a domain. If the requirements weren't satisfied when the domain was created, the payment method will be inactive on the domain.
   * The payment method doesn't appear in Elements or Embedded Checkout for this domain until it is active.
   *
   * To activate a payment method on an existing payment method domain, complete the required registration steps specific to the payment method, and then validate the payment method domain with this endpoint.
   *
   * Related guides: [Payment method domains](https://docs.stripe.com/docs/payments/payment-methods/pmd-registration).
   */
  validate(id, params, options) {
    return this._makeRequest("POST", `/v1/payment_method_domains/${id}/validate`, params, options);
  }
};
var PaymentRecordResource = class extends StripeResource {
  static {
    __name(this, "PaymentRecordResource");
  }
  static {
    __name2(this, "PaymentRecordResource");
  }
  /**
   * Retrieves a Payment Record with the given ID
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/payment_records/${id}`, params, options);
  }
  /**
   * Report a new payment attempt on the specified Payment Record. A new payment
   *  attempt can only be specified if all other payment attempts are canceled or failed.
   */
  reportPaymentAttempt(id, params, options) {
    return this._makeRequest("POST", `/v1/payment_records/${id}/report_payment_attempt`, params, options);
  }
  /**
   * Report that the most recent payment attempt on the specified Payment Record
   *  was canceled.
   */
  reportPaymentAttemptCanceled(id, params, options) {
    return this._makeRequest("POST", `/v1/payment_records/${id}/report_payment_attempt_canceled`, params, options);
  }
  /**
   * Report that the most recent payment attempt on the specified Payment Record
   *  failed or errored.
   */
  reportPaymentAttemptFailed(id, params, options) {
    return this._makeRequest("POST", `/v1/payment_records/${id}/report_payment_attempt_failed`, params, options);
  }
  /**
   * Report that the most recent payment attempt on the specified Payment Record
   *  was guaranteed.
   */
  reportPaymentAttemptGuaranteed(id, params, options) {
    return this._makeRequest("POST", `/v1/payment_records/${id}/report_payment_attempt_guaranteed`, params, options);
  }
  /**
   * Report informational updates on the specified Payment Record.
   */
  reportPaymentAttemptInformational(id, params, options) {
    return this._makeRequest("POST", `/v1/payment_records/${id}/report_payment_attempt_informational`, params, options);
  }
  /**
   * Report that the most recent payment attempt on the specified Payment Record
   *  was refunded.
   */
  reportRefund(id, params, options) {
    return this._makeRequest("POST", `/v1/payment_records/${id}/report_refund`, params, options);
  }
  /**
   * Report a new Payment Record. You may report a Payment Record as it is
   *  initialized and later report updates through the other report_* methods, or report Payment
   *  Records in a terminal state directly, through this method.
   */
  reportPayment(params, options) {
    return this._makeRequest("POST", "/v1/payment_records/report_payment", params, options);
  }
};
var PayoutResource = class extends StripeResource {
  static {
    __name(this, "PayoutResource");
  }
  static {
    __name2(this, "PayoutResource");
  }
  /**
   * Returns a list of existing payouts sent to third-party bank accounts or payouts that Stripe sent to you. The payouts return in sorted order, with the most recently created payouts appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/payouts", params, options, {
      methodType: "list"
    });
  }
  /**
   * To send funds to your own bank account, create a new payout object. Your [Stripe balance](https://docs.stripe.com/api#balance) must cover the payout amount. If it doesn't, you receive an “Insufficient Funds” error.
   *
   * If your API key is in test mode, money won't actually be sent, though every other action occurs as if you're in live mode.
   *
   * If you create a manual payout on a Stripe account that uses multiple payment source types, you need to specify the source type balance that the payout draws from. The [balance object](https://docs.stripe.com/api/balances/object) details available and pending amounts by source type.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/payouts", params, options);
  }
  /**
   * Retrieves the details of an existing payout. Supply the unique payout ID from either a payout creation request or the payout list. Stripe returns the corresponding payout information.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/payouts/${id}`, params, options);
  }
  /**
   * Updates the specified payout by setting the values of the parameters you pass. We don't change parameters that you don't provide. This request only accepts the metadata as arguments.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/payouts/${id}`, params, options);
  }
  /**
   * You can cancel a previously created payout if its status is pending. Stripe refunds the funds to your available balance. You can't cancel automatic Stripe payouts.
   */
  cancel(id, params, options) {
    return this._makeRequest("POST", `/v1/payouts/${id}/cancel`, params, options);
  }
  /**
   * Reverses a payout by debiting the destination bank account. At this time, you can only reverse payouts for connected accounts to US and Canadian bank accounts. If the payout is manual and in the pending status, use /v1/payouts/:id/cancel instead.
   *
   * By requesting a reversal through /v1/payouts/:id/reverse, you confirm that the authorized signatory of the selected bank account authorizes the debit on the bank account and that no other authorization is required.
   */
  reverse(id, params, options) {
    return this._makeRequest("POST", `/v1/payouts/${id}/reverse`, params, options);
  }
};
var PlanResource = class extends StripeResource {
  static {
    __name(this, "PlanResource");
  }
  static {
    __name2(this, "PlanResource");
  }
  /**
   * Deleting plans means new subscribers can't be added. Existing subscribers aren't affected.
   */
  del(id, params, options) {
    return this._makeRequest("DELETE", `/v1/plans/${id}`, params, options);
  }
  /**
   * Retrieves the plan with the given ID.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/plans/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          amount_decimal: { kind: "nullable", inner: { kind: "decimal_string" } },
          tiers: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                flat_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                },
                unit_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Updates the specified plan by setting the values of the parameters passed. Any parameters not provided are left unchanged. By design, you cannot change a plan's ID, amount, currency, or billing cycle.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/plans/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          amount_decimal: { kind: "nullable", inner: { kind: "decimal_string" } },
          tiers: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                flat_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                },
                unit_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Returns a list of your plans.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/plans", params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                },
                tiers: {
                  kind: "array",
                  element: {
                    kind: "object",
                    fields: {
                      flat_amount_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      },
                      unit_amount_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * You can now model subscriptions more flexibly using the [Prices API](https://docs.stripe.com/api#prices). It replaces the Plans API and is backwards compatible to simplify your migration.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/plans", params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          amount_decimal: { kind: "decimal_string" },
          tiers: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                flat_amount_decimal: { kind: "decimal_string" },
                unit_amount_decimal: { kind: "decimal_string" }
              }
            }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          amount_decimal: { kind: "nullable", inner: { kind: "decimal_string" } },
          tiers: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                flat_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                },
                unit_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          }
        }
      }
    });
  }
};
var PriceResource = class extends StripeResource {
  static {
    __name(this, "PriceResource");
  }
  static {
    __name2(this, "PriceResource");
  }
  /**
   * Returns a list of your active prices, excluding [inline prices](https://docs.stripe.com/docs/products-prices/pricing-models#inline-pricing). For the list of inactive prices, set active to false.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/prices", params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                currency_options: {
                  kind: "array",
                  element: {
                    kind: "object",
                    fields: {
                      tiers: {
                        kind: "array",
                        element: {
                          kind: "object",
                          fields: {
                            flat_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            unit_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      unit_amount_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      }
                    }
                  }
                },
                tiers: {
                  kind: "array",
                  element: {
                    kind: "object",
                    fields: {
                      flat_amount_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      },
                      unit_amount_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      }
                    }
                  }
                },
                unit_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Creates a new [Price for an existing <a href="https://docs.stripe.com/api/products">Product](https://docs.stripe.com/api/prices). The Price can be recurring or one-time.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/prices", params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          currency_options: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                tiers: {
                  kind: "array",
                  element: {
                    kind: "object",
                    fields: {
                      flat_amount_decimal: { kind: "decimal_string" },
                      unit_amount_decimal: { kind: "decimal_string" }
                    }
                  }
                },
                unit_amount_decimal: { kind: "decimal_string" }
              }
            }
          },
          tiers: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                flat_amount_decimal: { kind: "decimal_string" },
                unit_amount_decimal: { kind: "decimal_string" }
              }
            }
          },
          unit_amount_decimal: { kind: "decimal_string" }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          currency_options: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                tiers: {
                  kind: "array",
                  element: {
                    kind: "object",
                    fields: {
                      flat_amount_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      },
                      unit_amount_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      }
                    }
                  }
                },
                unit_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          },
          tiers: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                flat_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                },
                unit_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          },
          unit_amount_decimal: {
            kind: "nullable",
            inner: { kind: "decimal_string" }
          }
        }
      }
    });
  }
  /**
   * Retrieves the price with the given ID.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/prices/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          currency_options: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                tiers: {
                  kind: "array",
                  element: {
                    kind: "object",
                    fields: {
                      flat_amount_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      },
                      unit_amount_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      }
                    }
                  }
                },
                unit_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          },
          tiers: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                flat_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                },
                unit_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          },
          unit_amount_decimal: {
            kind: "nullable",
            inner: { kind: "decimal_string" }
          }
        }
      }
    });
  }
  /**
   * Updates the specified price by setting the values of the parameters passed. Any parameters not provided are left unchanged.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/prices/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          currency_options: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                tiers: {
                  kind: "array",
                  element: {
                    kind: "object",
                    fields: {
                      flat_amount_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      },
                      unit_amount_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      }
                    }
                  }
                },
                unit_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          },
          tiers: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                flat_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                },
                unit_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          },
          unit_amount_decimal: {
            kind: "nullable",
            inner: { kind: "decimal_string" }
          }
        }
      }
    });
  }
  /**
   * Search for prices you've previously created using Stripe's [Search Query Language](https://docs.stripe.com/docs/search#search-query-language).
   * Don't use search in read-after-write flows where strict consistency is necessary. Under normal operating
   * conditions, data is searchable in less than a minute. Occasionally, propagation of new or updated data can be up
   * to an hour behind during outages. Search functionality is not available to merchants in India.
   */
  search(params, options) {
    return this._makeRequest("GET", "/v1/prices/search", params, options, {
      methodType: "search",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                currency_options: {
                  kind: "array",
                  element: {
                    kind: "object",
                    fields: {
                      tiers: {
                        kind: "array",
                        element: {
                          kind: "object",
                          fields: {
                            flat_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            unit_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      unit_amount_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      }
                    }
                  }
                },
                tiers: {
                  kind: "array",
                  element: {
                    kind: "object",
                    fields: {
                      flat_amount_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      },
                      unit_amount_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      }
                    }
                  }
                },
                unit_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          }
        }
      }
    });
  }
};
var ProductResource2 = class extends StripeResource {
  static {
    __name(this, "ProductResource2");
  }
  static {
    __name2(this, "ProductResource");
  }
  /**
   * Delete a product. Deleting a product is only possible if it has no prices associated with it. Additionally, deleting a product with type=good is only possible if it has no SKUs associated with it.
   */
  del(id, params, options) {
    return this._makeRequest("DELETE", `/v1/products/${id}`, params, options);
  }
  /**
   * Retrieves the details of an existing product. Supply the unique product ID from either a product creation request or the product list, and Stripe will return the corresponding product information.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/products/${id}`, params, options);
  }
  /**
   * Updates the specific product by setting the values of the parameters passed. Any parameters not provided will be left unchanged.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/products/${id}`, params, options);
  }
  /**
   * Returns a list of your products. The products are returned sorted by creation date, with the most recently created products appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/products", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a new product object.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/products", params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          default_price_data: {
            kind: "object",
            fields: {
              currency_options: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    tiers: {
                      kind: "array",
                      element: {
                        kind: "object",
                        fields: {
                          flat_amount_decimal: { kind: "decimal_string" },
                          unit_amount_decimal: { kind: "decimal_string" }
                        }
                      }
                    },
                    unit_amount_decimal: { kind: "decimal_string" }
                  }
                }
              },
              unit_amount_decimal: { kind: "decimal_string" }
            }
          }
        }
      }
    });
  }
  /**
   * Search for products you've previously created using Stripe's [Search Query Language](https://docs.stripe.com/docs/search#search-query-language).
   * Don't use search in read-after-write flows where strict consistency is necessary. Under normal operating
   * conditions, data is searchable in less than a minute. Occasionally, propagation of new or updated data can be up
   * to an hour behind during outages. Search functionality is not available to merchants in India.
   */
  search(params, options) {
    return this._makeRequest("GET", "/v1/products/search", params, options, {
      methodType: "search"
    });
  }
  /**
   * Deletes the feature attachment to a product
   */
  deleteFeature(productId, id, params, options) {
    return this._makeRequest("DELETE", `/v1/products/${productId}/features/${id}`, params, options);
  }
  /**
   * Retrieves a product_feature, which represents a feature attachment to a product
   */
  retrieveFeature(productId, id, params, options) {
    return this._makeRequest("GET", `/v1/products/${productId}/features/${id}`, params, options);
  }
  /**
   * Retrieve a list of features for a product
   */
  listFeatures(id, params, options) {
    return this._makeRequest("GET", `/v1/products/${id}/features`, params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a product_feature, which represents a feature attachment to a product
   */
  createFeature(id, params, options) {
    return this._makeRequest("POST", `/v1/products/${id}/features`, params, options);
  }
};
var PromotionCodeResource = class extends StripeResource {
  static {
    __name(this, "PromotionCodeResource");
  }
  static {
    __name2(this, "PromotionCodeResource");
  }
  /**
   * Returns a list of your promotion codes.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/promotion_codes", params, options, {
      methodType: "list"
    });
  }
  /**
   * A promotion code points to an underlying promotion. You can optionally restrict the code to a specific customer, redemption limit, and expiration date.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/promotion_codes", params, options);
  }
  /**
   * Retrieves the promotion code with the given ID. In order to retrieve a promotion code by the customer-facing code use [list](https://docs.stripe.com/docs/api/promotion_codes/list) with the desired code.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/promotion_codes/${id}`, params, options);
  }
  /**
   * Updates the specified promotion code by setting the values of the parameters passed. Most fields are, by design, not editable.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/promotion_codes/${id}`, params, options);
  }
};
var QuoteResource = class extends StripeResource {
  static {
    __name(this, "QuoteResource");
  }
  static {
    __name2(this, "QuoteResource");
  }
  /**
   * Returns a list of your quotes.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/quotes", params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                computed: {
                  kind: "object",
                  fields: {
                    upfront: {
                      kind: "object",
                      fields: {
                        line_items: {
                          kind: "object",
                          fields: {
                            data: {
                              kind: "array",
                              element: {
                                kind: "object",
                                fields: {
                                  price: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        currency_options: {
                                          kind: "array",
                                          element: {
                                            kind: "object",
                                            fields: {
                                              tiers: {
                                                kind: "array",
                                                element: {
                                                  kind: "object",
                                                  fields: {
                                                    flat_amount_decimal: {
                                                      kind: "nullable",
                                                      inner: {
                                                        kind: "decimal_string"
                                                      }
                                                    },
                                                    unit_amount_decimal: {
                                                      kind: "nullable",
                                                      inner: {
                                                        kind: "decimal_string"
                                                      }
                                                    }
                                                  }
                                                }
                                              },
                                              unit_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              }
                                            }
                                          }
                                        },
                                        tiers: {
                                          kind: "array",
                                          element: {
                                            kind: "object",
                                            fields: {
                                              flat_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              },
                                              unit_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              }
                                            }
                                          }
                                        },
                                        unit_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * A quote models prices and services for a customer. Default options for header, description, footer, and expires_at can be set in the dashboard via the [quote template](https://dashboard.stripe.com/settings/billing/quote).
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/quotes", params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          line_items: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                price_data: {
                  kind: "object",
                  fields: { unit_amount_decimal: { kind: "decimal_string" } }
                }
              }
            }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          computed: {
            kind: "object",
            fields: {
              upfront: {
                kind: "object",
                fields: {
                  line_items: {
                    kind: "object",
                    fields: {
                      data: {
                        kind: "array",
                        element: {
                          kind: "object",
                          fields: {
                            price: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  currency_options: {
                                    kind: "array",
                                    element: {
                                      kind: "object",
                                      fields: {
                                        tiers: {
                                          kind: "array",
                                          element: {
                                            kind: "object",
                                            fields: {
                                              flat_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              },
                                              unit_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              }
                                            }
                                          }
                                        },
                                        unit_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  tiers: {
                                    kind: "array",
                                    element: {
                                      kind: "object",
                                      fields: {
                                        flat_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        unit_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  unit_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Retrieves the quote with the given ID.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/quotes/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          computed: {
            kind: "object",
            fields: {
              upfront: {
                kind: "object",
                fields: {
                  line_items: {
                    kind: "object",
                    fields: {
                      data: {
                        kind: "array",
                        element: {
                          kind: "object",
                          fields: {
                            price: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  currency_options: {
                                    kind: "array",
                                    element: {
                                      kind: "object",
                                      fields: {
                                        tiers: {
                                          kind: "array",
                                          element: {
                                            kind: "object",
                                            fields: {
                                              flat_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              },
                                              unit_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              }
                                            }
                                          }
                                        },
                                        unit_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  tiers: {
                                    kind: "array",
                                    element: {
                                      kind: "object",
                                      fields: {
                                        flat_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        unit_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  unit_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * A quote models prices and services for a customer.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/quotes/${id}`, params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          line_items: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                price_data: {
                  kind: "object",
                  fields: { unit_amount_decimal: { kind: "decimal_string" } }
                }
              }
            }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          computed: {
            kind: "object",
            fields: {
              upfront: {
                kind: "object",
                fields: {
                  line_items: {
                    kind: "object",
                    fields: {
                      data: {
                        kind: "array",
                        element: {
                          kind: "object",
                          fields: {
                            price: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  currency_options: {
                                    kind: "array",
                                    element: {
                                      kind: "object",
                                      fields: {
                                        tiers: {
                                          kind: "array",
                                          element: {
                                            kind: "object",
                                            fields: {
                                              flat_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              },
                                              unit_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              }
                                            }
                                          }
                                        },
                                        unit_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  tiers: {
                                    kind: "array",
                                    element: {
                                      kind: "object",
                                      fields: {
                                        flat_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        unit_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  unit_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Accepts the specified quote.
   */
  accept(id, params, options) {
    return this._makeRequest("POST", `/v1/quotes/${id}/accept`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          computed: {
            kind: "object",
            fields: {
              upfront: {
                kind: "object",
                fields: {
                  line_items: {
                    kind: "object",
                    fields: {
                      data: {
                        kind: "array",
                        element: {
                          kind: "object",
                          fields: {
                            price: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  currency_options: {
                                    kind: "array",
                                    element: {
                                      kind: "object",
                                      fields: {
                                        tiers: {
                                          kind: "array",
                                          element: {
                                            kind: "object",
                                            fields: {
                                              flat_amount_decimal: {
                                                kind: "nullable",
                                                inner: {
                                                  kind: "decimal_string"
                                                }
                                              },
                                              unit_amount_decimal: {
                                                kind: "nullable",
                                                inner: {
                                                  kind: "decimal_string"
                                                }
                                              }
                                            }
                                          }
                                        },
                                        unit_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  tiers: {
                                    kind: "array",
                                    element: {
                                      kind: "object",
                                      fields: {
                                        flat_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        unit_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  unit_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Cancels the quote.
   */
  cancel(id, params, options) {
    return this._makeRequest("POST", `/v1/quotes/${id}/cancel`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          computed: {
            kind: "object",
            fields: {
              upfront: {
                kind: "object",
                fields: {
                  line_items: {
                    kind: "object",
                    fields: {
                      data: {
                        kind: "array",
                        element: {
                          kind: "object",
                          fields: {
                            price: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  currency_options: {
                                    kind: "array",
                                    element: {
                                      kind: "object",
                                      fields: {
                                        tiers: {
                                          kind: "array",
                                          element: {
                                            kind: "object",
                                            fields: {
                                              flat_amount_decimal: {
                                                kind: "nullable",
                                                inner: {
                                                  kind: "decimal_string"
                                                }
                                              },
                                              unit_amount_decimal: {
                                                kind: "nullable",
                                                inner: {
                                                  kind: "decimal_string"
                                                }
                                              }
                                            }
                                          }
                                        },
                                        unit_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  tiers: {
                                    kind: "array",
                                    element: {
                                      kind: "object",
                                      fields: {
                                        flat_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        unit_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  unit_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Finalizes the quote.
   */
  finalizeQuote(id, params, options) {
    return this._makeRequest("POST", `/v1/quotes/${id}/finalize`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          computed: {
            kind: "object",
            fields: {
              upfront: {
                kind: "object",
                fields: {
                  line_items: {
                    kind: "object",
                    fields: {
                      data: {
                        kind: "array",
                        element: {
                          kind: "object",
                          fields: {
                            price: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  currency_options: {
                                    kind: "array",
                                    element: {
                                      kind: "object",
                                      fields: {
                                        tiers: {
                                          kind: "array",
                                          element: {
                                            kind: "object",
                                            fields: {
                                              flat_amount_decimal: {
                                                kind: "nullable",
                                                inner: {
                                                  kind: "decimal_string"
                                                }
                                              },
                                              unit_amount_decimal: {
                                                kind: "nullable",
                                                inner: {
                                                  kind: "decimal_string"
                                                }
                                              }
                                            }
                                          }
                                        },
                                        unit_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  tiers: {
                                    kind: "array",
                                    element: {
                                      kind: "object",
                                      fields: {
                                        flat_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        unit_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  unit_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Download the PDF for a finalized quote. Explanation for special handling can be found [here](https://docs.stripe.com/quotes/overview#quote_pdf)
   */
  pdf(id, params, options) {
    return this._makeRequest("GET", `/v1/quotes/${id}/pdf`, params, options, {
      apiBase: "files",
      streaming: true
    });
  }
  /**
   * When retrieving a quote, there is an includable [computed.upfront.line_items](https://stripe.com/docs/api/quotes/object#quote_object-computed-upfront-line_items) property containing the first handful of those items. There is also a URL where you can retrieve the full (paginated) list of upfront line items.
   */
  listComputedUpfrontLineItems(id, params, options) {
    return this._makeRequest("GET", `/v1/quotes/${id}/computed_upfront_line_items`, params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                price: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      currency_options: {
                        kind: "array",
                        element: {
                          kind: "object",
                          fields: {
                            tiers: {
                              kind: "array",
                              element: {
                                kind: "object",
                                fields: {
                                  flat_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  },
                                  unit_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            },
                            unit_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      tiers: {
                        kind: "array",
                        element: {
                          kind: "object",
                          fields: {
                            flat_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            unit_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      unit_amount_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * When retrieving a quote, there is an includable line_items property containing the first handful of those items. There is also a URL where you can retrieve the full (paginated) list of line items.
   */
  listLineItems(id, params, options) {
    return this._makeRequest("GET", `/v1/quotes/${id}/line_items`, params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                price: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      currency_options: {
                        kind: "array",
                        element: {
                          kind: "object",
                          fields: {
                            tiers: {
                              kind: "array",
                              element: {
                                kind: "object",
                                fields: {
                                  flat_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  },
                                  unit_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            },
                            unit_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      tiers: {
                        kind: "array",
                        element: {
                          kind: "object",
                          fields: {
                            flat_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            unit_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      unit_amount_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
};
var RefundResource2 = class extends StripeResource {
  static {
    __name(this, "RefundResource2");
  }
  static {
    __name2(this, "RefundResource");
  }
  /**
   * Returns a list of all refunds you created. We return the refunds in sorted order, with the most recent refunds appearing first. The 10 most recent refunds are always available by default on the Charge object.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/refunds", params, options, {
      methodType: "list"
    });
  }
  /**
   * When you create a new refund, you must specify a Charge or a PaymentIntent object on which to create it.
   *
   * Creating a new refund will refund a charge that has previously been created but not yet refunded.
   * Funds will be refunded to the credit or debit card that was originally charged.
   *
   * You can optionally refund only part of a charge.
   * You can do so multiple times, until the entire charge has been refunded.
   *
   * Once entirely refunded, a charge can't be refunded again.
   * This method will raise an error when called on an already-refunded charge,
   * or when trying to refund more money than is left on a charge.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/refunds", params, options);
  }
  /**
   * Retrieves the details of an existing refund.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/refunds/${id}`, params, options);
  }
  /**
   * Updates the refund that you specify by setting the values of the passed parameters. Any parameters that you don't provide remain unchanged.
   *
   * This request only accepts metadata as an argument.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/refunds/${id}`, params, options);
  }
  /**
   * Cancels a refund with a status of requires_action.
   *
   * You can't cancel refunds in other states. Only refunds for payment methods that require customer action can enter the requires_action state.
   */
  cancel(id, params, options) {
    return this._makeRequest("POST", `/v1/refunds/${id}/cancel`, params, options);
  }
};
var ReviewResource = class extends StripeResource {
  static {
    __name(this, "ReviewResource");
  }
  static {
    __name2(this, "ReviewResource");
  }
  /**
   * Returns a list of Review objects that have open set to true. The objects are sorted in descending order by creation date, with the most recently created object appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/reviews", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves a Review object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/reviews/${id}`, params, options);
  }
  /**
   * Approves a Review object, closing it and removing it from the list of reviews.
   */
  approve(id, params, options) {
    return this._makeRequest("POST", `/v1/reviews/${id}/approve`, params, options);
  }
};
var SetupAttemptResource = class extends StripeResource {
  static {
    __name(this, "SetupAttemptResource");
  }
  static {
    __name2(this, "SetupAttemptResource");
  }
  /**
   * Returns a list of SetupAttempts that associate with a provided SetupIntent.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/setup_attempts", params, options, {
      methodType: "list"
    });
  }
};
var SetupIntentResource = class extends StripeResource {
  static {
    __name(this, "SetupIntentResource");
  }
  static {
    __name2(this, "SetupIntentResource");
  }
  /**
   * Returns a list of SetupIntents.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/setup_intents", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a SetupIntent object.
   *
   * After you create the SetupIntent, attach a payment method and [confirm](https://docs.stripe.com/docs/api/setup_intents/confirm)
   * it to collect any required permissions to charge the payment method later.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/setup_intents", params, options);
  }
  /**
   * Retrieves the details of a SetupIntent that has previously been created.
   *
   * Client-side retrieval using a publishable key is allowed when the client_secret is provided in the query string.
   *
   * When retrieved with a publishable key, only a subset of properties will be returned. Please refer to the [SetupIntent](https://docs.stripe.com/api#setup_intent_object) object reference for more details.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/setup_intents/${id}`, params, options);
  }
  /**
   * Updates a SetupIntent object.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/setup_intents/${id}`, params, options);
  }
  /**
   * You can cancel a SetupIntent object when it's in one of these statuses: requires_payment_method, requires_confirmation, or requires_action.
   *
   * After you cancel it, setup is abandoned and any operations on the SetupIntent fail with an error. You can't cancel the SetupIntent for a Checkout Session. [Expire the Checkout Session](https://docs.stripe.com/docs/api/checkout/sessions/expire) instead.
   */
  cancel(id, params, options) {
    return this._makeRequest("POST", `/v1/setup_intents/${id}/cancel`, params, options);
  }
  /**
   * Confirm that your customer intends to set up the current or
   * provided payment method. For example, you would confirm a SetupIntent
   * when a customer hits the “Save” button on a payment method management
   * page on your website.
   *
   * If the selected payment method does not require any additional
   * steps from the customer, the SetupIntent will transition to the
   * succeeded status.
   *
   * Otherwise, it will transition to the requires_action status and
   * suggest additional actions via next_action. If setup fails,
   * the SetupIntent will transition to the
   * requires_payment_method status or the canceled status if the
   * confirmation limit is reached.
   */
  confirm(id, params, options) {
    return this._makeRequest("POST", `/v1/setup_intents/${id}/confirm`, params, options);
  }
  /**
   * Verifies microdeposits on a SetupIntent object.
   */
  verifyMicrodeposits(id, params, options) {
    return this._makeRequest("POST", `/v1/setup_intents/${id}/verify_microdeposits`, params, options);
  }
};
var ShippingRateResource = class extends StripeResource {
  static {
    __name(this, "ShippingRateResource");
  }
  static {
    __name2(this, "ShippingRateResource");
  }
  /**
   * Returns a list of your shipping rates.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/shipping_rates", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a new shipping rate object.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/shipping_rates", params, options);
  }
  /**
   * Returns the shipping rate object with the given ID.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/shipping_rates/${id}`, params, options);
  }
  /**
   * Updates an existing shipping rate object.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/shipping_rates/${id}`, params, options);
  }
};
var SourceResource = class extends StripeResource {
  static {
    __name(this, "SourceResource");
  }
  static {
    __name2(this, "SourceResource");
  }
  /**
   * Retrieves an existing source object. Supply the unique source ID from a source creation request and Stripe will return the corresponding up-to-date source object information.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/sources/${id}`, params, options);
  }
  /**
   * Updates the specified source by setting the values of the parameters passed. Any parameters not provided will be left unchanged.
   *
   * This request accepts the metadata and owner as arguments. It is also possible to update type specific information for selected payment methods. Please refer to our [payment method guides](https://docs.stripe.com/docs/sources) for more detail.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/sources/${id}`, params, options);
  }
  /**
   * Creates a new source object.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/sources", params, options);
  }
  /**
   * Verify a given source.
   */
  verify(id, params, options) {
    return this._makeRequest("POST", `/v1/sources/${id}/verify`, params, options);
  }
  /**
   * List source transactions for a given source.
   */
  listSourceTransactions(id, params, options) {
    return this._makeRequest("GET", `/v1/sources/${id}/source_transactions`, params, options, {
      methodType: "list"
    });
  }
};
var SubscriptionResource = class extends StripeResource {
  static {
    __name(this, "SubscriptionResource");
  }
  static {
    __name2(this, "SubscriptionResource");
  }
  /**
   * Cancels a customer's subscription immediately. The customer won't be charged again for the subscription. After it's canceled, you can no longer update the subscription or its [metadata](https://docs.stripe.com/metadata).
   *
   * Any pending invoice items that you've created are still charged at the end of the period, unless manually [deleted](https://docs.stripe.com/api/invoiceitems/delete). If you've set the subscription to cancel at the end of the period, any pending prorations are also left in place and collected at the end of the period. But if the subscription is set to cancel immediately, pending prorations are removed if invoice_now and prorate are both set to true.
   *
   * By default, upon subscription cancellation, Stripe stops automatic collection of all finalized invoices for the customer. This is intended to prevent unexpected payment attempts after the customer has canceled a subscription. However, you can resume automatic collection of the invoices manually after subscription cancellation to have us proceed. Or, you could check for unpaid invoices before allowing the customer to cancel the subscription at all.
   */
  cancel(id, params, options) {
    return this._makeRequest("DELETE", `/v1/subscriptions/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          items: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    plan: {
                      kind: "object",
                      fields: {
                        amount_decimal: {
                          kind: "nullable",
                          inner: { kind: "decimal_string" }
                        },
                        tiers: {
                          kind: "array",
                          element: {
                            kind: "object",
                            fields: {
                              flat_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              },
                              unit_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              }
                            }
                          }
                        }
                      }
                    },
                    price: {
                      kind: "object",
                      fields: {
                        currency_options: {
                          kind: "array",
                          element: {
                            kind: "object",
                            fields: {
                              tiers: {
                                kind: "array",
                                element: {
                                  kind: "object",
                                  fields: {
                                    flat_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    },
                                    unit_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    }
                                  }
                                }
                              },
                              unit_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              }
                            }
                          }
                        },
                        tiers: {
                          kind: "array",
                          element: {
                            kind: "object",
                            fields: {
                              flat_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              },
                              unit_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              }
                            }
                          }
                        },
                        unit_amount_decimal: {
                          kind: "nullable",
                          inner: { kind: "decimal_string" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Retrieves the subscription with the given ID.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/subscriptions/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          items: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    plan: {
                      kind: "object",
                      fields: {
                        amount_decimal: {
                          kind: "nullable",
                          inner: { kind: "decimal_string" }
                        },
                        tiers: {
                          kind: "array",
                          element: {
                            kind: "object",
                            fields: {
                              flat_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              },
                              unit_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              }
                            }
                          }
                        }
                      }
                    },
                    price: {
                      kind: "object",
                      fields: {
                        currency_options: {
                          kind: "array",
                          element: {
                            kind: "object",
                            fields: {
                              tiers: {
                                kind: "array",
                                element: {
                                  kind: "object",
                                  fields: {
                                    flat_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    },
                                    unit_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    }
                                  }
                                }
                              },
                              unit_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              }
                            }
                          }
                        },
                        tiers: {
                          kind: "array",
                          element: {
                            kind: "object",
                            fields: {
                              flat_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              },
                              unit_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              }
                            }
                          }
                        },
                        unit_amount_decimal: {
                          kind: "nullable",
                          inner: { kind: "decimal_string" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Updates an existing subscription to match the specified parameters.
   * When changing prices or quantities, we optionally prorate the price we charge next month to make up for any price changes.
   * To preview how the proration is calculated, use the [create preview](https://docs.stripe.com/docs/api/invoices/create_preview) endpoint.
   *
   * By default, we prorate subscription changes. For example, if a customer signs up on May 1 for a 100 price, they'll be billed 100 immediately. If on May 15 they switch to a 200 price, then on June 1 they'll be billed 250 (200 for a renewal of her subscription, plus a 50 prorating adjustment for half of the previous month's 100 difference). Similarly, a downgrade generates a credit that is applied to the next invoice. We also prorate when you make quantity changes.
   *
   * Switching prices does not normally change the billing date or generate an immediate charge unless:
   *
   *
   * The billing interval is changed (for example, from monthly to yearly).
   * The subscription moves from free to paid.
   * A trial starts or ends.
   *
   *
   * In these cases, we apply a credit for the unused time on the previous price, immediately charge the customer using the new price, and reset the billing date. Learn about how [Stripe immediately attempts payment for subscription changes](https://docs.stripe.com/docs/billing/subscriptions/upgrade-downgrade#immediate-payment).
   *
   * If you want to charge for an upgrade immediately, pass proration_behavior as always_invoice to create prorations, automatically invoice the customer for those proration adjustments, and attempt to collect payment. If you pass create_prorations, the prorations are created but not automatically invoiced. If you want to bill the customer for the prorations before the subscription's renewal date, you need to manually [invoice the customer](https://docs.stripe.com/docs/api/invoices/create).
   *
   * If you don't want to prorate, set the proration_behavior option to none. With this option, the customer is billed 100 on May 1 and 200 on June 1. Similarly, if you set proration_behavior to none when switching between different billing intervals (for example, from monthly to yearly), we don't generate any credits for the old subscription's unused time. We still reset the billing date and bill immediately for the new subscription.
   *
   * Updating the quantity on a subscription many times in an hour may result in [rate limiting. If you need to bill for a frequently changing quantity, consider integrating <a href="/docs/billing/subscriptions/usage-based">usage-based billing](https://docs.stripe.com/docs/rate-limits) instead.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/subscriptions/${id}`, params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          add_invoice_items: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                price_data: {
                  kind: "object",
                  fields: { unit_amount_decimal: { kind: "decimal_string" } }
                }
              }
            }
          },
          items: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                price_data: {
                  kind: "object",
                  fields: { unit_amount_decimal: { kind: "decimal_string" } }
                }
              }
            }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          items: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    plan: {
                      kind: "object",
                      fields: {
                        amount_decimal: {
                          kind: "nullable",
                          inner: { kind: "decimal_string" }
                        },
                        tiers: {
                          kind: "array",
                          element: {
                            kind: "object",
                            fields: {
                              flat_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              },
                              unit_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              }
                            }
                          }
                        }
                      }
                    },
                    price: {
                      kind: "object",
                      fields: {
                        currency_options: {
                          kind: "array",
                          element: {
                            kind: "object",
                            fields: {
                              tiers: {
                                kind: "array",
                                element: {
                                  kind: "object",
                                  fields: {
                                    flat_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    },
                                    unit_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    }
                                  }
                                }
                              },
                              unit_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              }
                            }
                          }
                        },
                        tiers: {
                          kind: "array",
                          element: {
                            kind: "object",
                            fields: {
                              flat_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              },
                              unit_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              }
                            }
                          }
                        },
                        unit_amount_decimal: {
                          kind: "nullable",
                          inner: { kind: "decimal_string" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Removes the currently applied discount on a subscription.
   */
  deleteDiscount(id, params, options) {
    return this._makeRequest("DELETE", `/v1/subscriptions/${id}/discount`, params, options);
  }
  /**
   * By default, returns a list of subscriptions that have not been canceled. In order to list canceled subscriptions, specify status=canceled.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/subscriptions", params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                items: {
                  kind: "object",
                  fields: {
                    data: {
                      kind: "array",
                      element: {
                        kind: "object",
                        fields: {
                          plan: {
                            kind: "object",
                            fields: {
                              amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              },
                              tiers: {
                                kind: "array",
                                element: {
                                  kind: "object",
                                  fields: {
                                    flat_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    },
                                    unit_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    }
                                  }
                                }
                              }
                            }
                          },
                          price: {
                            kind: "object",
                            fields: {
                              currency_options: {
                                kind: "array",
                                element: {
                                  kind: "object",
                                  fields: {
                                    tiers: {
                                      kind: "array",
                                      element: {
                                        kind: "object",
                                        fields: {
                                          flat_amount_decimal: {
                                            kind: "nullable",
                                            inner: { kind: "decimal_string" }
                                          },
                                          unit_amount_decimal: {
                                            kind: "nullable",
                                            inner: { kind: "decimal_string" }
                                          }
                                        }
                                      }
                                    },
                                    unit_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    }
                                  }
                                }
                              },
                              tiers: {
                                kind: "array",
                                element: {
                                  kind: "object",
                                  fields: {
                                    flat_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    },
                                    unit_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    }
                                  }
                                }
                              },
                              unit_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Creates a new subscription on an existing customer. Each customer can have up to 500 active or scheduled subscriptions.
   *
   * When you create a subscription with collection_method=charge_automatically, the first invoice is finalized as part of the request.
   * The payment_behavior parameter determines the exact behavior of the initial payment.
   *
   * To start subscriptions where the first invoice always begins in a draft status, use [subscription schedules](https://docs.stripe.com/docs/billing/subscriptions/subscription-schedules#managing) instead.
   * Schedules provide the flexibility to model more complex billing configurations that change over time.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/subscriptions", params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          add_invoice_items: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                price_data: {
                  kind: "object",
                  fields: { unit_amount_decimal: { kind: "decimal_string" } }
                }
              }
            }
          },
          items: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                price_data: {
                  kind: "object",
                  fields: { unit_amount_decimal: { kind: "decimal_string" } }
                }
              }
            }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          items: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    plan: {
                      kind: "object",
                      fields: {
                        amount_decimal: {
                          kind: "nullable",
                          inner: { kind: "decimal_string" }
                        },
                        tiers: {
                          kind: "array",
                          element: {
                            kind: "object",
                            fields: {
                              flat_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              },
                              unit_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              }
                            }
                          }
                        }
                      }
                    },
                    price: {
                      kind: "object",
                      fields: {
                        currency_options: {
                          kind: "array",
                          element: {
                            kind: "object",
                            fields: {
                              tiers: {
                                kind: "array",
                                element: {
                                  kind: "object",
                                  fields: {
                                    flat_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    },
                                    unit_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    }
                                  }
                                }
                              },
                              unit_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              }
                            }
                          }
                        },
                        tiers: {
                          kind: "array",
                          element: {
                            kind: "object",
                            fields: {
                              flat_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              },
                              unit_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              }
                            }
                          }
                        },
                        unit_amount_decimal: {
                          kind: "nullable",
                          inner: { kind: "decimal_string" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Search for subscriptions you've previously created using Stripe's [Search Query Language](https://docs.stripe.com/docs/search#search-query-language).
   * Don't use search in read-after-write flows where strict consistency is necessary. Under normal operating
   * conditions, data is searchable in less than a minute. Occasionally, propagation of new or updated data can be up
   * to an hour behind during outages. Search functionality is not available to merchants in India.
   */
  search(params, options) {
    return this._makeRequest("GET", "/v1/subscriptions/search", params, options, {
      methodType: "search",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                items: {
                  kind: "object",
                  fields: {
                    data: {
                      kind: "array",
                      element: {
                        kind: "object",
                        fields: {
                          plan: {
                            kind: "object",
                            fields: {
                              amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              },
                              tiers: {
                                kind: "array",
                                element: {
                                  kind: "object",
                                  fields: {
                                    flat_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    },
                                    unit_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    }
                                  }
                                }
                              }
                            }
                          },
                          price: {
                            kind: "object",
                            fields: {
                              currency_options: {
                                kind: "array",
                                element: {
                                  kind: "object",
                                  fields: {
                                    tiers: {
                                      kind: "array",
                                      element: {
                                        kind: "object",
                                        fields: {
                                          flat_amount_decimal: {
                                            kind: "nullable",
                                            inner: { kind: "decimal_string" }
                                          },
                                          unit_amount_decimal: {
                                            kind: "nullable",
                                            inner: { kind: "decimal_string" }
                                          }
                                        }
                                      }
                                    },
                                    unit_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    }
                                  }
                                }
                              },
                              tiers: {
                                kind: "array",
                                element: {
                                  kind: "object",
                                  fields: {
                                    flat_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    },
                                    unit_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    }
                                  }
                                }
                              },
                              unit_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Upgrade the billing_mode of an existing subscription.
   */
  migrate(id, params, options) {
    return this._makeRequest("POST", `/v1/subscriptions/${id}/migrate`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          items: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    plan: {
                      kind: "object",
                      fields: {
                        amount_decimal: {
                          kind: "nullable",
                          inner: { kind: "decimal_string" }
                        },
                        tiers: {
                          kind: "array",
                          element: {
                            kind: "object",
                            fields: {
                              flat_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              },
                              unit_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              }
                            }
                          }
                        }
                      }
                    },
                    price: {
                      kind: "object",
                      fields: {
                        currency_options: {
                          kind: "array",
                          element: {
                            kind: "object",
                            fields: {
                              tiers: {
                                kind: "array",
                                element: {
                                  kind: "object",
                                  fields: {
                                    flat_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    },
                                    unit_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    }
                                  }
                                }
                              },
                              unit_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              }
                            }
                          }
                        },
                        tiers: {
                          kind: "array",
                          element: {
                            kind: "object",
                            fields: {
                              flat_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              },
                              unit_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              }
                            }
                          }
                        },
                        unit_amount_decimal: {
                          kind: "nullable",
                          inner: { kind: "decimal_string" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Initiates resumption of a paused subscription, optionally resetting the billing cycle anchor and creating prorations. If no resumption invoice is generated, the subscription becomes active immediately. If a resumption invoice is generated, the subscription remains paused until the invoice is paid or marked uncollectible. If the invoice isn't paid by the expiration date, it is voided and the subscription remains paused. You can only resume subscriptions with collection_method set to charge_automatically. send_invoice subscriptions are not supported.
   */
  resume(id, params, options) {
    return this._makeRequest("POST", `/v1/subscriptions/${id}/resume`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          items: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    plan: {
                      kind: "object",
                      fields: {
                        amount_decimal: {
                          kind: "nullable",
                          inner: { kind: "decimal_string" }
                        },
                        tiers: {
                          kind: "array",
                          element: {
                            kind: "object",
                            fields: {
                              flat_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              },
                              unit_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              }
                            }
                          }
                        }
                      }
                    },
                    price: {
                      kind: "object",
                      fields: {
                        currency_options: {
                          kind: "array",
                          element: {
                            kind: "object",
                            fields: {
                              tiers: {
                                kind: "array",
                                element: {
                                  kind: "object",
                                  fields: {
                                    flat_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    },
                                    unit_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    }
                                  }
                                }
                              },
                              unit_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              }
                            }
                          }
                        },
                        tiers: {
                          kind: "array",
                          element: {
                            kind: "object",
                            fields: {
                              flat_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              },
                              unit_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              }
                            }
                          }
                        },
                        unit_amount_decimal: {
                          kind: "nullable",
                          inner: { kind: "decimal_string" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
};
var SubscriptionItemResource = class extends StripeResource {
  static {
    __name(this, "SubscriptionItemResource");
  }
  static {
    __name2(this, "SubscriptionItemResource");
  }
  /**
   * Deletes an item from the subscription. Removing a subscription item from a subscription will not cancel the subscription.
   */
  del(id, params, options) {
    return this._makeRequest("DELETE", `/v1/subscription_items/${id}`, params, options);
  }
  /**
   * Retrieves the subscription item with the given ID.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/subscription_items/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          plan: {
            kind: "object",
            fields: {
              amount_decimal: {
                kind: "nullable",
                inner: { kind: "decimal_string" }
              },
              tiers: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    flat_amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    },
                    unit_amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          },
          price: {
            kind: "object",
            fields: {
              currency_options: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    tiers: {
                      kind: "array",
                      element: {
                        kind: "object",
                        fields: {
                          flat_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          },
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    },
                    unit_amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              },
              tiers: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    flat_amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    },
                    unit_amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              },
              unit_amount_decimal: {
                kind: "nullable",
                inner: { kind: "decimal_string" }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Updates the plan or quantity of an item on a current subscription.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/subscription_items/${id}`, params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          price_data: {
            kind: "object",
            fields: { unit_amount_decimal: { kind: "decimal_string" } }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          plan: {
            kind: "object",
            fields: {
              amount_decimal: {
                kind: "nullable",
                inner: { kind: "decimal_string" }
              },
              tiers: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    flat_amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    },
                    unit_amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          },
          price: {
            kind: "object",
            fields: {
              currency_options: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    tiers: {
                      kind: "array",
                      element: {
                        kind: "object",
                        fields: {
                          flat_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          },
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    },
                    unit_amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              },
              tiers: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    flat_amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    },
                    unit_amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              },
              unit_amount_decimal: {
                kind: "nullable",
                inner: { kind: "decimal_string" }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Returns a list of your subscription items for a given subscription.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/subscription_items", params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                plan: {
                  kind: "object",
                  fields: {
                    amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    },
                    tiers: {
                      kind: "array",
                      element: {
                        kind: "object",
                        fields: {
                          flat_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          },
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                },
                price: {
                  kind: "object",
                  fields: {
                    currency_options: {
                      kind: "array",
                      element: {
                        kind: "object",
                        fields: {
                          tiers: {
                            kind: "array",
                            element: {
                              kind: "object",
                              fields: {
                                flat_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                },
                                unit_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                }
                              }
                            }
                          },
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    },
                    tiers: {
                      kind: "array",
                      element: {
                        kind: "object",
                        fields: {
                          flat_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          },
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    },
                    unit_amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Adds a new item to an existing subscription. No existing items will be changed or replaced.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/subscription_items", params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          price_data: {
            kind: "object",
            fields: { unit_amount_decimal: { kind: "decimal_string" } }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          plan: {
            kind: "object",
            fields: {
              amount_decimal: {
                kind: "nullable",
                inner: { kind: "decimal_string" }
              },
              tiers: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    flat_amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    },
                    unit_amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          },
          price: {
            kind: "object",
            fields: {
              currency_options: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    tiers: {
                      kind: "array",
                      element: {
                        kind: "object",
                        fields: {
                          flat_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          },
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    },
                    unit_amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              },
              tiers: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    flat_amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    },
                    unit_amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              },
              unit_amount_decimal: {
                kind: "nullable",
                inner: { kind: "decimal_string" }
              }
            }
          }
        }
      }
    });
  }
};
var SubscriptionScheduleResource = class extends StripeResource {
  static {
    __name(this, "SubscriptionScheduleResource");
  }
  static {
    __name2(this, "SubscriptionScheduleResource");
  }
  /**
   * Retrieves the list of your subscription schedules.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/subscription_schedules", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a new subscription schedule object. Each customer can have up to 500 active or scheduled subscriptions.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/subscription_schedules", params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          phases: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                add_invoice_items: {
                  kind: "array",
                  element: {
                    kind: "object",
                    fields: {
                      price_data: {
                        kind: "object",
                        fields: {
                          unit_amount_decimal: { kind: "decimal_string" }
                        }
                      }
                    }
                  }
                },
                items: {
                  kind: "array",
                  element: {
                    kind: "object",
                    fields: {
                      price_data: {
                        kind: "object",
                        fields: {
                          unit_amount_decimal: { kind: "decimal_string" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Retrieves the details of an existing subscription schedule. You only need to supply the unique subscription schedule identifier that was returned upon subscription schedule creation.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/subscription_schedules/${id}`, params, options);
  }
  /**
   * Updates an existing subscription schedule.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/subscription_schedules/${id}`, params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          phases: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                add_invoice_items: {
                  kind: "array",
                  element: {
                    kind: "object",
                    fields: {
                      price_data: {
                        kind: "object",
                        fields: {
                          unit_amount_decimal: { kind: "decimal_string" }
                        }
                      }
                    }
                  }
                },
                items: {
                  kind: "array",
                  element: {
                    kind: "object",
                    fields: {
                      price_data: {
                        kind: "object",
                        fields: {
                          unit_amount_decimal: { kind: "decimal_string" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Cancels a subscription schedule and its associated subscription immediately (if the subscription schedule has an active subscription). A subscription schedule can only be canceled if its status is not_started or active.
   */
  cancel(id, params, options) {
    return this._makeRequest("POST", `/v1/subscription_schedules/${id}/cancel`, params, options);
  }
  /**
   * Releases the subscription schedule immediately, which will stop scheduling of its phases, but leave any existing subscription in place. A schedule can only be released if its status is not_started or active. If the subscription schedule is currently associated with a subscription, releasing it will remove its subscription property and set the subscription's ID to the released_subscription property.
   */
  release(id, params, options) {
    return this._makeRequest("POST", `/v1/subscription_schedules/${id}/release`, params, options);
  }
};
var TaxCodeResource = class extends StripeResource {
  static {
    __name(this, "TaxCodeResource");
  }
  static {
    __name2(this, "TaxCodeResource");
  }
  /**
   * A list of [all tax codes available](https://stripe.com/docs/tax/tax-categories) to add to Products in order to allow specific tax calculations.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/tax_codes", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves the details of an existing tax code. Supply the unique tax code ID and Stripe will return the corresponding tax code information.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/tax_codes/${id}`, params, options);
  }
};
var TaxIdResource = class extends StripeResource {
  static {
    __name(this, "TaxIdResource");
  }
  static {
    __name2(this, "TaxIdResource");
  }
  /**
   * Deletes an existing account or customer tax_id object.
   */
  del(id, params, options) {
    return this._makeRequest("DELETE", `/v1/tax_ids/${id}`, params, options);
  }
  /**
   * Retrieves an account or customer tax_id object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/tax_ids/${id}`, params, options);
  }
  /**
   * Returns a list of tax IDs.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/tax_ids", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a new account or customer tax_id object.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/tax_ids", params, options);
  }
};
var TaxRateResource = class extends StripeResource {
  static {
    __name(this, "TaxRateResource");
  }
  static {
    __name2(this, "TaxRateResource");
  }
  /**
   * Returns a list of your tax rates. Tax rates are returned sorted by creation date, with the most recently created tax rates appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/tax_rates", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a new tax rate.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/tax_rates", params, options);
  }
  /**
   * Retrieves a tax rate with the given ID
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/tax_rates/${id}`, params, options);
  }
  /**
   * Updates an existing tax rate.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/tax_rates/${id}`, params, options);
  }
};
var TokenResource2 = class extends StripeResource {
  static {
    __name(this, "TokenResource2");
  }
  static {
    __name2(this, "TokenResource");
  }
  /**
   * Retrieves the token with the given ID.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/tokens/${id}`, params, options);
  }
  /**
   * Creates a single-use token that represents a bank account's details.
   * You can use this token with any v1 API method in place of a bank account dictionary. You can only use this token once. To do so, attach it to a [connected account](https://docs.stripe.com/api#accounts) where [controller.requirement_collection](https://docs.stripe.com/api/accounts/object#account_object-controller-requirement_collection) is application, which includes Custom accounts.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/tokens", params, options);
  }
};
var TopupResource = class extends StripeResource {
  static {
    __name(this, "TopupResource");
  }
  static {
    __name2(this, "TopupResource");
  }
  /**
   * Returns a list of top-ups.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/topups", params, options, {
      methodType: "list"
    });
  }
  /**
   * Top up the balance of an account
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/topups", params, options);
  }
  /**
   * Retrieves the details of a top-up that has previously been created. Supply the unique top-up ID that was returned from your previous request, and Stripe will return the corresponding top-up information.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/topups/${id}`, params, options);
  }
  /**
   * Updates the metadata of a top-up. Other top-up details are not editable by design.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/topups/${id}`, params, options);
  }
  /**
   * Cancels a top-up. Only pending top-ups can be canceled.
   */
  cancel(id, params, options) {
    return this._makeRequest("POST", `/v1/topups/${id}/cancel`, params, options);
  }
};
var TransferResource = class extends StripeResource {
  static {
    __name(this, "TransferResource");
  }
  static {
    __name2(this, "TransferResource");
  }
  /**
   * Returns a list of existing transfers sent to connected accounts. The transfers are returned in sorted order, with the most recently created transfers appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/transfers", params, options, {
      methodType: "list"
    });
  }
  /**
   * To send funds from your Stripe account to a connected account, you create a new transfer object. Your [Stripe balance](https://docs.stripe.com/api#balance) must be able to cover the transfer amount, or you'll receive an “Insufficient Funds” error.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/transfers", params, options);
  }
  /**
   * Retrieves the details of an existing transfer. Supply the unique transfer ID from either a transfer creation request or the transfer list, and Stripe will return the corresponding transfer information.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/transfers/${id}`, params, options);
  }
  /**
   * Updates the specified transfer by setting the values of the parameters passed. Any parameters not provided will be left unchanged.
   *
   * This request accepts only metadata as an argument.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/transfers/${id}`, params, options);
  }
  /**
   * You can see a list of the reversals belonging to a specific transfer. Note that the 10 most recent reversals are always available by default on the transfer object. If you need more than those 10, you can use this API method and the limit and starting_after parameters to page through additional reversals.
   */
  listReversals(id, params, options) {
    return this._makeRequest("GET", `/v1/transfers/${id}/reversals`, params, options, {
      methodType: "list"
    });
  }
  /**
   * When you create a new reversal, you must specify a transfer to create it on.
   *
   * When reversing transfers, you can optionally reverse part of the transfer. You can do so as many times as you wish until the entire transfer has been reversed.
   *
   * Once entirely reversed, a transfer can't be reversed again. This method will return an error when called on an already-reversed transfer, or when trying to reverse more money than is left on a transfer.
   */
  createReversal(id, params, options) {
    return this._makeRequest("POST", `/v1/transfers/${id}/reversals`, params, options);
  }
  /**
   * By default, you can see the 10 most recent reversals stored directly on the transfer object, but you can also retrieve details about a specific reversal stored on the transfer.
   */
  retrieveReversal(transferId, id, params, options) {
    return this._makeRequest("GET", `/v1/transfers/${transferId}/reversals/${id}`, params, options);
  }
  /**
   * Updates the specified reversal by setting the values of the parameters passed. Any parameters not provided will be left unchanged.
   *
   * This request only accepts metadata and description as arguments.
   */
  updateReversal(transferId, id, params, options) {
    return this._makeRequest("POST", `/v1/transfers/${transferId}/reversals/${id}`, params, options);
  }
};
var WebhookEndpointResource = class extends StripeResource {
  static {
    __name(this, "WebhookEndpointResource");
  }
  static {
    __name2(this, "WebhookEndpointResource");
  }
  /**
   * You can also delete webhook endpoints via the [webhook endpoint management](https://dashboard.stripe.com/account/webhooks) page of the Stripe dashboard.
   */
  del(id, params, options) {
    return this._makeRequest("DELETE", `/v1/webhook_endpoints/${id}`, params, options);
  }
  /**
   * Retrieves the webhook endpoint with the given ID.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/webhook_endpoints/${id}`, params, options);
  }
  /**
   * Updates the webhook endpoint. You may edit the url, the list of enabled_events, and the status of your endpoint.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/webhook_endpoints/${id}`, params, options);
  }
  /**
   * Returns a list of your webhook endpoints.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/webhook_endpoints", params, options, {
      methodType: "list"
    });
  }
  /**
   * A webhook endpoint must have a url and a list of enabled_events. You may optionally specify the Boolean connect parameter. If set to true, then a Connect webhook endpoint that notifies the specified url about events from all connected accounts is created; otherwise an account webhook endpoint that notifies the specified url only about events from your account is created. You can also create webhook endpoints in the [webhooks settings](https://dashboard.stripe.com/account/webhooks) section of the Dashboard.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/webhook_endpoints", params, options);
  }
};
var Apps = resourceNamespace("apps", { Secrets: SecretResource });
var Billing = resourceNamespace("billing", {
  Alerts: AlertResource,
  CreditBalanceSummary: CreditBalanceSummaryResource,
  CreditBalanceTransactions: CreditBalanceTransactionResource,
  CreditGrants: CreditGrantResource,
  MeterEventAdjustments: MeterEventAdjustmentResource,
  MeterEvents: MeterEventResource,
  Meters: MeterResource
});
var BillingPortal = resourceNamespace("billingPortal", {
  Configurations: ConfigurationResource,
  Sessions: SessionResource
});
var Checkout = resourceNamespace("checkout", {
  Sessions: SessionResource2
});
var Climate = resourceNamespace("climate", {
  Orders: OrderResource,
  Products: ProductResource,
  Suppliers: SupplierResource
});
var Entitlements = resourceNamespace("entitlements", {
  ActiveEntitlements: ActiveEntitlementResource,
  Features: FeatureResource
});
var FinancialConnections = resourceNamespace("financialConnections", {
  Accounts: AccountResource,
  Sessions: SessionResource3,
  Transactions: TransactionResource
});
var Forwarding = resourceNamespace("forwarding", {
  Requests: RequestResource
});
var Identity = resourceNamespace("identity", {
  VerificationReports: VerificationReportResource,
  VerificationSessions: VerificationSessionResource
});
var Issuing = resourceNamespace("issuing", {
  Authorizations: AuthorizationResource,
  Cardholders: CardholderResource,
  Cards: CardResource,
  Disputes: DisputeResource,
  PersonalizationDesigns: PersonalizationDesignResource,
  PhysicalBundles: PhysicalBundleResource,
  Tokens: TokenResource,
  Transactions: TransactionResource2
});
var Radar = resourceNamespace("radar", {
  EarlyFraudWarnings: EarlyFraudWarningResource,
  PaymentEvaluations: PaymentEvaluationResource,
  ValueListItems: ValueListItemResource,
  ValueLists: ValueListResource
});
var Reporting = resourceNamespace("reporting", {
  ReportRuns: ReportRunResource,
  ReportTypes: ReportTypeResource
});
var Sigma = resourceNamespace("sigma", {
  ScheduledQueryRuns: ScheduledQueryRunResource
});
var Tax = resourceNamespace("tax", {
  Associations: AssociationResource,
  Calculations: CalculationResource,
  Registrations: RegistrationResource,
  Settings: SettingResource,
  Transactions: TransactionResource3
});
var Terminal = resourceNamespace("terminal", {
  Configurations: ConfigurationResource2,
  ConnectionTokens: ConnectionTokenResource,
  Locations: LocationResource,
  OnboardingLinks: OnboardingLinkResource,
  Readers: ReaderResource
});
var TestHelpers = resourceNamespace("testHelpers", {
  ConfirmationTokens: ConfirmationTokenResource,
  Customers: CustomerResource,
  Refunds: RefundResource,
  TestClocks: TestClockResource,
  Issuing: resourceNamespace("issuing", {
    Authorizations: AuthorizationResource2,
    Cards: CardResource2,
    PersonalizationDesigns: PersonalizationDesignResource2,
    Transactions: TransactionResource4
  }),
  Terminal: resourceNamespace("terminal", {
    Readers: ReaderResource2
  }),
  Treasury: resourceNamespace("treasury", {
    InboundTransfers: InboundTransferResource,
    OutboundPayments: OutboundPaymentResource,
    OutboundTransfers: OutboundTransferResource,
    ReceivedCredits: ReceivedCreditResource,
    ReceivedDebits: ReceivedDebitResource
  })
});
var Treasury = resourceNamespace("treasury", {
  CreditReversals: CreditReversalResource,
  DebitReversals: DebitReversalResource,
  FinancialAccounts: FinancialAccountResource,
  InboundTransfers: InboundTransferResource2,
  OutboundPayments: OutboundPaymentResource2,
  OutboundTransfers: OutboundTransferResource2,
  ReceivedCredits: ReceivedCreditResource2,
  ReceivedDebits: ReceivedDebitResource2,
  TransactionEntries: TransactionEntryResource,
  Transactions: TransactionResource5
});
var V2 = resourceNamespace("v2", {
  Billing: resourceNamespace("billing", {
    MeterEventAdjustments: MeterEventAdjustmentResource2,
    MeterEventSession: MeterEventSessionResource,
    MeterEventStream: MeterEventStreamResource,
    MeterEvents: MeterEventResource2
  }),
  Core: resourceNamespace("core", {
    AccountLinks: AccountLinkResource,
    AccountTokens: AccountTokenResource,
    Accounts: AccountResource2,
    EventDestinations: EventDestinationResource,
    Events: EventResource
  })
});
var Apps2 = class {
  static {
    __name(this, "Apps2");
  }
  static {
    __name2(this, "Apps");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.secrets = new SecretResource(stripe);
  }
};
var Billing2 = class {
  static {
    __name(this, "Billing2");
  }
  static {
    __name2(this, "Billing");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.alerts = new AlertResource(stripe);
    this.creditBalanceSummaries = new CreditBalanceSummaryResource(stripe);
    this.creditBalanceTransactions = new CreditBalanceTransactionResource(stripe);
    this.creditGrants = new CreditGrantResource(stripe);
    this.meters = new MeterResource(stripe);
    this.meterEvents = new MeterEventResource(stripe);
    this.meterEventAdjustments = new MeterEventAdjustmentResource(stripe);
  }
};
var BillingPortal2 = class {
  static {
    __name(this, "BillingPortal2");
  }
  static {
    __name2(this, "BillingPortal");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.configurations = new ConfigurationResource(stripe);
    this.sessions = new SessionResource(stripe);
  }
};
var Checkout2 = class {
  static {
    __name(this, "Checkout2");
  }
  static {
    __name2(this, "Checkout");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.sessions = new SessionResource2(stripe);
  }
};
var Climate2 = class {
  static {
    __name(this, "Climate2");
  }
  static {
    __name2(this, "Climate");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.orders = new OrderResource(stripe);
    this.products = new ProductResource(stripe);
    this.suppliers = new SupplierResource(stripe);
  }
};
var Entitlements2 = class {
  static {
    __name(this, "Entitlements2");
  }
  static {
    __name2(this, "Entitlements");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.activeEntitlements = new ActiveEntitlementResource(stripe);
    this.features = new FeatureResource(stripe);
  }
};
var FinancialConnections2 = class {
  static {
    __name(this, "FinancialConnections2");
  }
  static {
    __name2(this, "FinancialConnections");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.accounts = new AccountResource(stripe);
    this.sessions = new SessionResource3(stripe);
    this.transactions = new TransactionResource(stripe);
  }
};
var Forwarding2 = class {
  static {
    __name(this, "Forwarding2");
  }
  static {
    __name2(this, "Forwarding");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.requests = new RequestResource(stripe);
  }
};
var Identity2 = class {
  static {
    __name(this, "Identity2");
  }
  static {
    __name2(this, "Identity");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.verificationReports = new VerificationReportResource(stripe);
    this.verificationSessions = new VerificationSessionResource(stripe);
  }
};
var Issuing2 = class {
  static {
    __name(this, "Issuing2");
  }
  static {
    __name2(this, "Issuing");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.authorizations = new AuthorizationResource(stripe);
    this.cards = new CardResource(stripe);
    this.cardholders = new CardholderResource(stripe);
    this.disputes = new DisputeResource(stripe);
    this.personalizationDesigns = new PersonalizationDesignResource(stripe);
    this.physicalBundles = new PhysicalBundleResource(stripe);
    this.tokens = new TokenResource(stripe);
    this.transactions = new TransactionResource2(stripe);
  }
};
var Radar2 = class {
  static {
    __name(this, "Radar2");
  }
  static {
    __name2(this, "Radar");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.earlyFraudWarnings = new EarlyFraudWarningResource(stripe);
    this.paymentEvaluations = new PaymentEvaluationResource(stripe);
    this.valueLists = new ValueListResource(stripe);
    this.valueListItems = new ValueListItemResource(stripe);
  }
};
var Reporting2 = class {
  static {
    __name(this, "Reporting2");
  }
  static {
    __name2(this, "Reporting");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.reportRuns = new ReportRunResource(stripe);
    this.reportTypes = new ReportTypeResource(stripe);
  }
};
var Sigma2 = class {
  static {
    __name(this, "Sigma2");
  }
  static {
    __name2(this, "Sigma");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.scheduledQueryRuns = new ScheduledQueryRunResource(stripe);
  }
};
var Tax2 = class {
  static {
    __name(this, "Tax2");
  }
  static {
    __name2(this, "Tax");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.associations = new AssociationResource(stripe);
    this.calculations = new CalculationResource(stripe);
    this.registrations = new RegistrationResource(stripe);
    this.settings = new SettingResource(stripe);
    this.transactions = new TransactionResource3(stripe);
  }
};
var Terminal2 = class {
  static {
    __name(this, "Terminal2");
  }
  static {
    __name2(this, "Terminal");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.configurations = new ConfigurationResource2(stripe);
    this.connectionTokens = new ConnectionTokenResource(stripe);
    this.locations = new LocationResource(stripe);
    this.onboardingLinks = new OnboardingLinkResource(stripe);
    this.readers = new ReaderResource(stripe);
  }
};
var Issuing3 = class {
  static {
    __name(this, "Issuing3");
  }
  static {
    __name2(this, "Issuing");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.authorizations = new AuthorizationResource2(stripe);
    this.cards = new CardResource2(stripe);
    this.personalizationDesigns = new PersonalizationDesignResource2(stripe);
    this.transactions = new TransactionResource4(stripe);
  }
};
var Terminal3 = class {
  static {
    __name(this, "Terminal3");
  }
  static {
    __name2(this, "Terminal");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.readers = new ReaderResource2(stripe);
  }
};
var Treasury2 = class {
  static {
    __name(this, "Treasury2");
  }
  static {
    __name2(this, "Treasury");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.inboundTransfers = new InboundTransferResource(stripe);
    this.outboundPayments = new OutboundPaymentResource(stripe);
    this.outboundTransfers = new OutboundTransferResource(stripe);
    this.receivedCredits = new ReceivedCreditResource(stripe);
    this.receivedDebits = new ReceivedDebitResource(stripe);
  }
};
var TestHelpers2 = class {
  static {
    __name(this, "TestHelpers2");
  }
  static {
    __name2(this, "TestHelpers");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.confirmationTokens = new ConfirmationTokenResource(stripe);
    this.customers = new CustomerResource(stripe);
    this.refunds = new RefundResource(stripe);
    this.testClocks = new TestClockResource(stripe);
    this.issuing = new Issuing3(stripe);
    this.terminal = new Terminal3(stripe);
    this.treasury = new Treasury2(stripe);
  }
};
var Treasury3 = class {
  static {
    __name(this, "Treasury3");
  }
  static {
    __name2(this, "Treasury");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.creditReversals = new CreditReversalResource(stripe);
    this.debitReversals = new DebitReversalResource(stripe);
    this.financialAccounts = new FinancialAccountResource(stripe);
    this.inboundTransfers = new InboundTransferResource2(stripe);
    this.outboundPayments = new OutboundPaymentResource2(stripe);
    this.outboundTransfers = new OutboundTransferResource2(stripe);
    this.receivedCredits = new ReceivedCreditResource2(stripe);
    this.receivedDebits = new ReceivedDebitResource2(stripe);
    this.transactions = new TransactionResource5(stripe);
    this.transactionEntries = new TransactionEntryResource(stripe);
  }
};
var Billing3 = class {
  static {
    __name(this, "Billing3");
  }
  static {
    __name2(this, "Billing");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.meterEvents = new MeterEventResource2(stripe);
    this.meterEventAdjustments = new MeterEventAdjustmentResource2(stripe);
    this.meterEventSession = new MeterEventSessionResource(stripe);
    this.meterEventStream = new MeterEventStreamResource(stripe);
  }
};
var Core = class {
  static {
    __name(this, "Core");
  }
  static {
    __name2(this, "Core");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.accounts = new AccountResource2(stripe);
    this.accountLinks = new AccountLinkResource(stripe);
    this.accountTokens = new AccountTokenResource(stripe);
    this.events = new EventResource(stripe);
    this.eventDestinations = new EventDestinationResource(stripe);
  }
};
var V22 = class {
  static {
    __name(this, "V22");
  }
  static {
    __name2(this, "V2");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.billing = new Billing3(stripe);
    this.core = new Core(stripe);
  }
};
var DEFAULT_HOST = "api.stripe.com";
var DEFAULT_PORT = "443";
var DEFAULT_BASE_PATH = "/v1/";
var DEFAULT_API_VERSION = ApiVersion;
var DEFAULT_TIMEOUT = 8e4;
var MAX_NETWORK_RETRY_DELAY_SEC = 5;
var INITIAL_NETWORK_RETRY_DELAY_SEC = 0.5;
var APP_INFO_PROPERTIES = [
  "name",
  "version",
  "url",
  "partner_id"
];
var ALLOWED_CONFIG_PROPERTIES = [
  "authenticator",
  "apiVersion",
  "typescript",
  "maxNetworkRetries",
  "httpAgent",
  "httpClient",
  "timeout",
  "host",
  "port",
  "protocol",
  "telemetry",
  "emitEventBodies",
  "appInfo",
  "stripeAccount",
  "stripeContext"
];
var defaultRequestSenderFactory = /* @__PURE__ */ __name2((stripe) => new RequestSender(stripe, StripeResource.MAX_BUFFERED_REQUEST_METRICS), "defaultRequestSenderFactory");
var Stripe = class _Stripe {
  static {
    __name(this, "_Stripe");
  }
  static {
    __name2(this, "Stripe");
  }
  static initialize(platformFunctions, requestSenderFactory = defaultRequestSenderFactory) {
    _Stripe._platformFunctions = platformFunctions;
    _Stripe._requestSenderFactory = requestSenderFactory;
    _Stripe.webhooks = createWebhooks(platformFunctions);
    _Stripe.createNodeHttpClient = platformFunctions.createNodeHttpClient;
    _Stripe.createFetchHttpClient = platformFunctions.createFetchHttpClient;
    _Stripe.createNodeCryptoProvider = platformFunctions.createNodeCryptoProvider;
    _Stripe.createSubtleCryptoProvider = platformFunctions.createSubtleCryptoProvider;
  }
  constructor(key, config = {}) {
    this._authenticator = null;
    const props = this._getPropsFromConfig(config);
    this._platformFunctions = _Stripe._platformFunctions;
    Object.defineProperty(this, "_emitter", {
      value: this._platformFunctions.createEmitter(),
      enumerable: false,
      configurable: false,
      writable: false
    });
    this.VERSION = _Stripe.PACKAGE_VERSION;
    this.on = this._emitter.on.bind(this._emitter);
    this.once = this._emitter.once.bind(this._emitter);
    this.off = this._emitter.removeListener.bind(this._emitter);
    const agent = props.httpAgent || null;
    this._api = {
      host: props.host || DEFAULT_HOST,
      port: props.port || DEFAULT_PORT,
      protocol: props.protocol || "https",
      basePath: DEFAULT_BASE_PATH,
      version: props.apiVersion || DEFAULT_API_VERSION,
      timeout: validateInteger("timeout", props.timeout, DEFAULT_TIMEOUT),
      maxNetworkRetries: validateInteger("maxNetworkRetries", props.maxNetworkRetries, 2),
      agent,
      httpClient: props.httpClient || (agent ? this._platformFunctions.createNodeHttpClient(agent) : this._platformFunctions.createDefaultHttpClient()),
      dev: false,
      stripeAccount: props.stripeAccount || null,
      stripeContext: props.stripeContext || null
    };
    const typescript = props.typescript || false;
    if (typescript !== _Stripe.USER_AGENT.typescript) {
      _Stripe.USER_AGENT.typescript = typescript;
    }
    if (props.appInfo) {
      this._setAppInfo(props.appInfo);
    }
    this._setAuthenticator(key, props.authenticator || null);
    this.errors = Error_exports;
    this.Decimal = Decimal;
    this.webhooks = _Stripe.webhooks;
    this._prevRequestMetrics = [];
    this._enableTelemetry = props.telemetry !== false;
    this._emitEventBodies = props.emitEventBodies === true;
    this._requestSender = _Stripe._requestSenderFactory(this);
    this.accountLinks = new AccountLinkResource2(this);
    this.accountSessions = new AccountSessionResource(this);
    this.accounts = new AccountResource3(this);
    this.applePayDomains = new ApplePayDomainResource(this);
    this.applicationFees = new ApplicationFeeResource(this);
    this.balance = new BalanceResource(this);
    this.balanceSettings = new BalanceSettingResource(this);
    this.balanceTransactions = new BalanceTransactionResource(this);
    this.charges = new ChargeResource(this);
    this.confirmationTokens = new ConfirmationTokenResource2(this);
    this.countrySpecs = new CountrySpecResource(this);
    this.coupons = new CouponResource(this);
    this.creditNotes = new CreditNoteResource(this);
    this.customerSessions = new CustomerSessionResource(this);
    this.customers = new CustomerResource2(this);
    this.disputes = new DisputeResource2(this);
    this.ephemeralKeys = new EphemeralKeyResource(this);
    this.events = new EventResource2(this);
    this.exchangeRates = new ExchangeRateResource(this);
    this.fileLinks = new FileLinkResource(this);
    this.files = new FileResource(this);
    this.invoiceItems = new InvoiceItemResource(this);
    this.invoicePayments = new InvoicePaymentResource(this);
    this.invoiceRenderingTemplates = new InvoiceRenderingTemplateResource(this);
    this.invoices = new InvoiceResource(this);
    this.mandates = new MandateResource(this);
    this.paymentAttemptRecords = new PaymentAttemptRecordResource(this);
    this.paymentIntents = new PaymentIntentResource(this);
    this.paymentLinks = new PaymentLinkResource(this);
    this.paymentMethodConfigurations = new PaymentMethodConfigurationResource(this);
    this.paymentMethodDomains = new PaymentMethodDomainResource(this);
    this.paymentMethods = new PaymentMethodResource(this);
    this.paymentRecords = new PaymentRecordResource(this);
    this.payouts = new PayoutResource(this);
    this.plans = new PlanResource(this);
    this.prices = new PriceResource(this);
    this.products = new ProductResource2(this);
    this.promotionCodes = new PromotionCodeResource(this);
    this.quotes = new QuoteResource(this);
    this.refunds = new RefundResource2(this);
    this.reviews = new ReviewResource(this);
    this.setupAttempts = new SetupAttemptResource(this);
    this.setupIntents = new SetupIntentResource(this);
    this.shippingRates = new ShippingRateResource(this);
    this.sources = new SourceResource(this);
    this.subscriptionItems = new SubscriptionItemResource(this);
    this.subscriptionSchedules = new SubscriptionScheduleResource(this);
    this.subscriptions = new SubscriptionResource(this);
    this.taxCodes = new TaxCodeResource(this);
    this.taxIds = new TaxIdResource(this);
    this.taxRates = new TaxRateResource(this);
    this.tokens = new TokenResource2(this);
    this.topups = new TopupResource(this);
    this.transfers = new TransferResource(this);
    this.webhookEndpoints = new WebhookEndpointResource(this);
    this.apps = new Apps2(this);
    this.billing = new Billing2(this);
    this.billingPortal = new BillingPortal2(this);
    this.checkout = new Checkout2(this);
    this.climate = new Climate2(this);
    this.entitlements = new Entitlements2(this);
    this.financialConnections = new FinancialConnections2(this);
    this.forwarding = new Forwarding2(this);
    this.identity = new Identity2(this);
    this.issuing = new Issuing2(this);
    this.radar = new Radar2(this);
    this.reporting = new Reporting2(this);
    this.sigma = new Sigma2(this);
    this.tax = new Tax2(this);
    this.terminal = new Terminal2(this);
    this.testHelpers = new TestHelpers2(this);
    this.treasury = new Treasury3(this);
    this.v2 = new V22(this);
    this.account = this.accounts;
    this.oauth = new OAuthResource(this);
  }
  /**
   * Allows for sending "raw" requests to the Stripe API, which can be used for
   * testing new API endpoints or performing requests that the library does
   * not support yet.
   *
   * @param method - HTTP request method, 'GET', 'POST', or 'DELETE'
   * @param path - The path of the request, e.g. '/v1/beta_endpoint'
   * @param params - The parameters to include in the request body.
   * @param options - Additional request options.
   */
  rawRequest(method, path, params, options) {
    return this._requestSender._rawRequest(method, path, params, options);
  }
  /**
   * @private
   */
  _setAuthenticator(key, authenticator) {
    if (key && authenticator) {
      throw new Error("Can't specify both apiKey and authenticator");
    }
    if (!key && !authenticator) {
      throw new Error("Neither apiKey nor config.authenticator provided");
    }
    this._authenticator = key ? createApiKeyAuthenticator(key) : authenticator;
  }
  /**
   * @private
   * This may be removed in the future.
   */
  _setAppInfo(info) {
    if (info && typeof info !== "object") {
      throw new Error("AppInfo must be an object.");
    }
    if (info && !info.name) {
      throw new Error("AppInfo.name is required");
    }
    info = info || {};
    this._appInfo = APP_INFO_PROPERTIES.reduce((accum, prop) => {
      if (typeof info[prop] == "string") {
        accum = accum || {};
        accum[prop] = info[prop];
      }
      return accum;
    }, {});
  }
  setClientId(clientId) {
    this._clientId = clientId;
  }
  getClientId() {
    return this._clientId;
  }
  /**
   * @private
   * Please open or upvote an issue at github.com/stripe/stripe-node
   * if you use this, detailing your use-case.
   *
   * It may be deprecated and removed in the future.
   */
  getConstant(c) {
    switch (c) {
      case "DEFAULT_HOST":
        return DEFAULT_HOST;
      case "DEFAULT_PORT":
        return DEFAULT_PORT;
      case "DEFAULT_BASE_PATH":
        return DEFAULT_BASE_PATH;
      case "DEFAULT_API_VERSION":
        return DEFAULT_API_VERSION;
      case "DEFAULT_TIMEOUT":
        return DEFAULT_TIMEOUT;
      case "MAX_NETWORK_RETRY_DELAY_SEC":
        return MAX_NETWORK_RETRY_DELAY_SEC;
      case "INITIAL_NETWORK_RETRY_DELAY_SEC":
        return INITIAL_NETWORK_RETRY_DELAY_SEC;
    }
    return _Stripe[c];
  }
  resolveBaseAddress(apiBase) {
    const instanceHost = this.getApiField("host");
    if (instanceHost !== DEFAULT_HOST) {
      return instanceHost;
    }
    return DEFAULT_BASE_ADDRESSES[apiBase];
  }
  getMaxNetworkRetries() {
    return this.getApiField("maxNetworkRetries");
  }
  /**
   * @private
   * This may be removed in the future.
   */
  _setApiNumberField(prop, n, defaultVal) {
    const val = validateInteger(prop, n, defaultVal);
    this._setApiField(prop, val);
  }
  getMaxNetworkRetryDelay() {
    return MAX_NETWORK_RETRY_DELAY_SEC;
  }
  getInitialNetworkRetryDelay() {
    return INITIAL_NETWORK_RETRY_DELAY_SEC;
  }
  /**
   * @private
   * Please open or upvote an issue at github.com/stripe/stripe-node
   * if you use this, detailing your use-case.
   *
   * It may be deprecated and removed in the future.
   *
   * Gets a JSON version of a User-Agent and uses a cached version for a slight
   * speed advantage.
   */
  getClientUserAgent(cb) {
    return this.getClientUserAgentSeeded(_Stripe.USER_AGENT, cb);
  }
  /**
   * @private
   * Please open or upvote an issue at github.com/stripe/stripe-node
   * if you use this, detailing your use-case.
   *
   * It may be deprecated and removed in the future.
   *
   * Gets a JSON version of a User-Agent by encoding a seeded object and
   * fetching a uname from the system.
   */
  getClientUserAgentSeeded(seed, cb) {
    const userAgent = {};
    for (const field in seed) {
      if (!Object.prototype.hasOwnProperty.call(seed, field)) {
        continue;
      }
      userAgent[field] = encodeURIComponent(seed[field] ?? "null");
    }
    const platformInfo = this._platformFunctions.getPlatformInfo();
    if (platformInfo && this.getTelemetryEnabled()) {
      userAgent.platform = encodeURIComponent(platformInfo);
    } else {
      delete userAgent.platform;
    }
    const client = this.getApiField("httpClient");
    if (client) {
      userAgent.httplib = encodeURIComponent(client.getClientName());
    }
    if (this._appInfo) {
      userAgent.application = this._appInfo;
    }
    cb(JSON.stringify(userAgent));
  }
  /**
   * @private
   * Please open or upvote an issue at github.com/stripe/stripe-node
   * if you use this, detailing your use-case.
   *
   * It may be deprecated and removed in the future.
   */
  getAppInfoAsString() {
    if (!this._appInfo) {
      return "";
    }
    let formatted = this._appInfo.name;
    if (this._appInfo.version) {
      formatted += `/${this._appInfo.version}`;
    }
    if (this._appInfo.url) {
      formatted += ` (${this._appInfo.url})`;
    }
    return formatted;
  }
  getTelemetryEnabled() {
    return this._enableTelemetry;
  }
  getEmitEventBodiesEnabled() {
    return this._emitEventBodies;
  }
  /**
   * @private
   * This may be removed in the future.
   */
  _prepResources() {
    for (const name in resources_exports) {
      if (!Object.prototype.hasOwnProperty.call(resources_exports, name)) {
        continue;
      }
      this[pascalToCamelCase(name.replace("Resource", ""))] = new resources_exports[name](this);
    }
  }
  /**
   * @private
   * This may be removed in the future.
   */
  _getPropsFromConfig(config) {
    if (!config) {
      return {};
    }
    const isString = typeof config === "string";
    const isObject2 = config === Object(config) && !Array.isArray(config);
    if (!isObject2 && !isString) {
      throw new Error("Config must either be an object or a string");
    }
    if (isString) {
      return {
        apiVersion: config
      };
    }
    const values = Object.keys(config).filter((value) => !ALLOWED_CONFIG_PROPERTIES.includes(value));
    if (values.length > 0) {
      throw new Error(`Config object may only contain the following: ${ALLOWED_CONFIG_PROPERTIES.join(", ")}`);
    }
    return config;
  }
  /**
   * @private
   * This may be removed in the future.
   */
  _setApiField(key, value) {
    this._api[key] = value;
  }
  /**
   * @private
   * Please open or upvote an issue at github.com/stripe/stripe-node
   * if you use this, detailing your use-case.
   *
   * It may be deprecated and removed in the future.
   */
  getApiField(key) {
    return this._api[key];
  }
  parseEventNotification(payload, header, secret, tolerance, cryptoProvider, receivedAt) {
    if (!this.webhooks.signature) {
      throw new Error("ERR: missing signature helper, unable to verify");
    }
    this.webhooks.signature.verifyHeader(payload, header, secret, tolerance || this.webhooks.DEFAULT_TOLERANCE, cryptoProvider || this._platformFunctions.createDefaultCryptoProvider(), receivedAt);
    const eventNotification = payload instanceof Uint8Array ? JSON.parse(new TextDecoder("utf8").decode(payload)) : JSON.parse(payload);
    if (eventNotification && eventNotification.object === "event") {
      throw new Error("You passed a webhook payload to stripe.parseEventNotification, which expects an event notification. Use stripe.webhooks.constructEvent instead.");
    }
    if (eventNotification.context) {
      eventNotification.context = StripeContext.parse(eventNotification.context);
    }
    eventNotification.fetchEvent = () => {
      return this._requestSender._rawRequest("GET", `/v2/core/events/${eventNotification.id}`, void 0, {
        stripeContext: eventNotification.context,
        headers: {
          "Stripe-Request-Trigger": `event=${eventNotification.id}`
        }
      }, ["fetch_event"]);
    };
    eventNotification.fetchRelatedObject = () => {
      if (!eventNotification.related_object) {
        return Promise.resolve(null);
      }
      return this._requestSender._rawRequest("GET", eventNotification.related_object.url, void 0, {
        stripeContext: eventNotification.context,
        headers: {
          "Stripe-Request-Trigger": `event=${eventNotification.id}`
        }
      }, ["fetch_related_object"]);
    };
    return eventNotification;
  }
  async parseEventNotificationAsync(payload, header, secret, tolerance, cryptoProvider, receivedAt) {
    if (!this.webhooks.signature) {
      throw new Error("ERR: missing signature helper, unable to verify");
    }
    await this.webhooks.signature.verifyHeaderAsync(payload, header, secret, tolerance || this.webhooks.DEFAULT_TOLERANCE, cryptoProvider || this._platformFunctions.createDefaultCryptoProvider(), receivedAt);
    const eventNotification = payload instanceof Uint8Array ? JSON.parse(new TextDecoder("utf8").decode(payload)) : JSON.parse(payload);
    if (eventNotification && eventNotification.object === "event") {
      throw new Error("You passed a webhook payload to stripe.parseEventNotificationAsync, which expects an event notification. Use stripe.webhooks.constructEventAsync instead.");
    }
    if (eventNotification.context) {
      eventNotification.context = StripeContext.parse(eventNotification.context);
    }
    eventNotification.fetchEvent = () => {
      return this._requestSender._rawRequest("GET", `/v2/core/events/${eventNotification.id}`, void 0, {
        stripeContext: eventNotification.context,
        headers: {
          "Stripe-Request-Trigger": `event=${eventNotification.id}`
        }
      }, ["fetch_event"]);
    };
    eventNotification.fetchRelatedObject = () => {
      if (!eventNotification.related_object) {
        return Promise.resolve(null);
      }
      return this._requestSender._rawRequest("GET", eventNotification.related_object.url, void 0, {
        stripeContext: eventNotification.context,
        headers: {
          "Stripe-Request-Trigger": `event=${eventNotification.id}`
        }
      }, ["fetch_related_object"]);
    };
    return eventNotification;
  }
};
Stripe.PACKAGE_VERSION = "22.1.1";
Stripe.API_VERSION = ApiVersion;
Stripe.aiAgent = typeof process !== "undefined" && process.env ? detectAIAgent(process.env) : "";
Stripe.AI_AGENT = Stripe.aiAgent;
Stripe.USER_AGENT = {
  bindings_version: Stripe.PACKAGE_VERSION,
  lang: "node",
  typescript: false,
  ...determineProcessUserAgentProperties(),
  ...Stripe.aiAgent ? { ai_agent: Stripe.aiAgent } : {}
};
Stripe.StripeResource = StripeResource;
Stripe.resources = resources_exports;
Stripe.HttpClient = HttpClient;
Stripe.HttpClientResponse = HttpClientResponse;
Stripe.CryptoProvider = CryptoProvider;
Stripe.StripeContext = StripeContext;
Stripe.errors = Error_exports;
Stripe.Decimal = Decimal;
Stripe._requestSenderFactory = defaultRequestSenderFactory;
Stripe.initialize(new WebPlatformFunctions());
var stripe_esm_worker_default = Stripe;
async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.STRIPE_SECRET_KEY) {
    return Response.json({ error: "Stripe secret key not configured" }, { status: 500 });
  }
  const stripe = new stripe_esm_worker_default(env.STRIPE_SECRET_KEY);
  try {
    const payload = await request.json();
    const { items, orderId, success_url, cancel_url, customer_email } = payload;
    const line_items = items.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : []
        },
        unit_amount: Math.round(item.price * 100)
        // convert to paise
      },
      quantity: item.quantity
    }));
    if (payload.shippingCost > 0) {
      line_items.push({
        price_data: {
          currency: "inr",
          product_data: {
            name: "Shipping"
          },
          unit_amount: Math.round(payload.shippingCost * 100)
        },
        quantity: 1
      });
    }
    if (payload.tax > 0) {
      line_items.push({
        price_data: {
          currency: "inr",
          product_data: {
            name: "Taxes (GST)"
          },
          unit_amount: Math.round(payload.tax * 100)
        },
        quantity: 1
      });
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      shipping_address_collection: {
        allowed_countries: ["IN"]
      },
      // Basic stripe test mode card options
      line_items,
      mode: "payment",
      customer_email,
      success_url: success_url.includes("?") ? `${success_url}&paymentId={CHECKOUT_SESSION_ID}` : `${success_url}?paymentId={CHECKOUT_SESSION_ID}`,
      cancel_url,
      metadata: {
        orderId,
        userId: payload.userId
      }
    });
    return Response.json({ url: session.url });
  } catch (err) {
    console.error("Error creating checkout session:", err);
    return Response.json({ error: err.message }, { status: 400 });
  }
}
__name(onRequestPost, "onRequestPost");
__name2(onRequestPost, "onRequestPost");
async function onRequestPost2(context) {
  const { request, env } = context;
  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
    return Response.json({ error: "Stripe keys not configured" }, { status: 500 });
  }
  const stripe = new stripe_esm_worker_default(env.STRIPE_SECRET_KEY);
  const signature = request.headers.get("stripe-signature");
  try {
    const body = await request.text();
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const { orderId, userId } = session.metadata;
      console.log(`[Stripe Webhook] Payment successful for order ${orderId} (User: ${userId})`);
      await updateOrderStatusInFirestore(env, orderId, "Paid", session.id);
    }
    return Response.json({ received: true });
  } catch (err) {
    console.error(`[Stripe Webhook Error] ${err.message}`);
    return Response.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }
}
__name(onRequestPost2, "onRequestPost2");
__name2(onRequestPost2, "onRequestPost");
async function updateOrderStatusInFirestore(env, orderId, status, paymentId) {
  try {
    const projectId = env.FIREBASE_PROJECT_ID || env.REACT_APP_FIREBASE_PROJECT_ID;
    console.log(`[Stripe Webhook] Would update order ${orderId} to ${status}`);
    return true;
  } catch (error) {
    console.error("[Stripe Webhook] Error updating Firestore:", error);
    return false;
  }
}
__name(updateOrderStatusInFirestore, "updateOrderStatusInFirestore");
__name2(updateOrderStatusInFirestore, "updateOrderStatusInFirestore");
async function onRequest(context) {
  const { request, env } = context;
  const startTime = Date.now();
  console.log(`[Email Function] Incoming ${request.method} request to ${request.url}`);
  console.log(`[Email Function] Request headers:`, Object.fromEntries(request.headers.entries()));
  if (request.method === "OPTIONS") {
    console.log("[Email Function] Handling CORS preflight request");
    return handleCORS();
  }
  if (request.method !== "POST") {
    console.log(`[Email Function] Method ${request.method} not allowed`);
    return new Response(JSON.stringify({
      error: { message: "Method not allowed", code: "METHOD_NOT_ALLOWED" }
    }), {
      status: 405,
      headers: getCORSHeaders()
    });
  }
  try {
    let body;
    try {
      const rawBody = await request.text();
      console.log(`[Email Function] Raw request body length: ${rawBody.length}`);
      body = JSON.parse(rawBody);
      console.log(`[Email Function] Parsed request body:`, {
        to: body.to,
        subject: body.subject,
        hasHtml: !!body.html,
        htmlLength: body.html?.length || 0,
        from: body.from
      });
    } catch (parseError) {
      console.error("[Email Function] Failed to parse request body:", parseError);
      return new Response(JSON.stringify({
        error: { message: "Invalid JSON in request body", code: "INVALID_JSON" }
      }), {
        status: 400,
        headers: getCORSHeaders()
      });
    }
    const missingFields = [];
    if (!body.to) missingFields.push("to");
    if (!body.subject) missingFields.push("subject");
    if (!body.html) missingFields.push("html");
    if (missingFields.length > 0) {
      console.error(`[Email Function] Missing required fields: ${missingFields.join(", ")}`);
      return new Response(JSON.stringify({
        error: {
          message: `Missing required fields: ${missingFields.join(", ")}`,
          code: "MISSING_FIELDS",
          missingFields
        }
      }), {
        status: 400,
        headers: getCORSHeaders()
      });
    }
    console.log("[Email Function] Environment variables check:");
    console.log("- RESEND_API_KEY exists:", !!env.RESEND_API_KEY);
    console.log("- RESEND_API_KEY length:", env.RESEND_API_KEY?.length || 0);
    console.log("- RESEND_API_KEY starts with re_:", env.RESEND_API_KEY?.startsWith("re_") || false);
    const apiKey = env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("[Email Function] RESEND_API_KEY environment variable not found");
      return new Response(JSON.stringify({
        error: {
          message: "Server configuration error: Missing API key",
          code: "MISSING_API_KEY"
        }
      }), {
        status: 500,
        headers: getCORSHeaders()
      });
    }
    if (!apiKey.startsWith("re_")) {
      console.error("[Email Function] Invalid API key format - should start with re_");
      return new Response(JSON.stringify({
        error: {
          message: "Server configuration error: Invalid API key format",
          code: "INVALID_API_KEY_FORMAT"
        }
      }), {
        status: 500,
        headers: getCORSHeaders()
      });
    }
    const defaultFrom = "KamiKoto <noreply@kamikoto.nsl>";
    const emailPayload = {
      from: body.from || defaultFrom,
      to: Array.isArray(body.to) ? body.to : [body.to],
      // Ensure to is an array
      subject: body.subject,
      html: body.html,
      // Add other optional fields if provided
      ...body.cc && { cc: Array.isArray(body.cc) ? body.cc : [body.cc] },
      ...body.bcc && { bcc: Array.isArray(body.bcc) ? body.bcc : [body.bcc] },
      ...body.reply_to && { reply_to: body.reply_to }
    };
    console.log("[Email Function] Prepared email payload:");
    console.log("- From:", emailPayload.from);
    console.log("- To:", emailPayload.to);
    console.log("- Subject:", emailPayload.subject);
    console.log("- HTML length:", emailPayload.html.length);
    console.log("- Has CC:", !!emailPayload.cc);
    console.log("- Has BCC:", !!emailPayload.bcc);
    console.log("- Has Reply-To:", !!emailPayload.reply_to);
    console.log("[Email Function] Calling Resend API...");
    const resendStartTime = Date.now();
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "User-Agent": "KamiKoto-Shop/1.0.0"
      },
      body: JSON.stringify(emailPayload)
    });
    const resendDuration = Date.now() - resendStartTime;
    console.log(`[Email Function] Resend API response received in ${resendDuration}ms`);
    console.log(`[Email Function] Resend response status: ${resendResponse.status}`);
    console.log(`[Email Function] Resend response headers:`, Object.fromEntries(resendResponse.headers.entries()));
    let data;
    try {
      const responseText = await resendResponse.text();
      console.log(`[Email Function] Resend response body length: ${responseText.length}`);
      data = JSON.parse(responseText);
      console.log("[Email Function] Resend response data:", data);
    } catch (parseError) {
      console.error("[Email Function] Failed to parse Resend response:", parseError);
      return new Response(JSON.stringify({
        error: {
          message: "Failed to parse response from email service",
          code: "RESPONSE_PARSE_ERROR"
        }
      }), {
        status: 500,
        headers: getCORSHeaders()
      });
    }
    const totalDuration = Date.now() - startTime;
    console.log(`[Email Function] Total request duration: ${totalDuration}ms`);
    if (resendResponse.ok) {
      console.log(`[Email Function] \u2705 Email sent successfully! ID: ${data.id}`);
    } else {
      console.error(`[Email Function] \u274C Email sending failed:`, data);
    }
    return new Response(JSON.stringify({
      ...data,
      // Add debugging metadata in development
      ...{
        debug: {
          duration: totalDuration,
          resendDuration,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }
      }
    }), {
      status: resendResponse.status,
      headers: getCORSHeaders()
    });
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error(`[Email Function] \u274C Unexpected error after ${totalDuration}ms:`, error);
    console.error("[Email Function] Error stack:", error.stack);
    return new Response(JSON.stringify({
      error: {
        message: error.message || "Internal server error",
        code: "INTERNAL_ERROR",
        ...{
          stack: error.stack,
          duration: totalDuration
        }
      }
    }), {
      status: 500,
      headers: getCORSHeaders()
    });
  }
}
__name(onRequest, "onRequest");
__name2(onRequest, "onRequest");
function handleCORS() {
  console.log("[Email Function] Sending CORS preflight response");
  return new Response(null, {
    status: 204,
    headers: getCORSHeaders()
  });
}
__name(handleCORS, "handleCORS");
__name2(handleCORS, "handleCORS");
function getCORSHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    // In production, replace with your domain
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    "Content-Type": "application/json",
    "Cache-Control": "no-cache"
  };
}
__name(getCORSHeaders, "getCORSHeaders");
__name2(getCORSHeaders, "getCORSHeaders");
function isBot(userAgent) {
  if (!userAgent) return false;
  const botPatterns = [
    "bot",
    "crawler",
    "spider",
    "crawling",
    "facebookexternalhit",
    "facebookcatalog",
    "twitterbot",
    "twitter",
    "linkedinbot",
    "linkedin",
    "discordbot",
    "discord",
    "slackbot",
    "slack",
    "telegrambot",
    "telegram",
    "whatsapp",
    "whatsappbot",
    "pinterest",
    "pinterestbot",
    "skype",
    "skypebot",
    "redditbot",
    "reddit",
    "googlebot",
    "google",
    "bingbot",
    "bing",
    "yandexbot",
    "yandex",
    "baiduspider",
    "baidu",
    "duckduckbot",
    "duckduckgo",
    "slurp",
    "yahoo",
    "embedly",
    "quora",
    "outbrain",
    "flipboard",
    "tumblr",
    "bitly",
    "instapaper",
    "pocket",
    "developers.google.com/+/web/snippet",
    "vkshare",
    "w3c_validator",
    "redditbot",
    "applebot",
    "rogerbot",
    "semrushbot",
    "dotbot",
    "ahrefsbot",
    "screaming frog",
    "mediapartners-google",
    "adsbot-google"
  ];
  const ua = userAgent.toLowerCase();
  return botPatterns.some((pattern) => ua.includes(pattern));
}
__name(isBot, "isBot");
__name2(isBot, "isBot");
async function fetchProductData(productId, env) {
  try {
    const projectId = env.FIREBASE_PROJECT_ID || env.REACT_APP_FIREBASE_PROJECT_ID;
    const apiKey = env.FIREBASE_API_KEY || env.REACT_APP_FIREBASE_API_KEY;
    if (!projectId || !apiKey) {
      console.error("[Meta Middleware] Missing Firebase configuration");
      return null;
    }
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products/${productId}`;
    console.log(`[Meta Middleware] Fetching product ${productId} from Firestore...`);
    const response = await fetch(`${firestoreUrl}?key=${apiKey}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      console.error(`[Meta Middleware] Firestore API error: ${response.status} ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    const product = {
      id: productId,
      name: data.fields?.name?.stringValue || "",
      description: data.fields?.description?.stringValue || "",
      price: data.fields?.price?.integerValue || data.fields?.price?.doubleValue || 0,
      mrp: data.fields?.mrp?.integerValue || data.fields?.mrp?.doubleValue || 0,
      image: data.fields?.image?.stringValue || "",
      brand: data.fields?.brand?.stringValue || "",
      type: data.fields?.type?.stringValue || "",
      stock: data.fields?.stock?.integerValue || 0
    };
    console.log(`[Meta Middleware] Product fetched successfully:`, product.name);
    return product;
  } catch (error) {
    console.error("[Meta Middleware] Error fetching product:", error);
    return null;
  }
}
__name(fetchProductData, "fetchProductData");
__name2(fetchProductData, "fetchProductData");
function formatPrice(price) {
  const priceStr = price.toString();
  const [integerPart, decimalPart] = priceStr.split(".");
  const lastThreeDigits = integerPart.slice(-3);
  const otherDigits = integerPart.slice(0, -3);
  const formattedInteger = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + (otherDigits ? "," : "") + lastThreeDigits;
  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
}
__name(formatPrice, "formatPrice");
__name2(formatPrice, "formatPrice");
function generateMetaTags(product, url) {
  const metaDescription = product.description ? product.description.substring(0, 155) + (product.description.length > 155 ? "..." : "") : `Buy ${product.name} online at KamiKoto`;
  const title = `${product.name} | KamiKoto - Premium Stationery`;
  const priceFormatted = formatPrice(product.price);
  const ogTitle = `${product.name} - \u20B9${priceFormatted}`;
  return `
    <!-- Basic Meta Tags -->
    <title>${title}</title>
    <meta name="description" content="${metaDescription}">

    <!-- OpenGraph Tags for Facebook/Instagram/WhatsApp/Discord -->
    <meta property="og:title" content="${ogTitle}">
    <meta property="og:description" content="${metaDescription}">
    <meta property="og:image" content="${product.image}">
    <meta property="og:image:secure_url" content="${product.image}">
    <meta property="og:image:type" content="image/jpeg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${product.name}">
    <meta property="og:url" content="${url}">
    <meta property="og:type" content="product">
    <meta property="og:site_name" content="KamiKoto - Premium Stationery">
    <meta property="og:locale" content="en_IN">
    <meta property="og:price:amount" content="${product.price}">
    <meta property="og:price:currency" content="INR">
    ${product.stock > 0 ? '<meta property="product:availability" content="in stock">' : ""}
    ${product.brand ? `<meta property="product:brand" content="${product.brand}">` : ""}

    <!-- Twitter Card Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@KamiKoto">
    <meta name="twitter:title" content="${ogTitle}">
    <meta name="twitter:description" content="${metaDescription}">
    <meta name="twitter:image" content="${product.image}">
    <meta name="twitter:image:alt" content="${product.name}">
    <meta name="twitter:label1" content="Price">
    <meta name="twitter:data1" content="\u20B9${priceFormatted}">
    <meta name="twitter:label2" content="Availability">
    <meta name="twitter:data2" content="${product.stock > 0 ? "In Stock" : "Out of Stock"}">

    <!-- WhatsApp Specific Meta Tags -->
    <meta property="og:rich_attachment" content="true">

    <!-- Discord Embed Enhancement -->
    <meta name="theme-color" content="#3B82F6">

    <!-- Additional Meta Tags -->
    <meta name="keywords" content="${product.name}, ${product.brand || ""}, ${product.type || ""}, stationery, online shopping">
    <link rel="canonical" href="${url}">
  `;
}
__name(generateMetaTags, "generateMetaTags");
__name2(generateMetaTags, "generateMetaTags");
async function onRequest2(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const userAgent = request.headers.get("User-Agent") || "";
  const productPageMatch = url.pathname.match(/^\/product\/([^\/]+)$/);
  if (productPageMatch && isBot(userAgent)) {
    const productId = productPageMatch[1];
    console.log(`[Meta Middleware] Bot detected: ${userAgent}`);
    console.log(`[Meta Middleware] Fetching product page: ${productId}`);
    const product = await fetchProductData(productId, env);
    if (product) {
      const response = await next();
      let html = await response.text();
      const metaTags = generateMetaTags(product, request.url);
      html = html.replace(/<meta[^>]+data-react-helmet="true"[^>]*>/gi, "");
      html = html.replace(/<title>.*?<\/title>/i, "");
      html = html.replace("</head>", `${metaTags}
</head>`);
      console.log(`[Meta Middleware] Meta tags injected for product: ${product.name}`);
      return new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=3600"
          // Cache for 1 hour
        }
      });
    } else {
      console.log(`[Meta Middleware] Product ${productId} not found, serving default HTML`);
    }
  }
  return next();
}
__name(onRequest2, "onRequest2");
__name2(onRequest2, "onRequest");
var routes = [
  {
    routePath: "/api/create-checkout-session",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/stripe-webhook",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/send-email",
    mountPath: "/",
    method: "",
    middlewares: [],
    modules: [onRequest]
  },
  {
    routePath: "/",
    mountPath: "/",
    method: "",
    middlewares: [onRequest2],
    modules: []
  }
];
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
__name2(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name2(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name2(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name2(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name2(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name2(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
__name2(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
__name2(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name2(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
__name2(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
__name2(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
__name2(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
__name2(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
__name2(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
__name2(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
__name2(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");
__name2(pathToRegexp, "pathToRegexp");
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
__name2(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name2(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name2(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name2((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
var drainBody = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
__name2(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
__name2(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
__name2(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");
__name2(__facade_invoke__, "__facade_invoke__");
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  static {
    __name(this, "___Facade_ScheduledController__");
  }
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name2(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name2(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name2(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
__name2(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name2((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name2((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
__name2(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;

// ../../../.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default2 = drainBody2;

// ../../../.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError2(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError2(e.cause)
  };
}
__name(reduceError2, "reduceError");
var jsonError2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError2(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default2 = jsonError2;

// .wrangler/tmp/bundle-04TbgG/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__2 = [
  middleware_ensure_req_body_drained_default2,
  middleware_miniflare3_json_error_default2
];
var middleware_insertion_facade_default2 = middleware_loader_entry_default;

// ../../../.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__2 = [];
function __facade_register__2(...args) {
  __facade_middleware__2.push(...args.flat());
}
__name(__facade_register__2, "__facade_register__");
function __facade_invokeChain__2(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__2(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__2, "__facade_invokeChain__");
function __facade_invoke__2(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__2(request, env, ctx, dispatch, [
    ...__facade_middleware__2,
    finalMiddleware
  ]);
}
__name(__facade_invoke__2, "__facade_invoke__");

// .wrangler/tmp/bundle-04TbgG/middleware-loader.entry.ts
var __Facade_ScheduledController__2 = class ___Facade_ScheduledController__2 {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__2)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler2(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__2(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__2(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler2, "wrapExportedHandler");
function wrapWorkerEntrypoint2(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__2(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__2(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint2, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY2;
if (typeof middleware_insertion_facade_default2 === "object") {
  WRAPPED_ENTRY2 = wrapExportedHandler2(middleware_insertion_facade_default2);
} else if (typeof middleware_insertion_facade_default2 === "function") {
  WRAPPED_ENTRY2 = wrapWorkerEntrypoint2(middleware_insertion_facade_default2);
}
var middleware_loader_entry_default2 = WRAPPED_ENTRY2;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__2 as __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default2 as default
};
//# sourceMappingURL=functionsWorker-0.3051330575913558.js.map
