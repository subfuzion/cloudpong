import assert from "assert";
import {PongMessages} from "../lib/index.js";

describe("Basic serialization test suite", function () {
  const pongMessages = new PongMessages();

  // Paramterize tests like this:
  // it("should convert between MovePaddleRequest (with scalar) and buffer", function () {
  //   const original = -1;
  //   const buffer = pongMessages.encodeMovePaddleRequest(original);
  //   const final = pongMessages.decodeMovePaddleRequest(buffer);
  //   assert.equal(final.direction, original);
  // });
  //
  // if .expect not supplied, assert will test against .original
  // if assert needs to test a property on the actual result, set .finalProperty
  // set .assertMethod to the approprate assert test (default is assert.equal)
  const tests = [
    {
      name: "should convert between EchoRequest and buffer",
      type: "EchoRequest",
      original: 10,
      finalProperty: "data",
    },
    {
      name: "should convert between EchoReply and buffer",
      type: "EchoReply",
      original: 10,
      finalProperty: "data",
    },
    {
      name: "should convert between MoveBall (with scalar) and buffer",
      type: "MoveBall",
      original: [10, 20],
      assertMethod: "deepEqual",
      expect: {x: 10, y: 20},
    },
    {
      name: "should convert between MoveBall (with object) and buffer",
      type: "MoveBall",
      original: {x: 10, y: 20},
      assertMethod: "deepEqual",
    },
    {
      name: "should convert between MovePaddleRequest (with scalar) and buffer",
      type: "MovePaddleRequest",
      original: -1,
      finalProperty: "direction",
    },
    {
      name: "should convert between MovePaddleRequest (with object) and buffer",
      type: "MovePaddleRequest",
      original: {direction: 1},
      assertMethod: "deepEqual",
    },
    {
      name: "should normalize negative MovePaddleRequest.direction",
      type: "MovePaddleRequest",
      original: {direction: -10},
      assertMethod: "deepEqual",
      expect: {direction: -1},
    },
    {
      name: "should normalize positive MovePaddleRequest.direction",
      type: "MovePaddleRequest",
      original: {direction: 30},
      assertMethod: "deepEqual",
      expect: {direction: 1},
    },
    {
      name: "should normalize zero MovePaddleRequest.direction",
      type: "MovePaddleRequest",
      original: {direction: 0},
      assertMethod: "deepEqual",
      expect: {direction: 0},
    },
    {
      name: "should convert between MovePaddle (with scalar) and buffer",
      type: "MovePaddle",
      original: -20,
      finalProperty: "y",
      assertMethod: "equal",
    },
    {
      name: "should convert between MovePaddle (with object) and buffer",
      type: "MovePaddle",
      original: {y: 30},
      assertMethod: "deepEqual",
    },
  ];

  for (const test of tests) {
    it(test.name, function () {
      let buffer;
      if (Array.isArray(test.original)) {
        buffer = pongMessages[`encode${test.type}`](...test.original);
      } else {
        buffer = pongMessages[`encode${test.type}`](test.original);
      }
      const final = pongMessages[`decode${test.type}`](buffer);
      assert[test.assertMethod ? test.assertMethod : "equal"](test.finalProperty ? final[test.finalProperty] : final,
        test.expect ? test.expect : test.original);
    });
  }

});
