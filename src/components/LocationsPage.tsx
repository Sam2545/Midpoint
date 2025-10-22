import { useState, useEffect } from 'react';
import { MapPin, Plus, X, Search, ArrowLeft } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { ActivitySelector } from './ActivitySelector';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Card, CardContent } from './ui/card';
import { FriendCarousel } from './FriendCarousel';

interface Friend {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
}

interface LocationEntry {
  id: string;
  personName: string;
  location: string;
  isMe?: boolean;
}

interface LocationsPageProps {
  onBack: () => void;
  onSearch: (locations: LocationEntry[], activity: string, friends: Friend[]) => void;
}

export function LocationsPage({ onBack, onSearch }: LocationsPageProps) {
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
    onSearch(locations, activity, selectedFriends);
  };

  const isValid = locations.every(loc => loc.location.trim() !== '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-background rounded-2xl shadow-xl overflow-hidden border-2 border-secondary/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground p-6 pb-8">
          <button
            onClick={onBack}
            className="mb-4 p-2 -ml-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-xl">
              <MapPin className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl">Plan Your Meetup</h1>
              <p className="text-primary-foreground/80 text-sm">Invite friends & set locations</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Friend Carousel */}
          <FriendCarousel onFriendsChange={handleFriendsChange} />

          <Separator className="mb-6" />

          {/* Locations List */}
          <div className="space-y-4 mb-6">
            {locations.map((loc, index) => (
              <Card key={loc.id} className="overflow-hidden border-secondary/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10 mt-1 ring-2 ring-secondary/50">
                      <AvatarFallback className="bg-secondary/10 text-secondary">
                        {loc.isMe ? '👤' : loc.personName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <Label className="text-sm text-secondary">{loc.personName}</Label>
                      <Input
                        type="text"
                        placeholder="Enter location or address"
                        value={loc.location}
                        onChange={(e) => updateLocation(loc.id, e.target.value)}
                        className="bg-input-background border-secondary/30 focus:border-secondary"
                        inputMode="text"
                        autoComplete="street-address"
                      />
                    </div>
                    {!loc.isMe && (
                      <button
                        onClick={() => removeLocation(loc.id)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors mt-1"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add More Button */}
          <Button
            variant="outline"
            className="w-full mb-6 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
            onClick={addMoreLocation}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add More Location
          </Button>

          <Separator className="mb-6" />

          {/* Activity Selector */}
          <div className="mb-6">
            <ActivitySelector selected={activity} onSelect={setActivity} />
          </div>

          {/* Search Button */}
          <Button
            onClick={handleSearch}
            className="w-full h-12"
            size="lg"
            disabled={!isValid}
          >
            <Search className="w-5 h-5 mr-2" />
            Find Midpoint
          </Button>
        </div>
      </div>
    </div>
  );
}
