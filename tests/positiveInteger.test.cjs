const assert = require("node:assert/strict");
const { test } = require("node:test");

const { parsePositiveInteger } = require("../src/utils/positiveInteger");

test("parses positive whole-number text", () => {
  assert.equal(parsePositiveInteger("3"), 3);
  assert.equal(parsePositiveInteger(" 24 "), 24);
  assert.equal(parsePositiveInteger("001"), 1);
});

test("rejects invalid and unsafe intervals", () => {
  for (const value of ["", "0", "-2", "2.5", "2.0", "3days", "1e2"]) {
    assert.equal(parsePositiveInteger(value), null, `expected ${value} to fail`);
  }

  assert.equal(parsePositiveInteger("9007199254740992"), null);
});
