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
exports.View = exports.Sprite = exports.GraphicsContext = void 0;
var GraphicsContext = /** @class */ (function () {
    function GraphicsContext(p5, x, y, width, height) {
        this.p5 = p5;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    return GraphicsContext;
}());
exports.GraphicsContext = GraphicsContext;
// A sprite is something that knows how to draw itself.
var Sprite = /** @class */ (function () {
    function Sprite(x, y, width, height) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (width === void 0) { width = 0; }
        if (height === void 0) { height = 0; }
        this.vx = 0;
        this.vy = 0;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.background = "white";
    }
    Sprite.prototype.update = function (g) {
        g.p5.rect(this.x, this.y, this.width, this.height);
    };
    Sprite.prototype.paint = function (g) {
        g.p5.fill(this.background);
        this.update(g);
    };
    return Sprite;
}());
exports.Sprite = Sprite;
// A view is a sprite that contains other sprites.
var View = /** @class */ (function (_super) {
    __extends(View, _super);
    function View(x, y, width, height) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (width === void 0) { width = 0; }
        if (height === void 0) { height = 0; }
        var _this = _super.call(this, x, y, width, height) || this;
        _this.sprites = new Set();
        return _this;
    }
    View.prototype.add = function () {
        var sprites = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            sprites[_i] = arguments[_i];
        }
        for (var _a = 0, sprites_1 = sprites; _a < sprites_1.length; _a++) {
            var s = sprites_1[_a];
            this.sprites.add(s);
        }
    };
    View.prototype.paint = function (g) {
        _super.prototype.paint.call(this, g);
        for (var _i = 0, _a = this.sprites; _i < _a.length; _i++) {
            var s = _a[_i];
            s.paint(g);
        }
    };
    return View;
}(Sprite));
exports.View = View;
