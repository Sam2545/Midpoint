import React, { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
  Image,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { WebView } from "react-native-webview";
import { environment } from "../config/environment";
import {
  ArrowLeft,
  MapPin,
  Star,
  Users,
  Share2,
  Navigation,
  ExternalLink,
} from "lucide-react-native";
import { Avatar, AvatarFallback } from "../components/ui/Avatar";
import { successHaptic } from "../utils/haptics";
import { colors, colorOpacity } from "../constants/theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.25;

export default function MidpointMapPage() {
  const params = useLocalSearchParams<{
    activity?: string;
    midpointData?: string;
  }>();
  const midpointData = params.midpointData
    ? JSON.parse(params.midpointData)
    : null;
  const activity = params.activity || "restaurants";

  // Default center (San Francisco) - will be updated with actual midpoint data
  const center =
    midpointData?.midpoint?.lat && midpointData?.midpoint?.lng
      ? { lat: midpointData.midpoint.lat, lng: midpointData.midpoint.lng }
      : midpointData?.midpointLat && midpointData?.midpointLng
      ? { lat: midpointData.midpointLat, lng: midpointData.midpointLng }
      : { lat: 37.78825, lng: -122.4324 };

  // Check if API key is available
  const apiKey = environment.GOOGLE_MAPS_API_KEY;
  console.log("🗺️ Map API Key:", apiKey ? "Set" : "NOT SET");

  // Generate HTML for Google Maps
  const mapHtml = useMemo(() => {
    const key = environment.GOOGLE_MAPS_API_KEY || "";
    if (!key) {
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { 
                margin: 0; 
                padding: 0; 
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                font-family: Arial, sans-serif;
                background: #f0f0f0;
              }
              .error {
                text-align: center;
                color: #666;
                padding: 20px;
              }
            </style>
          </head>
          <body>
            <div class="error">
              <h3>Google Maps API Key Not Set</h3>
              <p>Please set EXPO_PUBLIC_GOOGLE_MAPS_API_KEY in your environment</p>
            </div>
          </body>
        </html>
      `;
    }

    // Prepare markers data
    const markers: Array<{
      lat: number;
      lng: number;
      title: string;
      icon: string;
    }> = [];
    if (midpointData?.places) {
      midpointData.places.forEach((place: any, index: number) => {
        if (place.coordinates?.lat && place.coordinates?.lng) {
          markers.push({
            lat: place.coordinates.lat,
            lng: place.coordinates.lng,
            title: place.name || `Place ${index + 1}`,
            icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
          });
        }
      });
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              html, body { 
                width: 100%; 
                height: 100%; 
                margin: 0; 
                padding: 0; 
                overflow: hidden;
              }
              #map { 
                width: 100%; 
                height: 100vh; 
                min-height: 200px;
              }
            </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            function initMap() {
              console.log('🗺️ Initializing Google Maps...');
              const center = { lat: ${center.lat}, lng: ${center.lng} };
              const mapElement = document.getElementById('map');
              
              if (!mapElement) {
                console.error('❌ Map element not found!');
                return;
              }
              
              console.log('📍 Center:', center);
              const map = new google.maps.Map(mapElement, {
                zoom: 13,
                center: center,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                gestureHandling: 'greedy'
              });
              
              console.log('✅ Map initialized successfully');

              // Add midpoint marker
              new google.maps.Marker({
                position: center,
                map: map,
                title: 'Midpoint',
                icon: {
                  url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                  scaledSize: new google.maps.Size(40, 40)
                }
              });

              // Add place markers
              const markers = ${JSON.stringify(markers)};
              markers.forEach(marker => {
                new google.maps.Marker({
                  position: { lat: marker.lat, lng: marker.lng },
                  map: map,
                  title: marker.title,
                  icon: marker.icon
                });
              });

              // Fit bounds to show all markers
              if (markers.length > 0) {
                const bounds = new google.maps.LatLngBounds();
                bounds.extend(center);
                markers.forEach(m => bounds.extend({ lat: m.lat, lng: m.lng }));
                map.fitBounds(bounds);
              }
            }
          </script>
          <script async defer
            src="https://maps.googleapis.com/maps/api/js?key=${key}&callback=initMap">
          </script>
          <script>
            // Error handling
            window.addEventListener('error', function(e) {
              console.error('❌ Map error:', e.message, e.filename, e.lineno);
              const mapEl = document.getElementById('map');
              if (mapEl) {
                mapEl.innerHTML = '<div style="padding: 20px; text-align: center; color: #f00; background: #fee;">Error: ' + e.message + '</div>';
              }
            });
            
            // Log when Google Maps script loads
            window.gm_authFailure = function() {
              console.error('❌ Google Maps authentication failed - check your API key');
              const mapEl = document.getElementById('map');
              if (mapEl) {
                mapEl.innerHTML = '<div style="padding: 20px; text-align: center; color: #f00; background: #fee;">Google Maps API Key Error - Please check your API key</div>';
              }
            };
            
            // Timeout fallback
            setTimeout(function() {
              if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
                console.error('❌ Google Maps failed to load after 10 seconds');
                const mapEl = document.getElementById('map');
                if (mapEl) {
                  mapEl.innerHTML = '<div style="padding: 20px; text-align: center; color: #666; background: #f0f0f0;">Failed to load Google Maps. Please check your API key and internet connection.</div>';
                }
              }
            }, 10000);
            
            // Debug: Log script loading
            console.log('🗺️ Google Maps script tag added, waiting for callback...');
          </script>
        </body>
      </html>
    `;
  }, [center, midpointData, apiKey]);

  // Get places from midpoint data or use empty array
  const places = midpointData?.places || [];

  // Helper function to open Google Maps
  const openGoogleMaps = (place: any) => {
    if (place.coordinates?.lat && place.coordinates?.lng) {
      const url = `https://www.google.com/maps/search/?api=1&query=${place.coordinates.lat},${place.coordinates.lng}`;
      Linking.openURL(url).catch((err) => {
        console.error("Failed to open Google Maps:", err);
      });
    } else if (place.place_id) {
      const url = `https://www.google.com/maps/place/?q=place_id:${place.place_id}`;
      Linking.openURL(url).catch((err) => {
        console.error("Failed to open Google Maps:", err);
      });
    }
  };

  // Helper to format distance
  const formatDistance = (distanceMeters: number | undefined) => {
    if (!distanceMeters) return "";
    if (distanceMeters < 1000) {
      return `${Math.round(distanceMeters)} m`;
    }
    return `${(distanceMeters / 1000).toFixed(1)} km`;
  };

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

            {/* Google Maps WebView */}
            <WebView
              source={{ html: mapHtml }}
              style={styles.map}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              scalesPageToFit={true}
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
              originWhitelist={["*"]}
              mixedContentMode="always"
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.error("WebView error:", nativeEvent);
              }}
              onHttpError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.error("WebView HTTP error:", nativeEvent.statusCode);
              }}
              onLoadEnd={() => {
                console.log("🗺️ Map WebView loaded");
              }}
            />
          </View>

          {/* Nearby Places Section */}
          <View style={styles.restaurantsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Nearby Places</Text>
              <View style={styles.placesBadge}>
                <Text style={styles.placesBadgeText}>
                  {places.length} places
                </Text>
              </View>
            </View>

            {/* Place Cards */}
            {places.length > 0 ? (
              places.map((place: any, index: number) => (
                <View
                  key={place.place_id || index}
                  style={styles.restaurantCard}
                >
                  {/* Place Image */}
                  {place.photos &&
                    place.photos.length > 0 &&
                    place.photos[0].url && (
                      <Image
                        source={{ uri: place.photos[0].url }}
                        style={styles.placeImage}
                        resizeMode="cover"
                      />
                    )}

                  {/* Place Header */}
                  <View style={styles.restaurantHeader}>
                    <View style={styles.nameContainer}>
                      <Text style={styles.restaurantName} numberOfLines={2}>
                        {place.name || "Unknown Place"}
                      </Text>
                      {place.rating && (
                        <View style={styles.ratingContainer}>
                          <Star
                            size={16}
                            color={colors.primary}
                            fill={colors.primary}
                          />
                          <Text style={styles.ratingText}>
                            {place.rating.toFixed(1)}
                          </Text>
                        </View>
                      )}
                    </View>
                    {/* Google Maps Link */}
                    <Pressable
                      onPress={() => openGoogleMaps(place)}
                      style={({ pressed }) => [
                        styles.mapsButton,
                        { opacity: pressed ? 0.7 : 1 },
                      ]}
                    >
                      <ExternalLink size={20} color={colors.primary} />
                    </Pressable>
                  </View>

                  {/* Place Details */}
                  {place.address && (
                    <View style={styles.restaurantDetails}>
                      <View style={styles.detailRow}>
                        <MapPin size={16} color={colors.icon.muted} />
                        <Text style={styles.detailText} numberOfLines={2}>
                          {place.address}
                        </Text>
                      </View>
                      {place.distance && (
                        <View style={styles.detailRow}>
                          <Navigation size={16} color={colors.icon.muted} />
                          <Text style={styles.detailText}>
                            {formatDistance(place.distance)}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No places found near the midpoint
                </Text>
              </View>
            )}
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
            <Text style={styles.shareButtonText}>
              Share Midpoint with Group
            </Text>
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
    paddingBottom: 100,
  },
  mapCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 0,
    marginBottom: 24,
    height: 200,
    position: "relative",
    overflow: "hidden",
  },
  peopleBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: colors.secondary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    zIndex: 10,
  },
  peopleBadgeText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.white,
  },
  map: {
    width: "100%",
    height: "100%",
    minHeight: 200,
    borderRadius: 12,
    backgroundColor: colorOpacity.secondary["10"],
  },
  restaurantsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
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
    fontWeight: "500",
    color: colors.white,
  },
  restaurantCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  placeImage: {
    width: "100%",
    height: 180,
    backgroundColor: colorOpacity.secondary["10"],
  },
  nameContainer: {
    flex: 1,
    marginRight: 12,
  },
  mapsButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colorOpacity.primary["10"],
  },
  emptyState: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.mutedForeground,
    textAlign: "center",
  },
  restaurantHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
    paddingBottom: 12,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.foreground,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: 12,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.foreground,
  },
  restaurantDetails: {
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.mutedForeground,
  },
  peopleGoingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  peopleAvatars: {
    flexDirection: "row",
    gap: -8,
  },
  avatarCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.muted,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.card,
  },
  avatarText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.foreground,
  },
  peopleGoingText: {
    fontSize: 14,
    color: colors.mutedForeground,
    flex: 1,
  },
  shareButtonContainer: {
    position: "absolute",
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
    width: "100%",
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
    fontWeight: "600",
    color: colors.white,
  },
});
