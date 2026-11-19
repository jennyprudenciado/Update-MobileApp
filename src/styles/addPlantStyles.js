import { StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";

export const addPlantStyles = StyleSheet.create({
  formGroup: {
    marginBottom: 20,
  },

  formInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: COLORS.text,
    fontSize: 15,
    marginBottom: 10,
  },

  imagePicker: {
    height: 190,
    borderRadius: 18,
    backgroundColor: COLORS.secondary,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 25,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  selectedImage: {
    width: "100%",
    height: "100%",
  },

  cameraEmoji: {
    fontSize: 42,
    marginBottom: 8,
  },

  imagePickerText: {
    color: COLORS.primaryDark,
    fontWeight: "700",
  },

  intervalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  daysBox: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 12,
  },

  daysText: {
    color: COLORS.primaryDark,
    fontWeight: "800",
  },

  tipCard: {
    backgroundColor: "#FFF8DF",
    padding: 15,
    borderRadius: 14,
    marginTop: 20,
  },

  tipTitle: {
    color: "#755F16",
    fontWeight: "800",
    marginBottom: 5,
  },

  tipText: {
    color: "#806F34",
    lineHeight: 19,
  },

  primary: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 13,
    alignItems: "center",
    marginTop: 20,
  },
  // Image Adjustment Styles
  adjustmentsContainer: {
    marginVertical: 15,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  adjustmentsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primaryDark,
    marginBottom: 14,
  },

  sliderGroup: {
    marginBottom: 16,
  },

  sliderLabel: {
    fontSize: 12,
    color: COLORS.text,
    marginBottom: 8,
    fontWeight: "600",
  },

  slider: {
    width: "100%",
    height: 40,
  },

  resetButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 10,
    alignItems: "center",
  },

  resetButtonText: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 13,
  },
});