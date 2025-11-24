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
  Linking,
  Platform,
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
  Calendar,
  Clock,
  Navigation,
} from "lucide-react-native";
import { Avatar, AvatarFallback } from "../components/ui/Avatar";
import { Vote } from "../utils/types";
import { successHaptic } from "../utils/haptics";
import { colors, colorOpacity } from "../constants/theme";
import { EventsService } from "../lib/events";
import { AuthService } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { Friend } from "../utils/types";
import { FriendsService } from "../lib/friends";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.25;

export default function ConfirmMidpointPage() {
  const params = useLocalSearchParams<{
    eventId?: string;
    midpointData?: string;
    activity?: string;
    selectedFriends?: string; // JSON stringified array of friend IDs
  }>();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [myInvitationStatus, setMyInvitationStatus] = useState<
    "accepted" | "declined" | "pending" | null
  >(null);
  const [allInvitations, setAllInvitations] = useState<any[]>([]);
  const [friendInvitations, setFriendInvitations] = useState<any[]>([]);

  // Get current user ID
  const getCurrentUserId = async (): Promise<string> => {
    // First, check if user ID was set during login (stored in FriendsService)
    const storedUserId = FriendsService.getCurrentUserId();
    if (storedUserId) {
      return storedUserId;
    }

    // Try to get authenticated user from Supabase Auth (if using Supabase Auth)
    const authResult = await AuthService.getCurrentUser();
    if (authResult.profile?.id) {
      // Store it for future use
      FriendsService.setCurrentUserId(authResult.profile.id);
      return authResult.profile.id;
    }

    // If no user found, throw an error instead of using a random user
    throw new Error("User not logged in. Please log in to continue.");
  };

  // Fetch event data if eventId is provided (viewing existing event)
  useEffect(() => {
    const fetchEventData = async () => {
      if (params.eventId) {
        try {
          setLoading(true);

          // Fetch event with details
          const { data: eventData, error } =
            await EventsService.getEventWithDetails(params.eventId);

          if (error) {
            console.error("Error fetching event:", error);
            Alert.alert("Error", "Failed to load event details.");
            setLoading(false);
            return;
          }

          if (eventData) {
            setEvent(eventData);
            setAllInvitations(eventData.invitations || []);

            // Get current user ID and friends
            const currentUserId = await getCurrentUserId();

            // Get friends list
            const { data: friendsData } = await FriendsService.getFriends();
            if (friendsData) {
              // Map friends to include name property
              const mappedFriends: Friend[] = friendsData.map((f) => ({
                ...f,
                name:
                  f.first_name && f.last_name
                    ? `${f.first_name} ${f.last_name}`
                    : f.username || "Unknown",
              }));
              setFriends(mappedFriends);

              // Filter invitations to only show friends
              const friendIds = new Set(friendsData.map((f) => f.id));
              const filtered = (eventData.invitations || []).filter(
                (inv: any) => friendIds.has(inv.user_id)
              );
              setFriendInvitations(filtered);
            } else {
              setFriendInvitations([]);
            }

            // Find current user's invitation status
            const myInvitation = (eventData.invitations || []).find(
              (inv: any) => inv.user_id === currentUserId
            );
            if (myInvitation) {
              setMyInvitationStatus(
                myInvitation.status as "accepted" | "declined" | "pending"
              );
            }
          }
        } catch (err) {
          console.error("Error fetching event:", err);
          Alert.alert("Error", "Failed to load event details.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchEventData();
  }, [params.eventId]);

  // Parse midpoint data from params (for creating new event)
  const midpointData = params.midpointData
    ? JSON.parse(params.midpointData)
    : null;
  const activity = params.activity || "restaurants";

  // Get location from event (if viewing) or midpoint data (if creating)
  const selectedPlace = event
    ? { name: event.title, address: event.location }
    : midpointData?.places?.[0] || null;

  const midpointLocation = {
    name: event?.title || selectedPlace?.name || "Midpoint Location",
    address:
      event?.location ||
      selectedPlace?.address ||
      midpointData?.midpoint_address ||
      "Address not available",
  };

  // Parse selected friends (for now, we'll use empty array if not provided)
  const selectedFriends: Friend[] = params.selectedFriends
    ? JSON.parse(params.selectedFriends)
    : [];

  const [isSaving, setIsSaving] = useState(false);
  const [eventSaved, setEventSaved] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Convert invitations to Vote format for display
  const votes: Vote[] = friendInvitations
    .filter(
      (inv: any) => inv.status === "accepted" || inv.status === "declined"
    )
    .map((inv: any) => {
      const user = inv.user || {};
      const userName =
        user.first_name && user.last_name
          ? `${user.first_name} ${user.last_name}`
          : user.username || "Unknown";

      const respondedAt = inv.responded_at
        ? new Date(inv.responded_at)
        : new Date();
      const minutesAgo = Math.floor(
        (Date.now() - respondedAt.getTime()) / 60000
      );
      const timestamp =
        minutesAgo < 1
          ? "Just now"
          : minutesAgo < 60
          ? `${minutesAgo} ${minutesAgo === 1 ? "min" : "mins"} ago`
          : `${Math.floor(minutesAgo / 60)} ${
              Math.floor(minutesAgo / 60) === 1 ? "hour" : "hours"
            } ago`;

      return {
        userId: inv.user_id,
        userName,
        status: inv.status === "accepted" ? "confirmed" : "suggested",
        timestamp,
      };
    });

  const handleConfirm = async () => {
    if (!params.eventId) {
      // For new events, just set local state
      successHaptic();
      setMyInvitationStatus("accepted");
      return;
    }

    try {
      setIsUpdatingStatus(true);
      successHaptic();

      const currentUserId = await getCurrentUserId();
      const { data, error } = await EventsService.updateInvitationStatus(
        params.eventId,
        currentUserId,
        "accepted"
      );

      if (error) {
        console.error("Error updating invitation status:", error);
        Alert.alert("Error", "Failed to update your response.");
        setIsUpdatingStatus(false);
        return;
      }

      setMyInvitationStatus("accepted");

      // Refresh event data
      const { data: eventData } = await EventsService.getEventWithDetails(
        params.eventId
      );
      if (eventData) {
        setAllInvitations(eventData.invitations || []);
        const friendIds = new Set(friends.map((f) => f.id));
        const filtered = (eventData.invitations || []).filter((inv: any) =>
          friendIds.has(inv.user_id)
        );
        setFriendInvitations(filtered);
      }
    } catch (error: any) {
      console.error("Error confirming:", error);
      Alert.alert("Error", "Failed to update your response.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDecline = async () => {
    if (!params.eventId) {
      // For new events, just set local state
      successHaptic();
      setMyInvitationStatus("declined");
      return;
    }

    try {
      setIsUpdatingStatus(true);
      successHaptic();

      const currentUserId = await getCurrentUserId();
      const { data, error } = await EventsService.updateInvitationStatus(
        params.eventId,
        currentUserId,
        "declined"
      );

      if (error) {
        console.error("Error updating invitation status:", error);
        Alert.alert("Error", "Failed to update your response.");
        setIsUpdatingStatus(false);
        return;
      }

      setMyInvitationStatus("declined");

      // Refresh event data
      const { data: eventData } = await EventsService.getEventWithDetails(
        params.eventId
      );
      if (eventData) {
        setAllInvitations(eventData.invitations || []);
        const friendIds = new Set(friends.map((f) => f.id));
        const filtered = (eventData.invitations || []).filter((inv: any) =>
          friendIds.has(inv.user_id)
        );
        setFriendInvitations(filtered);
      }
    } catch (error: any) {
      console.error("Error declining:", error);
      Alert.alert("Error", "Failed to update your response.");
    } finally {
      setIsUpdatingStatus(false);
    }
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

  // Calculate confirmed count from actual database data
  const acceptedCount = allInvitations.filter(
    (inv: any) => inv.status === "accepted"
  ).length;
  const totalParticipants = allInvitations.length;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const openAddressInMaps = (address: string) => {
    successHaptic();
    
    // Encode the address for URL
    const encodedAddress = encodeURIComponent(address);
    
    // Try to open in Apple Maps first on iOS, then fallback to Google Maps
    if (Platform.OS === 'ios') {
      const appleMapsUrl = `maps://maps.apple.com/?q=${encodedAddress}`;
      Linking.openURL(appleMapsUrl).catch(() => {
        // Fallback to Google Maps if Apple Maps fails
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
        Linking.openURL(googleMapsUrl).catch((err) => {
          console.error("Failed to open maps:", err);
        });
      });
    } else {
      // Android - use Google Maps
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      Linking.openURL(googleMapsUrl).catch((err) => {
        console.error("Failed to open Google Maps:", err);
      });
    }
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
                <View style={styles.addressRow}>
                  <Text style={styles.midpointAddress} numberOfLines={2}>
                    {midpointLocation.address}
                  </Text>
                  <Pressable
                    onPress={() => openAddressInMaps(midpointLocation.address)}
                    style={({ pressed }) => [
                      styles.shareButton,
                      { opacity: pressed ? 0.7 : 1 },
                    ]}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Navigation size={18} color={colors.secondary} />
                  </Pressable>
                </View>
                <Text style={styles.midpointLabel}>Midpoint location</Text>
              </View>
            </View>

            {/* Date and Time Display */}
            {(event?.date || event?.time) && (
              <View style={styles.dateTimeSection}>
                {event.date && (
                  <View style={styles.dateTimeItem}>
                    <View style={styles.dateTimeIconContainer}>
                      <Calendar size={16} color={colors.icon.muted} />
                    </View>
                    <Text style={styles.dateTimeText}>{event.date}</Text>
                  </View>
                )}
                {event.time && (
                  <View style={styles.dateTimeItem}>
                    <View style={styles.dateTimeIconContainer}>
                      <Clock size={16} color={colors.icon.muted} />
                    </View>
                    <Text style={styles.dateTimeText}>{event.time}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Group Confirmation Progress */}
            <View style={styles.confirmationSection}>
              <View style={styles.confirmationHeader}>
                <Text style={styles.confirmationLabel}>Group confirmation</Text>
                <Text style={styles.confirmationCount}>
                  {acceptedCount}/{totalParticipants} confirmed
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <LinearGradient
                  colors={colors.gradients.header}
                  style={[
                    styles.progressBar,
                    {
                      width: `${
                        totalParticipants > 0
                          ? (acceptedCount / totalParticipants) * 100
                          : 0
                      }%`,
                    },
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
            </View>
          </View>

          {/* Your Response Section */}
          {myInvitationStatus !== "accepted" &&
            myInvitationStatus !== "declined" && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Your Response</Text>
                <View style={styles.responseButtons}>
                  <Pressable
                    onPress={handleConfirm}
                    disabled={isUpdatingStatus}
                    style={({ pressed }) => [
                      styles.responseButton,
                      { opacity: pressed || isUpdatingStatus ? 0.7 : 1 },
                    ]}
                  >
                    <ThumbsUp size={24} color={colors.secondary} />
                    <Text style={styles.responseButtonText}>Confirm</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleDecline}
                    disabled={isUpdatingStatus}
                    style={({ pressed }) => [
                      styles.responseButton,
                      { opacity: pressed || isUpdatingStatus ? 0.7 : 1 },
                    ]}
                  >
                    <MessageSquare size={24} color={colors.secondary} />
                    <Text style={styles.responseButtonText}>Decline</Text>
                  </Pressable>
                </View>
              </View>
            )}

          {/* My Vote Status */}
          {myInvitationStatus === "accepted" && (
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
                <Pressable
                  onPress={handleDecline}
                  disabled={isUpdatingStatus}
                  style={({ pressed }) => [
                    styles.changeButton,
                    { opacity: pressed || isUpdatingStatus ? 0.7 : 1 },
                  ]}
                >
                  <Text style={styles.changeButtonText}>Change to Decline</Text>
                </Pressable>
              </View>
            </View>
          )}

          {myInvitationStatus === "declined" && (
            <View style={styles.section}>
              <View style={styles.myVoteCard}>
                <View style={styles.myVoteContent}>
                  <View style={styles.myVoteIconContainer}>
                    <MessageSquare size={20} color={colors.primary} />
                  </View>
                  <Text style={styles.myVoteText}>
                    You declined this location
                  </Text>
                </View>
                <Pressable
                  onPress={handleConfirm}
                  disabled={isUpdatingStatus}
                  style={({ pressed }) => [
                    styles.changeButton,
                    { opacity: pressed || isUpdatingStatus ? 0.7 : 1 },
                  ]}
                >
                  <Text style={styles.changeButtonText}>Change to Accept</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Group Responses Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Group Responses</Text>
            {votes.length === 0 ? (
              <View style={styles.emptyResponsesContainer}>
                <Text style={styles.emptyResponsesText}>
                  No responses yet. Friends will appear here once they respond.
                </Text>
              </View>
            ) : (
              votes.map((vote) => (
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
                            <Text style={styles.statusBadgeText}>
                              Confirmed
                            </Text>
                          </View>
                        )}
                        {vote.status === "suggested" && (
                          <View
                            style={[
                              styles.statusBadge,
                              styles.statusBadgeSuggested,
                            ]}
                          >
                            <MessageSquare
                              size={12}
                              color={colors.icon.white}
                            />
                            <Text style={styles.statusBadgeText}>Declined</Text>
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
              ))
            )}
          </View>

          {/* Loading State */}
          {loading && (
            <View style={styles.section}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading event details...</Text>
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
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 4,
  },
  midpointAddress: {
    fontSize: 14,
    color: colors.mutedForeground,
    flex: 1,
  },
  shareButton: {
    padding: 4,
    marginTop: -2,
  },
  midpointLabel: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "500",
  },
  dateTimeSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  dateTimeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateTimeIconContainer: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  dateTimeText: {
    fontSize: 14,
    color: colors.foreground,
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
  changeButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignSelf: "flex-start",
  },
  changeButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.primary,
  },
  loadingText: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: "center",
    marginTop: 12,
  },
  emptyResponsesContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyResponsesText: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: "center",
  },
});
