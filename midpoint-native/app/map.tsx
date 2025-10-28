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

  const renderPlace = ({ item: place }: { item: PlaceDetails }) => (
    <Card className="overflow-hidden border-secondary/20 mb-3">
      <CardContent className="p-4">
        {/* Place Header */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-foreground mb-1">
              {place.name}
            </Text>
            <View className="flex-row items-center gap-2">
              {place.rating && (
                <View className="flex-row items-center gap-1">
                  <Star size={14} color="#fbbf24" fill="#fbbf24" />
                  <Text className="text-sm font-medium">{place.rating}</Text>
                </View>
              )}
              {place.priceLevel && (
                <Text className="text-sm text-muted-foreground">
                  {place.priceLevel}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Address */}
        <View className="flex-row items-start gap-2 mb-3">
          <MapPin size={16} color="#64748b" className="mt-0.5" />
          <Text className="text-sm text-muted-foreground flex-1">
            {place.address}
          </Text>
        </View>

        {/* Distance */}
        {place.distance && (
          <View className="flex-row items-center gap-2 mb-3">
            <Navigation size={16} color="#64748b" />
            <Text className="text-sm text-muted-foreground">
              {place.distance} away
            </Text>
          </View>
        )}

        {/* Travel Times */}
        {place.travelSummaries && place.travelSummaries.length > 0 && (
          <View className="mb-3">
            <Text className="text-sm font-medium text-foreground mb-2">
              Travel Times:
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {place.travelSummaries.map((summary, index) => (
                <Badge key={index} variant="secondary" className="px-2 py-1">
                  <Text className="text-xs">
                    {summary.mode}: {summary.duration}
                  </Text>
                </Badge>
              ))}
            </View>
          </View>
        )}

        {/* Photos */}
        {place.photos && place.photos.length > 0 && (
          <View className="mb-3">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {place.photos.slice(0, 3).map((photo, index) => (
                  <View
                    key={index}
                    className="w-20 h-20 bg-secondary/20 rounded-lg overflow-hidden"
                  >
                    {photo.url ? (
                      <Image
                        source={{ uri: photo.url }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-full h-full items-center justify-center">
                        <ImageIcon size={24} color="#64748b" />
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
          className="w-full"
        >
          <Text className="text-white font-medium">View Details</Text>
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
        <View className="px-6 py-4 bg-white">
          <View className="flex-row items-center gap-3 mb-3">
            <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center">
              <MapPin size={24} color="#667eea" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold">Midpoint Location</Text>
              <Text className="text-muted-foreground">
                Perfect spot for {activity}
              </Text>
            </View>
          </View>

          {/* Midpoint Address */}
          <View className="mb-3">
            <Text className="text-sm font-medium text-foreground mb-1">
              Address:
            </Text>
            <Text className="text-muted-foreground">
              {data.midpointAddress || "Calculated midpoint location"}
            </Text>
          </View>

          {/* Search Radius */}
          <View className="mb-3">
            <Text className="text-sm font-medium text-foreground mb-1">
              Search Radius:
            </Text>
            <Text className="text-muted-foreground">
              Within {data.searchRadiusMiles?.toFixed(1) || "5.0"} miles
            </Text>
          </View>

          <Text className="text-muted-foreground">
            We found the ideal meeting point based on everyone's locations. Here
            are some great options nearby:
          </Text>
        </View>

        {/* Places List */}
        <View className="px-6 py-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold">
              Nearby {activity.charAt(0).toUpperCase() + activity.slice(1)}
            </Text>
            <Badge variant="secondary">
              <Text className="text-xs">{data.places?.length || 0} found</Text>
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
