import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";

import {
  getMessages,
  markMessageAsRead,
  type UserMessage,
} from "@/services/messageService";
import { colors } from "@/utils/theme";

export default function Messages() {
  const router = useRouter();

  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [selectedMessage, setSelectedMessage] =
    useState<UserMessage | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      setError(null);

      const result = await getMessages();
      setMessages(result);
    } catch (err) {
      console.error("Failed to load messages:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load your messages.",
      );
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadMessages();
    }, [loadMessages]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await loadMessages(false);
    } finally {
      setRefreshing(false);
    }
  };

  const handleMessagePress = async (message: UserMessage) => {
    setSelectedMessage(message);
    setModalVisible(true);

    if (message.isRead) {
      return;
    }

    try {
      const updatedMessage = await markMessageAsRead(message.id);

      setMessages((currentMessages) =>
        currentMessages.map((item) =>
          item.id === updatedMessage.id ? updatedMessage : item,
        ),
      );

      setSelectedMessage(updatedMessage);
    } catch (err) {
      console.error("Failed to mark message as read:", err);
    }
  };

  /*
   * The API stores UserMessage timestamps using DateTime.UtcNow.
   * MySQL/API serialization may return them without a trailing "Z".
   *
   * A timestamp such as:
   * 2026-09-18T19:26:00
   *
   * therefore represents 19:26 UTC, not 19:26 local time.
   *
   * Adding "Z" when the API did not provide timezone information allows
   * JavaScript to correctly convert UTC to the phone's local timezone.
   */
  const parseApiUtcDate = (timestamp: string) => {
    const hasTimezone =
      timestamp.endsWith("Z") ||
      /[+-]\d{2}:\d{2}$/.test(timestamp);

    return new Date(hasTimezone ? timestamp : `${timestamp}Z`);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = parseApiUtcDate(timestamp);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMs < 0) {
      return date.toLocaleDateString();
    }

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  const formatFullTimestamp = (timestamp: string) => {
    const date = parseApiUtcDate(timestamp);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleString();
  };

  const getMessageIcon = (
    category: string,
  ): keyof typeof Ionicons.glyphMap => {
    switch (category.toLowerCase()) {
      case "areasafety":
        return "shield-checkmark-outline";

      case "security":
        return "lock-closed-outline";

      case "transaction":
        return "swap-horizontal-outline";

      default:
        return "mail-outline";
    }
  };

  const renderMessage = ({ item }: { item: UserMessage }) => (
    <TouchableOpacity
      style={[
        styles.messageItem,
        !item.isRead && styles.unreadItem,
      ]}
      activeOpacity={0.7}
      onPress={() => void handleMessagePress(item)}
    >
      <View style={styles.iconWrapper}>
        <Ionicons
          name={getMessageIcon(item.category)}
          size={24}
          color={colors.primary}
        />
      </View>

      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text
            style={[
              styles.messageTitle,
              !item.isRead && styles.unreadTitle,
            ]}
            numberOfLines={1}
          >
            {item.title}
          </Text>

          <Text style={styles.timestamp}>
            {formatTimestamp(item.createdAt)}
          </Text>
        </View>

        <Text style={styles.messagePreview} numberOfLines={2}>
          {item.body}
        </Text>
      </View>

      {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.primary} />

          <Text style={styles.stateText}>
            Loading your messages...
          </Text>
        </View>
      );
    }

    if (error && messages.length === 0) {
      return (
        <View style={styles.centerState}>
          <View style={styles.stateIcon}>
            <Ionicons
              name="cloud-offline-outline"
              size={30}
              color={colors.primary}
            />
          </View>

          <Text style={styles.stateTitle}>
            Messages unavailable
          </Text>

          <Text style={styles.stateText}>
            {error}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            activeOpacity={0.8}
            onPress={() => void loadMessages()}
          >
            <Ionicons
              name="refresh"
              size={18}
              color="#fff"
            />

            <Text style={styles.retryButtonText}>
              Try again
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          messages.length === 0 && styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void handleRefresh()}
            tintColor={colors.primary}
          />
        }
        ItemSeparatorComponent={() => (
          <View style={styles.separator} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.stateIcon}>
              <Ionicons
                name="mail-open-outline"
                size={32}
                color={colors.primary}
              />
            </View>

            <Text style={styles.stateTitle}>
              You're all caught up
            </Text>

            <Text style={styles.stateText}>
              Security and account messages will appear here.
            </Text>
          </View>
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#5B8DEF", "#6C63FF"]}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#fff"
          />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>
            Messages
          </Text>

          {!loading && messages.length > 0 && (
            <Text style={styles.headerSubtitle}>
              {
                messages.filter(
                  (message) => !message.isRead,
                ).length
              }{" "}
              unread
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={() => void handleRefresh()}
          disabled={refreshing}
        >
          <Ionicons
            name="refresh"
            size={22}
            color="#fff"
          />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.whiteCard}>
        {renderContent()}
      </View>

      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />

          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />

            {selectedMessage && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalIconWrapper}>
                    <Ionicons
                      name={getMessageIcon(
                        selectedMessage.category,
                      )}
                      size={28}
                      color={colors.primary}
                    />
                  </View>

                  <View style={styles.modalTitleContainer}>
                    <Text style={styles.modalTitle}>
                      {selectedMessage.title}
                    </Text>

                    <Text style={styles.modalCategory}>
                      {selectedMessage.category === "AreaSafety"
                        ? "Area Safety"
                        : selectedMessage.category}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.modalClose}
                    onPress={() => setModalVisible(false)}
                  >
                    <Ionicons
                      name="close"
                      size={24}
                      color={colors.navy}
                    />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={
                    styles.modalScrollContent
                  }
                >
                  <Text style={styles.modalTimestamp}>
                    {formatFullTimestamp(
                      selectedMessage.createdAt,
                    )}
                  </Text>

                  <Text style={styles.modalBody}>
                    {selectedMessage.body}
                  </Text>

                  {selectedMessage.category ===
                    "AreaSafety" && (
                    <View style={styles.safetyNote}>
                      <Ionicons
                        name="information-circle-outline"
                        size={20}
                        color={colors.primary}
                      />

                      <Text style={styles.safetyNoteText}>
                        Area Safety notices are awareness
                        reminders. Stay aware of your
                        surroundings and use your usual safety
                        precautions.
                      </Text>
                    </View>
                  )}

                  <View style={styles.readStatus}>
                    <Ionicons
                      name={
                        selectedMessage.isRead
                          ? "checkmark-circle"
                          : "ellipse-outline"
                      }
                      size={19}
                      color={colors.primary}
                    />

                    <Text style={styles.readStatusText}>
                      {selectedMessage.isRead
                        ? "Read"
                        : "Unread"}
                    </Text>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 70,
    paddingHorizontal: 20,
    paddingBottom: 28,
  },

  headerButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTextContainer: {
    flex: 1,
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 11,
    color: "rgba(255,255,255,0.82)",
  },

  whiteCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    overflow: "hidden",
  },

  listContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  messageItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 6,
    borderRadius: 14,
  },

  unreadItem: {
    backgroundColor: "#F5F8FF",
  },

  iconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#EEF3FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  messageContent: {
    flex: 1,
  },

  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },

  messageTitle: {
    flex: 1,
    marginRight: 8,
    fontSize: 15,
    fontWeight: "600",
    color: colors.navy,
  },

  unreadTitle: {
    fontWeight: "700",
  },

  timestamp: {
    fontSize: 11,
    color: colors.textSub,
  },

  messagePreview: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSub,
  },

  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginLeft: 9,
  },

  separator: {
    height: 1,
    backgroundColor: "#F0F2F5",
    marginHorizontal: 6,
  },

  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingBottom: 60,
  },

  stateIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#EEF3FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  stateTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.navy,
    textAlign: "center",
    marginBottom: 6,
  },

  stateText: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSub,
    textAlign: "center",
  },

  retryButton: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 22,
  },

  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.32)",
  },

  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 30,
    minHeight: 330,
    maxHeight: "80%",
  },

  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D8DDE6",
    alignSelf: "center",
    marginBottom: 18,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  modalIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EEF3FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  modalTitleContainer: {
    flex: 1,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.navy,
  },

  modalCategory: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textSub,
  },

  modalClose: {
    padding: 5,
  },

  modalScrollContent: {
    paddingBottom: 12,
  },

  modalTimestamp: {
    fontSize: 12,
    color: colors.textSub,
    marginBottom: 14,
  },

  modalBody: {
    fontSize: 15,
    color: "#303744",
    lineHeight: 23,
    marginBottom: 20,
  },

  safetyNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    backgroundColor: "#F4F7FD",
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
  },

  safetyNoteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: "#4A5568",
  },

  readStatus: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 7,
    backgroundColor: "#F4F7FD",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
  },

  readStatusText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },
});