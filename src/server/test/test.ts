import {describe, it} from "mocha";
import assert from "node:assert/strict";

import Redis from "ioredis";
import * as os from "os";
import {v4 as uuid} from "uuid";


const url = process.env.REDIS;
if (!url) throw new Error(`REDIS environment variable not set`);


class Player {
  name: string = uuid();
  server: string = os.hostname();

  constructor(name: string | undefined = undefined) {
    if (name) this.name = name;
  }
}


describe("player queue tests", async () => {

  it("should set and get player in redis", async () => {
    let client = new Redis(url);
    const player = new Player();

    const hash = `{player.name}`;
    await client.hset(hash, "name", player.name, "server", player.server);
    client.expire(hash, 5);
    let p = await client.hgetall(hash);
    assert.equal(p.name, player.name);
    assert.equal(p.server, player.server);
    client.disconnect();
  });

  it("should add players to a set", async () => {
    let client = new Redis(url);
    const player1 = new Player();
    const player2 = new Player();

    const players = new Set([player1.name, player2.name]);

    const hash = "players";
    await client.sadd(hash, player1.name);
    await client.sadd(hash, player2.name);

    let size = await client.scard(hash);
    assert.equal(size, players.size);

    let p = await client.smembers(hash);
    p.forEach(m => {
      assert(players.has(m));
      client.srem(hash, m);
    });

    await client.del(hash);
    client.disconnect();
  });

  it("should queue and dequeue players from a list", async () => {
    let client = new Redis(url);
    const player1 = new Player();
    const player2 = new Player();

    const players = [player1.name, player2.name];

    const hash = "players";
    await client.rpush(hash, player1.name);
    await client.rpush(hash, player2.name);

    let size = await client.llen(hash);
    assert.equal(size, players.length);

    let p = await client.lpop(hash);
    assert.equal(p, player1.name);

    p = await client.lpop(hash);
    assert.equal(p, player2.name);

    await client.del(hash);
    client.disconnect();
  });

  it("should publish and receive players", async function () {
    this.timeout(10000);

    const publisher = new Redis(url);
    const subscriber = new Redis(url);

    const player = new Player();

    const channel = "waiting";

    console.log();

    await subscriber.subscribe(channel);
    console.log("     > subscribed to channel");

    subscriber.on("message", async (channel, p) => {
      console.log("     >", p);
      const obj = JSON.parse(p);
      assert.equal(obj.name, player.name);
      console.log("     > test passed");

      return new Promise(async () => {
        publisher.disconnect();
        console.log("     > publisher disconnected");

        await subscriber.unsubscribe(channel);
        console.log("     > subscriber unsubscribed");

        subscriber.disconnect();
        console.log("     > subscriber disconnected");
      });
    });

    await publisher.publish(channel, JSON.stringify(player));
    console.log("     > published to channel");
  });

});

