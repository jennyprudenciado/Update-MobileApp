const { parsePositiveInteger } = require("./positiveInteger");

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isValidId(value) {
  return (
    (typeof value === "string" && value.trim().length > 0) ||
    (typeof value === "number" && Number.isFinite(value))
  );
}

function isValidDate(value) {
  return (
    (typeof value === "string" || typeof value === "number") &&
    Number.isFinite(new Date(value).getTime())
  );
}

function isValidImage(value) {
  return (
    value === undefined ||
    value === null ||
    typeof value === "string" ||
    (typeof value === "number" && Number.isFinite(value))
  );
}

function readArray(value, name) {
  if (value === undefined) {
    return [];
  }

  // Reject malformed collections instead of silently treating them as empty.
  if (!Array.isArray(value)) {
    throw new Error(`Saved PlantCare ${name} data has an unexpected format.`);
  }

  return value;
}

function normalizePlant(plant, index) {
  const interval = isRecord(plant)
    ? parsePositiveInteger(plant.interval)
    : null;

  // Check fields used by the screens and keep the interval numeric.
  if (
    !isRecord(plant) ||
    !isValidId(plant.id) ||
    typeof plant.name !== "string" ||
    !plant.name.trim() ||
    typeof plant.type !== "string" ||
    !plant.type.trim() ||
    interval === null ||
    !isValidDate(plant.lastWatered) ||
    !isValidImage(plant.image)
  ) {
    throw new Error(`Saved PlantCare plant record ${index + 1} is invalid.`);
  }

  return { ...plant, interval };
}

function normalizeDiaryEntry(entry, index) {
  // Older diary entries may rely on the plant name instead of a plant ID.
  if (
    !isRecord(entry) ||
    !isValidId(entry.id) ||
    typeof entry.note !== "string" ||
    !entry.note.trim() ||
    !isValidDate(entry.date) ||
    (entry.plantId != null &&
      entry.plantId !== "" &&
      !isValidId(entry.plantId)) ||
    (entry.plantName != null && typeof entry.plantName !== "string") ||
    !isValidImage(entry.image)
  ) {
    throw new Error(`Saved PlantCare diary record ${index + 1} is invalid.`);
  }

  return entry;
}

function normalizePersistedAppData(data) {
  if (!isRecord(data)) {
    throw new Error("Saved PlantCare data has an unexpected format.");
  }

  const plants = readArray(data.plants, "plant");
  const diary = readArray(data.diary, "diary");
  const pendingDeletes = readArray(data.pendingDeletes, "pending delete");

  return {
    ...data,
    plants: plants.map(normalizePlant),
    diary: diary.map(normalizeDiaryEntry),
    pendingDeletes,
  };
}

module.exports = { normalizePersistedAppData };
