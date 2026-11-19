import { Platform, StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },

  formContent: {
    padding: 20,
    paddingBottom: 100,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text,
    fontFamily: Platform.OS === "ios" ? "Times New Roman" : "Arial",
  },

  formTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 8,
  },

  formDescription: {
    color: COLORS.muted,
    lineHeight: 21,
    marginTop: 7,
    marginBottom: 22,
  },

  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  emptyEmoji: {
    fontSize: 55,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 7,
  },

  emptyText: {
    color: COLORS.muted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },

  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 13,
    alignItems: "center",
    marginTop: 20,
  },

  primaryButtonText: {
    color: COLORS.white,
    fontWeight: "800",
    fontSize: 15,
  },

  inputLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 8,
    marginTop: 10,
  },

  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: COLORS.text,
    fontSize: 15,
  },

  tabIcon: {
    fontSize: 20,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
});