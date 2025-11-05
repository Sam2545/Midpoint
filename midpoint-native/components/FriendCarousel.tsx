import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { UserPlus, Search, X } from "lucide-react-native";
import * as Contacts from "expo-contacts";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/Avatar";
import { selectionHaptic } from "../utils/haptics";
import { Friend } from "../utils/types";

interface FriendCarouselProps {
  onFriendsChange: (friends: Friend[]) => void;
}

export function FriendCarousel({ onFriendsChange }: FriendCarouselProps) {
  // Mock friends list - in real app, this would come from contacts/API
  const [allFriends, setAllFriends] = useState<Friend[]>([
    { id: "1", name: "Sarah", phone: "(555) 234-5678", avatar: "" },
    { id: "2", name: "Mike", phone: "(555) 345-6789", avatar: "" },
    { id: "3", name: "Emma", phone: "(555) 456-7890", avatar: "" },
  ]);

  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(
    new Set()
  );
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  // Contacts state
  const [contacts, setContacts] = useState<Friend[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Friend[]>([]);
  const [contactsSearchQuery, setContactsSearchQuery] = useState("");
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [contactsPermissionGranted, setContactsPermissionGranted] =
    useState(false);

  // Load contacts from device
  const loadContacts = useCallback(async () => {
    try {
      setIsLoadingContacts(true);
      const { status } = await Contacts.requestPermissionsAsync();

      if (status !== "granted") {
        setContactsPermissionGranted(false);
        Alert.alert(
          "Permission Required",
          "Please grant contacts permission to import friends from your contacts.",
          [{ text: "OK" }]
        );
        setIsLoadingContacts(false);
        return;
      }

      setContactsPermissionGranted(true);
      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Image,
        ],
      });

      // Convert contacts to Friend format
      const formattedContacts: Friend[] = data
        .filter(
          (contact) =>
            contact.name &&
            contact.phoneNumbers &&
            contact.phoneNumbers.length > 0
        )
        .map((contact) => {
          const phoneNumber = contact.phoneNumbers?.[0]?.number || "";
          return {
            id: contact.id || String(Date.now() + Math.random()),
            name: contact.name || "Unknown",
            phone: phoneNumber,
            avatar: contact.imageUri || "",
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name));

      setContacts(formattedContacts);
      setFilteredContacts(formattedContacts);
    } catch (error) {
      console.error("Error loading contacts:", error);
      Alert.alert("Error", "Failed to load contacts. Please try again.");
    } finally {
      setIsLoadingContacts(false);
    }
  }, []);

  // Filter contacts based on search query
  useEffect(() => {
    if (contactsSearchQuery.trim() === "") {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter(
        (contact) =>
          contact.name
            .toLowerCase()
            .includes(contactsSearchQuery.toLowerCase()) ||
          contact.phone.includes(contactsSearchQuery)
      );
      setFilteredContacts(filtered);
    }
  }, [contactsSearchQuery, contacts]);

  // Load contacts when modal opens
  useEffect(() => {
    if (isAddOpen) {
      loadContacts();
    }
  }, [isAddOpen, loadContacts]);

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
    const selected = allFriends.filter((f) => newSelected.has(f.id));
    onFriendsChange(selected);
  };

  const addContactAsFriend = (contact: Friend) => {
    selectionHaptic();
    // Check if contact already exists in allFriends
    const existingFriend = allFriends.find(
      (f) => f.id === contact.id || f.phone === contact.phone
    );

    if (existingFriend) {
      // If exists, just toggle selection
      toggleFriend(existingFriend);
    } else {
      // Add new friend and select it
      const newFriendList = [...allFriends, contact];
      setAllFriends(newFriendList);
      const newSelected = new Set(selectedFriends);
      newSelected.add(contact.id);
      setSelectedFriends(newSelected);
      onFriendsChange(newFriendList.filter((f) => newSelected.has(f.id)));
    }
    setIsAddOpen(false);
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
                ? "ring-4 ring-secondary shadow-lg scale-105"
                : "ring-2 ring-border"
            }`}
          >
            <AvatarImage src={friend.avatar} alt={friend.name} />
            <AvatarFallback
              className={`transition-colors ${
                isSelected
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-muted"
              }`}
            >
              <Text className="text-sm font-medium">
                {friend.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </Text>
            </AvatarFallback>
          </Avatar>
          {isSelected && (
            <View className="absolute -top-1 -right-1 w-6 h-6 bg-secondary rounded-full items-center justify-center shadow-lg">
              <Text className="text-xs text-secondary-foreground font-bold">
                ✓
              </Text>
            </View>
          )}
        </View>
        <Text
          className={`text-sm text-center mt-2 transition-colors ${
            isSelected ? "text-secondary" : "text-foreground"
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
      onPress={() => setIsAddOpen(true)}
      className="items-center w-20"
      style={({ pressed }) => ({
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <View className="w-16 h-16 rounded-full border-2 border-dashed border-secondary bg-secondary/5 items-center justify-center">
        <UserPlus size={24} color="#2563eb" />
      </View>
      <Text className="text-sm text-center text-secondary mt-2">Add</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Invite Friends</Text>
        <Text style={styles.selectedCount}>
          {selectedFriends.size} selected
        </Text>
      </View>

      <FlatList
        data={[
          ...allFriends,
          { id: "add", name: "Add", phone: "", avatar: "" },
        ]}
        renderItem={({ item }) =>
          item.id === "add" ? renderAddButton() : renderFriend({ item })
        }
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
      />
      {/* Add Friend Modal */}
      <Modal
        visible={isAddOpen}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setIsAddOpen(false);
          setContactsSearchQuery("");
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Friends</Text>
              <Pressable
                onPress={() => {
                  setIsAddOpen(false);
                  setContactsSearchQuery("");
                }}
                style={styles.closeButton}
              >
                <X size={24} color="#111827" />
              </Pressable>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Search size={20} color="#64748b" style={styles.searchIcon} />
              <TextInput
                placeholder="Search contacts..."
                value={contactsSearchQuery}
                onChangeText={setContactsSearchQuery}
                style={styles.searchInput}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {contactsSearchQuery.length > 0 && (
                <Pressable
                  onPress={() => setContactsSearchQuery("")}
                  style={styles.clearSearchButton}
                >
                  <X size={16} color="#64748b" />
                </Pressable>
              )}
            </View>

            {/* Contacts List */}
            {isLoadingContacts ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>Loading contacts...</Text>
              </View>
            ) : contactsPermissionGranted && filteredContacts.length > 0 ? (
              <View style={styles.contactsListContainer}>
                <FlatList
                  data={filteredContacts}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <Pressable
                      onPress={() => addContactAsFriend(item)}
                      style={styles.contactItem}
                    >
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={item.avatar} alt={item.name} />
                        <AvatarFallback className="bg-secondary/10">
                          <Text style={styles.contactAvatarText}>
                            {item.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </Text>
                        </AvatarFallback>
                      </Avatar>
                      <View style={styles.contactInfo}>
                        <Text style={styles.contactName}>{item.name}</Text>
                        {item.phone && (
                          <Text style={styles.contactPhone}>{item.phone}</Text>
                        )}
                      </View>
                    </Pressable>
                  )}
                  style={styles.contactsList}
                  showsVerticalScrollIndicator={true}
                />
              </View>
            ) : contactsPermissionGranted && filteredContacts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {contactsSearchQuery
                    ? "No contacts found"
                    : "No contacts available"}
                </Text>
              </View>
            ) : (
              <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>
                  Contacts permission is required to import friends.
                </Text>
                <Pressable
                  onPress={loadContacts}
                  style={[
                    styles.button,
                    styles.buttonPrimary,
                    styles.retryButton,
                  ]}
                >
                  <Text style={styles.buttonPrimaryText}>Grant Permission</Text>
                </Pressable>
              </View>
            )}

            {/* Manual Add Option */}
            <View style={styles.manualAddSection}>
              <Text style={styles.manualAddLabel}>Or add manually:</Text>
              <TextInput
                placeholder="Name"
                value={newName}
                onChangeText={setNewName}
                style={styles.input}
                autoCapitalize="words"
              />
              <TextInput
                placeholder="Phone (optional)"
                value={newPhone}
                onChangeText={setNewPhone}
                style={styles.input}
                keyboardType="phone-pad"
              />
              <Pressable
                onPress={() => {
                  const name = newName.trim();
                  const phone = newPhone.trim();
                  if (!name) return;
                  const next = [
                    ...allFriends,
                    { id: String(Date.now()), name, phone, avatar: "" },
                  ];
                  setAllFriends(next);
                  setNewName("");
                  setNewPhone("");
                  setIsAddOpen(false);
                  setContactsSearchQuery("");
                }}
                style={[
                  styles.button,
                  !newName.trim()
                    ? styles.buttonDisabled
                    : styles.buttonPrimary,
                ]}
                disabled={!newName.trim()}
              >
                <Text style={styles.buttonPrimaryText}>Add Manually</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2563eb",
  },
  selectedCount: {
    fontSize: 14,
    color: "#64748b",
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    maxHeight: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  button: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buttonOutline: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  buttonOutlineText: {
    color: "#111827",
  },
  buttonPrimary: {
    backgroundColor: "#2563eb",
  },
  buttonDisabled: {
    backgroundColor: "#93c5fd",
  },
  buttonPrimaryText: {
    color: "#fff",
    fontWeight: "600",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: "#f9fafb",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  clearSearchButton: {
    padding: 4,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    color: "#64748b",
    fontSize: 14,
  },
  contactsListContainer: {
    maxHeight: 300,
    marginBottom: 16,
  },
  contactsList: {
    flexGrow: 0,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  contactInfo: {
    marginLeft: 12,
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 14,
    color: "#64748b",
  },
  contactAvatarText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563eb",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: "#64748b",
    fontSize: 14,
  },
  permissionContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  permissionText: {
    color: "#64748b",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    marginTop: 8,
  },
  manualAddSection: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 16,
    marginTop: 8,
  },
  manualAddLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
});
