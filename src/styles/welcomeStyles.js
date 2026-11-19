import { StyleSheet } from "react-native";

export const welcomeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FAF4",
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  image: {
    width: "85%",
    height: 280,
    marginBottom: 32,
  },

  title: {
    color: "#245C35",
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },

  subtitle: {
    color: "#66736A",
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 32,
  },

  button: {
    width: "50%",
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});
