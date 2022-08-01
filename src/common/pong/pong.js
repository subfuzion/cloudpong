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
exports.Paddle = exports.Ball = exports.Table = void 0;
var gfx_1 = require("./gfx");
var Table = /** @class */ (function (_super) {
    __extends(Table, _super);
    function Table(x, y, width, height) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (width === void 0) { width = 600; }
        if (height === void 0) { height = 370; }
        return _super.call(this, x, y, width, height) || this;
    }
    return Table;
}(gfx_1.View));
exports.Table = Table;
var Ball = /** @class */ (function (_super) {
    __extends(Ball, _super);
    function Ball(x, y, width, height) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (width === void 0) { width = 10; }
        if (height === void 0) { height = 10; }
        return _super.call(this, x, y, width, height) || this;
    }
    Ball.prototype.update = function (g) {
        g.p5.ellipse(this.x, this.y, this.width, this.height);
    };
    return Ball;
}(gfx_1.Sprite));
exports.Ball = Ball;
var Paddle = /** @class */ (function (_super) {
    __extends(Paddle, _super);
    function Paddle(x, y, width, height) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (width === void 0) { width = 20; }
        if (height === void 0) { height = 100; }
        var _this = _super.call(this, x, y, width, height) || this;
        _this.downKey = 0;
        _this.upKey = 0;
        _this.cb = null;
        return _this;
    }
    Paddle.prototype.update = function (g) {
        // TODO: handle extended keydown to accelerate paddle?
        if (g.p5.keyIsDown(this.downKey) && this.y < g.height - this.height - 5) {
            this.fireChangeEvent(1);
        }
        if (g.p5.keyIsDown(this.upKey) && this.y > 5) {
            this.fireChangeEvent(-1);
        }
        _super.prototype.update.call(this, g);
    };
    Paddle.prototype.onchange = function (cb) {
        this.cb = cb;
    };
    Paddle.prototype.fireChangeEvent = function (y) {
        var _this = this;
        if (this.cb) {
            setTimeout(function () {
                if (_this.cb)
                    _this.cb(y);
            }, 0);
        }
    };
    return Paddle;
}(gfx_1.Sprite));
exports.Paddle = Paddle;
