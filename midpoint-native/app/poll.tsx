import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, MapPin, ThumbsUp, ThumbsDown, Send, MessageSquare } from 'lucide-react-native';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Avatar, AvatarFallback } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Separator } from '../components/ui/Separator';
import { Vote } from '../utils/types';
import { successHaptic, lightHaptic } from '../utils/haptics';

export default function SharePollPage() {
  const [votes, setVotes] = useState<Vote[]>([
    {
      userId: '1',
      userName: 'Sarah Johnson',
      status: 'confirmed',
      timestamp: '2 mins ago'
    },
    {
      userId: '2',
      userName: 'Mike Chen',
      status: 'suggested',
      suggestion: 'How about The Oak Restaurant instead? It\'s closer to me.',
      timestamp: '5 mins ago'
    },
    {
      userId: '3',
      userName: 'Emma Davis',
      status: 'confirmed',
      timestamp: '7 mins ago'
    }
  ]);

  const [myVote, setMyVote] = useState<'confirmed' | 'denied' | null>(null);
  const [suggestion, setSuggestion] = useState('');
  const [showSuggestion, setShowSuggestion] = useState(false);

  const handleVote = (vote: 'confirmed' | 'denied') => {
    if (vote === 'confirmed') {
      successHaptic();
    } else {
      lightHaptic();
    }
    setMyVote(vote);
    if (vote === 'confirmed') {
      setShowSuggestion(false);
      setSuggestion('');
    }
  };

  const handleSuggest = () => {
    setShowSuggestion(true);
    setMyVote(null);
  };

  const handleSubmitSuggestion = () => {
    if (suggestion.trim()) {
      lightHaptic();
      // In real app, would submit the suggestion
      setMyVote('denied');
    }
  };

  const confirmedCount = votes.filter(v => v.status === 'confirmed').length + (myVote === 'confirmed' ? 1 : 0);
  const totalParticipants = votes.length + 1;

  const renderVote = (vote: Vote) => (
    <Card key={vote.userId}>
      <CardContent className="p-4">
        <View className="flex-row items-start gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback>
              <Text className="text-sm font-medium">
                {vote.userName.split(' ').map(n => n[0]).join('')}
              </Text>
            </AvatarFallback>
          </Avatar>
          <View className="flex-1 min-w-0">
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="font-medium">{vote.userName}</Text>
              {vote.status === 'confirmed' && (
                <Badge className="bg-primary">
                  <ThumbsUp size={12} color="white" />
                  <Text className="ml-1 text-xs text-primary-foreground">Confirmed</Text>
                </Badge>
              )}
              {vote.status === 'denied' && (
                <Badge variant="destructive">
                  <ThumbsDown size={12} color="white" />
                  <Text className="ml-1 text-xs text-destructive-foreground">Denied</Text>
                </Badge>
              )}
              {vote.status === 'suggested' && (
                <Badge variant="secondary">
                  <MessageSquare size={12} color="white" />
                  <Text className="ml-1 text-xs text-secondary-foreground">Suggested</Text>
                </Badge>
              )}
            </View>
            <Text className="text-xs text-muted-foreground mb-2">{vote.timestamp}</Text>
            {vote.suggestion && (
              <Text className="text-sm bg-muted p-2 rounded-lg">{vote.suggestion}</Text>
            )}
          </View>
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
                    <Text className="text-2xl font-semibold text-white">Confirm Midpoint</Text>
                    <Text className="text-white/80 text-sm">Vote or suggest alternatives</Text>
                  </View>
                </View>
              </LinearGradient>

              {/* Content */}
              <View className="p-6">
                {/* Midpoint Location Card */}
                <Card className="mb-6 border-2 border-secondary/30">
                  <CardContent className="p-4">
                    <View className="flex-row items-start gap-3 mb-3">
                      <View className="bg-secondary/10 p-2 rounded-lg">
                        <MapPin size={20} color="#2563eb" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-lg font-semibold">The Garden Bistro</Text>
                        <Text className="text-sm text-muted-foreground">123 Main St, Downtown</Text>
                        <Text className="text-sm text-secondary mt-1">Midpoint location</Text>
                      </View>
                    </View>
                    
                    {/* Vote Progress */}
                    <View className="space-y-2">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-sm text-muted-foreground">Group confirmation</Text>
                        <Text className="text-sm text-secondary">{confirmedCount}/{totalParticipants} confirmed</Text>
                      </View>
                      <View className="w-full bg-muted rounded-full h-2">
                        <View
                          className="bg-gradient-to-r from-primary to-secondary rounded-full h-2"
                          style={{ width: `${(confirmedCount / totalParticipants) * 100}%` }}
                        />
                      </View>
                    </View>
                  </CardContent>
                </Card>

                {/* Your Response */}
                {!myVote && !showSuggestion && (
                  <View className="mb-6">
                    <Text className="mb-3 text-secondary font-medium">Your Response</Text>
                    <View className="flex-row gap-3">
                      <Button
                        onPress={() => handleVote('confirmed')}
                        variant="outline"
                        className="flex-1 h-auto py-4 flex-col gap-2 border-secondary text-secondary"
                      >
                        <ThumbsUp size={20} color="#2563eb" />
                        <Text className="text-secondary">Confirm</Text>
                      </Button>
                      <Button
                        onPress={handleSuggest}
                        variant="outline"
                        className="flex-1 h-auto py-4 flex-col gap-2 border-secondary text-secondary"
                      >
                        <MessageSquare size={20} color="#2563eb" />
                        <Text className="text-secondary">Suggest New</Text>
                      </Button>
                    </View>
                  </View>
                )}

                {/* Vote Confirmed */}
                {myVote === 'confirmed' && (
                  <Card className="mb-6 border-2 border-secondary">
                    <CardContent className="p-4">
                      <View className="flex-row items-center gap-3">
                        <View className="bg-secondary/10 p-2 rounded-lg">
                          <ThumbsUp size={20} color="#2563eb" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-secondary font-medium">You confirmed this location</Text>
                          <Text className="text-sm text-muted-foreground">Waiting for others to respond</Text>
                        </View>
                        <Button
                          variant="ghost"
                          size="sm"
                          onPress={() => setMyVote(null)}
                        >
                          <Text className="text-sm">Change</Text>
                        </Button>
                      </View>
                    </CardContent>
                  </Card>
                )}

                {/* Suggestion Form */}
                {showSuggestion && (
                  <Card className="mb-6">
                    <CardContent className="p-4 space-y-3">
                      <View className="flex-row items-center justify-between">
                        <Text className="font-medium">Suggest Alternative</Text>
                        <Button
                          variant="ghost"
                          size="sm"
                          onPress={() => {
                            setShowSuggestion(false);
                            setSuggestion('');
                          }}
                        >
                          <Text className="text-sm">Cancel</Text>
                        </Button>
                      </View>
                      <Input
                        placeholder="Suggest a different location or time..."
                        value={suggestion}
                        onChangeText={setSuggestion}
                        multiline
                        numberOfLines={3}
                        className="resize-none"
                      />
                      <Button
                        onPress={handleSubmitSuggestion}
                        className="w-full"
                        disabled={!suggestion.trim()}
                      >
                        <Send size={16} color="white" />
                        <Text className="ml-2 text-primary-foreground">Submit Suggestion</Text>
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <Separator className="mb-6" />

                {/* Group Responses */}
                <View className="max-h-[300px]">
                  <Text className="sticky top-0 bg-background pb-2 z-10 font-medium mb-3">Group Responses</Text>
                  
                  <ScrollView showsVerticalScrollIndicator={false}>
                    <View className="space-y-3">
                      {votes.map(renderVote)}
                    </View>
                  </ScrollView>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
}
