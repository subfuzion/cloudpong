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
var pong_1 = require("../common/pong/pong");
var client_1 = require("../common/pong/client");
var messages_1 = require("../common/pong/messages");
var p5js_1 = require("../server/pong/p5js");
//import {PongEngine} from "../common/pong/engine";
var gfx_1 = require("../common/pong/gfx");
// TODO: Use "wss://" instead of "ws://" for production.
// TODO: Need to bundle with correct url for deployment.
var HOST = "ws://".concat(location.host);
//const HOST = "ws://localhost:8081";
var Pong = /** @class */ (function (_super) {
    __extends(Pong, _super);
    //pongEngine: PongEngine;
    function Pong(p5, parent, width, height, host) {
        var _this = _super.call(this, p5, parent, width, height) || this;
        _this.id = document.getElementById("id");
        _this.rss = document.getElementById("rss");
        _this.heapTotal = document.getElementById("heapTotal");
        _this.heapUsed = document.getElementById("heapUsed");
        _this.external = document.getElementById("external");
        _this.client = new client_1.PongClient(host);
        _this.client.onchange = _this.onmessage.bind(_this);
        // game objects
        var table = new pong_1.Table(0, 0, _this.width, _this.height);
        table.background = "black";
        var ball = new pong_1.Ball(250, 100);
        var player1 = new pong_1.Paddle(30, 250);
        player1.upKey = 65; // up:   'a'
        player1.downKey = 90; // down: 'z'
        var player2 = new pong_1.Paddle(table.width - 50, 250);
        player2.upKey = p5.UP_ARROW;
        player2.downKey = p5.DOWN_ARROW;
        table.add(ball, player1, player2);
        // const pongEngine = new PongEngine();
        // pongEngine.onStateChange(e => {
        //   if (e instanceof Update) {
        //     this.ball.x = e.x;
        //     this.ball.y = e.y;
        //     this.ball.vx = e.vx;
        //     this.ball.vy = e.vy;
        //     this.player1.y = e.player1y;
        //     this.player2.y = e.player2y;
        //   }
        // });
        // TODO: need player id assigned from server
        player1.onchange(function (y) {
            ////pongEngine.movePaddle(0, y);
            _this.client.send({
                id: 0,
                y: y
            });
        });
        player2.onchange(function (y) {
            //pongEngine.movePaddle(1, y);
            _this.client.send({
                id: 1,
                y: y
            });
        });
        _this.table = table;
        _this.ball = ball;
        _this.player1 = player1;
        _this.player2 = player2;
        return _this;
        // this.pongEngine = pongEngine;
    }
    Pong.prototype.setup = function () {
        _super.prototype.setup.call(this);
        var canvas = this.p5.createCanvas(this.width, this.height);
        try {
            canvas.parent(this.parent);
        }
        catch (err) {
            throw new Error("canvas.parent(".concat(this.parent, ") Is '").concat(this.parent, "' the correct element?) ").concat(err));
        }
        this.p5.frameRate(60);
        //    this.pongEngine.start();
    };
    Pong.prototype.draw = function () {
        _super.prototype.draw.call(this);
        var g = new gfx_1.GraphicsContext(this.p5, 0, 0, this.width, this.height);
        this.table.paint(g);
    };
    Pong.prototype.onmessage = function (e) {
        console.log(e);
        // if (e.message instanceof StatsUpdate) {
        //   const m = e.message as StatsUpdate;
        //   this.id!.textContent = m.id;
        //   this.rss!.textContent = m.stats.rss;
        //   this.heapTotal!.textContent = m.stats.heapTotal;
        //   this.heapUsed!.textContent = m.stats.heapUsed;
        //   this.external!.textContent = m.stats.external;
        // } else if (e.message instanceof Update) {
        //   const m = e.message as Update;
        //   this.ball.x = m.x;
        //   this.ball.y = m.y;
        //   this.ball.vx = m.vx;
        //   this.ball.vy = m.vy;
        //   this.player1.y = m.player1y;
        //   this.player2.y = m.player2y;
        // }
        if (e.message instanceof messages_1.Update) {
            var m = e.message;
            this.ball.x = m.x;
            this.ball.y = m.y;
            this.ball.vx = m.vx;
            this.ball.vy = m.vy;
            this.player1.y = m.player1y;
            this.player2.y = m.player2y;
        }
    };
    return Pong;
}(p5js_1.P5js));
// "pong" is the DOM element that will be used for the p5 canvas.
p5js_1.P5js.create(Pong, "pong", 600, 370, HOST);
