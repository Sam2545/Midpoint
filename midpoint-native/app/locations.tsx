import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Plus, X, Search, ArrowLeft } from 'lucide-react-native';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Avatar, AvatarFallback } from '../components/ui/Avatar';
import { Separator } from '../components/ui/Separator';
import { FriendCarousel } from '../components/FriendCarousel';
import { ActivitySelector } from '../components/ActivitySelector';
import { Friend, LocationEntry } from '../utils/types';
import { successHaptic } from '../utils/haptics';

export default function LocationsPage() {
  const [activity, setActivity] = useState('restaurants');
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>([]);
  const [locations, setLocations] = useState<LocationEntry[]>([
    { id: 'me', personName: 'Me', location: '', isMe: true }
  ]);

  // Update locations when friends change
  useEffect(() => {
    setLocations([
      { id: 'me', personName: 'Me', location: '', isMe: true },
      ...selectedFriends.map(f => ({ id: f.id, personName: f.name, location: '' }))
    ]);
  }, [selectedFriends]);

  const handleFriendsChange = (friends: Friend[]) => {
    setSelectedFriends(friends);
  };

  const updateLocation = (id: string, value: string) => {
    setLocations(locations.map(loc =>
      loc.id === id ? { ...loc, location: value } : loc
    ));
  };

  const addMoreLocation = () => {
    setLocations([
      ...locations,
      { id: `extra-${Date.now()}`, personName: 'Additional Person', location: '' }
    ]);
  };

  const removeLocation = (id: string) => {
    if (id !== 'me') {
      setLocations(locations.filter(loc => loc.id !== id));
    }
  };

  const handleSearch = () => {
    successHaptic();
    router.push({
      pathname: '/map',
      params: { activity }
    });
  };

  const isValid = locations.every(loc => loc.location.trim() !== '');

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={['#dbeafe', '#fef3c7']}
            className="flex-1"
          >
            <View className="flex-1 items-center justify-center p-4">
              <View className="w-full max-w-md bg-background rounded-2xl shadow-xl overflow-hidden border-2 border-secondary/20">
                {/* Header */}
                <LinearGradient
                  colors={['#c2410c', '#2563eb']}
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
                  <View className="flex-row items-center gap-3">
                    <View className="bg-white/20 p-3 rounded-xl">
                      <MapPin size={32} color="white" />
                    </View>
                    <View>
                      <Text className="text-2xl font-semibold text-white">Plan Your Meetup</Text>
                      <Text className="text-white/80 text-sm">Invite friends & set locations</Text>
                    </View>
                  </View>
                </LinearGradient>

                {/* Content */}
                <View className="p-6 -mt-6">
                  {/* Friend Carousel */}
                  <FriendCarousel onFriendsChange={handleFriendsChange} />

                  <Separator className="mb-6" />

                  {/* Locations List */}
                  <View className="space-y-4 mb-6">
                    {locations.map((loc, index) => (
                      <Card key={loc.id} className="overflow-hidden border-secondary/20">
                        <CardContent className="p-4">
                          <View className="flex-row items-start gap-3">
                            <Avatar className="w-10 h-10 mt-1 ring-2 ring-secondary/50">
                              <AvatarFallback className="bg-secondary/10 text-secondary">
                                <Text className="text-sm font-medium">
                                  {loc.isMe ? '👤' : loc.personName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </Text>
                              </AvatarFallback>
                            </Avatar>
                            <View className="flex-1 space-y-2">
                              <Text className="text-sm text-secondary font-medium">{loc.personName}</Text>
                              <Input
                                placeholder="Enter location or address"
                                value={loc.location}
                                onChangeText={(value) => updateLocation(loc.id, value)}
                                className="bg-input-background border-secondary/30 focus:border-secondary"
                                autoComplete="street-address"
                              />
                            </View>
                            {!loc.isMe && (
                              <Pressable
                                onPress={() => removeLocation(loc.id)}
                                className="p-2 mt-1"
                                style={({ pressed }) => ({
                                  opacity: pressed ? 0.8 : 1,
                                })}
                              >
                                <X size={16} color="#64748b" />
                              </Pressable>
                            )}
                          </View>
                        </CardContent>
                      </Card>
                    ))}
                  </View>

                  {/* Add More Button */}
                  <Button
                    variant="outline"
                    className="w-full mb-6 border-secondary text-secondary"
                    onPress={addMoreLocation}
                  >
                    <Plus size={16} color="#2563eb" />
                    <Text className="ml-2 text-secondary">Add More Location</Text>
                  </Button>

                  <Separator className="mb-6" />

                  {/* Activity Selector */}
                  <View className="mb-6">
                    <ActivitySelector selected={activity} onSelect={setActivity} />
                  </View>

                  {/* Search Button */}
                  <Button
                    onPress={handleSearch}
                    className="w-full h-12"
                    size="lg"
                    disabled={!isValid}
                  >
                    <Search size={20} color="white" />
                    <Text className="ml-2 text-primary-foreground">Find Midpoint</Text>
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
