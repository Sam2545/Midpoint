import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Calendar, MapPin, Clock, Check } from 'lucide-react-native';
import { colors, colorOpacity } from '../constants/theme';
import { successHaptic } from '../utils/haptics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.25;

const USER_NAME = 'Sameer';

// Initial poll data
const initialTimePollOptions = [
  {
    time: '2:00 PM',
    votes: 3,
    voters: ['Alex', 'Jordan', 'Taylor'],
  },
  {
    time: '3:00 PM',
    votes: 2,
    voters: ['Alex', 'Taylor'],
  },
  {
    time: '4:00 PM',
    votes: 1,
    voters: ['Jordan'],
  },
];

// Default event details (used when no params are provided)
const defaultEventDetails = {
  title: 'Coffee Meetup',
  location: 'Starbucks Downtown',
  date: 'Oct 25, 2025',
  time: '2:00 PM',
  attendeeCount: 3,
};

export default function EventDetailPage() {
  const params = useLocalSearchParams();
  const [pollOptions, setPollOptions] = useState(initialTimePollOptions);
  
  // Determine if this is a new event from restaurant selection
  const isNewEvent = params.isNewEvent === 'true';
  
  // Get restaurant data from params if available
  const restaurantName = params.restaurantName as string | undefined;
  const restaurantAddress = params.restaurantAddress as string | undefined;
  
  // Build event details from params or use defaults
  const eventDetails = {
    title: restaurantName || defaultEventDetails.title,
    location: restaurantAddress || defaultEventDetails.location,
    date: defaultEventDetails.date,
    time: defaultEventDetails.time,
    attendeeCount: defaultEventDetails.attendeeCount,
  };

  const handleVote = (index: number) => {
    setPollOptions(prevOptions => {
      const newOptions = [...prevOptions];
      const option = { ...newOptions[index] };
      const hasVoted = option.voters.includes(USER_NAME);

      if (hasVoted) {
        // Remove vote
        option.voters = option.voters.filter(voter => voter !== USER_NAME);
        option.votes = option.votes - 1;
      } else {
        // Add vote
        option.voters = [...option.voters, USER_NAME];
        option.votes = option.votes + 1;
      }

      newOptions[index] = option;
      return newOptions;
    });
    successHaptic();
  };

  const maxVotes = Math.max(...pollOptions.map(option => option.votes), 1);

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
              <Text style={styles.headerTitle}>{eventDetails.title}</Text>
              <Text style={styles.headerSubtitle}>
                {eventDetails.attendeeCount} attendees
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
          {/* Event Details Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Event Details</Text>
            
            {/* Location */}
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <MapPin size={20} color={colors.icon.muted} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{eventDetails.location}</Text>
              </View>
            </View>

            {/* Date */}
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Calendar size={20} color={colors.icon.muted} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>{eventDetails.date}</Text>
              </View>
            </View>

            {/* Time */}
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Clock size={20} color={colors.icon.muted} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValue}>{eventDetails.time}</Text>
              </View>
            </View>
          </View>

          {/* Time Availability Poll Card */}
          <View style={styles.card}>
            <View style={styles.pollHeader}>
              <Clock size={20} color={colors.primary} />
              <Text style={styles.cardTitle}>Time Availability Poll</Text>
            </View>

            {pollOptions.map((option, index) => {
              const progressPercentage = (option.votes / maxVotes) * 100;
              const hasVoted = option.voters.includes(USER_NAME);
              
              return (
                <View key={index} style={styles.pollOption}>
                  <View style={styles.pollOptionHeader}>
                    <Text style={styles.pollTime}>{option.time}</Text>
                    <Text style={styles.pollVotes}>{option.votes} {option.votes === 1 ? 'vote' : 'votes'}</Text>
                  </View>
                  
                  {/* Progress Bar */}
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        { width: `${progressPercentage}%` },
                      ]}
                    />
                  </View>

                  {/* Voter Tags */}
                  {option.voters.length > 0 && (
                    <View style={styles.votersContainer}>
                      {option.voters.map((voter, voterIndex) => (
                        <View 
                          key={voterIndex} 
                          style={[
                            styles.voterTag,
                            voter === USER_NAME && styles.voterTagSelf
                          ]}
                        >
                          <Text style={[
                            styles.voterTagText,
                            voter === USER_NAME && styles.voterTagTextSelf
                          ]}>
                            {voter}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Vote Button */}
                  <Pressable
                    onPress={() => handleVote(index)}
                    style={({ pressed }) => [
                      styles.voteButton,
                      hasVoted && styles.voteButtonVoted,
                      { opacity: pressed ? 0.8 : 1 },
                    ]}
                  >
                    {hasVoted ? (
                      <>
                        <Check size={16} color={colors.white} />
                        <Text style={styles.voteButtonText}>Voted</Text>
                      </>
                    ) : (
                      <Text style={styles.voteButtonText}>Vote</Text>
                    )}
                  </Pressable>
                </View>
              );
            })}
          </View>
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
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 16,
  },
  pollHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  detailIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
  },
  pollOption: {
    marginBottom: 20,
  },
  pollOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pollTime: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.foreground,
  },
  pollVotes: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.mutedForeground,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: colors.muted,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  votersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  voterTag: {
    backgroundColor: colorOpacity.primary['20'],
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  voterTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
  },
  voterTagSelf: {
    backgroundColor: colors.primary,
  },
  voterTagTextSelf: {
    color: colors.white,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.secondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  voteButtonVoted: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  voteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
});

