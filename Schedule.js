import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { styles } from "../styles/styles";
import { scheduleStyles } from "../styles/scheduleStyles";
import {
  formatDate,
  getNextWateringDate,
  getWateringStatus,
} from "../utils/date";
import positiveInteger from "../utils/positiveInteger";

const { parsePositiveInteger } = positiveInteger;

export default function ScheduleScreen({
  plants = [],
  onWaterPlant,
  onUpdatePlantSchedule,
}) {
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [newInterval, setNewInterval] = useState("");
  const [scheduleError, setScheduleError] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sort a copy so the shared plant list keeps its original order.
  const sortedPlants = useMemo(
    () =>
      [...plants].sort(
        (a, b) => getNextWateringDate(a) - getNextWateringDate(b)
      ),
    [plants]
  );

  function openScheduleEditor(plant) {
    setSelectedPlant(plant);
    setNewInterval(String(plant.interval));
    setScheduleError("");
    setEditModalVisible(true);
  }

  function closeScheduleEditor() {
    if (isSaving) return;
    setSelectedPlant(null);
    setNewInterval("");
    setScheduleError("");
    setEditModalVisible(false);
  }

  // Close the editor only after the parent confirms the save.
  async function saveScheduleChanges() {
    if (!selectedPlant || isSaving) return;

    const value = parsePositiveInteger(newInterval);
    if (value === null) {
      setScheduleError("Please enter a positive whole number of days.");
      return;
    }
    if (typeof onUpdatePlantSchedule !== "function") {
      setScheduleError("Schedule saving is unavailable.");
      return;
    }

    setIsSaving(true);
    setScheduleError("");

    try {
      const saved = await onUpdatePlantSchedule(selectedPlant.id, value);
      if (saved !== true) {
        setScheduleError("The schedule could not be saved. Please try again.");
        return;
      }

      setSelectedPlant(null);
      setNewInterval("");
      setEditModalVisible(false);
    } catch (error) {
      console.error("Error saving schedule:", error);
      setScheduleError(
        error?.message || "The schedule could not be saved. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={sortedPlants}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.sectionHeader}>
            <Text style={styles.title}>Watering Schedule 💧</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>📅</Text>
            <Text style={styles.emptyTitle}>No Plants in Schedule</Text>
            <Text style={styles.emptyText}>
              Add your first plant to start tracking its watering schedule.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const status = getWateringStatus(item);
          return (
            <View style={scheduleStyles.scheduleCard}>
              <View style={scheduleStyles.scheduleIcon}>
                <Text style={scheduleStyles.scheduleEmoji}>🌿</Text>
              </View>
              <View style={scheduleStyles.scheduleInfo}>
                <Text style={scheduleStyles.schedulePlant}>{item.name}</Text>
                <Text style={scheduleStyles.scheduleDate}>
                  Next watering: {formatDate(getNextWateringDate(item))}
                </Text>
                <Text style={scheduleStyles.scheduleInterval}>
                  Every {item.interval} day{item.interval > 1 ? "s" : ""}
                </Text>
              </View>
              <View
                style={[
                  scheduleStyles.scheduleStatus,
                  status === "Due Today" && scheduleStyles.dueStatus,
                ]}
              >
                <Text
                  style={[
                    scheduleStyles.scheduleStatusText,
                    status === "Due Today" && scheduleStyles.dueStatusText,
                  ]}
                >
                  {status}
                </Text>
              </View>
              <Pressable
                style={scheduleStyles.smallWaterButton}
                onPress={() => onWaterPlant?.(item.id)}
              >
                <Text style={scheduleStyles.smallWaterButtonText}>
                  💧 Water Now
                </Text>
              </Pressable>
              <Pressable
                style={scheduleStyles.editScheduleButton}
                onPress={() => openScheduleEditor(item)}
              >
                <Text style={scheduleStyles.editScheduleButtonText}>
                  Edit Schedule
                </Text>
              </Pressable>
            </View>
          );
        }}
      />

      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeScheduleEditor}
      >
        <View style={styles.modalOverlay}>
          <View style={scheduleStyles.scheduleModal}>
            <View style={scheduleStyles.scheduleModalHeader}>
              <Text style={scheduleStyles.scheduleModalTitle}>
                Edit Watering Schedule
              </Text>
              <Pressable onPress={closeScheduleEditor} disabled={isSaving}>
                <Text style={scheduleStyles.scheduleModalClose}>✕</Text>
              </Pressable>
            </View>

            {selectedPlant ? (
              <>
                <Text style={scheduleStyles.scheduleModalPlantName}>
                  {selectedPlant.name}
                </Text>
                <Text style={scheduleStyles.scheduleModalLabel}>
                  Current interval:
                </Text>
                <Text style={scheduleStyles.scheduleModalValue}>
                  {selectedPlant.interval} day
                  {selectedPlant.interval > 1 ? "s" : ""}
                </Text>
                <Text style={scheduleStyles.scheduleModalLabel}>
                  New interval (days)
                </Text>
                <TextInput
                  style={scheduleStyles.scheduleInput}
                  placeholder="Example: 7"
                  placeholderTextColor="#99A89A"
                  value={newInterval}
                  onChangeText={setNewInterval}
                  keyboardType="number-pad"
                  maxLength={3}
                  editable={!isSaving}
                />
                {scheduleError ? (
                  <Text style={scheduleStyles.scheduleError}>
                    {scheduleError}
                  </Text>
                ) : null}
                <View style={scheduleStyles.scheduleModalActions}>
                  <Pressable
                    style={scheduleStyles.scheduleCancelButton}
                    onPress={closeScheduleEditor}
                    disabled={isSaving}
                  >
                    <Text style={scheduleStyles.scheduleCancelText}>
                      Cancel
                    </Text>
                  </Pressable>
                  <Pressable
                    style={scheduleStyles.scheduleSaveButton}
                    onPress={saveScheduleChanges}
                    disabled={isSaving}
                  >
                    <Text style={scheduleStyles.scheduleSaveText}>
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Text>
                  </Pressable>
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}