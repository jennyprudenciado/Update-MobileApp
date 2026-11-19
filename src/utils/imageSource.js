export function getImageSource(image) {
  if (!image) {
    return null;
  }

  if (typeof image === "string") {
    return { uri: image };
  }

  return image;
}