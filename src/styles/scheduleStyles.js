import { StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";

export const scheduleStyles = StyleSheet.create({
  scheduleCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  scheduleIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  scheduleEmoji: {
    fontSize: 25,
  },

  scheduleInfo: {
    flex: 1,
    minWidth: 130,
  },

  schedulePlant: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
  },

  scheduleDate: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 3,
  },

  scheduleInterval: {
    color: COLORS.primary,
    fontSize: 12,
    marginTop: 3,
    fontWeight: "700",
  },

  scheduleStatus: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 5,
  },

  dueStatus: {
    backgroundColor: COLORS.lightRed,
  },

  scheduleStatusText: {
    color: COLORS.primaryDark,
    fontSize: 10,
    fontWeight: "800",
  },

  dueStatusText: {
    color: COLORS.danger,
  },

  editScheduleButton: {
    backgroundColor: "#EAF4EA",
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },

  editScheduleButtonText: {
    color: COLORS.primary,
    fontWeight: "800",
    fontSize: 12,
  },

  smallWaterButton: {
    backgroundColor: COLORS.water,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },

  smallWaterButtonText: {
    color: COLORS.white,
    fontWeight: "800",
  },

  // Keep the interval editor centered and bounded on wider screens.
  scheduleModal: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    margin: 20,
    maxWidth: 420,
    width: "100%",
    alignSelf: "center",
  },

  scheduleModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  scheduleModalTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "800",
  },

  scheduleModalClose: {
    color: COLORS.muted,
    fontSize: 24,
  },

  scheduleModalPlantName: {
    color: COLORS.primaryDark,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },

  scheduleModalLabel: {
    color: COLORS.muted,
    fontSize: 13,
    marginBottom: 4,
  },

  scheduleModalValue: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 14,
  },

  scheduleInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 10,
  },

  scheduleError: {
    color: COLORS.danger,
    fontSize: 12,
    marginBottom: 10,
  },

  scheduleModalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    gap: 10,
  },

  scheduleCancelButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  scheduleCancelText: {
    color: COLORS.primaryDark,
    fontWeight: "700",
  },

  scheduleSaveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  scheduleSaveText: {
    color: COLORS.white,
    fontWeight: "700",
  },
});