import { StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";

export const homeStyles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 16,
  },

  greeting: {
    fontSize: 15,
    color: COLORS.muted,
    marginTop: 5,
    marginBottom: 4,
  },

  plantCount: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.secondary,
    justifyContent: "center",
    alignItems: "center",
  },

  plantCountNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.primaryDark,
  },

  plantCountLabel: {
    fontSize: 10,
    color: COLORS.primaryDark,
  },

  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    padding: 18,
    marginBottom: 15,
    marginHorizontal: 16,
  },

  summaryIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(233, 237, 179, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  summaryEmoji: {
    fontSize: 25,
  },

  summaryText: {
    flex: 1,
  },

  summaryTitle: {
    color: COLORS.white,
    fontWeight: "800",
    fontSize: 16,
  },

  summarySubtitle: {
    color: "#E6F3E5",
    marginTop: 5,
    fontSize: 13,
  },

  sectionHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 5,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
  },

  addText: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 14,
  },

  flatListContent: {
    paddingHorizontal: 8,
  },

  plantCard: {
    width: 300,
    backgroundColor: COLORS.card,
    borderRadius: 15,
    overflow: "hidden",
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 3,
  },

  plantImage: {
    width: "100%",
    height: 190,
  },

  placeholderImage: {
    width: "100%",
    height: 190,
    backgroundColor: COLORS.secondary,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },

  placeholderEmoji: {
    fontSize: 65,
  },

  plantInfo: {
    padding: 16,
  },

  plantTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  plantName: {
    flex: 1,
    minWidth: 0,
    fontSize: 21,
    fontWeight: "800",
    color: COLORS.text,
    paddingBottom: 5,
  },

  plantCategoryRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },

  plantType: {
    color: COLORS.muted,
    marginTop: 3,
    flex: 1,
    minWidth: 0,
  },

  compactDeleteButton: {
    flexShrink: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.danger,
    backgroundColor: COLORS.card,
    justifyContent: "center",
    alignItems: "center",
  },

  compactDeleteButtonText: {
    color: COLORS.danger,
    fontSize: 10,
    fontWeight: "700",
  },

  statusBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusDue: {
    backgroundColor: COLORS.lightRed,
  },

  statusOverdue: {
    backgroundColor: COLORS.lightRed,
  },

  statusText: {
    color: COLORS.primaryDark,
    fontSize: 11,
    fontWeight: "800",
  },

  statusDueText: {
    color: COLORS.danger,
  },

  statusOverdueText: {
    color: COLORS.danger,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },

  nextWateringRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 5,
  },

  nextWateringLabel: {
    flexShrink: 1,
  },

  nextWateringValue: {
    flex: 1,
    minWidth: 0,
    textAlign: "right",
  },

  infoLabel: {
    color: COLORS.muted,
    fontSize: 13,
  },

  infoValue: {
    color: COLORS.text,
    fontWeight: "700",
    fontSize: 13,
  },

  waterButton: {
    backgroundColor: COLORS.water,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  waterButtonText: {
    color: COLORS.white,
    fontWeight: "800",
  },

  diaryButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },

  diaryButtonText: {
    color: COLORS.primary,
    fontWeight: "800",
  },

  reminderContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#F5FAF4",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  dueReminderText: {
    color: COLORS.primaryDark,
    fontWeight: "700",
    fontSize: 12,
    marginBottom: 4,
  },

  overdueReminderText: {
    color: COLORS.danger,
    fontWeight: "800",
    fontSize: 12,
    marginBottom: 4,
  },

  editImageModal: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    margin: 20,
    maxWidth: 420,
    width: "100%",
    alignSelf: "center",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#285d38",
  },

  imagePreview: {
    marginVertical: 20,
    borderRadius: 15,
    overflow: "hidden",
    height: 300,
    backgroundColor: "#f5f5f5",
  },

  previewImage: {
    width: "100%",
    height: "100%",
  },

  imagePickerPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },

  deleteConfirmCard: {
    width: "100%",
    maxWidth: 380,
    alignSelf: "center",
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 20,
    marginHorizontal: 20,
  },

  deleteConfirmTitle: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 8,
  },

  deleteConfirmMessage: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
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
    minWidth: 82,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  deleteConfirmCancelText: {
    color: COLORS.primaryDark,
    fontWeight: "700",
  },

  deleteConfirmDeleteButton: {
    minWidth: 82,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.danger,
    alignItems: "center",
    justifyContent: "center",
  },

  deleteConfirmDeleteText: {
    color: COLORS.white,
    fontWeight: "700",
  },

  disabledButton: {
    opacity: 0.6,
  },

  undoContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 72,
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