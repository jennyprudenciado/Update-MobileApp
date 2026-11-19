import React, { useEffect, useRef, useState } from "react";
import { Alert, Text } from "react-native";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { initialPlants, initialDiary } from "./data/plantsdata";
import { COLORS } from "./constants/colors";
import { styles } from "./styles/styles";
import {
  loadPersistedAppData,
  savePersistedAppData,
} from "./utils/storage";

import WelcomeScreen from "./screens/WelcomeScreen";
import HomeScreen from "./screens/HomeScreen";
import AddPlant from "./screens/AddPlant";
import Schedule from "./screens/Schedule";
import Diary from "./screens/Diary";

const Tab = createBottomTabNavigator();
const UNDO_WINDOW_MS = 5000;

let undoSequence = 0;

// Resolve links by plant ID, then fall back to names or legacy entry IDs.
function normalizeDiaryEntry(entry, currentPlants = []) {
  if (!entry || typeof entry !== "object") {
    return entry;
  }

  const requestedPlantId =
    entry.plantId != null && entry.plantId !== ""
      ? String(entry.plantId)
      : null;

  const requestedPlantName =
    typeof entry.plantName === "string" ? entry.plantName.trim() : "";

  const resolvedPlant =
    (requestedPlantId
      ? currentPlants.find((plant) => String(plant.id) === requestedPlantId)
      : null) ||
    (requestedPlantName
      ? currentPlants.find(
          (plant) =>
            plant.name.trim().toLowerCase() === requestedPlantName.toLowerCase()
        )
      : null) ||
    currentPlants.find((plant) => String(plant.id) === String(entry.id));

  return {
    ...entry,
    plantId: resolvedPlant ? String(resolvedPlant.id) : requestedPlantId || null,
    plantName: resolvedPlant ? resolvedPlant.name : requestedPlantName || "",
  };
}

export default function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [plants, setPlants] = useState(initialPlants);
  const [diary, setDiary] = useState(initialDiary);
  const [dataLoadStatus, setDataLoadStatus] = useState("loading");
  const [loadAttempt, setLoadAttempt] = useState(0);

  const plantsRef = useRef(initialPlants);
  const diaryRef = useRef(initialDiary);
  const isHydratedRef = useRef(false);
  const mutationQueueRef = useRef(Promise.resolve());

  // Serialize mutations so concurrent actions cannot overwrite newer data.
  function enqueueMutation(operation) {
    const operationPromise = mutationQueueRef.current.then(operation);

    mutationQueueRef.current = operationPromise.catch(() => {});

    return operationPromise;
  }

  // Publish changes only after storage confirms the save.
  async function persistAndPublish(nextPlants, nextDiary) {
    await savePersistedAppData(nextPlants, nextDiary);

    plantsRef.current = nextPlants;
    diaryRef.current = nextDiary;

    setPlants(nextPlants);
    setDiary(nextDiary);
  }

  function reportMutationError(message, error) {
    console.error(message, error);
    Alert.alert(
      "Save Error",
      "Your plant and diary data could not be saved. Please try again."
    );
  }

  // Load saved records once; allow writes only if loading succeeds.
  useEffect(() => {
    let isMounted = true;

    async function loadSavedData() {
      try {
        const savedData = await loadPersistedAppData();

        if (!isMounted) {
          return;
        }

        const loadedPlants =
          savedData && Array.isArray(savedData.plants)
            ? savedData.plants
            : initialPlants;

        const loadedDiary =
          savedData && Array.isArray(savedData.diary)
            ? savedData.diary.map((entry) =>
                normalizeDiaryEntry(entry, loadedPlants)
              )
            : initialDiary;

        plantsRef.current = loadedPlants;
        diaryRef.current = loadedDiary;

        setPlants(loadedPlants);
        setDiary(loadedDiary);
        isHydratedRef.current = true;
        setDataLoadStatus("ready");
      } catch (error) {
        console.error("Error loading PlantCare data:", error);

        if (isMounted) {
          isHydratedRef.current = false;
          setDataLoadStatus("error");
        }
      }
    }

    loadSavedData();

    return () => {
      isMounted = false;
    };
  }, [loadAttempt]);

  function retryDataLoad() {
    isHydratedRef.current = false;
    setDataLoadStatus("loading");
    setLoadAttempt((attempt) => attempt + 1);
  }

  function waterPlant(id) {
    return enqueueMutation(async () => {
      if (!isHydratedRef.current) {
        throw new Error("Plant data is not ready. Please wait for loading to finish.");
      }

      const nextPlants = plantsRef.current.map((plant) =>
        String(plant.id) === String(id)
          ? { ...plant, lastWatered: new Date() }
          : plant
      );

      await persistAndPublish(nextPlants, diaryRef.current);

      Alert.alert(
        "Plant Watered 💧",
        "The watering schedule has been updated."
      );

      return true;
    }).catch((error) => {
      reportMutationError("Error watering plant:", error);
      return false;
    });
  }

  function addPlant(plant) {
    return enqueueMutation(async () => {
      if (!isHydratedRef.current) {
        throw new Error("Plant data is not ready. Please wait for loading to finish.");
      }

      const duplicateId = plantsRef.current.some(
        (existingPlant) =>
          String(existingPlant.id) === String(plant.id)
      );

      if (duplicateId) {
        throw new Error("A plant with this ID already exists.");
      }

      const nextPlants = [...plantsRef.current, plant];
      await persistAndPublish(nextPlants, diaryRef.current);

      return true;
    }).catch((error) => {
      reportMutationError("Error adding plant:", error);
      return false;
    });
  }

  function updatePlant(updatedPlant) {
    return enqueueMutation(async () => {
      if (!isHydratedRef.current) {
        throw new Error("Plant data is not ready. Please wait for loading to finish.");
      }

      const exists = plantsRef.current.some(
        (plant) => String(plant.id) === String(updatedPlant.id)
      );

      if (!exists) {
        throw new Error("The plant to update could not be found.");
      }

      const nextPlants = plantsRef.current.map((plant) =>
        String(plant.id) === String(updatedPlant.id)
          ? updatedPlant
          : plant
      );

      await persistAndPublish(nextPlants, diaryRef.current);
      return true;
    }).catch((error) => {
      reportMutationError("Error updating plant:", error);
      return false;
    });
  }

  async function updatePlantSchedule(id, interval) {
    const nextInterval = Number(interval);

    if (!Number.isInteger(nextInterval) || nextInterval <= 0) {
      Alert.alert(
        "Invalid Watering Interval",
        "Please enter a positive whole number of days."
      );
      return false;
    }

    return enqueueMutation(async () => {
      if (!isHydratedRef.current) {
        throw new Error("Plant data is not ready. Please wait for loading to finish.");
      }

      const exists = plantsRef.current.some(
        (plant) => String(plant.id) === String(id)
      );

      if (!exists) {
        throw new Error("The plant to update could not be found.");
      }

      const nextPlants = plantsRef.current.map((plant) =>
        String(plant.id) === String(id)
          ? { ...plant, interval: nextInterval }
          : plant
      );

      await persistAndPublish(nextPlants, diaryRef.current);
      return true;
    }).catch((error) => {
      reportMutationError("Error updating watering schedule:", error);
      return false;
    });
  }

  // Save the plant and linked diary entries together so Undo can restore both.
  function deletePlant(id) {
    return enqueueMutation(async () => {
      if (!isHydratedRef.current) {
        throw new Error("Plant data is not ready. Please wait for loading to finish.");
      }

      const currentPlants = plantsRef.current;
      const plantIndex = currentPlants.findIndex(
        (plant) => String(plant.id) === String(id)
      );

      if (plantIndex === -1) {
        return false;
      }

      const plant = currentPlants[plantIndex];
      const nextPlants = currentPlants.filter(
        (item) => String(item.id) !== String(id)
      );

      const deletedDiaryEntries = diaryRef.current.filter((entry) => {
        const matchesId = String(entry.plantId) === String(id);
        const matchesName =
          !entry.plantId &&
          typeof entry.plantName === "string" &&
          entry.plantName.trim().toLowerCase() === plant.name.trim().toLowerCase();

        return matchesId || matchesName;
      });

      const nextDiary = diaryRef.current.filter((entry) => {
        const matchesId = String(entry.plantId) === String(id);
        const matchesName =
          !entry.plantId &&
          typeof entry.plantName === "string" &&
          entry.plantName.trim().toLowerCase() === plant.name.trim().toLowerCase();

        return !(matchesId || matchesName);
      });

      await persistAndPublish(nextPlants, nextDiary);

      const deletedAt = Date.now();
      undoSequence += 1;

      return {
        plant,
        plantIndex,
        previousPlantId: currentPlants[plantIndex - 1]?.id ?? null,
        nextPlantId: currentPlants[plantIndex + 1]?.id ?? null,
        deletedDiaryEntries,
        deletedAt,
        expiresAt: deletedAt + UNDO_WINDOW_MS,
        undoId: `${String(plant.id)}-${deletedAt}-${undoSequence}`,
      };
    }).catch((error) => {
      console.error("Error deleting plant:", error);
      throw new Error("The plant could not be deleted. Please try again.");
    });
  }

  // Restore the plant and its diary entries before the Undo window expires.
  function undoDeletePlant(snapshot, undoRequestedAt = Date.now()) {
    return enqueueMutation(async () => {
      if (!isHydratedRef.current) {
        throw new Error("Plant data is not ready. Please wait for loading to finish.");
      }

      if (!snapshot?.plant) {
        throw new Error("The deleted plant information is unavailable.");
      }

      if (
        !Number.isFinite(snapshot.expiresAt) ||
        undoRequestedAt >= snapshot.expiresAt
      ) {
        return false;
      }

      const currentPlants = plantsRef.current;
      const plantId = String(snapshot.plant.id);

      if (currentPlants.some((plant) => String(plant.id) === plantId)) {
        return true;
      }

      const nextPlants = [...currentPlants];
      const nextIndex = nextPlants.findIndex(
        (plant) =>
          snapshot.nextPlantId != null &&
          String(plant.id) === String(snapshot.nextPlantId)
      );
      const previousIndex = nextPlants.findIndex(
        (plant) =>
          snapshot.previousPlantId != null &&
          String(plant.id) === String(snapshot.previousPlantId)
      );

      let insertionIndex;

      if (nextIndex !== -1) {
        insertionIndex = nextIndex;
      } else if (previousIndex !== -1) {
        insertionIndex = previousIndex + 1;
      } else {
        const originalIndex = Number.isInteger(snapshot.plantIndex)
          ? snapshot.plantIndex
          : nextPlants.length;

        insertionIndex = Math.max(
          0,
          Math.min(originalIndex, nextPlants.length)
        );
      }

      nextPlants.splice(insertionIndex, 0, snapshot.plant);

      const restoredDiaryEntries = Array.isArray(snapshot.deletedDiaryEntries)
        ? snapshot.deletedDiaryEntries.map((entry) =>
            normalizeDiaryEntry({ ...entry, plantId: String(snapshot.plant.id) }, nextPlants)
          )
        : [];

      if (restoredDiaryEntries.length > 0) {
        const nextDiary = [...diaryRef.current, ...restoredDiaryEntries];
        await persistAndPublish(nextPlants, nextDiary);
        return true;
      }

      await persistAndPublish(nextPlants, diaryRef.current);
      return true;
    }).catch((error) => {
      console.error("Error restoring plant:", error);
      throw new Error("The plant could not be restored. Please try again.");
    });
  }

  // Store a consistent plant ID and name with each diary entry.
  function addDiary(entry) {
    return enqueueMutation(async () => {
      if (!isHydratedRef.current) {
        throw new Error("Diary data is not ready. Please wait for loading to finish.");
      }

      const normalizedEntry = normalizeDiaryEntry(
        { ...entry, plantId: entry.plantId ?? null },
        plantsRef.current
      );

      const duplicateId = diaryRef.current.some(
        (existingEntry) =>
          String(existingEntry.id) === String(normalizedEntry.id)
      );

      if (duplicateId) {
        throw new Error("A diary entry with this ID already exists.");
      }

      const nextDiary = [normalizedEntry, ...diaryRef.current];
      await persistAndPublish(plantsRef.current, nextDiary);

      return true;
    }).catch((error) => {
      reportMutationError("Error adding diary entry:", error);
      return false;
    });
  }

  function updateDiary(updatedEntry) {
    return enqueueMutation(async () => {
      if (!isHydratedRef.current) {
        throw new Error("Diary data is not ready. Please wait for loading to finish.");
      }

      const normalizedEntry = normalizeDiaryEntry(
        updatedEntry,
        plantsRef.current
      );

      const exists = diaryRef.current.some(
        (entry) => String(entry.id) === String(normalizedEntry.id)
      );

      if (!exists) {
        throw new Error("The diary entry to update could not be found.");
      }

      const nextDiary = diaryRef.current.map((entry) =>
        String(entry.id) === String(normalizedEntry.id)
          ? normalizedEntry
          : entry
      );

      await persistAndPublish(plantsRef.current, nextDiary);

      return true;
    }).catch((error) => {
      reportMutationError("Error updating diary entry:", error);
      return false;
    });
  }

  function deleteDiary(entryId) {
    return enqueueMutation(async () => {
      if (!isHydratedRef.current) {
        throw new Error("Diary data is not ready. Please wait for loading to finish.");
      }

      const currentDiary = diaryRef.current;
      const diaryIndex = currentDiary.findIndex(
        (entry) => String(entry.id) === String(entryId)
      );

      if (diaryIndex === -1) {
        return false;
      }

      const entry = currentDiary[diaryIndex];
      const nextDiary = currentDiary.filter(
        (item) => String(item.id) !== String(entryId)
      );

      await persistAndPublish(plantsRef.current, nextDiary);

      const deletedAt = Date.now();
      undoSequence += 1;

      return {
        entry,
        diaryIndex,
        previousDiaryEntryId: currentDiary[diaryIndex - 1]?.id ?? null,
        nextDiaryEntryId: currentDiary[diaryIndex + 1]?.id ?? null,
        deletedAt,
        expiresAt: deletedAt + UNDO_WINDOW_MS,
        undoId: `diary-${String(entry.id)}-${deletedAt}-${undoSequence}`,
      };
    }).catch((error) => {
      console.error("Error deleting diary entry:", error);
      throw new Error("The diary entry could not be deleted. Please try again.");
    });
  }

  function undoDeleteDiary(snapshot, undoRequestedAt = Date.now()) {
    return enqueueMutation(async () => {
      if (!isHydratedRef.current) {
        throw new Error("Diary data is not ready. Please wait for loading to finish.");
      }

      if (!snapshot?.entry) {
        throw new Error("The deleted diary entry is unavailable.");
      }

      if (
        !Number.isFinite(snapshot.expiresAt) ||
        undoRequestedAt >= snapshot.expiresAt
      ) {
        return false;
      }

      const currentDiary = diaryRef.current;
      const entryId = String(snapshot.entry.id);

      if (currentDiary.some((entry) => String(entry.id) === entryId)) {
        return true;
      }

      const nextDiary = [...currentDiary];
      const nextEntryIndex = nextDiary.findIndex(
        (entry) =>
          snapshot.nextDiaryEntryId != null &&
          String(entry.id) === String(snapshot.nextDiaryEntryId)
      );
      const previousEntryIndex = nextDiary.findIndex(
        (entry) =>
          snapshot.previousDiaryEntryId != null &&
          String(entry.id) === String(snapshot.previousDiaryEntryId)
        );

      let insertionIndex;

      if (nextEntryIndex !== -1) {
        insertionIndex = nextEntryIndex;
      } else if (previousEntryIndex !== -1) {
        insertionIndex = previousEntryIndex + 1;
      } else {
        const originalIndex = Number.isInteger(snapshot.diaryIndex)
          ? snapshot.diaryIndex
          : nextDiary.length;

        insertionIndex = Math.max(
          0,
          Math.min(originalIndex, nextDiary.length)
        );
      }

      nextDiary.splice(insertionIndex, 0, snapshot.entry);

      await persistAndPublish(plantsRef.current, nextDiary);
      return true;
    }).catch((error) => {
      console.error("Error restoring diary entry:", error);
      throw new Error("The diary entry could not be restored. Please try again.");
    });
  }

  return (
    <SafeAreaProvider>
      {dataLoadStatus !== "ready" || showWelcome ? (
        <WelcomeScreen
          loadStatus={dataLoadStatus}
          onGetStarted={() => setShowWelcome(false)}
          onRetry={retryDataLoad}
        />
      ) : (
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarActiveTintColor: COLORS.primary,
              tabBarInactiveTintColor: COLORS.muted,
              tabBarStyle: {
                height: 64,
                paddingBottom: 6,
                paddingTop: 5,
                backgroundColor: COLORS.white,
                borderTopColor: COLORS.border,
              },
              tabBarLabelStyle: {
                fontSize: 10,
                fontWeight: "600",
                marginTop: 1,
              },
              tabBarIconStyle: {
                marginTop: 1,
              },
            }}
          >
            <Tab.Screen
              name="Home"
              options={{
                tabBarIcon: () => (
                  <Text style={[styles.tabIcon, { fontSize: 18 }]}>🏠</Text>
                ),
              }}
            >
              {({ navigation }) => (
                <HomeScreen
                  navigation={navigation}
                  plants={plants}
                  isDataLoaded={dataLoadStatus === "ready"}
                  onWaterPlant={waterPlant}
                  onUpdatePlant={updatePlant}
                  onDeletePlant={deletePlant}
                  onUndoDeletePlant={undoDeletePlant}
                />
              )}
            </Tab.Screen>

            <Tab.Screen
              name="Schedule"
              options={{
                tabBarIcon: () => (
                  <Text style={[styles.tabIcon, { fontSize: 18 }]}>🗓️</Text>
                ),
              }}
            >
              {() => (
                <Schedule
                  plants={plants}
                  onWaterPlant={waterPlant}
                  onUpdatePlantSchedule={updatePlantSchedule}
                />
              )}
            </Tab.Screen>

            <Tab.Screen
              name="Diary"
              options={{
                tabBarIcon: () => (
                  <Text style={[styles.tabIcon, { fontSize: 18 }]}>📷</Text>
                ),
              }}
            >
              {() => (
                <Diary
                  plants={plants}
                  diary={diary}
                  onAddDiary={addDiary}
                  onUpdateDiary={updateDiary}
                  onDeleteDiary={deleteDiary}
                  onUndoDeleteDiary={undoDeleteDiary}
                />
              )}
            </Tab.Screen>

            <Tab.Screen
              name="Add Plant"
              options={{
                tabBarIcon: () => (
                  <Text style={[styles.tabIcon, { fontSize: 18 }]}>🌱</Text>
                ),
              }}
            >
              {({ navigation }) => (
                <AddPlant
                  navigation={navigation}
                  onAddPlant={addPlant}
                />
              )}
            </Tab.Screen>
          </Tab.Navigator>
        </NavigationContainer>
      )}
    </SafeAreaProvider>
  );
}