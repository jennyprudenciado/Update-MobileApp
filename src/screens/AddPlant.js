import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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

import { COLORS } from "../constants/colors";
import { styles } from "../styles/styles";
import { addPlantStyles } from "../styles/addPlantStyles";
import { persistImageUriToAppStorage } from "../utils/imageStorage";
import positiveInteger from "../utils/positiveInteger";
import {
  FALLBACK_TEXT,
  fetchEasyPlantsWithDetails,
  fetchPlantInfo,
  searchPlants,
  toStoredApiInfo,
} from "../utils/Plantapi";

const { parsePositiveInteger } = positiveInteger;

// Keep form state here; PlantCare.js owns the saved plant list.
export default function AddPlantScreen({ navigation, onAddPlant }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [interval, setInterval] = useState("3");
  const [isSaving, setIsSaving] = useState(false);
  const [image, setImage] = useState(null);
  const [showDiscovery, setShowDiscovery] = useState(false);

  const [selectedApiPlant, setSelectedApiPlant] = useState(null);

  const [search, setSearch] = useState({
    status: "idle",
    results: [],
    message: "",
  });
  const [details, setDetails] = useState({
    status: "idle",
    info: null,
    message: "",
  });

  // Cancel old catalog requests when another starts or this screen closes.
  const requestControllerRef = useRef(null);

  const lastListActionRef = useRef("search");

  useEffect(() => {
    return () => requestControllerRef.current?.abort();
  }, []);

  useEffect(() => {
    if (!navigation) {
      return;
    }

    return navigation.addListener("blur", () => {
      setShowDiscovery(false);
    });
  }, [navigation]);

  function startRequest() {
    requestControllerRef.current?.abort();

    const controller = new AbortController();
    requestControllerRef.current = controller;

    return controller;
  }

  async function searchForPlant() {
    lastListActionRef.current = "search";
    setShowDiscovery(true);
    const controller = startRequest();

    setDetails({ status: "idle", info: null, message: "" });
    setSearch({ status: "loading", results: [], message: "" });

    try {
      const results = await searchPlants(name, controller.signal);

      setSearch({ status: "success", results, message: "" });
    } catch (error) {
      // Ignore requests cancelled by a newer search or screen change.
      if (error?.name === "AbortError") {
        return;
      }

      if (error?.code !== "empty") {
        console.error("Plant search error:", error);
      }
      setSearch({
        status: "error",
        results: [],
        message: error?.message || "Something went wrong. Please try again.",
      });
    }
  }

  async function showEasyPlants() {
    lastListActionRef.current = "easy";
    const controller = startRequest();

    setDetails({ status: "idle", info: null, message: "" });
    setSearch({ status: "loading", results: [], message: "" });

    try {
      const { total, plants } = await fetchEasyPlantsWithDetails({
        signal: controller.signal,
      });

      setSearch({
        status: "success",
        results: plants,
        message: "",
        heading:
          total > plants.length
            ? `Found ${total} easy plants. Showing the first ${plants.length}:`
            : `Found ${total} easy plants:`,
      });
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }

      console.error("Easy plants error:", error);
      setSearch({
        status: "error",
        results: [],
        message: error?.message || "Something went wrong. Please try again.",
      });
    }
  }

  function retryList() {
    return lastListActionRef.current === "easy"
      ? showEasyPlants()
      : searchForPlant();
  }

  function toggleDiscovery() {
    const shouldShow = !showDiscovery;

    if (
      shouldShow &&
      (lastListActionRef.current !== "easy" || search.status === "idle")
    ) {
      showEasyPlants();
    }

    setShowDiscovery((visible) => !visible);
  }

  // Fetch details only when the result does not already include them.
  async function selectResult(result) {
    if (result.detailsLoaded) {
      setDetails({ status: "success", info: result, message: "" });
      return;
    }

    const controller = startRequest();

    setDetails({ status: "loading", info: null, message: "", result });

    try {
      const info = await fetchPlantInfo(result, controller.signal);

      setDetails({ status: "success", info, message: "" });
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }

      console.error("Plant details error:", error);
      setDetails({
        status: "error",
        info: null,
        message: error?.message || "Something went wrong. Please try again.",
        result,
      });
    }
  }

  // Fill the form from the catalog, but let the user set the watering interval.
  function applySelectedPlant(info) {
    setName(info.commonName || name);
    setType(info.scientificName || info.commonName || type);

    if (info.image && !image) {
      setImage(info.image);
    }

    setSelectedApiPlant(info);
    setSearch({ status: "idle", results: [], message: "" });
    setDetails({ status: "idle", info: null, message: "" });
    setShowDiscovery(false);
  }

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

  async function addPlant() {
    if (isSaving) {
      return;
    }

    const plantName = name.trim();
    const plantType = type.trim();
    const intervalNumber = parsePositiveInteger(interval);

    if (!plantName) {
      Alert.alert("Missing Information", "Please enter a plant name.");
      return;
    }

    if (!plantType) {
      Alert.alert("Missing Information", "Please enter a plant type.");
      return;
    }

    if (intervalNumber === null) {
      Alert.alert(
        "Invalid Interval",
        "Please enter a positive whole number of days."
      );
      return;
    }

    setIsSaving(true);

    try {
      const persistedImage = image
        ? await persistImageUriToAppStorage(image, "plant")
        : null;

      const newPlant = {
        id: Date.now().toString(),
        name: plantName,
        type: plantType,
        interval: intervalNumber,
        lastWatered: new Date(),
        image: persistedImage || image || null,
        ...(selectedApiPlant
          ? { apiInfo: toStoredApiInfo(selectedApiPlant) }
          : {}),
      };

      const saved = await onAddPlant(newPlant);

      if (!saved) {
        return;
      }

      setName("");
      setType("");
      setInterval("3");
      setImage(null);
      setSelectedApiPlant(null);

      navigation.navigate("Home");

      Alert.alert(
        "Plant Added 🌱",
        `${newPlant.name} has been added to your plant diary!`
      );
    } catch (error) {
      console.error("Error adding plant:", error);
      Alert.alert(
        "Save Error",
        "The plant or its photo could not be saved. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
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

            <Pressable
              style={[
                addPlantStyles.lookupButton,
                (search.status === "loading" ||
                  details.status === "loading") && { opacity: 0.6 },
              ]}
              onPress={searchForPlant}
              disabled={
                search.status === "loading" || details.status === "loading"
              }
            >
              <Text style={addPlantStyles.lookupButtonText}>
                🔎 Search Plant
              </Text>
            </Pressable>

            <Pressable
              style={addPlantStyles.lookupButton}
              onPress={toggleDiscovery}
              accessibilityRole="button"
              accessibilityState={{ expanded: showDiscovery }}
            >
              <Text style={addPlantStyles.lookupButtonText}>
                {showDiscovery
                  ? "🌿 Discover Plants Perfect for Beginners"
                  : "🌿 Discover Plants Perfect for Beginners"}
              </Text>
            </Pressable>

            {showDiscovery && (
              <>
                {(search.status === "loading" ||
                  details.status === "loading") && (
                  <View style={addPlantStyles.lookupCard}>
                    <ActivityIndicator color={COLORS.primary} />
                    <Text style={addPlantStyles.lookupMessage}>
                      {details.status === "loading"
                        ? "Loading plant details..."
                        : "Searching for plants..."}
                    </Text>
                  </View>
                )}

                {search.status === "error" && (
                  <View style={addPlantStyles.lookupCard}>
                    <Text style={addPlantStyles.lookupError}>
                      {search.message}
                    </Text>

                    <Pressable onPress={retryList}>
                      <Text style={addPlantStyles.lookupLink}>Try again</Text>
                    </Pressable>
                  </View>
                )}

                {details.status === "error" && (
                  <View style={addPlantStyles.lookupCard}>
                    <Text style={addPlantStyles.lookupError}>
                      {details.message}
                    </Text>

                    {!!details.result && (
                      <>
                        <Pressable onPress={() => selectResult(details.result)}>
                          <Text style={addPlantStyles.lookupLink}>
                            Try again
                          </Text>
                        </Pressable>

                        <Pressable
                          onPress={() => applySelectedPlant(details.result)}
                        >
                          <Text style={addPlantStyles.lookupLink}>
                            Use basic info instead
                          </Text>
                        </Pressable>
                      </>
                    )}

                    <Pressable
                      onPress={() =>
                        setDetails({ status: "idle", info: null, message: "" })
                      }
                    >
                      <Text style={addPlantStyles.lookupLink}>
                        Back to results
                      </Text>
                    </Pressable>
                  </View>
                )}

                {search.status === "success" && details.status === "idle" && (
                  <View style={addPlantStyles.lookupCard}>
                    {!!search.heading && (
                      <Text style={addPlantStyles.lookupMessage}>
                        {search.heading}
                      </Text>
                    )}

                    {search.results.map((result) => (
                      <Pressable
                        key={String(result.id)}
                        style={addPlantStyles.resultRow}
                        onPress={() => selectResult(result)}
                      >
                        <PlantImage
                          uri={result.image}
                          style={addPlantStyles.resultThumb}
                        />

                        <View style={{ flex: 1 }}>
                          <Text style={addPlantStyles.lookupTitle}>
                            {result.commonName}
                          </Text>

                          {!!result.scientificName && (
                            <Text style={addPlantStyles.lookupDescription}>
                              {result.scientificName}
                            </Text>
                          )}

                          {!!result.difficulty && (
                            <Text style={addPlantStyles.lookupExtract}>
                              Difficulty: {result.difficulty}
                            </Text>
                          )}

                          {result.detailsLoaded && (
                            <Text
                              style={addPlantStyles.lookupExtract}
                              numberOfLines={1}
                            >
                              💧 {result.watering || FALLBACK_TEXT}
                            </Text>
                          )}
                        </View>
                      </Pressable>
                    ))}

                    <Text style={addPlantStyles.lookupSource}>
                      Source: PlantSolve (CC BY 4.0)
                    </Text>
                  </View>
                )}

                {details.status === "success" && details.info && (
                  <View style={addPlantStyles.lookupCard}>
                    <PlantImage
                      uri={details.info.image}
                      style={addPlantStyles.lookupImage}
                    />

                    <Text style={addPlantStyles.lookupTitle}>
                      {details.info.commonName}
                    </Text>

                    {!!details.info.scientificName && (
                      <Text style={addPlantStyles.lookupDescription}>
                        {details.info.scientificName}
                      </Text>
                    )}

                    <Text style={addPlantStyles.lookupExtract}>
                      <Text style={{ fontWeight: "700" }}>Difficulty: </Text>
                      {details.info.difficulty || FALLBACK_TEXT}
                    </Text>

                    <Text
                      style={addPlantStyles.lookupExtract}
                      numberOfLines={5}
                    >
                      <Text style={{ fontWeight: "700" }}>Description: </Text>
                      {details.info.description || FALLBACK_TEXT}
                    </Text>

                    <Text style={addPlantStyles.lookupExtract}>
                      <Text style={{ fontWeight: "700" }}>💧 Watering: </Text>
                      {details.info.watering || FALLBACK_TEXT}
                    </Text>

                    <Text style={addPlantStyles.lookupExtract}>
                      <Text style={{ fontWeight: "700" }}>☀️ Sunlight: </Text>
                      {details.info.sunlight || FALLBACK_TEXT}
                    </Text>

                    <Text style={addPlantStyles.lookupExtract}>
                      <Text style={{ fontWeight: "700" }}>🌱 Soil: </Text>
                      {details.info.soil || FALLBACK_TEXT}
                    </Text>

                    {details.info.careNotes.map((item) => (
                      <Text
                        key={item.label}
                        style={addPlantStyles.lookupExtract}
                      >
                        <Text style={{ fontWeight: "700" }}>
                          {item.label}:{" "}
                        </Text>
                        {item.value}
                      </Text>
                    ))}

                    <Pressable onPress={() => applySelectedPlant(details.info)}>
                      <Text style={addPlantStyles.lookupLink}>
                        ✓ Use this plant in the form
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() =>
                        setDetails({
                          status: "idle",
                          info: null,
                          message: "",
                        })
                      }
                    >
                      <Text style={addPlantStyles.lookupLink}>
                        Back to results
                      </Text>
                    </Pressable>

                    <Text style={addPlantStyles.lookupSource}>
                      Source: PlantSolve (CC BY 4.0)
                    </Text>
                  </View>
                )}
              </>
            )}

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
                style={[addPlantStyles.formInput, { flex: 1 }]}
                placeholder="Enter interval"
                placeholderTextColor="#9AA69A"
                keyboardType="number-pad"
                value={interval}
                onChangeText={setInterval}
                maxLength={3}
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
              disabled={isSaving}
            >
              <Text style={styles.primaryButtonText}>
                {isSaving ? "Adding..." : "🌱 Add Plant"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function PlantImage({ uri, style }) {
  const [failed, setFailed] = useState(false);

  if (!uri || failed) {
    return (
      <View style={[style, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={addPlantStyles.cameraEmoji}>🪴</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={style}
      resizeMode="cover"
      onError={() => setFailed(true)}
    />
  );
}