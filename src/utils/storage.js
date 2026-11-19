import AsyncStorage from "@react-native-async-storage/async-storage";
import persistedData from "./persistedData";

// Keep this key unchanged so existing saved data can still be read.
const STORAGE_KEY = "plantcare_app_data_v1";
const { normalizePersistedAppData } = persistedData;

// Queue writes so an older save cannot overwrite newer data.
let saveQueue = Promise.resolve();

// Return null for a missing key, but surface read and parse errors.
export async function loadPersistedAppData() {
  let saved;

  try {
    saved = await AsyncStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error reading saved PlantCare data:", error);
    throw error;
  }

  if (!saved) {
    return null;
  }

  let parsed;

  try {
    parsed = JSON.parse(saved);
  } catch (error) {
    console.error("Saved PlantCare data is not valid JSON:", error);
    throw error;
  }

  return normalizePersistedAppData(parsed);
}

export function savePersistedAppData(
  plants,
  diary,
  pendingDeletes = []
) {
  if (
    !Array.isArray(plants) ||
    !Array.isArray(diary) ||
    !Array.isArray(pendingDeletes)
  ) {
    throw new TypeError("Plant and diary storage values must be arrays.");
  }

  const payload = JSON.stringify({
    plants,
    diary,
    pendingDeletes,
  });

  const writeOperation = saveQueue.then(() =>
    AsyncStorage.setItem(STORAGE_KEY, payload)
  );

  // Let later writes continue, while still returning this write's error.
  saveQueue = writeOperation.catch(() => {});

  return writeOperation;
}

export function clearPersistedAppData() {
  // Remove data only after any queued writes finish.
  const removeOperation = saveQueue.then(() =>
    AsyncStorage.removeItem(STORAGE_KEY)
  );

  saveQueue = removeOperation.catch(() => {});

  return removeOperation;
}