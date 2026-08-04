// app/(tabs)/messages.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/utils/theme";
import { useRouter } from "expo-router";

// Sample messages – all use the same icon
const initialMessages = [
  {
    id: "1",
    title: "Transfer Successful",
    body: "Your transfer of R500.00 to John Doe (ref: PAY-1234) was completed successfully. It will reflect in their account within 2 hours.",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    read: false,
  },
  {
    id: "2",
    title: "Security Alert",
    body: "We detected a login attempt from a new device (iPhone 14, Johannesburg) at 2:13 AM. If this wasn't you, please tap here to secure your account immediately.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    read: false,
  },
  {
    id: "3",
    title: "Monthly Fee Deducted",
    body: "Your monthly account maintenance fee of R12.00 was deducted from your main account (ending 3067).",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: false,
  },
  {
    id: "4",
    title: "Cashback Offer",
    body: "Use your virtual card at any participating retailer and get 10% cashback on your next purchase. Valid until 31 August 2026.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: true,
  },
  {
    id: "5",
    title: "Card Frozen – Suspicious Activity",
    body: "Your card (ending 3067) was temporarily frozen due to suspicious activity. To unfreeze, please verify your identity in the app or call our support line.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    read: true,
  },
  {
    id: "6",
    title: "Salary Deposited",
    body: "Your salary of R15,000.00 has been deposited into your main account (ending 3067). You can now access your funds.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72),
    read: true,
  },
  {
    id: "7",
    title: "Payment Reminder",
    body: "Your payment of R1,200.00 to ABC Insurance is due in 2 days. Ensure you have sufficient funds to avoid penalties.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96),
    read: true,
  },
  {
    id: "8",
    title: "New Feature: PayShap",
    body: "You can now send money instantly using PayShap. No beneficiary needed – just the recipient's cellphone number. Try it today.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 120),
    read: true,
  },
];

type Message = (typeof initialMessages)[0];

export default function Messages() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const toggleRead = (id: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, read: !msg.read } : msg
      )
    );
  };

  const markAllAsRead = () => {
    setMessages((prev) =>
      prev.map((msg) => ({ ...msg, read: true }))
    );
    Alert.alert("All messages marked as read");
  };

  const handleMessagePress = (message: Message) => {
    setSelectedMessage(message);
    setModalVisible(true);
    if (!message.read) {
      toggleRead(message.id);
    }
  };

  const renderItem = ({ item }: { item: Message }) => (
    <TouchableOpacity
      style={[styles.messageItem, !item.read && styles.unreadItem]}
      activeOpacity={0.7}
      onPress={() => handleMessagePress(item)}
    >
      <View style={styles.iconWrapper}>
        <Ionicons name="mail-outline" size={24} color={colors.primary} />
      </View>
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text style={styles.messageTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
        </View>
        <Text style={styles.messagePreview} numberOfLines={2}>
          {item.body}
        </Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#5B8DEF", "#6C63FF"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity
          style={styles.markAllButton}
          onPress={markAllAsRead}
          activeOpacity={0.7}
        >
          <Ionicons name="checkmark-done" size={22} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.whiteCard}>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No messages</Text>
          }
        />
      </View>

      {/* Detail Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            {selectedMessage && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalIconWrapper}>
                    <Ionicons name="mail-outline" size={28} color={colors.primary} />
                  </View>
                  <Text style={styles.modalTitle}>{selectedMessage.title}</Text>
                  <TouchableOpacity
                    style={styles.modalClose}
                    onPress={() => setModalVisible(false)}
                  >
                    <Ionicons name="close" size={24} color={colors.navy} />
                  </TouchableOpacity>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={styles.modalTimestamp}>
                    {formatTimestamp(selectedMessage.timestamp)}
                  </Text>
                  <Text style={styles.modalBody}>{selectedMessage.body}</Text>
                  <TouchableOpacity
                    style={styles.modalReadToggle}
                    onPress={() => {
                      toggleRead(selectedMessage.id);
                      setSelectedMessage((prev) =>
                        prev ? { ...prev, read: !prev.read } : null
                      );
                    }}
                  >
                    <Ionicons
                      name={selectedMessage.read ? "checkbox" : "square-outline"}
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.modalReadToggleText}>
                      {selectedMessage.read ? "Mark as unread" : "Mark as read"}
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// Styles remain exactly as before – no changes needed
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 70,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
    flex: 1,
    textAlign: "center",
  },
  markAllButton: {
    padding: 4,
  },
  whiteCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 8,
    marginTop: -20,
  },
  listContent: {
    paddingBottom: 20,
  },
  messageItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 4,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  unreadItem: {
    backgroundColor: "#F8F9FC",
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  messageTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.navy,
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 11,
    color: colors.textSub,
    fontWeight: "400",
  },
  messagePreview: {
    fontSize: 13,
    color: colors.textSub,
    lineHeight: 18,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginLeft: 8,
  },
  separator: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 2,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: colors.textSub,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingTop: 12,
    minHeight: 300,
    maxHeight: "80%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ddd",
    alignSelf: "center",
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  modalIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: colors.navy,
  },
  modalClose: {
    padding: 4,
  },
  modalTimestamp: {
    fontSize: 12,
    color: colors.textSub,
    marginBottom: 12,
  },
  modalBody: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
    marginBottom: 20,
  },
  modalReadToggle: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#F5F3FF",
  },
  modalReadToggleText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.primary,
  },
});