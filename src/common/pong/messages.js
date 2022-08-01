"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsUpdate = exports.Update = exports.WebSocketError = exports.Message = void 0;
var Message = /** @class */ (function () {
    function Message() {
    }
    Message.prototype.type = function () {
        return this.constructor.name;
    };
    return Message;
}());
exports.Message = Message;
var WebSocketError = /** @class */ (function (_super) {
    __extends(WebSocketError, _super);
    function WebSocketError(message) {
        var _this = _super.call(this) || this;
        _this.message = message;
        return _this;
    }
    return WebSocketError;
}(Message));
exports.WebSocketError = WebSocketError;
var Update = /** @class */ (function (_super) {
    __extends(Update, _super);
    function Update(x, y, vx, vy, player1y, player2y) {
        var _this = _super.call(this) || this;
        _this.x = x;
        _this.y = y;
        _this.vx = vx;
        _this.vy = vy;
        _this.player1y = player1y;
        _this.player2y = player2y;
        return _this;
    }
    Update.fromJson = function (data) {
        var o = JSON.parse(data.toString());
        return new Update(o.x, o.y, o.vx, o.vy, o.player1y, o.player2y);
    };
    return Update;
}(Message));
exports.Update = Update;
var StatsUpdate = /** @class */ (function (_super) {
    __extends(StatsUpdate, _super);
    function StatsUpdate(data) {
        var _this = _super.call(this) || this;
        var id = data.id, stats = data.stats;
        _this.id = id;
        _this.stats = {
            rss: stats.rss,
            heapTotal: stats.heapTotal,
            heapUsed: stats.heapUsed,
            external: stats.external,
        };
        return _this;
    }
    return StatsUpdate;
}(Message));
exports.StatsUpdate = StatsUpdate;
