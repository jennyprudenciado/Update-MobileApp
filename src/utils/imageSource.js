export function getImageSource(image) {
  if (!image) {
    return null;
  }

  // Image selected with Expo ImagePicker
  if (typeof image === "string") {
    return { uri: image };
  }

  // Local image loaded with require(...)
  return image;
}