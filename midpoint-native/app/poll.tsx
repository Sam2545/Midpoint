import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  MapPin,
  ThumbsUp,
  MessageSquare,
  Save,
} from "lucide-react-native";
import { Avatar, AvatarFallback } from "../components/ui/Avatar";
import { Vote } from "../utils/types";
import { successHaptic } from "../utils/haptics";
import { colors, colorOpacity } from "../constants/theme";
import { EventsService } from "../lib/events";
import { Friend } from "../utils/types";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.25;

// Mock data
const mockVotes: Vote[] = [
  {
    userId: "1",
    userName: "Sarah Johnson",
    status: "confirmed",
    timestamp: "2 mins ago",
  },
  {
    userId: "2",
    userName: "Mike Chen",
    status: "suggested",
    suggestion: "How about The Oak Restaurant instead? It's closer to me.",
    timestamp: "5 mins ago",
  },
];

export default function ConfirmMidpointPage() {
  const params = useLocalSearchParams<{
    midpointData?: string;
    activity?: string;
    selectedFriends?: string; // JSON stringified array of friend IDs
  }>();

  // Parse midpoint data from params
  const midpointData = params.midpointData
    ? JSON.parse(params.midpointData)
    : null;
  const activity = params.activity || "restaurants";

  // Get selected place (use first place from midpoint data, or default)
  const selectedPlace = midpointData?.places?.[0] || null;
  const midpointLocation = {
    name: selectedPlace?.name || "Midpoint Location",
    address:
      selectedPlace?.address ||
      midpointData?.midpoint_address ||
      "Address not available",
  };

  // Parse selected friends (for now, we'll use empty array if not provided)
  // TODO: Get this from params when map.tsx is updated to pass friends
  const selectedFriends: Friend[] = params.selectedFriends
    ? JSON.parse(params.selectedFriends)
    : [];

  const [votes, setVotes] = useState<Vote[]>(mockVotes);
  const [myVote, setMyVote] = useState<"confirmed" | "suggested" | null>(null);
  const [mySuggestion, setMySuggestion] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [eventSaved, setEventSaved] = useState(false);

  // TODO: Get current user ID from auth/storage
  // For now, using a placeholder - replace with actual user ID retrieval
  const getCurrentUserId = async (): Promise<string> => {
    // TODO: Replace with actual user ID from auth/storage
    // This is a placeholder - you'll need to implement user authentication
    return "current-user-id-placeholder";
  };

  const handleConfirm = () => {
    successHaptic();
    setMyVote("confirmed");
    setMySuggestion("");
  };

  const handleSuggest = () => {
    successHaptic();
    setMyVote("suggested");
    // In a real app, this would open a modal or navigate to a suggestion form
    // For now, we'll just set the status
  };

  const handleSaveEvent = async () => {
    try {
      setIsSaving(true);
      successHaptic();

      const currentUserId = await getCurrentUserId();

      // Get all invited user IDs (selected friends + current user)
      const invitedUserIds = [
        currentUserId,
        ...selectedFriends.map((friend) => friend.id),
      ];

      // Create event with midpoint location
      const { data: event, error } = await EventsService.createEvent(
        midpointLocation.name, // Event title = place name
        midpointLocation.address, // Location
        currentUserId,
        invitedUserIds
      );

      if (error) {
        Alert.alert(
          "Error",
          error.message || "Failed to save event. Please try again."
        );
        setIsSaving(false);
        return;
      }

      if (event) {
        setEventSaved(true);
        Alert.alert(
          "Event Saved!",
          "Your event has been saved and invitations have been sent.",
          [
            {
              text: "OK",
              onPress: () => {
                // Optionally navigate to events page
                // router.push('/events');
              },
            },
          ]
        );
      }
    } catch (error: any) {
      console.error("Error saving event:", error);
      Alert.alert("Error", "Failed to save event. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate confirmed count (excluding current user if not confirmed)
  const confirmedCount =
    votes.filter((v) => v.status === "confirmed").length +
    (myVote === "confirmed" ? 1 : 0);
  const totalParticipants = votes.length + 1; // +1 for current user

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header Section with Gradient */}
        <LinearGradient
          colors={colors.gradients.header}
          style={styles.headerSection}
        >
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              { opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <ArrowLeft size={24} color={colors.icon.white} />
          </Pressable>

          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <MapPin size={28} color={colors.icon.white} strokeWidth={2} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Confirm Midpoint</Text>
              <Text style={styles.headerSubtitle}>
                Vote or suggest alternatives
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Body Section */}
        <ScrollView
          style={styles.bodySection}
          contentContainerStyle={styles.bodyScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Midpoint Location Card */}
          <View style={styles.midpointCard}>
            <View style={styles.midpointHeader}>
              <View style={styles.midpointIconContainer}>
                <MapPin size={20} color={colors.secondary} />
              </View>
              <View style={styles.midpointInfo}>
                <Text style={styles.midpointName}>{midpointLocation.name}</Text>
                <Text style={styles.midpointAddress}>
                  {midpointLocation.address}
                </Text>
                <Text style={styles.midpointLabel}>Midpoint location</Text>
              </View>
            </View>

            {/* Group Confirmation Progress */}
            <View style={styles.confirmationSection}>
              <View style={styles.confirmationHeader}>
                <Text style={styles.confirmationLabel}>Group confirmation</Text>
                <Text style={styles.confirmationCount}>
                  {confirmedCount}/{totalParticipants} confirmed
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <LinearGradient
                  colors={colors.gradients.header}
                  style={[
                    styles.progressBar,
                    { width: `${(confirmedCount / totalParticipants) * 100}%` },
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
            </View>
          </View>

          {/* Your Response Section */}
          {!myVote && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Response</Text>
              <View style={styles.responseButtons}>
                <Pressable
                  onPress={handleConfirm}
                  style={({ pressed }) => [
                    styles.responseButton,
                    { opacity: pressed ? 0.9 : 1 },
                  ]}
                >
                  <ThumbsUp size={24} color={colors.secondary} />
                  <Text style={styles.responseButtonText}>Confirm</Text>
                </Pressable>
                <Pressable
                  onPress={handleSuggest}
                  style={({ pressed }) => [
                    styles.responseButton,
                    { opacity: pressed ? 0.9 : 1 },
                  ]}
                >
                  <MessageSquare size={24} color={colors.secondary} />
                  <Text style={styles.responseButtonText}>Suggest New</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* My Vote Status */}
          {myVote === "confirmed" && (
            <View style={styles.section}>
              <View style={styles.myVoteCard}>
                <View style={styles.myVoteContent}>
                  <View style={styles.myVoteIconContainer}>
                    <ThumbsUp size={20} color={colors.secondary} />
                  </View>
                  <Text style={styles.myVoteText}>
                    You confirmed this location
                  </Text>
                </View>
              </View>
            </View>
          )}

          {myVote === "suggested" && (
            <View style={styles.section}>
              <View style={styles.myVoteCard}>
                <View style={styles.myVoteContent}>
                  <View style={styles.myVoteIconContainer}>
                    <MessageSquare size={20} color={colors.primary} />
                  </View>
                  <Text style={styles.myVoteText}>
                    You suggested an alternative
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Group Responses Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Group Responses</Text>
            {votes.map((vote) => (
              <View key={vote.userId} style={styles.responseCard}>
                <View style={styles.responseCardContent}>
                  <View style={styles.responseAvatarContainer}>
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-muted">
                        <Text style={styles.avatarText}>
                          {getInitials(vote.userName)}
                        </Text>
                      </AvatarFallback>
                    </Avatar>
                  </View>
                  <View style={styles.responseInfo}>
                    <View style={styles.responseHeader}>
                      <Text style={styles.responseName}>{vote.userName}</Text>
                      {vote.status === "confirmed" && (
                        <View style={styles.statusBadge}>
                          <ThumbsUp size={12} color={colors.icon.white} />
                          <Text style={styles.statusBadgeText}>Confirmed</Text>
                        </View>
                      )}
                      {vote.status === "suggested" && (
                        <View
                          style={[
                            styles.statusBadge,
                            styles.statusBadgeSuggested,
                          ]}
                        >
                          <MessageSquare size={12} color={colors.icon.white} />
                          <Text style={styles.statusBadgeText}>Suggested</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.responseTimestamp}>
                      {vote.timestamp}
                    </Text>
                    {vote.suggestion && (
                      <View style={styles.suggestionBubble}>
                        <Text style={styles.suggestionText}>
                          {vote.suggestion}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Save Event Button - Show after user confirms */}
          {myVote === "confirmed" && !eventSaved && (
            <View style={styles.section}>
              <Pressable
                onPress={handleSaveEvent}
                disabled={isSaving}
                style={({ pressed }) => [
                  styles.saveButton,
                  (isSaving || pressed) && styles.saveButtonDisabled,
                  { opacity: pressed ? 0.9 : 1 },
                ]}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <>
                    <Save size={20} color={colors.icon.white} />
                    <Text style={styles.saveButtonText}>Save Event</Text>
                  </>
                )}
              </Pressable>
            </View>
          )}

          {/* Event Saved Confirmation */}
          {eventSaved && (
            <View style={styles.section}>
              <View style={styles.savedCard}>
                <View style={styles.savedContent}>
                  <View style={styles.savedIconContainer}>
                    <Save size={20} color={colors.secondary} />
                  </View>
                  <Text style={styles.savedText}>
                    Event saved successfully!
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
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
  },
  headerSection: {
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 24,
    height: HEADER_HEIGHT,
    minHeight: 180,
    maxHeight: 220,
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    flex: 1,
    justifyContent: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colorOpacity.white["20"],
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colorOpacity.white["80"],
    fontWeight: "400",
  },
  bodySection: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bodyScrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.foreground,
    marginBottom: 16,
  },
  midpointCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  midpointHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },
  midpointIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colorOpacity.secondary["10"],
    justifyContent: "center",
    alignItems: "center",
  },
  midpointInfo: {
    flex: 1,
  },
  midpointName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.secondary,
    marginBottom: 4,
  },
  midpointAddress: {
    fontSize: 14,
    color: colors.mutedForeground,
    marginBottom: 4,
  },
  midpointLabel: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "500",
  },
  confirmationSection: {
    marginTop: 12,
  },
  confirmationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  confirmationLabel: {
    fontSize: 14,
    color: colors.mutedForeground,
  },
  confirmationCount: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: "500",
  },
  progressBarContainer: {
    width: "100%",
    height: 8,
    backgroundColor: colors.muted,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  responseButtons: {
    flexDirection: "row",
    gap: 12,
  },
  responseButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  responseButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.secondary,
  },
  myVoteCard: {
    backgroundColor: colorOpacity.secondary["10"],
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colorOpacity.secondary["20"],
  },
  myVoteContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  myVoteIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    justifyContent: "center",
    alignItems: "center",
  },
  myVoteText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.foreground,
  },
  responseCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  responseCardContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  responseAvatarContainer: {
    marginTop: 2,
  },
  avatarFallback: {
    backgroundColor: colors.muted,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.foreground,
  },
  responseInfo: {
    flex: 1,
  },
  responseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
    flexWrap: "wrap",
  },
  responseName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.foreground,
  },
  statusBadge: {
    backgroundColor: colors.secondary,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusBadgeSuggested: {
    backgroundColor: colors.primary,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.white,
  },
  responseTimestamp: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginBottom: 8,
  },
  suggestionBubble: {
    backgroundColor: colorOpacity.primary["20"],
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
  },
  suggestionText: {
    fontSize: 14,
    color: colors.foreground,
    lineHeight: 20,
  },
  saveButton: {
    width: "100%",
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  saveButtonDisabled: {
    backgroundColor: colors.muted,
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
  savedCard: {
    backgroundColor: colorOpacity.secondary["10"],
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colorOpacity.secondary["20"],
  },
  savedContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  savedIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    justifyContent: "center",
    alignItems: "center",
  },
  savedText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.foreground,
  },
});
