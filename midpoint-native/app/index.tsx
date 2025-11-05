import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Camera, User, Phone, MapPinned } from "lucide-react-native";
import { successHaptic } from "../utils/haptics";
import { sharedStyles } from "../constants/styles";
import { Colors } from "../constants/Colors";

export default function LoginPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImage, setProfileImage] = useState("");

  const handleImageUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
        successHaptic();
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const handleSubmit = () => {
    if (name.trim() && phone.trim()) {
      successHaptic();
      router.push("/locations");
    }
  };

  const isFormValid = name.trim() !== "" && phone.trim() !== "";

  return (
    <SafeAreaView style={sharedStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={sharedStyles.flex1}
      >
        <ScrollView
          style={sharedStyles.flex1}
          contentContainerStyle={sharedStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={Colors.gradientBackground}
            style={sharedStyles.gradient}
          >
            <View style={sharedStyles.content}>
              <View style={sharedStyles.card}>
                {/* Header */}
                <LinearGradient
                  colors={Colors.gradientHeader}
                  style={sharedStyles.header}
                >
                  <View style={sharedStyles.headerContent}>
                    <View style={sharedStyles.iconContainer}>
                      <MapPinned size={32} color="white" />
                    </View>
                    <View>
                      <Text style={sharedStyles.title}>Welcome to Mid</Text>
                      <Text style={sharedStyles.subtitle}>
                        Create your profile to get started
                      </Text>
                    </View>
                  </View>
                </LinearGradient>

                {/* Content */}
                <View style={sharedStyles.formContent}>
                  <View style={sharedStyles.form}>
                    {/* Profile Picture */}
                    <View style={sharedStyles.profileSection}>
                      <View style={sharedStyles.avatarContainer}>
                        <View style={sharedStyles.avatar}>
                          {profileImage ? (
                            <Text style={sharedStyles.avatarText}>📷</Text>
                          ) : (
                            <User size={40} color={Colors.textMuted} />
                          )}
                        </View>
                        <Pressable
                          onPress={handleImageUpload}
                          style={sharedStyles.cameraButton}
                        >
                          <Camera size={16} color="white" />
                        </Pressable>
                      </View>
                      <Text style={sharedStyles.uploadText}>
                        Upload profile picture
                      </Text>
                    </View>

                    {/* Name Input */}
                    <View style={sharedStyles.inputSection}>
                      <Text style={sharedStyles.inputLabel}>Full Name</Text>
                      <TextInput
                        placeholder="Enter your full name"
                        value={name}
                        onChangeText={setName}
                        style={sharedStyles.input}
                        autoComplete="name"
                      />
                    </View>

                    {/* Phone Number Input */}
                    <View style={sharedStyles.inputSection}>
                      <Text style={sharedStyles.inputLabel}>Phone Number</Text>
                      <TextInput
                        placeholder="(555) 123-4567"
                        value={phone}
                        onChangeText={setPhone}
                        style={sharedStyles.input}
                        keyboardType="phone-pad"
                        autoComplete="tel"
                      />
                    </View>

                    {/* Submit Button */}
                    <Pressable
                      onPress={handleSubmit}
                      style={[
                        sharedStyles.submitButton,
                        !isFormValid && sharedStyles.submitButtonDisabled,
                      ]}
                      disabled={!isFormValid}
                    >
                      <Text style={sharedStyles.submitButtonText}>
                        Continue to Mid
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
