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
});