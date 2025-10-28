import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { MapPin, X } from "lucide-react-native";
import { useLocationSearch } from "../hooks/useLocationSearch";
import { PlacePrediction } from "../services/PlacesService";

interface LocationInputWithAutocompleteProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSelectPlace?: (place: PlacePrediction) => void;
  style?: any;
  autoComplete?: string;
}

export const LocationInputWithAutocomplete: React.FC<
  LocationInputWithAutocompleteProps
> = ({
  placeholder = "Enter location or address",
  value,
  onChangeText,
  onSelectPlace,
  style,
  autoComplete,
}) => {
  const {
    input,
    setInput,
    suggestions,
    isLoading,
    error,
    clearSuggestions,
    selectSuggestion,
  } = useLocationSearch({
    debounceMs: 300,
    minLength: 2,
  });

  const [showSuggestions, setShowSuggestions] = useState(false);

  // Sync external value with internal input
  React.useEffect(() => {
    if (value !== input) {
      setInput(value);
    }
  }, [value]);

  const handleInputChange = (text: string) => {
    setInput(text);
    onChangeText(text);
    setShowSuggestions(text.length >= 2);
  };

  const handleSelectSuggestion = (suggestion: PlacePrediction) => {
    selectSuggestion(suggestion);
    onChangeText(suggestion.description);
    setShowSuggestions(false);
    onSelectPlace?.(suggestion);
  };

  const handleClear = () => {
    setInput("");
    onChangeText("");
    clearSuggestions();
    setShowSuggestions(false);
  };

  const renderSuggestion = ({ item }: { item: PlacePrediction }) => (
    <Pressable
      style={styles.suggestionItem}
      onPress={() => handleSelectSuggestion(item)}
    >
      <View style={styles.suggestionContent}>
        <MapPin size={16} color="#64748b" />
        <View style={styles.suggestionText}>
          <Text style={styles.mainText}>
            {item.structured_formatting.main_text}
          </Text>
          {item.structured_formatting.secondary_text && (
            <Text style={styles.secondaryText}>
              {item.structured_formatting.secondary_text}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.inputContainer, style]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={input}
          onChangeText={handleInputChange}
          onFocus={() => setShowSuggestions(input.length >= 2)}
          autoComplete={autoComplete}
          placeholderTextColor="#9ca3af"
        />
        {input.length > 0 && (
          <Pressable onPress={handleClear} style={styles.clearButton}>
            <X size={16} color="#64748b" />
          </Pressable>
        )}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#2563eb" />
          </View>
        )}
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item) => item.place_id}
            style={styles.suggestionsList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.3)",
    borderRadius: 8,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    minHeight: 40,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  loadingContainer: {
    padding: 4,
    marginLeft: 8,
  },
  suggestionsContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
    maxHeight: 200,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  suggestionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  suggestionText: {
    marginLeft: 8,
    flex: 1,
  },
  mainText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
  },
  secondaryText: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 4,
  },
});
