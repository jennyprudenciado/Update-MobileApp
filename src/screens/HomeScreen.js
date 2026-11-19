import React, { useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StatusBar,
  Text,
  View,
  Alert,
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
import { styles } from "../styles/styles";
import { homeStyles } from "../styles/homeStyles";

export default function HomeScreen({ navigation, plants, onWaterPlant, onUpdatePlant }) {
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newImage, setNewImage] = useState(null);

  const duePlants = plants.filter(
    (plant) => getWateringStatus(plant) === "Due Today"
  );

  async function changePlantImage() {
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

  function saveImageChange() {
    if (!selectedPlant || !newImage) {
      Alert.alert("Select Image", "Please select an image for your plant.");
      return;
    }

    const updatedPlant = {
      ...selectedPlant,
      image: newImage,
    };

    onUpdatePlant(updatedPlant);
    closeEditModal();

    Alert.alert(
      "Image Updated!",
      "Your plant image has been updated successfully."
    );
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
            <View style={{ flex: 1 }}>
              <Text style={homeStyles.plantName}>{item.name}</Text>
              <Text style={homeStyles.plantType}>{item.type}</Text>
            </View>

            <View
              style={[
                homeStyles.statusBadge,
                status === "Due Today" && homeStyles.statusDue,
              ]}
            >
              <Text
                style={[
                  homeStyles.statusText,
                  status === "Due Today" && homeStyles.statusDueText,
                ]}
              >
                {status}
              </Text>
            </View>
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

          <View style={homeStyles.infoRow}>
            <Text style={homeStyles.infoLabel}>Next Watering</Text>
            <Text style={homeStyles.infoValue}>
              {formatDate(getNextWateringDate(item))}
            </Text>
          </View>

          <Pressable
            style={homeStyles.waterButton}
            onPress={() => onWaterPlant(item.id)}
          >
            <Text style={homeStyles.waterButtonText}>
              💧 Add Water
            </Text>
          </Pressable>

          <Pressable
            style={homeStyles.diaryButton}
            onPress={() => navigation.navigate("Diary")}
          >
            <Text style={homeStyles.diaryButtonText}>
              📷 My Plant Diary
            </Text>
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

      {/* FIXED HEADER */}
      <View style={homeStyles.header}>
        <View style={{ flex: 1 }}>
          <Text style={homeStyles.greeting}>
            🌿 Hello, Plant Lover 🌿
          </Text>
          <Text style={styles.title}>My Plants Diary</Text>
        </View>

        <View style={homeStyles.plantCount}>
          <Text style={homeStyles.plantCountNumber}>
            {plants.length}
          </Text>
          <Text style={homeStyles.plantCountLabel}>Plants</Text>
        </View>
      </View>

      {/* FIXED SUMMARY CARD */}
      <View style={homeStyles.summaryCard}>
        <View style={homeStyles.summaryIcon}>
          <Text style={homeStyles.summaryEmoji}>💧</Text>
        </View>

        <View style={homeStyles.summaryText}>
          <Text style={homeStyles.summaryTitle}>
            {duePlants.length === 0
              ? "All plants are well-watered!"
              : `${duePlants.length} plant${
                  duePlants.length > 1 ? "s" : ""
                } need watering today`}
          </Text>

          <Text style={homeStyles.summarySubtitle}>
            Keep your plants healthy and happy by watering them on time.
          </Text>
        </View>
      </View>

      {/* FIXED SECTION HEADER */}
      <View style={homeStyles.sectionHeader}>
        <Text style={homeStyles.sectionTitle}>My Plants</Text>

        <Pressable onPress={() => navigation.navigate("Add Plant")}>
          <Text style={homeStyles.addText}>+ Add Plant</Text>
        </Pressable>
      </View>

      {/* HORIZONTAL SCROLLING FLATLIST */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={plants}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderPlantCard}
        ListEmptyComponent={emptyComponent}
        contentContainerStyle={homeStyles.flatListContent}
        scrollEnabled={plants.length > 0}
      />

      {/* EDIT IMAGE MODAL */}
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
                  <Text style={{ color: "#285d38", fontWeight: "700", marginTop: 10 }}>
                    Tap to select image
                  </Text>
                </View>
              )}
            </Pressable>

            <Pressable
              style={styles.primaryButton}
              onPress={saveImageChange}
            >
              <Text style={styles.primaryButtonText}>
                Save Image
              </Text>
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
    </SafeAreaView>
  );
}