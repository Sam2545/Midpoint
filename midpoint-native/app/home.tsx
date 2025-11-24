import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft, Plus, Calendar, UserPlus } from "lucide-react-native";
import { colors } from "../constants/theme";
import { successHaptic } from "../utils/haptics";
import Navbar from "../components/Navbar";

export default function HomeScreen() {
  const handlePlanHangout = () => {
    successHaptic();
    router.push("/locations");
  };

  const handleViewEvents = () => {
    successHaptic();
    router.push("/events");
  };

  const handleAddFriends = () => {
    successHaptic();
    router.push("/add-friends");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.content}>
        {/* Back Button */}
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            { opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <ArrowLeft size={24} color={colors.foreground} />
        </Pressable>

        {/* Buttons Section - Centered */}
        <View style={styles.buttonsContainer}>
          {/* Plan a Hangout Button */}
          <Pressable
            onPress={handlePlanHangout}
            style={({ pressed }) => [
              styles.primaryButton,
              { opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <Plus size={20} color={colors.icon.white} />
            <Text style={styles.primaryButtonText}>Plan a Hangout</Text>
          </Pressable>

          {/* View Existing Events Button */}
          <Pressable
            onPress={handleViewEvents}
            style={({ pressed }) => [
              styles.outlineButton,
              styles.primaryOutlineButton,
              { opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <Calendar size={20} color={colors.primary} />
            <Text style={styles.primaryOutlineButtonText}>
              View Existing Events
            </Text>
          </Pressable>

          {/* Add Friends Button */}
          <Pressable
            onPress={handleAddFriends}
            style={({ pressed }) => [
              styles.outlineButton,
              styles.secondaryOutlineButton,
              { opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <UserPlus size={20} color={colors.secondary} />
            <Text style={styles.secondaryOutlineButtonText}>Add Friends</Text>
          </Pressable>
        </View>
      </View>
      <Navbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
    marginBottom: 40,
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: "center",
    gap: 16,
    maxWidth: 400,
    alignSelf: "center",
    width: "100%",
  },
  primaryButton: {
    width: "100%",
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    gap: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.white,
  },
  outlineButton: {
    width: "100%",
    height: 56,
    backgroundColor: colors.card,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    gap: 12,
    borderWidth: 2,
  },
  primaryOutlineButton: {
    borderColor: colors.primary,
  },
  primaryOutlineButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.primary,
  },
  secondaryOutlineButton: {
    borderColor: colors.secondary,
  },
  secondaryOutlineButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.secondary,
  },
});
