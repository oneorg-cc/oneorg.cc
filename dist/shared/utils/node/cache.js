"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AliasCache = exports.CachePersistency = exports.CacheDataPersistency = void 0;
const events_1 = __importDefault(require("./events"));
class CacheDataPersistency {
    static CACHE_RELATIVE = new this(cache => cache.persistency().dataPersistency);
    static VOLATILE = new this(null);
    static PERSISTENT = new this(null);
    // 
    #getter;
    // 
    constructor(getter) {
        this.#getter = getter;
    }
    // 
    get getter() { return this.#getter; }
    // 
    get(cache) {
        if (this.getter == null)
            return this;
        return this.getter(cache);
    }
}
exports.CacheDataPersistency = CacheDataPersistency;
class CachePersistency {
    static PERSISTENT = new this(CacheDataPersistency.PERSISTENT);
    static VOLATILE = new this(CacheDataPersistency.VOLATILE);
    // 
    #dataPersistency;
    // 
    constructor(data_persistency) {
        this.#dataPersistency = data_persistency;
    }
    // 
    get dataPersistency() { return this.#dataPersistency; }
}
exports.CachePersistency = CachePersistency;
// 
class CacheData {
    #timestamp;
    #persistency;
    #delay;
    #value;
    // 
    constructor(timestamp, persistency, delay, value) {
        this.#timestamp = timestamp;
        this.#persistency = persistency;
        this.#delay = delay;
        this.#value = value;
    }
    // 
    get timestamp() { return this.#timestamp; }
    get persistency() { return this.#persistency; }
    get delay() { return this.#delay; }
    get value() { return this.#value; }
    // 
    refresh() { this.#timestamp = Cache.TIMESTAMP(); }
    // 
    static of(timestamp, persistency, delay, value) {
        return new CacheData(timestamp, persistency, delay, value);
    }
}
// 
class Cache extends events_1.default.Emitter.Custom {
    static TIMESTAMP() { return Date.now(); }
    static DELAY = class {
        static MILLISECONDS(count) { return count; }
        static SECONDS(count) { return count * 1000; }
        static MINUTES(count) { return count * 60 * 1000; }
        static HOURS(count) { return count * 60 * 60 * 1000; }
    };
    //
    #map = new Map();
    #delay = 0;
    #persistency = CachePersistency.VOLATILE;
    //
    constructor(options) {
        super();
        this.persistency(options?.persistency);
        this.delay(options?.delay);
    }
    //
    // get map(): ReadonlyMap<Key, CacheData<Value>> { return this.#map; }
    //
    contains(key, cleanup) {
        cleanup = cleanup == undefined ? true : cleanup;
        if (cleanup)
            this.cleanup();
        const result = this.#map.has(key);
        this.emit("contains", { key, cleanup }, result);
        return result;
    }
    store(key, value, options) {
        options = options || {};
        options.cleanup = options.cleanup == undefined ? true : options.cleanup;
        this.withdraw(key, options.cleanup);
        this.#map.set(key, CacheData.of(Cache.TIMESTAMP(), options.persistency
            ? options.persistency != CacheDataPersistency.CACHE_RELATIVE
                ? options.persistency
                : this.persistency().dataPersistency
            : this.persistency().dataPersistency, options.delay == undefined ? -1 : options.delay, value));
        this.emit("store", { key, value, options });
    }
    get(key, cleanup) {
        cleanup = cleanup == undefined ? true : cleanup;
        let result = null;
        if (this.contains(key, cleanup))
            result = this.#map.get(key).value;
        this.emit("get", { key, cleanup }, result);
        return result;
    }
    withdraw(key, cleanup) {
        cleanup = cleanup == undefined ? true : cleanup;
        let data = this.get(key, cleanup);
        this.#map.delete(key);
        this.emit("withdraw", { key, cleanup }, data);
        return data;
    }
    delay(ms) {
        if (ms) {
            const old = this.#delay;
            this.#delay = ms;
            this.emit("delay:set", old, ms);
        }
        this.emit("delay:get", this.#delay);
        return this.#delay;
    }
    persistency(persistency) {
        if (persistency) {
            const old = this.#persistency;
            this.#persistency = persistency;
            this.emit("persistency:set", old, persistency);
        }
        ;
        this.emit("persistency:get", this.#persistency);
        return this.#persistency;
    }
    //
    persistencyOf(key, cleanup) {
        cleanup = cleanup == undefined ? true : cleanup;
        let result = null;
        if (this.contains(key, cleanup))
            result = this.#map.get(key).persistency.get(this);
        this.emit("persistencyOf", { key, cleanup }, result);
        return result;
    }
    timestamp(key, cleanup) {
        cleanup = cleanup == undefined ? true : cleanup;
        let result = -1;
        if (this.contains(key, cleanup))
            result = this.#map.get(key).timestamp;
        this.emit("timestamp", { key, cleanup }, result);
        return result;
    }
    delayOf(key, cleanup) {
        cleanup = cleanup == undefined ? true : cleanup;
        let result = 0;
        if (this.contains(key, cleanup)) {
            let data = this.#map.get(key);
            if (data.delay < 0)
                result = this.delay();
        }
        this.emit("delayOf", { key, cleanup });
        return result;
    }
    expiration(key, cleanup) {
        const result = this.timestamp(key, cleanup) + this.delayOf(key, cleanup);
        this.emit("expiration", { key, cleanup }, result);
        return result;
    }
    expired(key, options) {
        options = options || {};
        options.delay = options.delay == undefined ? this.delayOf(key, options.cleanup) : options.delay;
        options.cleanup = options.cleanup == undefined ? true : options.cleanup;
        let result = true;
        if (this.contains(key, false))
            result = (Cache.TIMESTAMP() - this.#map.get(key).timestamp) > options.delay;
        this.emit("expired", { key, options }, result);
        return result;
    }
    //
    refresh(key, options) {
        options = options || {};
        options.delay = options.delay == undefined ? this.delayOf(key, options.cleanup) : options.delay;
        options.cleanup = options.cleanup == undefined ? true : options.cleanup;
        if (!this.contains(key, false))
            return false;
        this.#map.get(key)?.refresh();
        return true;
    }
    //
    cleanup(force) {
        force = force == undefined ? false : force;
        this.#map.forEach((value, key) => {
            if (this.expired(key, { cleanup: false }) && (this.persistencyOf(key, false) == CacheDataPersistency.VOLATILE) || force) {
                this.emit("cleanup", key, this.withdraw(key, false));
            }
        });
    }
    // 
    keys(cleanup) {
        if (cleanup)
            this.cleanup();
        return Array.from(this.#map.keys());
    }
    values(cleanup) {
        if (cleanup)
            this.cleanup();
        return Array.from(this.#map.values()).map(v => v.value);
    }
    entries(cleanup) {
        if (cleanup)
            this.cleanup();
        return Array.from(this.#map.entries()).map(v => { return { key: v[0], value: v[1].value }; });
    }
}
exports.default = Cache;
class AliasCache extends events_1.default.Emitter.Custom {
    #aliasformatter;
    #cache = new Cache();
    // 
    constructor(options) {
        super();
        this.#aliasformatter = options.formatter;
        this.persistency(options?.persistency);
        this.delay(options?.delay);
    }
    // 
    contains(key, cleanup) {
        return this.#cache.contains(this.#aliasformatter(key), cleanup);
    }
    store(key, value, options) {
        return this.#cache.store(this.#aliasformatter(key), value, options);
    }
    get(key, cleanup) {
        return this.#cache.get(this.#aliasformatter(key), cleanup);
    }
    withdraw(key, cleanup) {
        return this.#cache.withdraw(this.#aliasformatter(key), cleanup);
    }
    delay(ms) {
        return this.#cache.delay(ms);
    }
    persistency(persistent) {
        return this.#cache.persistency(persistent);
    }
    // 
    persistencyOf(key, cleanup) {
        return this.#cache.persistencyOf(this.#aliasformatter(key), cleanup);
    }
    timestamp(key, cleanup) {
        return this.#cache.timestamp(this.#aliasformatter(key), cleanup);
    }
    delayOf(key, cleanup) {
        return this.#cache.delayOf(this.#aliasformatter(key), cleanup);
    }
    expiration(key, cleanup) {
        return this.#cache.expiration(this.#aliasformatter(key), cleanup);
    }
    expired(key, options) {
        return this.#cache.expired(this.#aliasformatter(key), options);
    }
    // 
    refresh(key, options) {
        return this.#cache.refresh(this.#aliasformatter(key), options);
    }
    // 
    cleanup(force) {
        return this.#cache.cleanup(force);
    }
    // 
    keys(cleanup) {
        return this.#cache.keys(cleanup);
    }
    values(cleanup) {
        throw new Error("Method not implemented.");
    }
    entries(cleanup) {
        throw new Error("Method not implemented.");
    }
}
exports.AliasCache = AliasCache;
