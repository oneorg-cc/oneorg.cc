"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.XXXTEST = void 0;
const events_1 = __importDefault(require("events"));
var Events;
(function (Events) {
    let Emitter;
    (function (Emitter) {
        class Custom extends events_1.default {
            addListener(eventName, listener) { return super.addListener(eventName, listener); }
            on(eventName, listener) { return super.on(eventName, listener); }
            once(eventName, listener) { return super.once(eventName, listener); }
            removeListener(eventName, listener) { return super.removeListener(eventName, listener); }
            off(eventName, listener) { return super.off(eventName, listener); }
            removeAllListeners(event) { return super.removeAllListeners(event); }
            listeners(eventName) { return super.listeners(eventName); }
            rawListeners(eventName) { return super.rawListeners(eventName); }
            emit(eventName, ...args) { return super.emit(eventName, ...args); }
            listenerCount(eventName, listener) { return super.listenerCount(eventName, listener); }
            prependListener(eventName, listener) { return super.prependListener(eventName, listener); }
            prependOnceListener(eventName, listener) { return super.prependOnceListener(eventName, listener); }
            eventNames() { return super.eventNames(); }
        }
        Emitter.Custom = Custom;
    })(Emitter = Events.Emitter || (Events.Emitter = {}));
})(Events || (Events = {}));
exports.XXXTEST = new Events.Emitter.Custom();
exports.default = Events;
