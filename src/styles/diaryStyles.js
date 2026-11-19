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
    top: -5,
    right: 0,
  },

  plusButtonText: {
    color: COLORS.white,
    fontSize: 28,
    textAlign: "center",
    bottom: 2,
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

  // The entry editor can scroll while staying within the screen height.
  modalCard: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    maxHeight: "88%",
    width: "100%",
    overflow: "hidden",
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

  diaryActions: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },

  editButton: {
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

  deleteEntryButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.danger,
    backgroundColor: COLORS.white,
    alignSelf: "flex-start",
  },

  deleteEntryButtonText: {
    color: COLORS.danger,
    fontWeight: "700",
  },

  deleteConfirmCard: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "85%",
    alignSelf: "center",
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    transform: [{ translateY: -12 }],
  },

  deleteConfirmTitle: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: "800",
    marginBottom: 10,
  },

  deleteConfirmDescription: {
    color: COLORS.muted,
    fontSize: 15,
    lineHeight: 22,
  },

  deleteConfirmEmphasis: {
    color: COLORS.text,
    fontWeight: "800",
  },

  deleteConfirmNote: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: COLORS.white,
  },

  deleteConfirmImageNote: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 10,
  },

  deleteConfirmError: {
    color: COLORS.danger,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 12,
  },

  deleteConfirmActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 20,
  },

  deleteConfirmCancelButton: {
    minWidth: 86,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },

  deleteConfirmCancelText: {
    color: COLORS.primaryDark,
    fontWeight: "700",
  },

  deleteConfirmDeleteButton: {
    minWidth: 86,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: COLORS.danger,
    alignItems: "center",
    justifyContent: "center",
  },

  deleteConfirmDeleteText: {
    color: COLORS.white,
    fontWeight: "700",
  },

  deleteDisabledButton: {
    opacity: 0.6,
  },

  undoContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    backgroundColor: COLORS.primaryDark,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },

  undoText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },

  undoButton: {
    marginLeft: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: COLORS.secondary,
    justifyContent: "center",
    alignItems: "center",
  },

  undoButtonDisabled: {
    opacity: 0.7,
  },

  undoButtonText: {
    color: COLORS.primaryDark,
    fontWeight: "800",
    fontSize: 12,
  },
});