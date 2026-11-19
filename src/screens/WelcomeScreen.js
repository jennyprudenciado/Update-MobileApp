import React from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { welcomeStyles } from "../styles/welcomeStyles";

export default function WelcomeScreen({
  loadStatus = "ready",
  onGetStarted,
  onRetry,
}) {
  const isLoading = loadStatus === "loading";
  const hasLoadError = loadStatus === "error";
  let subtitle =
    "Take care of your plants, track watering, and keep a diary of their growth.";
  let buttonLabel = "Start Tracking";
  let buttonAction = onGetStarted;

  if (isLoading) {
    subtitle = "Loading your saved plants...";
    buttonLabel = "Loading...";
    buttonAction = undefined;
  } else if (hasLoadError) {
    subtitle =
      "Your saved data could not be loaded. Nothing was changed. Try again.";
    buttonLabel = "Try Again";
    buttonAction = onRetry;
  }

  return (
    <SafeAreaView style={welcomeStyles.container}>
      <View style={welcomeStyles.content}>
        <Image
          source={require("../assets/plant-diary.jpg")}
          style={welcomeStyles.image}
          resizeMode="contain"
        />

        <Text style={welcomeStyles.title}>
          Welcome to PlantDiary 🌱
        </Text>

        <Text style={welcomeStyles.subtitle}>
          {subtitle}
        </Text>

        <TouchableOpacity
          style={[
            welcomeStyles.button,
            isLoading && welcomeStyles.buttonDisabled,
          ]}
          activeOpacity={0.8}
          disabled={isLoading}
          onPress={buttonAction}
        >
          <Text style={welcomeStyles.buttonText}>
            {buttonLabel}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}