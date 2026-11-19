import { StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";

export const diaryStyles = StyleSheet.create({
  diaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    marginTop: 10,
  },

  plusButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: -10,
    right: 0,
  },

  plusButtonText: {
    color: COLORS.white,
    fontSize: 28,
  },

  diaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  diaryImage: {
    width: "100%",
    height: 220,
  },

  diaryPlaceholder: {
    width: "100%",
    height: 150,
    backgroundColor: COLORS.secondary,
    justifyContent: "center",
    alignItems: "center",
  },

  diaryPlaceholderEmoji: {
    fontSize: 55,
  },

  diaryContent: {
    padding: 15,
  },

  diaryPlant: {
    fontSize: 19,
    fontWeight: "800",
    color: COLORS.text,
  },

  diaryDate: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 3,
  },

  diaryNote: {
    color: COLORS.text,
    lineHeight: 21,
    marginTop: 10,
  },

  modalCard: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    maxHeight: "90%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
  },

  closeButton: {
    fontSize: 22,
    color: COLORS.muted,
  },

  plantSelector: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 5,
  },

  plantOption: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 20,
  },

  selectedPlantOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  plantOptionText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "700",
  },

  selectedPlantOptionText: {
    color: COLORS.white,
  },

  diaryPhotoButton: {
    height: 130,
    backgroundColor: COLORS.secondary,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 8,
  },

  diarySelectedImage: {
    width: "100%",
    height: "100%",
  },

  noteInput: {
    height: 90,
    textAlignVertical: "top",
  },
  editButton: {
  marginTop: 12,
  paddingVertical: 8,
  paddingHorizontal: 14,
  borderRadius: 8,
  backgroundColor: "#E8F3EA",
  alignSelf: "flex-start",
},

editButtonText: {
  color: "#285D38",
  fontWeight: "700",
},
});