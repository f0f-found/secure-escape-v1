import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { getAccounts } from "@/services/accountService";
import { AccountResponse } from "@/types/account";
import { Ionicons } from "@expo/vector-icons";
import { colors, shadows } from "@/utils/theme";
import { getProfileMe } from "@/services/profileService";
import { ProfileMeResponse } from "@/types/profile";
import { useRouter, useFocusEffect } from "expo-router";
import {
  AreaSafetyResult,
  checkAreaSafety,
} from "@/services/areaSafetyService";
import { notifyForAreaSafety } from "@/services/areaSafetyNotificationService";
import { createMessage } from "@/services/messageService";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();

  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [profile, setProfile] = useState<ProfileMeResponse>();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [areaSafety, setAreaSafety] =
    useState<AreaSafetyResult | null>(null);
  const [isAreaSafetyLoading, setIsAreaSafetyLoading] = useState(true);
  const [areaSafetyError, setAreaSafetyError] = useState<string | null>(
    null,
  );

  const isDuress = profile?.sessionMode === "Duress";

  useEffect(() => {
    loadAccounts();
    loadProfile();
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const refreshHome = async () => {
        loadAccounts();

        try {
          const currentProfile = await getProfileMe();

          if (!isActive) {
            return;
          }

          setProfile(currentProfile);

          if (currentProfile.sessionMode === "Duress") {
            setAreaSafety(null);
            setAreaSafetyError(null);
            setIsAreaSafetyLoading(false);
            return;
          }

          await loadAreaSafety();
        } catch (profileError) {
          console.error(
            "Failed to refresh Home session mode:",
            profileError,
          );

          if (isActive) {
            setIsAreaSafetyLoading(false);
          }
        }
      };

      void refreshHome();

      return () => {
        isActive = false;
      };
    }, []),
  );

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const user = await getProfileMe();
      setProfile(user);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load profile.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadAccounts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getAccounts();
      setAccounts(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load accounts.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadAreaSafety = async () => {
    try {
      setIsAreaSafetyLoading(true);
      setAreaSafetyError(null);

      const result = await checkAreaSafety();
      setAreaSafety(result);

      const alertableStatuses: AreaSafetyResult["status"][] = [
        "inside-high",
        "inside-medium",
        "nearby-high",
        "nearby-medium",
      ];

      if (
        result.nearestZone &&
        alertableStatuses.includes(result.status)
      ) {
        const zone = result.nearestZone;
        const today = new Date().toISOString().slice(0, 10);

        let title = "Area Safety Alert";
        let body =
          "A safety awareness zone is near your current area. Stay aware of your surroundings.";

        switch (result.status) {
          case "inside-high":
            title = "Higher-risk area";
            body = `You are currently within the ${zone.name} safety awareness zone. Stay aware of your surroundings.`;
            break;

          case "inside-medium":
            title = "Elevated-risk area";
            body = `You are currently within the ${zone.name} safety awareness zone. Stay aware of your surroundings.`;
            break;

          case "nearby-high":
            title = "Higher-risk area nearby";
            body = `${zone.name} is near your current area. Stay aware of your surroundings.`;
            break;

          case "nearby-medium":
            title = "Elevated-risk area nearby";
            body = `${zone.name} is near your current area. Stay aware of your surroundings.`;
            break;
        }

        try {
          await createMessage({
            title,
            body,
            category: "AreaSafety",
            referenceType: "RiskZone",
            referenceId: zone.id,
            deduplicationKey: `area-safety:${zone.id}:${result.status}:${today}`,
          });
        } catch (messageError) {
          console.warn(
            "Area Safety message could not be saved:",
            messageError,
          );
        }
      }

      try {
        await notifyForAreaSafety(result);
      } catch (notificationError) {
        console.warn(
          "Area Safety notification could not be delivered:",
          notificationError,
        );
      }
    } catch (err) {
      setAreaSafety(null);

      setAreaSafetyError(
        err instanceof Error
          ? err.message
          : "Area Safety is temporarily unavailable.",
      );
    } finally {
      setIsAreaSafetyLoading(false);
    }
  };

  const accountCards = accounts.map((account, index) => ({
    id: account.id,
    name: account.accountName,
    balance: account.availableBalance,
    icon: index === 0 ? "wallet" : "trending-up",
    gradient:
      index === 0
        ? (["#9F8FEF", "#7C6EF7"] as const)
        : (["#93C5FD", "#60A5FA"] as const),
    iconBg: index === 0 ? "#9F8FEF20" : "#60A5FA20",
  }));

  const favourites = [
    {
      label: "Pay Beneficiary",
      icon: "people",
      bg: "#EEEEFF",
      link: "/beneficiaries/beneficiary-list",
    },
    {
      label: "Transfer",
      icon: "swap-horizontal",
      bg: "#FFF0F5",
      link: "/beneficiaries/beneficiary-list",
    },
    {
      label: "Send Cash",
      icon: "cash",
      bg: "#E6FAF8",
      link: "/transactions/create-cash-send",
    },
    {
      label: "Cards",
      icon: "card",
      bg: "#FFF5F5",
      link: "/(tabs)/cards",
    },
    {
      label: "Transaction report",
      icon: "stats-chart",
      bg: "#EEEEFF",
      link: "/transactions/report",
    },
    {
      label: "Financial Advice",
      icon: "document-text",
      bg: "#F0FDF4",
      link: "/advice/financial-advice",
    },
    {
      label: "Security Tips",
      icon: "shield-checkmark",
      bg: "#FFF5F5",
      link: "/advice/security-tips",
    },
  ];

  const handleFavPress = (item: (typeof favourites)[0]) => {
    if (item.link) {
      router.push(item.link as never);
      return;
    }

    Alert.alert(
      "Coming Soon",
      `The "${item.label}" feature will be available in the next sprint.`,
      [{ text: "OK", style: "default" }],
    );
  };

  const openAreaSafety = () => {
    if (isDuress) {
      return;
    }

    router.push("/area-safety" as never);
  };

  const formatDistance = (meters: number | null) => {
    if (meters === null) {
      return null;
    }

    const safeMeters = Math.max(0, meters);

    if (safeMeters < 1000) {
      return `${Math.round(safeMeters)} m`;
    }

    return `${(safeMeters / 1000).toFixed(1)} km`;
  };

  const getAreaSafetyContent = () => {
    if (!areaSafety) {
      return {
        title: "Area Safety",
        message: "No elevated-risk areas detected nearby.",
        icon: "shield-checkmark" as const,
        tone: "clear" as const,
      };
    }

    const zone = areaSafety.nearestZone;

    switch (areaSafety.status) {
      case "inside-high":
        return {
          title: "Higher-risk area",
          message: zone
            ? `You are currently within the ${zone.name} safety awareness zone. Stay aware of your surroundings.`
            : "You are currently within a higher-risk safety awareness zone.",
          icon: "warning" as const,
          tone: "high" as const,
        };

      case "inside-medium":
        return {
          title: "Elevated-risk area",
          message: zone
            ? `You are currently within the ${zone.name} safety awareness zone. Stay aware of your surroundings.`
            : "You are currently within an elevated-risk safety awareness zone.",
          icon: "alert-circle" as const,
          tone: "medium" as const,
        };

      case "nearby-high": {
        const distance = formatDistance(
          areaSafety.distanceToNearestZoneBoundaryMeters,
        );

        return {
          title: "Higher-risk area nearby",
          message: zone
            ? `${zone.name} is${distance ? ` about ${distance}` : ""} from your current area.`
            : "A higher-risk safety awareness zone is nearby.",
          icon: "warning" as const,
          tone: "high" as const,
        };
      }

      case "nearby-medium": {
        const distance = formatDistance(
          areaSafety.distanceToNearestZoneBoundaryMeters,
        );

        return {
          title: "Elevated-risk area nearby",
          message: zone
            ? `${zone.name} is${distance ? ` about ${distance}` : ""} from your current area.`
            : "An elevated-risk safety awareness zone is nearby.",
          icon: "alert-circle" as const,
          tone: "medium" as const,
        };
      }

      default:
        return {
          title: "Area Safety",
          message: "No elevated-risk areas detected nearby.",
          icon: "shield-checkmark" as const,
          tone: "clear" as const,
        };
    }
  };

  const areaSafetyContent = getAreaSafetyContent();

  return (
    <View style={styles.pageContainer}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerComponent}>
          <View style={styles.header}>
            <Text style={styles.title}>My Dashboard</Text>

            <Text style={styles.greeting}>
              Good afternoon, {profile?.fullName || "User"}
            </Text>
          </View>
        </View>

        {isLoading && (
          <Text style={styles.stateText}>Loading accounts...</Text>
        )}

        {error && (
          <TouchableOpacity onPress={loadAccounts}>
            <Text style={styles.errorText}>{error}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.cardsRow}>
          {accountCards.map((card) => (
            <TouchableOpacity
              key={card.id}
              activeOpacity={0.9}
              style={styles.cardWrapper}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/accounts/account-detail",
                  params: {
                    accountId: card.id,
                    accountName: card.name,
                    balance: card.balance.toString(),
                  },
                })
              }
            >
              <LinearGradient
                colors={card.gradient}
                style={styles.accountCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: card.iconBg },
                  ]}
                >
                  <Ionicons
                    name={
                      card.icon as keyof typeof Ionicons.glyphMap
                    }
                    size={24}
                    color={colors.primary}
                  />
                </View>

                <Text style={styles.accName}>{card.name}</Text>

                <Text style={styles.accBalance}>
                  R {card.balance.toLocaleString()}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {!isDuress && (
          <View style={styles.areaSafetySection}>
            <View style={styles.areaSafetyHeadingRow}>
              <View>
                <Text style={styles.areaSafetySectionTitle}>
                  Area Safety
                </Text>

                <Text style={styles.areaSafetySectionSubtitle}>
                  Awareness based on your current location
                </Text>
              </View>

              {!isAreaSafetyLoading && (
                <TouchableOpacity
                  style={styles.refreshButton}
                  onPress={loadAreaSafety}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Refresh Area Safety"
                >
                  <Ionicons
                    name="refresh"
                    size={18}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              )}
            </View>

            {isAreaSafetyLoading ? (
              <View style={styles.areaSafetyCard}>
                <View style={styles.areaSafetyLoadingRow}>
                  <ActivityIndicator
                    size="small"
                    color={colors.primary}
                  />

                  <View style={styles.areaSafetyTextContainer}>
                    <Text style={styles.areaSafetyCardTitle}>
                      Checking your area
                    </Text>

                    <Text style={styles.areaSafetyMessage}>
                      Getting current Area Safety information...
                    </Text>
                  </View>
                </View>
              </View>
            ) : areaSafetyError ? (
              <TouchableOpacity
                style={[
                  styles.areaSafetyCard,
                  styles.areaSafetyUnavailableCard,
                ]}
                onPress={loadAreaSafety}
                activeOpacity={0.8}
              >
                <View style={styles.areaSafetyLoadingRow}>
                  <View
                    style={[
                      styles.areaSafetyIcon,
                      styles.areaSafetyUnavailableIcon,
                    ]}
                  >
                    <Ionicons
                      name="location-outline"
                      size={22}
                      color={colors.textSub}
                    />
                  </View>

                  <View style={styles.areaSafetyTextContainer}>
                    <Text style={styles.areaSafetyCardTitle}>
                      Area Safety unavailable
                    </Text>

                    <Text style={styles.areaSafetyMessage}>
                      {areaSafetyError}
                    </Text>

                    <Text style={styles.areaSafetyRetry}>
                      Tap to try again
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.areaSafetyCard,
                  areaSafetyContent.tone === "high" &&
                    styles.areaSafetyHighCard,
                  areaSafetyContent.tone === "medium" &&
                    styles.areaSafetyMediumCard,
                ]}
                onPress={openAreaSafety}
                activeOpacity={0.82}
                accessibilityRole="button"
                accessibilityLabel="Open Area Safety map"
              >
                <View style={styles.areaSafetyLoadingRow}>
                  <View
                    style={[
                      styles.areaSafetyIcon,
                      areaSafetyContent.tone === "clear" &&
                        styles.areaSafetyClearIcon,
                      areaSafetyContent.tone === "high" &&
                        styles.areaSafetyHighIcon,
                      areaSafetyContent.tone === "medium" &&
                        styles.areaSafetyMediumIcon,
                    ]}
                  >
                    <Ionicons
                      name={areaSafetyContent.icon}
                      size={22}
                      color={
                        areaSafetyContent.tone === "high"
                          ? "#B42318"
                          : areaSafetyContent.tone === "medium"
                            ? "#B54708"
                            : colors.primary
                      }
                    />
                  </View>

                  <View style={styles.areaSafetyTextContainer}>
                    <Text style={styles.areaSafetyCardTitle}>
                      {areaSafetyContent.title}
                    </Text>

                    <Text style={styles.areaSafetyMessage}>
                      {areaSafetyContent.message}
                    </Text>

                    <View style={styles.areaSafetyMapLink}>
                      <Text style={styles.areaSafetyMapLinkText}>
                        View safety map
                      </Text>

                      <Ionicons
                        name="chevron-forward"
                        size={15}
                        color={colors.primary}
                      />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.favouritesSection}>
          <View style={styles.favouritesHeader}>
            <Text style={styles.favTitle}>Favourites</Text>

            <TouchableOpacity>
              <Text style={styles.editLink}>edit ›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.favGrid}>
            {favourites.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.favTile}
                activeOpacity={0.7}
                onPress={() => handleFavPress(item)}
              >
                <View
                  style={[
                    styles.favIcon,
                    { backgroundColor: item.bg },
                  ]}
                >
                  <Ionicons
                    name={
                      item.icon as keyof typeof Ionicons.glyphMap
                    }
                    size={24}
                    color={colors.primary}
                  />
                </View>

                <Text style={styles.favLabel}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: colors.greyBg,
  },

  container: {
    flex: 1,
    backgroundColor: colors.greyBg,
  },

  scrollContent: {
    paddingBottom: 40,
  },

  headerComponent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  header: {
    flex: 1,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.navy,
  },

  greeting: {
    fontSize: 14,
    color: colors.textSub,
    marginTop: 6,
  },

  stateText: {
    paddingHorizontal: 20,
    marginBottom: 12,
    color: colors.textSub,
    fontSize: 13,
  },

  errorText: {
    paddingHorizontal: 20,
    marginBottom: 12,
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "600",
  },

  cardsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 16,
    marginTop: 8,
    marginBottom: 24,
  },

  cardWrapper: {
    flex: 1,
  },

  accountCard: {
    borderRadius: 28,
    padding: 18,
    ...shadows.medium,
  },

  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  accName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.white,
    opacity: 0.9,
  },

  accBalance: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.white,
    marginTop: 6,
  },

  areaSafetySection: {
    paddingHorizontal: 16,
    marginBottom: 26,
  },

  areaSafetyHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  areaSafetySectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.navy,
  },

  areaSafetySectionSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textSub,
  },

  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.greyLine,
  },

  areaSafetyCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.greyLine,
    ...shadows.medium,
  },

  areaSafetyHighCard: {
    backgroundColor: "#FFF7F6",
    borderColor: "#FECDCA",
  },

  areaSafetyMediumCard: {
    backgroundColor: "#FFFAEB",
    borderColor: "#FEDF89",
  },

  areaSafetyUnavailableCard: {
    backgroundColor: "#F8FAFC",
  },

  areaSafetyLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  areaSafetyIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  areaSafetyClearIcon: {
    backgroundColor: "#EFF6FF",
  },

  areaSafetyHighIcon: {
    backgroundColor: "#FEE4E2",
  },

  areaSafetyMediumIcon: {
    backgroundColor: "#FEF0C7",
  },

  areaSafetyUnavailableIcon: {
    backgroundColor: "#F1F5F9",
  },

  areaSafetyTextContainer: {
    flex: 1,
  },

  areaSafetyCardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.navy,
  },

  areaSafetyMessage: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSub,
  },

  areaSafetyRetry: {
    marginTop: 7,
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },

  areaSafetyMapLink: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  areaSafetyMapLinkText: {
    marginRight: 3,
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },

  favouritesSection: {
    paddingHorizontal: 16,
    marginTop: 4,
  },

  favouritesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  favTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.navy,
  },

  editLink: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
    opacity: 0.75,
  },

  favGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  favTile: {
    width: (width - 48) / 3,
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 14,
    ...shadows.medium,
  },

  favIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  favLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textMain,
    textAlign: "center",
    paddingHorizontal: 4,
  },
});