import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Dimensions, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, UserPlus, Search, MapPin } from 'lucide-react-native';
import { Avatar, AvatarFallback } from '../components/ui/Avatar';
import { successHaptic } from '../utils/haptics';
import { colors, colorOpacity } from '../constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.25;

// Mock friends data
const mockFriends = [
  {
    id: '1',
    name: 'Sarah Johnson',
    phone: '(555) 234-5678',
    initials: 'SJ',
  },
  {
    id: '2',
    name: 'Mike Chen',
    phone: '(555) 345-6789',
    initials: 'MC',
  },
  {
    id: '3',
    name: 'Emma Davis',
    phone: '(555) 456-7890',
    initials: 'ED',
  },
  {
    id: '4',
    name: 'Alex Martinez',
    phone: '(555) 567-8901',
    initials: 'AM',
  },
];

export default function AddFriendsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());

  const toggleFriend = (friendId: string) => {
    successHaptic();
    const newSelected = new Set(selectedFriends);
    if (newSelected.has(friendId)) {
      newSelected.delete(friendId);
    } else {
      newSelected.add(friendId);
    }
    setSelectedFriends(newSelected);
  };

  const handleContinue = () => {
    successHaptic();
    // TODO: Navigate to next page or save selected friends
    router.back();
  };

  const handleAddNewFriend = () => {
    successHaptic();
    // TODO: Open modal or navigate to add new friend form
    console.log('Add New Friend');
  };

  const filteredFriends = mockFriends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.phone.includes(searchQuery)
  );

  const selectedCount = selectedFriends.size;

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
              <View style={styles.headerIconInner}>
                <View style={styles.personIcon}>
                  <View style={styles.personHead} />
                  <View style={styles.personBody} />
                </View>
                <View style={styles.pinIconOverlay}>
                  <MapPin size={14} color={colors.icon.white} fill={colors.icon.white} strokeWidth={2} />
                </View>
              </View>
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Add Friends</Text>
              <Text style={styles.headerSubtitle}>
                Select friends to meet with
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
          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Search size={20} color={colors.icon.muted} />
            <TextInput
              placeholder="Search friends..."
              placeholderTextColor={colors.mutedForeground}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              autoCapitalize="none"
            />
          </View>

          {/* Friends List */}
          <View style={styles.friendsList}>
            {filteredFriends.map((friend) => {
              const isSelected = selectedFriends.has(friend.id);
              return (
                <Pressable
                  key={friend.id}
                  onPress={() => toggleFriend(friend.id)}
                  style={({ pressed }) => [
                    styles.friendCard,
                    isSelected && styles.friendCardSelected,
                    { opacity: pressed ? 0.9 : 1 },
                  ]}
                >
                  <View style={styles.friendCardContent}>
                    <Avatar className="w-12 h-12">
                      <AvatarFallback style={styles.avatarFallback}>
                        <Text style={styles.avatarText}>{friend.initials}</Text>
                      </AvatarFallback>
                    </Avatar>
                    <View style={styles.friendInfo}>
                      <Text style={styles.friendName}>{friend.name}</Text>
                      <Text style={styles.friendPhone}>{friend.phone}</Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Add New Friend Button */}
          <Pressable
            onPress={handleAddNewFriend}
            style={({ pressed }) => [
              styles.addNewFriendButton,
              { opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <UserPlus size={20} color={colors.icon.muted} />
            <Text style={styles.addNewFriendText}>Add New Friend</Text>
          </Pressable>
        </ScrollView>

        {/* Continue Button */}
        <View style={styles.continueButtonContainer}>
          <Pressable
            onPress={handleContinue}
            style={({ pressed }) => [
              styles.continueButton,
              { opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <LinearGradient
              colors={colors.gradients.header}
              style={styles.continueButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.continueButtonText}>
                Continue with {selectedCount} {selectedCount === 1 ? 'friend' : 'friends'}
              </Text>
            </LinearGradient>
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
    position: 'relative',
  },
  headerIconInner: {
    position: 'relative',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  personIcon: {
    position: 'relative',
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  personHead: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.icon.white,
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
  },
  personBody: {
    width: 16,
    height: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.icon.white,
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
  },
  pinIconOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colorOpacity.white['20'],
    borderRadius: 8,
    padding: 2,
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.foreground,
  },
  friendsList: {
    gap: 12,
    marginBottom: 16,
  },
  friendCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  friendCardSelected: {
    borderColor: colors.secondary,
    borderWidth: 2,
    backgroundColor: colorOpacity.secondary['5'],
  },
  friendCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarFallback: {
    backgroundColor: colors.muted,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.foreground,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.foreground,
    marginBottom: 4,
  },
  friendPhone: {
    fontSize: 14,
    color: colors.mutedForeground,
  },
  addNewFriendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
    marginBottom: 16,
  },
  addNewFriendText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.foreground,
  },
  continueButtonContainer: {
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
  continueButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  continueButtonGradient: {
    width: '100%',
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
  },
});

