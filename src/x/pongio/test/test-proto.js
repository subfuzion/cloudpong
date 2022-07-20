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
  const tests = [
    {
      name: "should convert between MovePaddleRequest (with scalar) and buffer",
      type: "MovePaddleRequest",
      original: -1,
      finalProperty: "direction",
      assertMethod: "equal",
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
      const buffer = pongMessages[`encode${test.type}`](test.original);
      const final = pongMessages[`decode${test.type}`](buffer);
      assert[test.assertMethod](test.finalProperty ? final[test.finalProperty] : final,
        test.expect ? test.expect : test.original);
    });
  }

});
