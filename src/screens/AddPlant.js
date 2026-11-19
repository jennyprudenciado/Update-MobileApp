import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

import { styles } from "../styles/styles";
import { addPlantStyles } from "../styles/addPlantStyles";

export default function AddPlantScreen({ navigation, onAddPlant }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [interval, setInterval] = useState("3");
  const [image, setImage] = useState(null);

  async function chooseImage() {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission Denied",
          "Please grant permission to access your photos."
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
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert(
        "Unable to Select Image",
        "Something went wrong while selecting the image."
      );
    }
  }

  function addPlant() {
    const plantName = name.trim();
    const plantType = type.trim();
    const intervalNumber = Number.parseInt(interval, 10);

    if (!plantName) {
      Alert.alert("Missing Information", "Please enter a plant name.");
      return;
    }

    if (!plantType) {
      Alert.alert("Missing Information", "Please enter a plant type.");
      return;
    }

    if (!Number.isInteger(intervalNumber) || intervalNumber <= 0) {
      Alert.alert(
        "Invalid Interval",
        "Please enter a valid watering interval greater than zero."
      );
      return;
    }

    const newPlant = {
      id: Date.now().toString(),
      name: plantName,
      type: plantType,
      interval: intervalNumber,
      lastWatered: new Date(),
      image: image || null,
    };

    onAddPlant(newPlant);

    setName("");
    setType("");
    setInterval("3");
    setImage(null);

    navigation.navigate("Home");

    Alert.alert(
      "Plant Added 🌱",
      `${newPlant.name} has been added to your plant diary!`
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.formContent}
        >
          <Text style={styles.formTitle}>Add a New Plant 🌱</Text>

          <Text style={styles.formDescription}>
            Fill in the details below to add a new plant to your diary. You can
            also upload a photo of your plant to keep track of its growth and
            progress.
          </Text>

          <Pressable
            style={addPlantStyles.imagePicker}
            onPress={chooseImage}
          >
            {image ? (
              <Image
                source={{ uri: image }}
                style={addPlantStyles.selectedImage}
                resizeMode="cover"
              />
            ) : (
              <>
                <Text style={addPlantStyles.cameraEmoji}>🪴</Text>

                <Text style={addPlantStyles.imagePickerText}>
                  Tap to upload a photo of your plant
                </Text>
              </>
            )}
          </Pressable>

          {image && (
            <Pressable
              style={{
                marginHorizontal: 16,
                marginBottom: 20,
                padding: 12,
              }}
              onPress={() => setImage(null)}
            >
              <Text
                style={{
                  color: "#C94C4C",
                  textAlign: "center",
                  fontWeight: "600",
                  fontSize: 14,
                }}
              >
                ✕ Remove Image
              </Text>
            </Pressable>
          )}

          <View style={addPlantStyles.formGroup}>
            <Text style={styles.inputLabel}>Plant Name</Text>

            <TextInput
              style={addPlantStyles.formInput}
              placeholder="Enter plant name"
              placeholderTextColor="#9AA69A"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              returnKeyType="next"
            />

            <Text style={styles.inputLabel}>Plant Type</Text>

            <TextInput
              style={addPlantStyles.formInput}
              placeholder="Enter plant type"
              placeholderTextColor="#9AA69A"
              value={type}
              onChangeText={setType}
              autoCapitalize="words"
              returnKeyType="next"
            />

            <Text style={styles.inputLabel}>
              Watering Interval (Days)
            </Text>

            <View style={addPlantStyles.intervalRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="0"
                placeholderTextColor="#9AA69A"
                keyboardType="number-pad"
                value={interval}
                onChangeText={setInterval}
                maxLength={0}
              />

              <View style={addPlantStyles.daysBox}>
                <Text style={addPlantStyles.daysText}>Days</Text>
              </View>
            </View>

            <View style={addPlantStyles.tipCard}>
              <Text style={addPlantStyles.tipTitle}>💡 Tip</Text>

              <Text style={addPlantStyles.tipText}>
                Enter the number of days between watering for your plant.
              </Text>
            </View>

            <Pressable
              style={addPlantStyles.primary}
              onPress={addPlant}
            >
              <Text style={styles.primaryButtonText}>
                🌱 Add Plant
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}