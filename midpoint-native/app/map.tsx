import React from "react";
import { View, Text, ScrollView, FlatList, Pressable } from "react-native";
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
} from "lucide-react-native";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Avatar, AvatarFallback } from "../components/ui/Avatar";
import { Place } from "../utils/types";
import { successHaptic } from "../utils/haptics";

export default function MidpointMapPage() {
  const { activity, locations } = useLocalSearchParams<{
    activity: string;
    locations?: string;
  }>();

  // Parse locations if provided
  let parsedLocations = [];
  try {
    parsedLocations = locations ? JSON.parse(locations) : [];
  } catch (error) {
    console.error("Error parsing locations:", error);
    parsedLocations = [];
  }

  console.log("Received activity:", activity);
  console.log("Received locations:", parsedLocations);

  // Mock places data
  const places: Place[] = [
    {
      id: "1",
      name: "The Garden Bistro",
      rating: 4.5,
      distance: "0.2 mi",
      address: "123 Main St",
      usersGoing: 3,
      lat: 40.758,
      lng: -73.9855,
    },
    {
      id: "2",
      name: "Midtown Grill",
      rating: 4.7,
      distance: "0.3 mi",
      address: "456 Center Ave",
      usersGoing: 5,
      lat: 40.759,
      lng: -73.9845,
    },
    {
      id: "3",
      name: "Fusion Kitchen",
      rating: 4.3,
      distance: "0.4 mi",
      address: "789 Park Blvd",
      usersGoing: 2,
      lat: 40.757,
      lng: -73.9865,
    },
  ];

  const handleShare = () => {
    successHaptic();
    router.push("/poll");
  };

  const renderPlace = ({ item: place }: { item: Place }) => (
    <Card className="overflow-hidden border-secondary/20">
      <CardContent className="p-4">
        <View className="flex-row justify-between items-start mb-2">
          <Text className="flex-1 text-lg font-semibold">{place.name}</Text>
          <View className="flex-row items-center gap-1">
            <Star size={16} color="#fbbf24" fill="#fbbf24" />
            <Text className="text-sm">{place.rating}</Text>
          </View>
        </View>

        <View className="flex-row items-center gap-4 mb-2">
          <View className="flex-row items-center gap-1">
            <Navigation size={16} color="#64748b" />
            <Text className="text-sm text-muted-foreground">
              {place.distance}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Users size={16} color="#64748b" />
            <Text className="text-sm text-muted-foreground">
              {place.usersGoing} going
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2 mb-3">
          <MapPin size={16} color="#64748b" />
          <Text className="text-sm text-muted-foreground">{place.address}</Text>
        </View>

        {/* Users going indicator */}
        <View className="flex-row items-center gap-2 pt-3 border-t border-secondary/20">
          <View className="flex-row -space-x-2">
            {[...Array(Math.min(place.usersGoing, 3))].map((_, i) => (
              <Avatar
                key={i}
                className="w-6 h-6 border-2 border-background ring-1 ring-secondary/30"
              >
                <AvatarFallback className="text-xs bg-secondary/10 text-secondary">
                  <Text className="text-xs">{String.fromCharCode(65 + i)}</Text>
                </AvatarFallback>
              </Avatar>
            ))}
          </View>
          <Text className="text-xs text-secondary">
            {place.usersGoing}{" "}
            {place.usersGoing === 1 ? "person is" : "people are"} also going
            here
          </Text>
        </View>
      </CardContent>
    </Card>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient colors={["#dbeafe", "#fef3c7"]} className="flex-1">
          <View className="flex-1 items-center justify-center p-4">
            <View className="w-full max-w-md bg-background rounded-2xl shadow-xl overflow-hidden border-2 border-secondary/20">
              {/* Header */}
              <LinearGradient
                colors={["#c2410c", "#2563eb"]}
                className="p-6 pb-8"
              >
                <Pressable
                  onPress={() => router.back()}
                  className="mb-4 p-2 -ml-2"
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <ArrowLeft size={20} color="white" />
                </Pressable>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <View className="bg-white/20 p-3 rounded-xl">
                      <MapPin size={32} color="white" />
                    </View>
                    <View>
                      <Text className="text-2xl font-semibold text-white">
                        Midpoint Found
                      </Text>
                      <Text className="text-white/80 text-sm">
                        Central location results
                      </Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>

              {/* Content */}
              <View className="p-6">
                {/* Map Visualization */}
                <Card className="mb-6 overflow-hidden border-2 border-secondary/30">
                  <View className="relative bg-muted h-64 items-center justify-center">
                    {/* Simple map visualization */}
                    <LinearGradient
                      colors={["#dbeafe", "#bfdbfe", "#93c5fd"]}
                      className="absolute inset-0"
                    >
                      {/* Grid pattern to simulate map */}
                      <View
                        className="absolute inset-0 opacity-20"
                        style={{
                          backgroundColor: "transparent",
                          backgroundImage:
                            "linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)",
                          backgroundSize: "20px 20px",
                        }}
                      />

                      {/* Midpoint marker */}
                      <View className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <View className="relative">
                          <View className="absolute inset-0 bg-primary rounded-full animate-ping opacity-30" />
                          <View className="relative bg-primary p-3 rounded-full shadow-lg">
                            <MapPin size={24} color="white" />
                          </View>
                        </View>
                      </View>

                      {/* Place markers with stars */}
                      {places.map((place, index) => {
                        const positions = [
                          { top: "30%", left: "40%" },
                          { top: "50%", left: "65%" },
                          { top: "60%", left: "35%" },
                        ];
                        return (
                          <View
                            key={place.id}
                            className="absolute"
                            style={positions[index]}
                          >
                            <View className="bg-yellow-400 p-2 rounded-full shadow-md">
                              <Star size={16} color="#92400e" fill="#92400e" />
                            </View>
                          </View>
                        );
                      })}
                    </LinearGradient>

                    {/* Map overlay info */}
                    <View className="absolute top-4 right-4">
                      <Badge className="bg-secondary text-secondary-foreground">
                        <Users size={12} color="white" />
                        <Text className="ml-1 text-xs text-secondary-foreground">
                          {places.reduce((sum, p) => sum + p.usersGoing, 0)}{" "}
                          people nearby
                        </Text>
                      </Badge>
                    </View>
                  </View>
                </Card>

                {/* Activity Type Badge */}
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-lg font-semibold">
                    Nearby{" "}
                    {activity === "restaurants"
                      ? "Restaurants"
                      : activity === "shopping"
                      ? "Shopping"
                      : "Cafes"}
                  </Text>
                  <Badge className="bg-secondary text-secondary-foreground">
                    <Text className="text-xs">{places.length} places</Text>
                  </Badge>
                </View>

                {/* Places List */}
                <View className="max-h-[280px] mb-6">
                  <FlatList
                    data={places}
                    renderItem={renderPlace}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={() => (
                      <View style={{ height: 12 }} />
                    )}
                  />
                </View>

                {/* Share Button */}
                <Button onPress={handleShare} className="w-full h-12" size="lg">
                  <Share2 size={20} color="white" />
                  <Text className="ml-2 text-primary-foreground">
                    Share Midpoint with Group
                  </Text>
                </Button>
              </View>
            </View>
          </View>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
}
