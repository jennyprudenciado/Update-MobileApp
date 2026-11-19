import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

import { COLORS } from "../constants/colors";
import {
  formatDate,
  getNextWateringDate,
  getWateringStatus,
} from "../utils/date";
import { getImageSource } from "../utils/imageSource";
import { persistImageUriToAppStorage } from "../utils/imageStorage";

import { styles } from "../styles/styles";
import { homeStyles } from "../styles/homeStyles";

export default function HomeScreen({
  navigation,
  plants = [],
  onWaterPlant,
  onUpdatePlant,
  onDeletePlant,
  onUndoDeletePlant,
  isDataLoaded = true,
}) {
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newImage, setNewImage] = useState(null);
  const [plantToDelete, setPlantToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingDeletes, setPendingDeletes] = useState([]);
  const [undoingIds, setUndoingIds] = useState([]);

  const reminderShownRef = useRef(false);
  const undoTimersRef = useRef(new Map());
  const undoingIdsRef = useRef(new Set());

  const displayedPlants = isDataLoaded ? plants : [];

  const duePlants = displayedPlants.filter(
    (plant) => getWateringStatus(plant) === "Due Today"
  );

  const overduePlants = displayedPlants.filter(
    (plant) => getWateringStatus(plant) === "Overdue"
  );

  // Show a single reminder after saved plants finish loading.
  useEffect(() => {
    if (
      !isDataLoaded ||
      displayedPlants.length === 0 ||
      reminderShownRef.current
    ) {
      return;
    }

    const dueTodayNames = duePlants.map((plant) => plant.name);
    const overdueNames = overduePlants.map((plant) => plant.name);

    if (dueTodayNames.length === 0 && overdueNames.length === 0) {
      return;
    }

    const reminderLines = [];

    if (dueTodayNames.length > 0) {
      reminderLines.push(`💧 Due today: ${dueTodayNames.join(", ")}`);
    }

    if (overdueNames.length > 0) {
      reminderLines.push(
        `⚠️ Overdue: ${overdueNames.join(", ")}. Water them as soon as possible.`
      );
    }

    Alert.alert("Watering Reminder", reminderLines.join("\n"));
    reminderShownRef.current = true;
  }, [isDataLoaded, displayedPlants, duePlants, overduePlants]);

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

  async function changePlantImage() {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow photo access to change plant image."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setNewImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking new plant image:", error);
      Alert.alert(
        "Unable to Select Image",
        "Something went wrong while selecting your new plant image."
      );
    }
  }

  function openEditModal(plant) {
    setSelectedPlant(plant);
    setNewImage(plant.image || null);
    setEditModalVisible(true);
  }

  function closeEditModal() {
    setEditModalVisible(false);
    setSelectedPlant(null);
    setNewImage(null);
  }

  function openDeleteConfirmation(plant) {
    setDeleteError("");
    setPlantToDelete(plant);
  }

  function closeDeleteConfirmation() {
    if (isDeleting) {
      return;
    }

    setDeleteError("");
    setPlantToDelete(null);
  }

  // Keep the deletion snapshot so the user can undo it.
  async function handleDeletePlant() {
    if (!plantToDelete || typeof onDeletePlant !== "function") {
      setDeleteError("Plant deletion is unavailable. Please try again.");
      return;
    }

    setIsDeleting(true);
    setDeleteError("");

    try {
      const snapshot = await onDeletePlant(plantToDelete.id);

      if (!snapshot || snapshot === false) {
        setDeleteError(
          "This plant could not be found. The plant list was not changed."
        );
        return;
      }

      setPlantToDelete(null);

      setPendingDeletes((current) => [
        ...current.filter((entry) => entry.undoId !== snapshot.undoId),
        snapshot,
      ]);

      startUndoTimer(snapshot);
    } catch (error) {
      console.error("Error deleting plant:", error);
      setDeleteError(
        error?.message ||
          "The plant could not be deleted or saved. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  }

  // Ignore expired or duplicate taps; keep Undo available if saving fails.
  async function handleUndoDelete(snapshot) {
    if (
      !snapshot ||
      typeof onUndoDeletePlant !== "function" ||
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
      const restored = await onUndoDeletePlant(
        snapshot,
        undoRequestedAt
      );

      if (restored === false) {
        dismissPendingDelete(snapshot);
        return;
      }

      dismissPendingDelete(snapshot);
    } catch (error) {
      console.error("Error restoring deleted plant:", error);

      Alert.alert(
        "Undo Failed",
        error?.message ||
          "The plant could not be restored. Please try again."
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

  // Save the image file before updating the plant record.
  async function saveImageChange() {
    if (!selectedPlant) {
      Alert.alert(
        "Select Image",
        "Please select a plant before updating its image."
      );
      return;
    }

    if (!newImage) {
      Alert.alert("Select Image", "Please choose an image for your plant.");
      return;
    }

    if (typeof onUpdatePlant !== "function") {
      Alert.alert(
        "Update Error",
        "Plant update function is not available."
      );
      return;
    }

    try {
      const persistedUri = await persistImageUriToAppStorage(
        newImage,
        `plant_${selectedPlant.id}`
      );

      if (!persistedUri) {
        Alert.alert(
          "Image Save Error",
          "The selected image could not be saved. Your plant image was not changed."
        );
        return;
      }

      const updated = await onUpdatePlant({
        ...selectedPlant,
        image: persistedUri,
      });

      if (updated === false) {
        Alert.alert(
          "Save Error",
          "The plant image could not be saved to your plant record."
        );
        return;
      }

      closeEditModal();

      Alert.alert(
        "Image Updated!",
        "Your plant image has been updated successfully."
      );
    } catch (error) {
      console.error("Error saving plant image:", error);
      Alert.alert(
        "Save Error",
        "Your plant image could not be saved correctly."
      );
    }
  }

  const emptyComponent = (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyEmoji}>🌱</Text>

      <Text style={styles.emptyText}>
        Add your first houseplant to start tracking its water schedule.
      </Text>

      <Pressable
        style={styles.primaryButton}
        onPress={() => navigation.navigate("Add Plant")}
      >
        <Text style={styles.primaryButtonText}>
          + Add Another New Plant
        </Text>
      </Pressable>
    </View>
  );

  const renderPlantCard = ({ item }) => {
    const status = getWateringStatus(item);

    return (
      <View style={homeStyles.plantCard}>
        <Pressable onPress={() => openEditModal(item)}>
          {item.image ? (
            <Image
              source={getImageSource(item.image)}
              style={homeStyles.plantImage}
              resizeMode="cover"
            />
          ) : (
            <View style={homeStyles.placeholderImage}>
              <Text style={homeStyles.placeholderEmoji}>🌿</Text>
            </View>
          )}
        </Pressable>

        <View style={homeStyles.plantInfo}>
          <View style={homeStyles.plantTopRow}>
            <Text style={homeStyles.plantName} numberOfLines={1}>
              {item.name}
            </Text>

            <View
              style={[
                homeStyles.statusBadge,
                status === "Due Today" && homeStyles.statusDue,
                status === "Overdue" && homeStyles.statusOverdue,
              ]}
            >
              <Text
                style={[
                  homeStyles.statusText,
                  status === "Due Today" && homeStyles.statusDueText,
                  status === "Overdue" && homeStyles.statusOverdueText,
                ]}
              >
                {status}
              </Text>
            </View>
          </View>

          <View style={homeStyles.plantCategoryRow}>
            <Text
              style={homeStyles.plantType}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.type}
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Delete ${item.name}`}
              hitSlop={8}
              style={homeStyles.compactDeleteButton}
              onPress={() => openDeleteConfirmation(item)}
            >
              <Text style={homeStyles.compactDeleteButtonText}>Delete</Text>
            </Pressable>
          </View>

          <View style={homeStyles.infoRow}>
            <Text style={homeStyles.infoLabel}>Water Every</Text>
            <Text style={homeStyles.infoValue}>
              {item.interval} day{item.interval > 1 ? "s" : ""}
            </Text>
          </View>

          <View style={homeStyles.infoRow}>
            <Text style={homeStyles.infoLabel}>Last Watered</Text>
            <Text style={homeStyles.infoValue}>
              {formatDate(item.lastWatered)}
            </Text>
          </View>

          <View style={homeStyles.nextWateringRow}>
            <Text
              style={[homeStyles.infoLabel, homeStyles.nextWateringLabel]}
              numberOfLines={1}
            >
              Next Watering
            </Text>

            <Text
              style={[homeStyles.infoValue, homeStyles.nextWateringValue]}
              numberOfLines={1}
            >
              {formatDate(getNextWateringDate(item))}
            </Text>
          </View>

          <Pressable
            style={homeStyles.waterButton}
            onPress={() => onWaterPlant(item.id)}
          >
            <Text style={homeStyles.waterButtonText}>💧 Add Water</Text>
          </Pressable>

          <Pressable
            style={homeStyles.diaryButton}
            onPress={() => navigation.navigate("Diary")}
          >
            <Text style={homeStyles.diaryButtonText}>My Plant Diary</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={homeStyles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>My Plants Diary</Text>
            <Text style={homeStyles.greeting}> Hello, Plant Lover </Text>
          </View>

          <View style={homeStyles.plantCount}>
            <Text style={homeStyles.plantCountNumber}>
              {displayedPlants.length}
            </Text>
            <Text style={homeStyles.plantCountLabel}>Plants</Text>
          </View>
        </View>

        {(duePlants.length > 0 || overduePlants.length > 0) && (
          <View style={homeStyles.reminderContainer}>
            {overduePlants.length > 0 && (
              <Text style={homeStyles.overdueReminderText}>
                ⚠️ Overdue: {overduePlants.map((plant) => plant.name).join(", ")}
              </Text>
            )}

            {duePlants.length > 0 && (
              <Text style={homeStyles.dueReminderText}>
                💧 Due today: {duePlants.map((plant) => plant.name).join(", ")}
              </Text>
            )}
          </View>
        )}

        <View style={homeStyles.summaryCard}>
          <View style={homeStyles.summaryIcon}>
            <Text style={homeStyles.summaryEmoji}>💧</Text>
          </View>

          <View style={homeStyles.summaryText}>
            <Text style={homeStyles.summaryTitle}>
              {duePlants.length === 0 && overduePlants.length === 0
                ? "All plants are well-watered!"
                : `${duePlants.length + overduePlants.length} plant${
                    duePlants.length + overduePlants.length > 1 ? "s" : ""
                  } need watering`}
            </Text>

            <Text style={homeStyles.summarySubtitle}>
              Keep your plants healthy and happy by watering them on time.
            </Text>
          </View>
        </View>

        <View style={homeStyles.sectionHeader}>
          <Text style={homeStyles.sectionTitle}>My Plants</Text>

          <Pressable onPress={() => navigation.navigate("Add Plant")}>
            <Text style={homeStyles.addText}>+ Add Plant</Text>
          </Pressable>
        </View>

        {!isDataLoaded ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Loading your plants...</Text>
          </View>
        ) : displayedPlants.length === 0 ? (
          emptyComponent
        ) : (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={displayedPlants}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderPlantCard}
            contentContainerStyle={homeStyles.flatListContent}
            scrollEnabled
            nestedScrollEnabled
          />
        )}
      </ScrollView>

      {pendingDeletes.map((snapshot, index) => {
        const isThisUndoing = undoingIds.includes(snapshot.undoId);

        return (
          <View
            key={snapshot.undoId}
            accessibilityLiveRegion="polite"
            style={[
              homeStyles.undoContainer,
              { bottom: 72 + index * 64 },
            ]}
          >
            <Text style={homeStyles.undoText}>
              Plant deleted successfully.
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Undo deletion of ${snapshot.plant.name}`}
              disabled={isThisUndoing}
              onPress={() => handleUndoDelete(snapshot)}
              style={[
                homeStyles.undoButton,
                isThisUndoing && homeStyles.undoButtonDisabled,
              ]}
            >
              <Text style={homeStyles.undoButtonText}>
                {isThisUndoing ? "UNDOING..." : "UNDO"}
              </Text>
            </Pressable>
          </View>
        );
      })}

      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalOverlay}>
          <View style={homeStyles.editImageModal}>
            <View style={homeStyles.modalHeader}>
              <Text style={homeStyles.modalTitle}>
                Change {selectedPlant?.name} Image
              </Text>

              <Pressable onPress={closeEditModal}>
                <Text style={{ fontSize: 24, color: "#666" }}>✕</Text>
              </Pressable>
            </View>

            <Pressable
              style={homeStyles.imagePreview}
              onPress={changePlantImage}
            >
              {newImage ? (
                <Image
                  source={getImageSource(newImage)}
                  style={homeStyles.previewImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={homeStyles.imagePickerPlaceholder}>
                  <Text style={{ fontSize: 50 }}>📷</Text>
                  <Text
                    style={{
                      color: "#285d38",
                      fontWeight: "700",
                      marginTop: 10,
                    }}
                  >
                    Tap to select image
                  </Text>
                </View>
              )}
            </Pressable>

            <Pressable
              style={styles.primaryButton}
              onPress={saveImageChange}
            >
              <Text style={styles.primaryButtonText}>Save Image</Text>
            </Pressable>

            <Pressable
              style={[styles.primaryButton, { backgroundColor: "#ccc" }]}
              onPress={closeEditModal}
            >
              <Text style={[styles.primaryButtonText, { color: "#333" }]}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={Boolean(plantToDelete)}
        animationType="fade"
        transparent
        onRequestClose={closeDeleteConfirmation}
      >
        <View style={styles.modalOverlay}>
          <View style={homeStyles.deleteConfirmCard}>
            <Text style={homeStyles.deleteConfirmTitle}>Delete Plant?</Text>

            <Text style={homeStyles.deleteConfirmMessage}>
              Delete {plantToDelete?.name} and its diary entries? You can undo
              this for 5 seconds.
            </Text>

            {deleteError ? (
              <Text style={homeStyles.deleteConfirmError}>
                {deleteError}
              </Text>
            ) : null}

            <View style={homeStyles.deleteConfirmActions}>
              <Pressable
                accessibilityRole="button"
                disabled={isDeleting}
                style={[
                  homeStyles.deleteConfirmCancelButton,
                  isDeleting && homeStyles.disabledButton,
                ]}
                onPress={closeDeleteConfirmation}
              >
                <Text style={homeStyles.deleteConfirmCancelText}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                disabled={isDeleting}
                style={[
                  homeStyles.deleteConfirmDeleteButton,
                  isDeleting && homeStyles.disabledButton,
                ]}
                onPress={handleDeletePlant}
              >
                <Text style={homeStyles.deleteConfirmDeleteText}>
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