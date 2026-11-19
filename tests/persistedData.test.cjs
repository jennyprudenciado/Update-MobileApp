const assert = require("node:assert/strict");
const { test } = require("node:test");

const { normalizePersistedAppData } = require("../src/utils/persistedData");

const validPlant = {
  id: "plant-1",
  name: "Monstera",
  type: "Indoor Plant",
  interval: 3,
  lastWatered: "2026-11-15T00:00:00.000Z",
  image: null,
};

const validDiaryEntry = {
  id: "diary-1",
  plantName: "Monstera",
  note: "New leaves are growing.",
  date: "2026-11-15T00:00:00.000Z",
  image: null,
};

test("normalizes valid records and supports legacy diary links", () => {
  const data = normalizePersistedAppData({
    plants: [{ ...validPlant, interval: "3" }],
    diary: [validDiaryEntry],
  });

  assert.equal(data.plants[0].interval, 3);
  assert.equal(data.diary[0].plantId, undefined);
  assert.deepEqual(data.pendingDeletes, []);
});

test("rejects malformed collections and records", () => {
  assert.throws(
    () => normalizePersistedAppData({ plants: "not-an-array" }),
    /plant data has an unexpected format/
  );
  assert.throws(
    () => normalizePersistedAppData({ plants: [null] }),
    /plant record 1 is invalid/
  );
  assert.throws(
    () => normalizePersistedAppData({ diary: [{ ...validDiaryEntry, date: "bad" }] }),
    /diary record 1 is invalid/
  );
});
