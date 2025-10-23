import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Coffee, ShoppingBag, Utensils } from "lucide-react-native";
import { selectionHaptic } from "../utils/haptics";

interface ActivitySelectorProps {
  selected: string;
  onSelect: (activity: string) => void;
}

export function ActivitySelector({
  selected,
  onSelect,
}: ActivitySelectorProps) {
  const activities = [
    { id: "restaurants", label: "Restaurants", icon: Utensils },
    { id: "shopping", label: "Shopping", icon: ShoppingBag },
    { id: "cafes", label: "Cafes", icon: Coffee },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity Type</Text>
      <View style={styles.activitiesContainer}>
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
              style={({ pressed }) => [
                styles.activityButton,
                isSelected
                  ? styles.activityButtonSelected
                  : styles.activityButtonUnselected,
                { opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Icon size={24} color={isSelected ? "white" : "#64748b"} />
              <Text
                style={[
                  styles.activityText,
                  isSelected
                    ? styles.activityTextSelected
                    : styles.activityTextUnselected,
                ]}
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

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1e293b",
    marginBottom: 12,
  },
  activitiesContainer: {
    flexDirection: "row",
    gap: 12,
  },
  activityButton: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  activityButtonSelected: {
    backgroundColor: "#c2410c",
    borderColor: "#c2410c",
  },
  activityButtonUnselected: {
    backgroundColor: "#ffffff",
    borderColor: "#e2e8f0",
  },
  activityText: {
    fontSize: 14,
    fontWeight: "500",
  },
  activityTextSelected: {
    color: "white",
  },
  activityTextUnselected: {
    color: "#1e293b",
  },
});
