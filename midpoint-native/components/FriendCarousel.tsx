import React, { useState } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { UserPlus } from 'lucide-react-native';
import { Avatar, AvatarFallback, AvatarImage } from './ui/Avatar';
import { selectionHaptic } from '../utils/haptics';
import { Friend } from '../utils/types';

interface FriendCarouselProps {
  onFriendsChange: (friends: Friend[]) => void;
}

export function FriendCarousel({ onFriendsChange }: FriendCarouselProps) {
  // Mock friends list - in real app, this would come from contacts/API
  const [allFriends] = useState<Friend[]>([
    { id: '1', name: 'Sarah', phone: '(555) 234-5678', avatar: '' },
    { id: '2', name: 'Mike', phone: '(555) 345-6789', avatar: '' },
    { id: '3', name: 'Emma', phone: '(555) 456-7890', avatar: '' },
    { id: '4', name: 'Alex', phone: '(555) 567-8901', avatar: '' },
    { id: '5', name: 'John', phone: '(555) 678-9012', avatar: '' },
    { id: '6', name: 'Lisa', phone: '(555) 789-0123', avatar: '' },
    { id: '7', name: 'Tom', phone: '(555) 890-1234', avatar: '' },
    { id: '8', name: 'Amy', phone: '(555) 901-2345', avatar: '' },
  ]);

  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());

  const toggleFriend = (friend: Friend) => {
    selectionHaptic();
    const newSelected = new Set(selectedFriends);
    if (newSelected.has(friend.id)) {
      newSelected.delete(friend.id);
    } else {
      newSelected.add(friend.id);
    }
    setSelectedFriends(newSelected);
    
    // Update parent with selected friends
    const selected = allFriends.filter(f => newSelected.has(f.id));
    onFriendsChange(selected);
  };

  const renderFriend = ({ item: friend }: { item: Friend }) => {
    const isSelected = selectedFriends.has(friend.id);
    
    return (
      <Pressable
        onPress={() => toggleFriend(friend)}
        className="items-center w-20"
        style={({ pressed }) => ({
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <View className="relative">
          <Avatar
            className={`w-16 h-16 transition-all duration-200 ${
              isSelected
                ? 'ring-4 ring-secondary shadow-lg scale-105'
                : 'ring-2 ring-border'
            }`}
          >
            <AvatarImage src={friend.avatar} alt={friend.name} />
            <AvatarFallback
              className={`transition-colors ${
                isSelected
                  ? 'bg-secondary text-secondary-foreground'
                  : 'bg-muted'
              }`}
            >
              <Text className="text-sm font-medium">
                {friend.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </Text>
            </AvatarFallback>
          </Avatar>
          {isSelected && (
            <View className="absolute -top-1 -right-1 w-6 h-6 bg-secondary rounded-full items-center justify-center shadow-lg">
              <Text className="text-xs text-secondary-foreground font-bold">✓</Text>
            </View>
          )}
        </View>
        <Text
          className={`text-sm text-center mt-2 transition-colors ${
            isSelected ? 'text-secondary' : 'text-foreground'
          }`}
          numberOfLines={1}
        >
          {friend.name}
        </Text>
      </Pressable>
    );
  };

  const renderAddButton = () => (
    <Pressable
      onPress={() => {}}
      className="items-center w-20"
      style={({ pressed }) => ({
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <View className="w-16 h-16 rounded-full border-2 border-dashed border-secondary bg-secondary/5 items-center justify-center">
        <UserPlus size={24} color="#2563eb" />
      </View>
      <Text className="text-sm text-center text-secondary mt-2">
        Add
      </Text>
    </Pressable>
  );

  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-secondary font-medium">Invite Friends</Text>
        <Text className="text-sm text-muted-foreground">
          {selectedFriends.size} selected
        </Text>
      </View>

      <FlatList
        data={[...allFriends, { id: 'add', name: 'Add', phone: '', avatar: '' }]}
        renderItem={({ item }) => 
          item.id === 'add' ? renderAddButton() : renderFriend({ item })
        }
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
      />
    </View>
  );
}
