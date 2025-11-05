import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MapPin, Plus, X, Search, ArrowLeft } from "lucide-react-native";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card, CardContent } from "../components/ui/Card";
import { Avatar, AvatarFallback } from "../components/ui/Avatar";
import { Separator } from "../components/ui/Separator";
import { FriendCarousel } from "../components/FriendCarousel";
import { ActivitySelector } from "../components/ActivitySelector";
import { LocationInputWithAutocomplete } from "../components/LocationInputWithAutocomplete";
import { Friend, LocationEntry } from "../utils/types";
import { successHaptic } from "../utils/haptics";

export default function LocationsPage() {
  const [activity, setActivity] = useState("restaurants");
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>([]);
  const [locations, setLocations] = useState<LocationEntry[]>([
    { id: "me", personName: "Me", location: "", isMe: true },
  ]);
  const [coordinates, setCoordinates] = useState<{
    [key: string]: { lat: number; lng: number };
  }>({});

  // Update locations when friends change
  useEffect(() => {
    setLocations([
      { id: "me", personName: "Me", location: "", isMe: true },
      ...selectedFriends.map((f) => ({
        id: f.id,
        personName: f.name,
        location: "",
      })),
    ]);
  }, [selectedFriends]);

  const handleFriendsChange = (friends: Friend[]) => {
    setSelectedFriends(friends);
  };

  const updateLocation = (id: string, value: string) => {
    setLocations(
      locations.map((loc) =>
        loc.id === id ? { ...loc, location: value } : loc
      )
    );
  };

  const handlePlaceSelect = async (id: string, place: any) => {
    try {
      // Get coordinates from place details
      const response = await fetch(
        `http://localhost:8080/api/places/details?placeId=${place.place_id}`
      );
      if (response.ok) {
        const placeDetails = await response.json();
        const coords = {
          lat: placeDetails.geometry.location.lat,
          lng: placeDetails.geometry.location.lng,
        };

        setCoordinates((prev) => ({
          ...prev,
          [id]: coords,
        }));

        console.log(`📍 Coordinates for ${id}:`, coords);
      }
    } catch (error) {
      console.error("Error getting place coordinates:", error);
    }
  };

  const addMoreLocation = () => {
    setLocations([
      ...locations,
      {
        id: `extra-${Date.now()}`,
        personName: "Additional Person",
        location: "",
      },
    ]);
  };

  const removeLocation = (id: string) => {
    if (id !== "me") {
      setLocations(locations.filter((loc) => loc.id !== id));
    }
  };

  const handleSearch = async () => {
    console.log("Button pressed!");
    console.log("isValid:", isValid);
    console.log("locations:", locations);
    console.log("coordinates:", coordinates);

    try {
      successHaptic();

      // Get coordinates for all locations
      const coordsArray = locations
        .filter((loc) => coordinates[loc.id])
        .map((loc) => coordinates[loc.id]);

      if (coordsArray.length < 2) {
        alert("Please select valid locations for at least 2 people");
        return;
      }

      // Convert activity to filters
      const getActivityFilters = (activityType: string): string[] => {
        switch (activityType) {
          case "restaurants":
            return ["restaurant"];
          case "cafes":
            return ["cafe"];
          case "shopping":
            return ["shopping_mall", "store"];
          case "entertainment":
            return ["movie_theater", "amusement_park", "zoo"];
          default:
            return ["restaurant", "cafe"];
        }
      };

      // Call backend API
      const request = {
        coords: coordsArray,
        filters: getActivityFilters(activity),
      };

      console.log("🎯 Calling midpoint API:", request);

      const response = await fetch(
        "http://localhost:8080/api/places/midpoint",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Midpoint data received:", data);

        // Navigate to map page with the data
        router.push({
          pathname: "/map",
          params: {
            activity: activity,
            midpointData: JSON.stringify(data),
          },
        });
      } else {
        console.error("❌ API call failed:", response.status);
        alert("Failed to find midpoint. Please try again.");
      }
    } catch (error) {
      console.error("Navigation error:", error);
      alert("Error finding midpoint. Please check your connection.");
    }
  };

  const isValid = locations.every((loc) => loc.location.trim() !== "");

  // Debug validation
  console.log("Validation check:");
  console.log("locations:", locations);
  console.log("isValid:", isValid);
  locations.forEach((loc, index) => {
    console.log(
      `Location ${index}: "${loc.location}" - valid: ${
        loc.location.trim() !== ""
      }`
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex1}
      >
        <ScrollView
          style={styles.flex1}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={["#dbeafe", "#fef3c7"]}
            style={styles.gradient}
          >
            <View style={styles.content}>
              <View style={styles.card}>
                {/* Header */}
                <LinearGradient
                  colors={["#c2410c", "#2563eb"]}
                  style={styles.header}
                >
                  <View style={styles.headerTop}>
                    <Pressable
                      onPress={() => router.back()}
                      style={({ pressed }) => [
                        styles.backButton,
                        { opacity: pressed ? 0.8 : 1 },
                      ]}
                    >
                      <ArrowLeft size={20} color="white" />
                    </Pressable>
                  </View>
                  <View style={styles.headerContent}>
                    <View style={styles.iconContainer}>
                      <MapPin size={32} color="white" />
                    </View>
                    <View>
                      <Text style={styles.title}>Plan Your Meetup</Text>
                      <Text style={styles.subtitle}>
                        Invite friends & set locations
                      </Text>
                    </View>
                  </View>
                </LinearGradient>

                {/* Content */}
                <View style={styles.formContent}>
                  {/* Friend Carousel */}
                  <FriendCarousel onFriendsChange={handleFriendsChange} />

                  <Separator className="mb-6" />

                  {/* Locations List */}
                  <View style={styles.locationsList}>
                    {locations.map((loc, index) => (
                      <View key={loc.id} style={styles.locationCard}>
                        <View style={styles.locationCardContainer}>
                          <View style={styles.locationRow}>
                            <View style={styles.avatarContainer}>
                              <Avatar className="w-10 h-10 ring-2 ring-secondary/50">
                                <AvatarFallback className="bg-secondary/10 text-secondary">
                                  <Text style={styles.avatarText}>
                                    {loc.isMe
                                      ? "👤"
                                      : loc.personName
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")
                                          .slice(0, 2)}
                                  </Text>
                                </AvatarFallback>
                              </Avatar>
                            </View>
                            <View style={styles.locationInputContainer}>
                              <Text style={styles.locationLabel}>
                                {loc.personName}
                              </Text>
                              <LocationInputWithAutocomplete
                                placeholder="Enter location or address"
                                value={loc.location}
                                onChangeText={(value) =>
                                  updateLocation(loc.id, value)
                                }
                                onSelectPlace={(place) =>
                                  handlePlaceSelect(loc.id, place)
                                }
                                style={styles.locationInput}
                                autoComplete="street-address"
                              />
                            </View>
                            {!loc.isMe && (
                              <Pressable
                                onPress={() => removeLocation(loc.id)}
                                style={({ pressed }) => [
                                  styles.removeButton,
                                  { opacity: pressed ? 0.8 : 1 },
                                ]}
                              >
                                <X size={16} color="#64748b" />
                              </Pressable>
                            )}
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>

                  {/* Add More Button */}
                  <View style={styles.addMoreButtonContainer}>
                    <Button
                      variant="outline"
                      className="w-full mb-6 border-secondary text-secondary"
                      onPress={addMoreLocation}
                    >
                      <Plus size={16} color="#2563eb" />
                      <Text className="ml-2 text-secondary">
                        Add More Location
                      </Text>
                    </Button>
                  </View>

                  <Separator className="mb-6" />

                  {/* Activity Selector */}
                  <View style={styles.activitySection}>
                    <ActivitySelector
                      selected={activity}
                      onSelect={setActivity}
                    />
                  </View>

                  {/* Search Button */}
                  <Pressable
                    onPress={handleSearch}
                    disabled={!isValid}
                    style={({ pressed }) => [
                      {
                        width: "100%",
                        height: 56,
                        backgroundColor: isValid ? "#667eea" : "#cbd5e1",
                        borderRadius: 16,
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "row",
                        shadowColor: "#667eea",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: isValid ? 0.3 : 0,
                        shadowRadius: 8,
                        elevation: isValid ? 8 : 0,
                        transform: [{ scale: pressed && isValid ? 0.98 : 1 }],
                        opacity: !isValid ? 0.6 : pressed ? 0.9 : 1,
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={
                        isValid
                          ? ["#667eea", "#764ba2"]
                          : ["#cbd5e1", "#94a3b8"]
                      }
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                        borderRadius: 16,
                      }}
                    />
                    <Search
                      size={22}
                      color="white"
                      style={{ marginRight: 10 }}
                    />
                    <Text
                      style={{
                        color: "white",
                        fontSize: 18,
                        fontWeight: "700",
                        letterSpacing: 0.5,
                      }}
                    >
                      Find Midpoint
                    </Text>
                  </Pressable>

                  {/* Test Button - Remove this after testing */}
                  <Button
                    onPress={() => {
                      console.log("Test button pressed");
                      router.push("/map");
                    }}
                    className="w-full h-12 mt-2"
                    size="lg"
                    variant="outline"
                  >
                    <Text className="text-primary">Test Navigation</Text>
                  </Button>
                </View>
              </View>
            </View>
          </LinearGradient>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
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
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(37, 99, 235, 0.2)",
  },
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
    color: "white",
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
  },
  formContent: {
    padding: 24,
    marginTop: -24,
  },
  locationsList: {
    marginBottom: 24,
    gap: 16,
  },
  locationCard: {
    marginBottom: 16,
  },
  locationCardContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.1)",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  avatarContainer: {
    marginTop: 4,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2563eb",
  },
  locationInputContainer: {
    flex: 1,
    gap: 8,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  locationInput: {
    height: 40,
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.3)",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f8fafc",
    fontSize: 16,
  },
  removeButton: {
    padding: 8,
    marginTop: 4,
  },
  addMoreButtonContainer: {
    marginBottom: 24,
  },
  activitySection: {
    marginBottom: 24,
  },
  searchButton: {
    width: "100%",
    height: 48,
    backgroundColor: "#c2410c",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  searchButtonDisabled: {
    opacity: 0.5,
  },
});
