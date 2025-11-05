import { StyleSheet } from "react-native";
import { Colors } from "./Colors";

export const sharedStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex1: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },

  // Card styles
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: Colors.background,
    borderRadius: 16,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: Colors.borderSecondary,
  },

  // Header styles
  header: {
    padding: 24,
    paddingBottom: 32,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 12,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.white,
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
  },

  // Form styles
  formContent: {
    padding: 24,
    marginTop: -24,
  },
  form: {
    gap: 24,
  },

  // Profile/Avatar styles
  profileSection: {
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginTop: 4,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.backgroundMuted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: Colors.white,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarText: {
    fontSize: 24,
  },
  avatarTextSmall: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.secondary,
  },
  cameraButton: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 20,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadText: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 12,
  },

  // Input styles
  inputSection: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: Colors.borderSecondaryMedium,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.backgroundLight,
    fontSize: 16,
  },
  locationInput: {
    height: 40,
    borderWidth: 1,
    borderColor: Colors.borderSecondaryMedium,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.backgroundLight,
    fontSize: 16,
  },
  locationInputContainer: {
    flex: 1,
    gap: 8,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textMuted,
  },

  // Button styles
  submitButton: {
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "500",
  },
  searchButton: {
    width: "100%",
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  searchButtonDisabled: {
    opacity: 0.5,
  },
  removeButton: {
    padding: 8,
    marginTop: 4,
  },

  // Location card styles
  locationsList: {
    marginBottom: 24,
    gap: 16,
  },
  locationCard: {
    marginBottom: 16,
  },
  locationCardContainer: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderSecondaryLight,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  // Other component styles
  addMoreButtonContainer: {
    marginBottom: 24,
  },
  activitySection: {
    marginBottom: 24,
  },
});
