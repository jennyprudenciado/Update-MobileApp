import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

import { styles } from "../styles/styles";
import { diaryStyles } from "../styles/diaryStyles";
import { formatDate } from "../utils/date";
import { getImageSource } from "../utils/imageSource";
import { persistImageUriToAppStorage } from "../utils/imageStorage";

export default function DiaryScreen({
  plants,
  diary,
  onAddDiary,
  onUpdateDiary,
  onDeleteDiary,
  onUndoDeleteDiary,
}) {
  const [selectedPlantId, setSelectedPlantId] = useState("");
  const [note, setNote] = useState("");
  const [image, setImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDiary, setEditingDiary] = useState(null);

  const [entryToDelete, setEntryToDelete] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [pendingDeletes, setPendingDeletes] = useState([]);
  const [undoingIds, setUndoingIds] = useState([]);

  const undoTimersRef = useRef(new Map());
  const undoingIdsRef = useRef(new Set());

  const displayedDiary = Array.isArray(diary) ? diary : [];

  // Clear timers when the screen unmounts.
  useEffect(() => {
    return () => {
      undoTimersRef.current.forEach((timer) => clearTimeout(timer));
      undoTimersRef.current.clear();
    };
  }, []);

  function clearUndoTimer(undoId) {
    const timer = undoTimersRef.current.get(undoId);

    if (timer) {
      clearTimeout(timer);
      undoTimersRef.current.delete(undoId);
    }
  }

  function dismissPendingDelete(snapshot) {
    if (!snapshot?.undoId) {
      return;
    }

    clearUndoTimer(snapshot.undoId);
    setPendingDeletes((current) =>
      current.filter((entry) => entry.undoId !== snapshot.undoId)
    );
  }

  function startUndoTimer(snapshot) {
    clearUndoTimer(snapshot.undoId);

    const remainingTime = Math.max(
      0,
      snapshot.expiresAt - Date.now()
    );

    const timer = setTimeout(() => {
      setPendingDeletes((current) =>
        current.filter((entry) => entry.undoId !== snapshot.undoId)
      );
      undoTimersRef.current.delete(snapshot.undoId);
    }, remainingTime);

    undoTimersRef.current.set(snapshot.undoId, timer);
  }

  async function chooseDiaryImage() {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow photo access to add diary photos."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking diary image:", error);
      Alert.alert(
        "Unable to Select Image",
        "Something went wrong while selecting the diary image."
      );
    }
  }

  function openAddDiary() {
    setEditingDiary(null);
    setSelectedPlantId("");
    setNote("");
    setImage(null);
    setModalVisible(true);
  }

  function openEditDiary(item) {
    // Use the plant ID, or match by name for older entries.
    const plantId =
      item.plantId &&
      plants.some((plant) => String(plant.id) === String(item.plantId))
        ? item.plantId
        : plants.find(
            (plant) => plant.name.trim().toLowerCase() === String(item.plantName || "").trim().toLowerCase()
          )?.id || "";

    setEditingDiary(item);
    setSelectedPlantId(plantId);
    setNote(item.note);
    setImage(item.image || null);
    setModalVisible(true);
  }

  // Save the image before adding or updating the diary entry.
  async function saveDiary() {
    if (isSaving) {
      return;
    }

    if (!selectedPlantId) {
      Alert.alert("Select Plant", "Please select a plant.");
      return;
    }

    const matchingPlant = plants.find(
      (plant) => String(plant.id) === String(selectedPlantId)
    );

    if (!matchingPlant) {
      Alert.alert("Select Plant", "Please select a valid plant.");
      return;
    }

    if (!note.trim()) {
      Alert.alert("Missing Note", "Please write a short diary note.");
      return;
    }

    setIsSaving(true);

    try {
      let savedImage = null;

      if (image) {
        savedImage = await persistImageUriToAppStorage(
          image,
          `diary_${editingDiary?.id || Date.now()}`
        );
      }

      if (editingDiary) {
        const updatedEntry = {
          ...editingDiary,
          plantId: matchingPlant.id,
          plantName: matchingPlant.name,
          note: note.trim(),
          image: savedImage || image || editingDiary.image || null,
        };

        const saved =
          typeof onUpdateDiary === "function"
            ? await onUpdateDiary(updatedEntry)
            : false;

        if (saved !== true) {
          Alert.alert(
            "Save Error",
            "Your diary entry could not be saved. Please try again."
          );
          return;
        }

        setEditingDiary(null);
        setSelectedPlantId("");
        setNote("");
        setImage(null);
        setModalVisible(false);

        Alert.alert(
          "Diary Updated!",
          "Your plant diary entry was updated."
        );
        return;
      }

      const entry = {
        id: Date.now().toString(),
        plantId: matchingPlant.id,
        plantName: matchingPlant.name,
        note: note.trim(),
        date: new Date(),
        image: savedImage || image || null,
      };

      const saved =
        typeof onAddDiary === "function"
          ? await onAddDiary(entry)
          : false;

      if (saved !== true) {
        Alert.alert(
          "Save Error",
          "Your diary entry could not be saved. Please try again."
        );
        return;
      }

      setSelectedPlantId("");
      setNote("");
      setImage(null);
      setModalVisible(false);

      Alert.alert(
        "Diary Saved! 📸",
        "Your plant diary entry was added."
      );
    } catch (error) {
      console.error("Error saving diary entry:", error);
      Alert.alert(
        "Save Error",
        "Your diary entry could not be saved correctly."
      );
    } finally {
      setIsSaving(false);
    }
  }

  function closeModal() {
    setModalVisible(false);
    setEditingDiary(null);
    setSelectedPlantId("");
    setNote("");
    setImage(null);
  }

  function openDeleteConfirmation(entry) {
    setDeleteError("");
    setEntryToDelete(entry);
  }

  function closeDeleteConfirmation() {
    if (isDeleting) {
      return;
    }

    setDeleteError("");
    setEntryToDelete(null);
  }

  // Keep the deleted entry snapshot so the user can undo the deletion.
  async function confirmDeleteDiary() {
    if (!entryToDelete || typeof onDeleteDiary !== "function") {
      setDeleteError("Diary deletion is unavailable. Please try again.");
      return;
    }

    setIsDeleting(true);
    setDeleteError("");

    try {
      const snapshot = await onDeleteDiary(entryToDelete.id);

      if (!snapshot || snapshot === false) {
        setDeleteError(
          "This diary entry could not be found. Nothing was deleted."
        );
        return;
      }

      setEntryToDelete(null);
      setPendingDeletes((current) => [
        ...current.filter((entry) => entry.undoId !== snapshot.undoId),
        snapshot,
      ]);
      startUndoTimer(snapshot);
    } catch (error) {
      console.error("Error deleting diary entry:", error);
      setDeleteError(
        error?.message ||
          "The diary entry could not be deleted. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  }

  // Ignore expired or duplicate taps; keep Undo available if saving fails.
  async function handleUndoDelete(snapshot) {
    if (
      !snapshot ||
      typeof onUndoDeleteDiary !== "function" ||
      undoingIdsRef.current.has(snapshot.undoId)
    ) {
      return;
    }

    const undoRequestedAt = Date.now();

    if (undoRequestedAt >= snapshot.expiresAt) {
      dismissPendingDelete(snapshot);
      return;
    }

    undoingIdsRef.current.add(snapshot.undoId);
    setUndoingIds((current) => [...current, snapshot.undoId]);
    clearUndoTimer(snapshot.undoId);

    try {
      const restored = await onUndoDeleteDiary(
        snapshot,
        undoRequestedAt
      );

      if (restored === false) {
        dismissPendingDelete(snapshot);
        return;
      }

      dismissPendingDelete(snapshot);
    } catch (error) {
      console.error("Error restoring diary entry:", error);
      Alert.alert(
        "Undo Failed",
        error?.message ||
          "The diary entry could not be restored. Please try again."
      );

      if (Date.now() < snapshot.expiresAt) {
        startUndoTimer(snapshot);
      } else {
        dismissPendingDelete(snapshot);
      }
    } finally {
      undoingIdsRef.current.delete(snapshot.undoId);
      setUndoingIds((current) =>
        current.filter((undoId) => undoId !== snapshot.undoId)
      );
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={displayedDiary}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={diaryStyles.diaryHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Plant Diary 📸</Text>
              <Text style={styles.formDescription}>
                Keep a visual record of your plant's growth.
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add diary entry"
              style={diaryStyles.plusButton}
              onPress={openAddDiary}
            >
              <Text style={diaryStyles.plusButtonText}>+</Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>📷</Text>
            <Text style={styles.emptyTitle}>Your diary is empty</Text>
            <Text style={styles.emptyText}>
              Add photos and notes to keep a visual diary of your plants.
            </Text>
            <Pressable
              style={styles.primaryButton}
              onPress={openAddDiary}
            >
              <Text style={styles.primaryButtonText}>
                + Add Diary Entry
              </Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <View style={diaryStyles.diaryCard}>
            {item.image ? (
              <Image
                source={getImageSource(item.image)}
                style={diaryStyles.diaryImage}
                resizeMode="cover"
                onError={() => {
                  console.warn(
                    `Could not display diary image for entry ${item.id}.`
                  );
                }}
              />
            ) : (
              <View style={diaryStyles.diaryPlaceholder}>
                <Text style={diaryStyles.diaryPlaceholderEmoji}>🌱</Text>
              </View>
            )}

            <View style={diaryStyles.diaryContent}>
              <Text style={diaryStyles.diaryPlant}>{item.plantName}</Text>
              <Text style={diaryStyles.diaryDate}>
                {formatDate(item.date)}
              </Text>
              <Text style={diaryStyles.diaryNote}>{item.note}</Text>

              <View style={diaryStyles.diaryActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Edit diary entry for ${item.plantName}`}
                  style={diaryStyles.editButton}
                  onPress={() => openEditDiary(item)}
                >
                  <Text style={diaryStyles.editButtonText}>✍🏻 Edit</Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Delete diary entry for ${item.plantName}`}
                  style={diaryStyles.deleteEntryButton}
                  onPress={() => openDeleteConfirmation(item)}
                >
                  <Text style={diaryStyles.deleteEntryButtonText}>
                    🗑 Delete
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      />

      {pendingDeletes.map((snapshot, index) => {
        const isThisUndoing = undoingIds.includes(snapshot.undoId);

        return (
          <View
            key={snapshot.undoId}
            accessibilityLiveRegion="polite"
            style={[
              diaryStyles.undoContainer,
              { bottom: 12 + index * 64 },
            ]}
          >
            <Text style={diaryStyles.undoText}>
              Diary entry deleted.
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Undo deletion of diary entry for ${snapshot.entry.plantName}`}
              disabled={isThisUndoing}
              onPress={() => handleUndoDelete(snapshot)}
              style={[
                diaryStyles.undoButton,
                isThisUndoing && diaryStyles.undoButtonDisabled,
              ]}
            >
              <Text style={diaryStyles.undoButtonText}>
                {isThisUndoing ? "UNDOING..." : "UNDO"}
              </Text>
            </Pressable>
          </View>
        );
      })}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={diaryStyles.modalCard}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <View style={diaryStyles.modalHeader}>
                <Text style={diaryStyles.modalTitle}>
                  {editingDiary ? "Edit Diary Entry" : "New Diary Entry"}
                </Text>

                <Pressable onPress={closeModal}>
                  <Text style={diaryStyles.closeButton}>✕</Text>
                </Pressable>
              </View>

              <Text style={styles.inputLabel}>Select Plant</Text>

              {plants.length === 0 ? (
                <Text
                  style={{
                    color: "#C94C4C",
                    marginBottom: 10,
                  }}
                >
                  Please add a plant first.
                </Text>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: 8 }}
                >
                  <View style={diaryStyles.plantSelector}>
                    {plants.map((plant) => (
                      <Pressable
                        key={plant.id}
                        style={[
                          diaryStyles.plantOption,
                          selectedPlantId === plant.id &&
                            diaryStyles.selectedPlantOption,
                        ]}
                        onPress={() => setSelectedPlantId(plant.id)}
                      >
                        <Text
                          style={[
                            diaryStyles.plantOptionText,
                            selectedPlantId === plant.id &&
                              diaryStyles.selectedPlantOptionText,
                          ]}
                        >
                          🌿 {plant.name}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              )}

              <Text style={styles.inputLabel}>Photo</Text>

              <Pressable
                style={diaryStyles.diaryPhotoButton}
                onPress={chooseDiaryImage}
              >
                {image ? (
                  <Image
                    source={getImageSource(image)}
                    style={diaryStyles.diarySelectedImage}
                    resizeMode="cover"
                  />
                ) : (
                  <>
                    <Text
                      style={{
                        fontSize: 42,
                        marginBottom: 8,
                      }}
                    >
                      📷
                    </Text>
                    <Text
                      style={{
                        color: "#285d38",
                        fontWeight: "700",
                      }}
                    >
                      Add Photo
                    </Text>
                  </>
                )}
              </Pressable>

              <Text style={styles.inputLabel}>Note</Text>

              <TextInput
                style={[styles.input, diaryStyles.noteInput]}
                placeholder="Example: New leaves are growing!"
                placeholderTextColor="#9AA69A"
                multiline
                value={note}
                onChangeText={setNote}
              />

              <Pressable
                style={styles.primaryButton}
                onPress={saveDiary}
                disabled={isSaving}
              >
                <Text style={styles.primaryButtonText}>
                  {isSaving
                    ? "Saving..."
                    : editingDiary
                      ? "Update Diary Entry"
                      : "Save Diary Entry"}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={Boolean(entryToDelete)}
        animationType="fade"
        transparent
        onRequestClose={closeDeleteConfirmation}
      >
        <View style={styles.modalOverlay}>
          <View style={diaryStyles.deleteConfirmCard}>
            <Text style={diaryStyles.deleteConfirmTitle}>
              Delete diary entry?
            </Text>

            <Text style={diaryStyles.deleteConfirmDescription}>
              Delete the diary entry for{" "}
              <Text style={diaryStyles.deleteConfirmEmphasis}>
                {entryToDelete?.plantName}
              </Text>
              ?
            </Text>

            {entryToDelete?.note ? (
              <Text
                numberOfLines={3}
                style={diaryStyles.deleteConfirmNote}
              >
                “{entryToDelete.note}”
              </Text>
            ) : null}

            <Text style={diaryStyles.deleteConfirmImageNote}>
              The saved image file will not be removed.
            </Text>

            {deleteError ? (
              <Text style={diaryStyles.deleteConfirmError}>
                {deleteError}
              </Text>
            ) : null}

            <View style={diaryStyles.deleteConfirmActions}>
              <Pressable
                accessibilityRole="button"
                disabled={isDeleting}
                style={[
                  diaryStyles.deleteConfirmCancelButton,
                  isDeleting && diaryStyles.deleteDisabledButton,
                ]}
                onPress={closeDeleteConfirmation}
              >
                <Text style={diaryStyles.deleteConfirmCancelText}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                disabled={isDeleting}
                style={[
                  diaryStyles.deleteConfirmDeleteButton,
                  isDeleting && diaryStyles.deleteDisabledButton,
                ]}
                onPress={confirmDeleteDiary}
              >
                <Text style={diaryStyles.deleteConfirmDeleteText}>
                  {isDeleting ? "Deleting..." : "Delete"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}