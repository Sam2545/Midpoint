import { useState } from "react";
import { Camera, User, Phone, MapPinned } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface LoginPageProps {
  onComplete: () => void;
}

export function LoginPage({ onComplete }: LoginPageProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImage, setProfileImage] = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete();
  };

  const isFormValid = name.trim() !== "" && phone.trim() !== "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-background rounded-2xl shadow-xl overflow-hidden border-2 border-secondary/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground p-6 pb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 p-3 rounded-xl">
              <MapPinned className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl">Welcome to Mid</h1>
              <p className="text-primary-foreground/80 text-sm">
                Create your profile to get started
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 -mt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                  <AvatarImage src={profileImage} alt={name} />
                  <AvatarFallback className="bg-muted">
                    <User className="w-10 h-10 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="profile-upload"
                  className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground p-2.5 rounded-full shadow-lg cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  <input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Upload profile picture
              </p>
            </div>

            {/* Name Input */}
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="flex items-center gap-2 text-secondary"
              >
                <User className="w-4 h-4" />
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-input-background border-secondary/30 focus:border-secondary"
                autoComplete="name"
                inputMode="text"
                required
              />
            </div>

            {/* Phone Number Input */}
            <div className="space-y-2">
              <Label
                htmlFor="phone"
                className="flex items-center gap-2 text-secondary"
              >
                <Phone className="w-4 h-4" />
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-input-background border-secondary/30 focus:border-secondary"
                inputMode="tel"
                autoComplete="tel"
                required
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 mt-8"
              size="lg"
              disabled={!isFormValid}
            >
              Continue to Mid
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
