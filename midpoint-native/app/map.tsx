import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  MapPin,
  Star,
  Users,
  Share2,
  Navigation,
  ImageIcon,
  AlertCircle,
  Loader2,
} from "lucide-react-native";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Avatar, AvatarFallback } from "../components/ui/Avatar";
import { Place, MidpointResponse, PlaceDetails } from "../utils/types";
import { successHaptic } from "../utils/haptics";

export default function MidpointMapPage() {
  const { activity, midpointData } = useLocalSearchParams<{
    activity: string;
    midpointData?: string;
  }>();

  const [data, setData] = useState<MidpointResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (midpointData) {
      try {
        const parsedData = JSON.parse(midpointData);
        setData(parsedData);
        console.log("✅ Received midpoint data:", parsedData);
      } catch (error) {
        console.error("Error parsing midpoint data:", error);
        setError("Invalid data received");
      }
    } else {
      setError("No midpoint data provided");
    }
  }, [midpointData]);

  const handleShare = () => {
    successHaptic();
    router.push("/poll");
  };

  // Format distance to readable format
  const formatDistance = (distance: string | number | undefined): string => {
    if (!distance) return "";
    const dist = typeof distance === "string" ? parseFloat(distance) : distance;
    if (isNaN(dist)) return "";

    if (dist < 1) {
      // Convert to feet if less than 1 mile
      const feet = dist * 5280;
      return `${Math.round(feet)} ft away`;
    } else if (dist < 10) {
      // Show 1 decimal place for short distances
      return `${dist.toFixed(1)} mi away`;
    } else {
      // Show whole number for longer distances
      return `${Math.round(dist)} mi away`;
    }
  };

  const renderPlace = ({ item: place }: { item: PlaceDetails }) => (
    <Card className="overflow-hidden border-secondary/20 mb-4 shadow-sm bg-white">
      <CardContent className="p-5">
        {/* Place Header */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1 pr-2">
            <Text className="text-xl font-bold text-foreground mb-2">
              {place.name}
            </Text>
            <View className="flex-row items-center gap-3">
              {place.rating && (
                <View className="flex-row items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                  <Star size={16} color="#f59e0b" fill="#f59e0b" />
                  <Text className="text-sm font-semibold text-foreground">
                    {place.rating}
                  </Text>
                </View>
              )}
              {place.priceLevel && (
                <Badge variant="secondary" className="px-2 py-1">
                  <Text className="text-xs font-medium">
                    {place.priceLevel}
                  </Text>
                </Badge>
              )}
            </View>
          </View>
        </View>

        {/* Address */}
        <View className="flex-row items-start gap-2 mb-3 bg-gray-50 p-2 rounded-lg">
          <MapPin size={16} color="#667eea" className="mt-0.5" />
          <Text className="text-sm text-foreground flex-1 leading-5">
            {place.address}
          </Text>
        </View>

        {/* Distance */}
        {place.distance && (
          <View className="flex-row items-center gap-2 mb-3">
            <View className="bg-blue-100 p-2 rounded-full">
              <Navigation size={14} color="#667eea" />
            </View>
            <Text className="text-sm font-medium text-foreground">
              {formatDistance(place.distance)}
            </Text>
          </View>
        )}

        {/* Travel Times */}
        {place.travelSummaries && place.travelSummaries.length > 0 && (
          <View className="mb-3 pt-3 border-t border-gray-200">
            <Text className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
              Travel Times
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {place.travelSummaries.map((summary, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="px-3 py-1.5 bg-blue-50 border-blue-200"
                >
                  <Text className="text-xs font-medium text-blue-700">
                    {summary.mode}: {summary.duration}
                  </Text>
                </Badge>
              ))}
            </View>
          </View>
        )}

        {/* Photos */}
        {place.photos && place.photos.length > 0 && (
          <View className="mb-4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-3">
                {place.photos.slice(0, 3).map((photo, index) => (
                  <View
                    key={index}
                    className="w-24 h-24 bg-secondary/20 rounded-xl overflow-hidden border border-gray-200"
                  >
                    {photo.url ? (
                      <Image
                        source={{ uri: photo.url }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-full h-full items-center justify-center bg-gray-100">
                        <ImageIcon size={24} color="#9ca3af" />
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Action Button */}
        <Button
          onPress={() => {
            successHaptic();
            // TODO: Add navigation to place details or directions
          }}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
          style={{
            backgroundColor: "#667eea",
            borderRadius: 12,
            paddingVertical: 14,
          }}
        >
          <Text className="text-white font-semibold text-base">
            View Details
          </Text>
        </Button>
      </CardContent>
    </Card>
  );

  // Loading state
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#667eea" />
          <Text className="text-lg font-medium mt-4 text-foreground">
            Finding your perfect midpoint...
          </Text>
          <Text className="text-sm text-muted-foreground mt-2 text-center px-8">
            Calculating the best location and searching for nearby places
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-6">
          <AlertCircle size={64} color="#ef4444" />
          <Text className="text-xl font-semibold mt-4 text-foreground text-center">
            Oops! Something went wrong
          </Text>
          <Text className="text-sm text-muted-foreground mt-2 text-center">
            {error || "No midpoint data available"}
          </Text>
          <Button onPress={() => router.back()} className="mt-6">
            <Text className="text-white font-medium">Go Back</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient colors={["#667eea", "#764ba2"]} className="px-6 py-4">
          <View className="flex-row items-center justify-between">
            <Pressable
              onPress={() => router.back()}
              className="p-2 rounded-full bg-white/20"
            >
              <ArrowLeft size={20} color="white" />
            </Pressable>
            <Text className="text-white text-lg font-semibold">
              Midpoint Found!
            </Text>
            <Pressable
              onPress={handleShare}
              className="p-2 rounded-full bg-white/20"
            >
              <Share2 size={20} color="white" />
            </Pressable>
          </View>
        </LinearGradient>

        {/* Midpoint Info */}
        <View className="px-6 py-5 bg-white border-b border-gray-100">
          <View className="flex-row items-center gap-4 mb-4">
            <View
              className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full items-center justify-center shadow-md"
              style={{ backgroundColor: "#667eea" }}
            >
              <MapPin size={28} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-foreground">
                Midpoint Location
              </Text>
              <Text className="text-muted-foreground mt-1">
                Perfect spot for{" "}
                {activity.charAt(0).toUpperCase() + activity.slice(1)}
              </Text>
            </View>
          </View>

          {/* Midpoint Address */}
          <View className="mb-4 p-3 bg-gray-50 rounded-xl">
            <Text className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
              Address
            </Text>
            <Text className="text-base text-foreground font-medium">
              {data.midpointAddress || "Calculated midpoint location"}
            </Text>
          </View>

          {/* Search Radius */}
          <View className="mb-4 flex-row items-center justify-between p-3 bg-blue-50 rounded-xl">
            <View>
              <Text className="text-xs font-semibold text-blue-700 mb-1 uppercase tracking-wide">
                Search Radius
              </Text>
              <Text className="text-base text-blue-900 font-semibold">
                Within {data.searchRadiusMiles?.toFixed(1) || "5.0"} miles
              </Text>
            </View>
            <View className="w-12 h-12 bg-blue-200 rounded-full items-center justify-center">
              <Navigation size={20} color="#1e40af" />
            </View>
          </View>

          <View className="pt-3 border-t border-gray-200">
            <Text className="text-sm text-muted-foreground leading-5">
              We found the ideal meeting point based on everyone's locations.
              Here are some great options nearby:
            </Text>
          </View>
        </View>

        {/* Places List */}
        <View className="px-6 py-5 bg-gray-50">
          <View className="flex-row items-center justify-between mb-5">
            <View>
              <Text className="text-2xl font-bold text-foreground">
                Nearby {activity.charAt(0).toUpperCase() + activity.slice(1)}
              </Text>
              <Text className="text-sm text-muted-foreground mt-1">
                Sorted by distance from midpoint
              </Text>
            </View>
            <Badge
              variant="secondary"
              className="bg-blue-100 border-blue-300 px-3 py-1.5"
            >
              <Text className="text-sm font-bold text-blue-700">
                {data.places?.length || 0} found
              </Text>
            </Badge>
          </View>

          {data.places && data.places.length > 0 ? (
            <FlatList
              data={data.places}
              renderItem={renderPlace}
              keyExtractor={(item) => item.placeId}
              scrollEnabled={false}
              nestedScrollEnabled={true}
            />
          ) : (
            <View className="items-center py-8">
              <MapPin size={48} color="#64748b" />
              <Text className="text-lg font-medium mt-4 text-foreground">
                No places found
              </Text>
              <Text className="text-sm text-muted-foreground mt-2 text-center">
                Try expanding your search radius or selecting a different
                activity type
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
