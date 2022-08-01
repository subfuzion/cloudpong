"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PongClient = exports.PongEvent = void 0;
var messages_1 = require("./messages");
var PongEvent = /** @class */ (function () {
    function PongEvent(message) {
        this.message = message;
    }
    return PongEvent;
}());
exports.PongEvent = PongEvent;
var PongClient = /** @class */ (function () {
    function PongClient(url, cb) {
        if (cb === void 0) { cb = null; }
        this.cb = cb;
        console.log("connecting to", url);
        var ws = this.ws = new WebSocket(url);
        ws.onmessage = this.handleMessage.bind(this);
        ws.onerror = this.handleError.bind(this);
    }
    Object.defineProperty(PongClient.prototype, "onchange", {
        set: function (cb) {
            this.cb = cb;
        },
        enumerable: false,
        configurable: true
    });
    PongClient.prototype.send = function (message) {
        var m = JSON.stringify(message);
        this.ws.send(m);
    };
    PongClient.prototype.handleMessage = function (m) {
        // // TODO: fix hack (hardcoded to StatsUpdate)
        // const data = new StatsUpdate(JSON.parse(m.data));
        // const e = new PongEvent<StatsUpdate>(data);
        // TODO: fix hack (hardcoded to Update)
        var data = messages_1.Update.fromJson(m.data);
        var e = new PongEvent(data);
        this.emitChangeEvent(e);
    };
    PongClient.prototype.handleError = function (e) {
        console.log(e);
        var data = new messages_1.WebSocketError(e.type);
        this.emitChangeEvent(new PongEvent(data));
    };
    PongClient.prototype.emitChangeEvent = function (e) {
        var _this = this;
        if (this.cb) {
            setTimeout(function () {
                if (_this.cb)
                    _this.cb(e);
            });
        }
    };
    return PongClient;
}());
exports.PongClient = PongClient;
