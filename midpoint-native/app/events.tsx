import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Calendar, MapPin, Clock, Users } from 'lucide-react-native';
import { successHaptic } from '../utils/haptics';
import { colors, colorOpacity } from '../constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.25;

// Mock events data
const mockEvents = [
  {
    id: '1',
    title: 'Coffee Meetup',
    location: 'Starbucks Downtown',
    date: 'Oct 25, 2025',
    time: '2:00 PM',
    participants: ['Alex', 'Jordan', 'Taylor'],
    participantCount: 3,
  },
  {
    id: '2',
    title: 'Dinner Plans',
    location: 'The Italian Place',
    date: 'Oct 27, 2025',
    time: '7:00 PM',
    participants: ['Sam', 'Morgan'],
    participantCount: 2,
  },
  {
    id: '3',
    title: 'Weekend Brunch',
    location: 'Sunny Side Cafe',
    date: 'Oct 28, 2025',
    time: '10:00 AM',
    participants: ['Alex', 'Jordan', 'Taylor', 'Sam'],
    participantCount: 4,
  },
];

export default function EventsPage() {
  const handleEventPress = (eventId: string) => {
    successHaptic();
    router.push('/event-detail');
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
              <Calendar size={28} color={colors.icon.white} strokeWidth={2} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Your Events</Text>
              <Text style={styles.headerSubtitle}>
                {mockEvents.length} upcoming events
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Body Section - Events List */}
        <ScrollView
          style={styles.bodySection}
          contentContainerStyle={styles.bodyScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {mockEvents.map((event) => (
            <Pressable
              key={event.id}
              onPress={() => handleEventPress(event.id)}
              style={({ pressed }) => [
                styles.eventCard,
                { opacity: pressed ? 0.9 : 1 },
              ]}
            >
              {/* Event Header */}
              <View style={styles.eventHeader}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <View style={styles.participantCountContainer}>
                  <Users size={16} color={colors.icon.muted} />
                  <Text style={styles.participantCount}>{event.participantCount}</Text>
                </View>
              </View>

              {/* Event Details */}
              <View style={styles.eventDetails}>
                <View style={styles.detailRow}>
                  <MapPin size={16} color={colors.icon.muted} />
                  <Text style={styles.detailText}>{event.location}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Calendar size={16} color={colors.icon.muted} />
                  <Text style={styles.detailText}>{event.date}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Clock size={16} color={colors.icon.muted} />
                  <Text style={styles.detailText}>{event.time}</Text>
                </View>
              </View>

              {/* Participant Tags */}
              {event.participants.length > 0 && (
                <View style={styles.participantsContainer}>
                  {event.participants.map((participant, index) => (
                    <View key={index} style={styles.participantTag}>
                      <Text style={styles.participantTagText}>{participant}</Text>
                    </View>
                  ))}
                </View>
              )}
            </Pressable>
          ))}
        </ScrollView>
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
    paddingBottom: 40,
  },
  eventCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    flex: 1,
  },
  participantCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 12,
  },
  participantCount: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.mutedForeground,
  },
  eventDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.mutedForeground,
  },
  participantsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  participantTag: {
    backgroundColor: colorOpacity.primary['20'],
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  participantTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
  },
});

