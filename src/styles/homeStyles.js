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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
  },

  addText: {
    color: COLORS.primary,
    fontWeight: "700",
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
    marginBottom:3,
    
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
    borderRadius:10,
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
    marginBottom: 15,
  },

  plantName: {
    fontSize: 21,
    fontWeight: "800",
    color: COLORS.text,
    paddingBottom: 5,
  },

  plantType: {
    color: COLORS.muted,
    marginTop: 3,
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

  statusText: {
    color: COLORS.primaryDark,
    fontSize: 11,
    fontWeight: "800",
  },

  statusDueText: {
    color: COLORS.danger,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
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

  editImageModal: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    margin: 20,
    marginTop: "50%",
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
});