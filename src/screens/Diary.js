import React, { useState } from "react";
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

export default function DiaryScreen({
  plants,
  diary,
  onAddDiary,
  onUpdateDiary,
}) {
  const [selectedPlant, setSelectedPlant] = useState("");
  const [note, setNote] = useState("");
  const [image, setImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDiary, setEditingDiary] = useState(null);

  async function chooseDiaryImage() {
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
  }

  function openAddDiary() {
    setEditingDiary(null);
    setSelectedPlant("");
    setNote("");
    setImage(null);
    setModalVisible(true);
  }

  function openEditDiary(item) {
    setEditingDiary(item);
    setSelectedPlant(item.plantName);
    setNote(item.note);
    setImage(item.image || null);
    setModalVisible(true);
  }

  function saveDiary() {
    if (!selectedPlant) {
      Alert.alert("Select Plant", "Please select a plant.");
      return;
    }

    if (!note.trim()) {
      Alert.alert("Missing Note", "Please write a short diary note.");
      return;
    }

    if (editingDiary) {
      const updatedEntry = {
        ...editingDiary,
        plantName: selectedPlant,
        note: note.trim(),
        image: image,
      };

      onUpdateDiary(updatedEntry);

      setEditingDiary(null);
      setSelectedPlant("");
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
      plantName: selectedPlant,
      note: note.trim(),
      date: new Date(),
      image,
    };

    onAddDiary(entry);

    setSelectedPlant("");
    setNote("");
    setImage(null);
    setModalVisible(false);

    Alert.alert(
      "Diary Saved! 📸",
      "Your plant diary entry was added."
    );
  }

  function closeModal() {
    setModalVisible(false);
    setEditingDiary(null);
    setSelectedPlant("");
    setNote("");
    setImage(null);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={diary}
        keyExtractor={(item) => item.id}
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
            <Text style={styles.emptyTitle}>
              Your diary is empty
            </Text>
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
              />
            ) : (
              <View style={diaryStyles.diaryPlaceholder}>
                <Text style={diaryStyles.diaryPlaceholderEmoji}>
                  🌱
                </Text>
              </View>
            )}
            <View style={diaryStyles.diaryContent}>
              <Text style={diaryStyles.diaryPlant}>
                {item.plantName}
              </Text>
              <Text style={diaryStyles.diaryDate}>
                {formatDate(item.date)}
              </Text>
              <Text style={diaryStyles.diaryNote}>
                {item.note}
              </Text>
              <Pressable
                style={diaryStyles.editButton}
                onPress={() => openEditDiary(item)}
              >
                <Text style={diaryStyles.editButtonText}>
                  ✍🏻 Edit 
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      />
      {/*Edit Diary Entry Modal** — A modal window that allows the user to edit an existing diary entry.*/}
      {/*Temporary window or overlay on top of the screen*/}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={diaryStyles.modalCard}>
            <View style={diaryStyles.modalHeader}>
              <Text style={diaryStyles.modalTitle}>
                {editingDiary
                  ? "Edit Diary Entry"
                  : "New Diary Entry"}
              </Text>
              <Pressable onPress={closeModal}>
                <Text style={diaryStyles.closeButton}>
                  ✕
                </Text>
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>
              Select Plant
            </Text>

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
              >
                <View style={diaryStyles.plantSelector}>
                  {plants.map((plant) => (
                    <Pressable
                      key={plant.id}
                      style={[
                        diaryStyles.plantOption,
                        selectedPlant === plant.name &&
                          diaryStyles.selectedPlantOption,
                      ]}
                      onPress={() =>
                        setSelectedPlant(plant.name)
                      }
                    >
                      <Text
                        style={[
                          diaryStyles.plantOptionText,
                          selectedPlant === plant.name &&
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

            <Text style={styles.inputLabel}>
              Photo
            </Text>

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

            <Text style={styles.inputLabel}>
              Note
            </Text>

            <TextInput
              style={[
                styles.input,
                diaryStyles.noteInput,
              ]}
              placeholder="Example: New leaves are growing!"
              placeholderTextColor="#9AA69A"
              multiline
              value={note}
              onChangeText={setNote}
            />

            <Pressable
              style={styles.primaryButton}
              onPress={saveDiary}
            >
              <Text style={styles.primaryButtonText}>
                {editingDiary
                  ? "Update Diary Entry"
                  : "Save Diary Entry"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}