import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Coffee, ShoppingBag, Utensils } from 'lucide-react-native';
import { selectionHaptic } from '../utils/haptics';

interface ActivitySelectorProps {
  selected: string;
  onSelect: (activity: string) => void;
}

export function ActivitySelector({ selected, onSelect }: ActivitySelectorProps) {
  const activities = [
    { id: 'restaurants', label: 'Restaurants', icon: Utensils },
    { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
    { id: 'cafes', label: 'Cafes', icon: Coffee },
  ];

  return (
    <View className="space-y-3">
      <Text className="text-sm font-medium text-foreground">Activity Type</Text>
      <View className="flex-row gap-3">
        {activities.map((activity) => {
          const Icon = activity.icon;
          const isSelected = selected === activity.id;
          
          return (
            <Pressable
              key={activity.id}
              onPress={() => {
                selectionHaptic();
                onSelect(activity.id);
              }}
              className={`flex-1 flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'bg-primary border-primary'
                  : 'bg-card border-border'
              }`}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Icon 
                size={24} 
                color={isSelected ? 'white' : '#64748b'} 
              />
              <Text 
                className={`text-sm ${
                  isSelected ? 'text-primary-foreground' : 'text-foreground'
                }`}
              >
                {activity.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
