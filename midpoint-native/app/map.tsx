import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  MapPin,
  Star,
  Users,
  Share2,
  Navigation,
} from "lucide-react-native";
import { Avatar, AvatarFallback } from "../components/ui/Avatar";
import { successHaptic } from "../utils/haptics";
import { colors, colorOpacity } from "../constants/theme";

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.25;

// Mock restaurant data
const mockRestaurants = [
  {
    id: "1",
    name: "The Garden Bistro",
    rating: 4.5,
    distance: "0.2 mi",
    goingCount: 3,
    address: "123 Main St",
    peopleGoing: ["A", "B", "C"],
  },
  {
    id: "2",
    name: "Midtown Grill",
    rating: 4.7,
    distance: "0.3 mi",
    goingCount: 5,
    address: "456 Center Ave",
    peopleGoing: [],
  },
  {
    id: "3",
    name: "Café Central",
    rating: 4.3,
    distance: "0.4 mi",
    goingCount: 2,
    address: "789 Park Blvd",
    peopleGoing: ["D", "E"],
  },
];

export default function MidpointMapPage() {
  const handleShare = () => {
    successHaptic();
    router.push("/poll");
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
              <Text style={styles.headerTitle}>Midpoint Found</Text>
              <Text style={styles.headerSubtitle}>
                Central location results
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
          {/* Map Visualization Card */}
          <View style={styles.mapCard}>
            {/* People Nearby Badge */}
            <View style={styles.peopleBadge}>
              <Users size={14} color={colors.icon.white} />
              <Text style={styles.peopleBadgeText}>10 people nearby</Text>
            </View>

            {/* Map Grid Background */}
            <View style={styles.mapGrid}>
              {/* Central Marker */}
              <View style={styles.centralMarker}>
                <LinearGradient
                  colors={colors.gradients.header}
                  style={styles.centralMarkerGradient}
                >
                  <MapPin size={20} color={colors.icon.white} fill={colors.icon.white} />
                </LinearGradient>
              </View>

              {/* Nearby Markers */}
              <View style={[styles.nearbyMarker, styles.marker1]}>
                <View style={styles.nearbyMarkerCircle}>
                  <Star size={12} color={colors.icon.white} fill={colors.icon.white} />
                </View>
              </View>
              <View style={[styles.nearbyMarker, styles.marker2]}>
                <View style={styles.nearbyMarkerCircle}>
                  <Star size={12} color={colors.icon.white} fill={colors.icon.white} />
                </View>
              </View>
              <View style={[styles.nearbyMarker, styles.marker3]}>
                <View style={styles.nearbyMarkerCircle}>
                  <Star size={12} color={colors.icon.white} fill={colors.icon.white} />
                </View>
              </View>
            </View>
          </View>

          {/* Nearby Restaurants Section */}
          <View style={styles.restaurantsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Nearby Restaurants</Text>
              <View style={styles.placesBadge}>
                <Text style={styles.placesBadgeText}>{mockRestaurants.length} places</Text>
              </View>
            </View>

            {/* Restaurant Cards */}
            {mockRestaurants.map((restaurant) => (
              <View key={restaurant.id} style={styles.restaurantCard}>
                {/* Restaurant Header */}
                <View style={styles.restaurantHeader}>
                  <Text style={styles.restaurantName}>{restaurant.name}</Text>
                  <View style={styles.ratingContainer}>
                    <Star size={16} color={colors.primary} fill={colors.primary} />
                    <Text style={styles.ratingText}>{restaurant.rating}</Text>
                  </View>
                </View>

                {/* Restaurant Details */}
                <View style={styles.restaurantDetails}>
                  <View style={styles.detailRow}>
                    <Navigation size={16} color={colors.icon.muted} />
                    <Text style={styles.detailText}>{restaurant.distance}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Users size={16} color={colors.icon.muted} />
                    <Text style={styles.detailText}>{restaurant.goingCount} going</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MapPin size={16} color={colors.icon.muted} />
                    <Text style={styles.detailText}>{restaurant.address}</Text>
                  </View>
                </View>

                {/* People Going */}
                {restaurant.peopleGoing.length > 0 && (
                  <View style={styles.peopleGoingContainer}>
                    <View style={styles.peopleAvatars}>
                      {restaurant.peopleGoing.map((initial, index) => (
                        <View key={index} style={styles.avatarCircle}>
                          <Text style={styles.avatarText}>{initial}</Text>
                        </View>
                      ))}
                    </View>
                    <Text style={styles.peopleGoingText}>
                      {restaurant.peopleGoing.length} people are also going here
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Share Button */}
        <View style={styles.shareButtonContainer}>
          <Pressable
            onPress={handleShare}
            style={({ pressed }) => [
              styles.shareButton,
              { opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <Share2 size={20} color={colors.icon.white} />
            <Text style={styles.shareButtonText}>Share Midpoint with Group</Text>
          </Pressable>
        </View>
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
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colorOpacity.white['20'],
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colorOpacity.white['80'],
    fontWeight: '400',
  },
  bodySection: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bodyScrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 100,
  },
  mapCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    height: 200,
    position: 'relative',
    overflow: 'hidden',
  },
  peopleBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.secondary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 10,
  },
  peopleBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.white,
  },
  mapGrid: {
    flex: 1,
    backgroundColor: colorOpacity.secondary['10'],
    borderRadius: 8,
    position: 'relative',
    // Create a grid pattern effect with borders
    borderWidth: 1,
    borderColor: colorOpacity.secondary['20'],
  },
  centralMarker: {
    position: 'absolute',
    top: '40%',
    left: '45%',
    width: 48,
    height: 48,
    borderRadius: 24,
    zIndex: 5,
  },
  centralMarkerGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  nearbyMarker: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    zIndex: 4,
  },
  marker1: {
    top: '25%',
    left: '35%',
  },
  marker2: {
    top: '55%',
    left: '30%',
  },
  marker3: {
    top: '35%',
    right: '25%',
  },
  nearbyMarkerCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  restaurantsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
  },
  placesBadge: {
    backgroundColor: colors.secondary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  placesBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.white,
  },
  restaurantCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 12,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.foreground,
  },
  restaurantDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.mutedForeground,
  },
  peopleGoingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  peopleAvatars: {
    flexDirection: 'row',
    gap: -8,
  },
  avatarCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.muted,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.card,
  },
  avatarText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.foreground,
  },
  peopleGoingText: {
    fontSize: 14,
    color: colors.mutedForeground,
    flex: 1,
  },
  shareButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 20,
    paddingTop: 12,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  shareButton: {
    width: '100%',
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  shareButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
  },
});
