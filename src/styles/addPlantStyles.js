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

  lookupButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },

  lookupButtonText: {
    color: COLORS.primaryDark,
    fontWeight: "700",
  },

  lookupCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    gap: 8,
  },

  lookupImage: {
    width: "100%",
    height: 150,
    borderRadius: 10,
  },

  lookupTitle: {
    color: COLORS.primaryDark,
    fontSize: 16,
    fontWeight: "800",
  },

  lookupDescription: {
    color: COLORS.text,
    fontStyle: "italic",
  },

  lookupExtract: {
    color: COLORS.text,
    lineHeight: 19,
  },

  lookupMessage: {
    color: COLORS.text,
    textAlign: "center",
  },

  lookupError: {
    color: "#C94C4C",
    fontWeight: "600",
  },

  lookupLink: {
    color: COLORS.primary,
    fontWeight: "700",
  },

  lookupSource: {
    color: COLORS.text,
    fontSize: 11,
    opacity: 0.6,
  },

  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 6,
  },

  resultThumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: COLORS.secondary,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
});