import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error || new Error("Failed to read image."));
    reader.readAsDataURL(blob);
  });
}

// Copy picked images into app storage so their URIs remain usable later.
export async function persistImageUriToAppStorage(uri, prefix = "plantcare") {
  if (!uri) {
    return null;
  }

  // Convert temporary browser URLs before saving them in AsyncStorage.
  if (Platform.OS === "web") {
    if (typeof uri !== "string") {
      return null;
    }

    if (uri.startsWith("data:")) {
      return uri;
    }

    if (uri.startsWith("blob:")) {
      try {
        const response = await fetch(uri);
        if (!response.ok) {
          throw new Error(
            `Browser image request failed with status ${response.status}.`
          );
        }
        const blob = await response.blob();

        return await blobToDataUrl(blob);
      } catch (error) {
        console.error("Error converting browser image to data URL:", error);
        throw error;
      }
    }

    return uri;
  }

  const directory = FileSystem.documentDirectory;

  if (!directory) {
    throw new Error("The app's document storage directory is unavailable.");
  }

  if (typeof uri !== "string" || uri.startsWith(directory)) {
    return uri;
  }

  const safePrefix = String(prefix).replace(/[^a-zA-Z0-9_-]/g, "_");
  const destinationUri = `${directory}${safePrefix}_${Date.now()}.jpg`;

  // Keep the remote URL if downloading the image fails.
  if (/^https?:\/\//i.test(uri)) {
    try {
      const downloaded = await FileSystem.downloadAsync(uri, destinationUri);

      return downloaded.uri;
    } catch (error) {
      console.error("Error downloading remote image:", error);
      return uri;
    }
  }

  try {
    // The picker owns its URI, so copy the file before saving it.
    await FileSystem.copyAsync({
      from: uri,
      to: destinationUri,
    });

    return destinationUri;
  } catch (error) {
    console.error("Error persisting image file:", error);
    throw error;
  }
}

export async function removePersistedImage(uri) {
  if (
    Platform.OS === "web" ||
    !uri ||
    !uri.startsWith("file://")
  ) {
    return;
  }

  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);

    if (fileInfo.exists) {
      await FileSystem.deleteAsync(uri);
    }
  } catch (error) {
    console.error("Error deleting persisted image:", error);
  }
}