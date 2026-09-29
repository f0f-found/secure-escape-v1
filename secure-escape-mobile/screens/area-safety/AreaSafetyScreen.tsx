import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, {
  Circle,
  Marker,
  PROVIDER_DEFAULT,
  Region,
} from "react-native-maps";

import {
  AreaSafetyResult,
  checkAreaSafety,
} from "@/services/areaSafetyService";
import { RiskLevel, RiskZone } from "@/services/riskZoneService";

const INITIAL_LATITUDE_DELTA = 0.12;
const INITIAL_LONGITUDE_DELTA = 0.12;

type StatusContent = {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: "high" | "medium" | "clear";
};

function getStatusContent(result: AreaSafetyResult): StatusContent {
  const zoneName = result.nearestZone?.name;

  switch (result.status) {
    case "inside-high":
      return {
        title: "Higher-risk area",
        description: zoneName
          ? `You are currently within the ${zoneName} safety awareness zone. Stay aware of your surroundings.`
          : "You are currently within a higher-risk safety awareness zone.",
        icon: "warning-outline",
        tone: "high",
      };

    case "inside-medium":
      return {
        title: "Elevated-risk area",
        description: zoneName
          ? `You are currently within the ${zoneName} safety awareness zone. Stay aware of your surroundings.`
          : "You are currently within an elevated-risk safety awareness zone.",
        icon: "alert-circle-outline",
        tone: "medium",
      };

    case "nearby-high":
      return {
        title: "Higher-risk area nearby",
        description: zoneName
          ? `${zoneName} is close to your current location. Stay aware of your surroundings.`
          : "A higher-risk safety awareness zone is close to your current location.",
        icon: "warning-outline",
        tone: "high",
      };

    case "nearby-medium":
      return {
        title: "Elevated-risk area nearby",
        description: zoneName
          ? `${zoneName} is close to your current location. Stay aware of your surroundings.`
          : "An elevated-risk safety awareness zone is close to your current location.",
        icon: "alert-circle-outline",
        tone: "medium",
      };

    default:
      return {
        title: "No elevated-risk areas detected nearby",
        description:
          "There are currently no High or Medium safety awareness zones detected near your location.",
        icon: "shield-checkmark-outline",
        tone: "clear",
      };
  }
}

function getRiskColour(level: RiskLevel): string {
  switch (level) {
    case "High":
      return "#C43D3D";
    case "Medium":
      return "#D58B18";
    case "Low":
      return "#2F7D5A";
  }
}

function getRiskFillColour(level: RiskLevel): string {
  switch (level) {
    case "High":
      return "rgba(196, 61, 61, 0.18)";
    case "Medium":
      return "rgba(213, 139, 24, 0.16)";
    case "Low":
      return "rgba(47, 125, 90, 0.12)";
  }
}

function getStatusColours(tone: StatusContent["tone"]) {
  switch (tone) {
    case "high":
      return {
        background: "#FFF4F4",
        border: "#F1CACA",
        iconBackground: "#FCE1E1",
        icon: "#B83232",
        title: "#8E2929",
      };

    case "medium":
      return {
        background: "#FFF8EB",
        border: "#F0D8A7",
        iconBackground: "#FCECCB",
        icon: "#B16E0D",
        title: "#85520A",
      };

    default:
      return {
        background: "#F1F8F5",
        border: "#CDE3D8",
        iconBackground: "#DCEFE6",
        icon: "#24684A",
        title: "#1D563D",
      };
  }
}

function formatDistance(distanceMeters: number | null): string | null {
  if (distanceMeters === null) {
    return null;
  }

  const safeDistance = Math.max(0, distanceMeters);

  if (safeDistance < 1000) {
    return `${Math.round(safeDistance)} m`;
  }

  return `${(safeDistance / 1000).toFixed(1)} km`;
}

function getZoneDescription(zone: RiskZone): string {
  if (zone.description?.trim()) {
    return zone.description.trim();
  }

  return `${zone.riskLevel} safety awareness zone.`;
}

export default function AreaSafetyScreen() {
  const router = useRouter();

  const [result, setResult] = useState<AreaSafetyResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<RiskZone | null>(null);

  const loadAreaSafety = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const nextResult = await checkAreaSafety();

      setResult(nextResult);
      setSelectedZone(nextResult.nearestZone);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Area Safety information could not be loaded.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAreaSafety();
    }, [loadAreaSafety]),
  );

  const mapRegion = useMemo<Region | undefined>(() => {
    if (!result) {
      return undefined;
    }

    return {
      latitude: result.currentLocation.latitude,
      longitude: result.currentLocation.longitude,
      latitudeDelta: INITIAL_LATITUDE_DELTA,
      longitudeDelta: INITIAL_LONGITUDE_DELTA,
    };
  }, [result]);

  const statusContent = result ? getStatusContent(result) : null;
  const statusColours = statusContent
    ? getStatusColours(statusContent.tone)
    : null;

  const boundaryDistance = result
    ? formatDistance(result.distanceToNearestZoneBoundaryMeters)
    : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.headerButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="chevron-back" size={24} color="#14213D" />
        </Pressable>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Area Safety</Text>
          <Text style={styles.headerSubtitle}>Location awareness</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Refresh area safety"
          onPress={loadAreaSafety}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.headerButton,
            pressed && !isLoading && styles.pressed,
          ]}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#1D5FD1" />
          ) : (
            <Ionicons name="refresh" size={21} color="#1D5FD1" />
          )}
        </Pressable>
      </View>

      {isLoading && !result ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#1D5FD1" />
          <Text style={styles.centerStateTitle}>Checking your area</Text>
          <Text style={styles.centerStateText}>
            Using your current location to load nearby safety awareness zones.
          </Text>
        </View>
      ) : error && !result ? (
        <View style={styles.centerState}>
          <View style={styles.errorIcon}>
            <Ionicons
              name="cloud-offline-outline"
              size={30}
              color="#A33A3A"
            />
          </View>

          <Text style={styles.centerStateTitle}>
            Area Safety unavailable
          </Text>

          <Text style={styles.centerStateText}>{error}</Text>

          <Pressable
            onPress={loadAreaSafety}
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.retryButtonPressed,
            ]}
          >
            <Ionicons name="refresh" size={18} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Try again</Text>
          </Pressable>
        </View>
      ) : result && mapRegion && statusContent && statusColours ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.statusCard,
              {
                backgroundColor: statusColours.background,
                borderColor: statusColours.border,
              },
            ]}
          >
            <View
              style={[
                styles.statusIcon,
                { backgroundColor: statusColours.iconBackground },
              ]}
            >
              <Ionicons
                name={statusContent.icon}
                size={24}
                color={statusColours.icon}
              />
            </View>

            <View style={styles.statusText}>
              <Text
                style={[
                  styles.statusTitle,
                  { color: statusColours.title },
                ]}
              >
                {statusContent.title}
              </Text>

              <Text style={styles.statusDescription}>
                {statusContent.description}
              </Text>

              {result.nearestZone &&
              result.status !== "clear" &&
              !result.isInsideZone &&
              boundaryDistance ? (
                <Text style={styles.distanceText}>
                  Approximately {boundaryDistance} from the zone boundary
                </Text>
              ) : null}
            </View>
          </View>

          <View style={styles.sectionHeading}>
            <View>
              <Text style={styles.sectionTitle}>Safety map</Text>
              <Text style={styles.sectionSubtitle}>
                Your location and configured awareness zones
              </Text>
            </View>

            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Current</Text>
            </View>
          </View>

          <View style={styles.mapCard}>
            <MapView
              provider={PROVIDER_DEFAULT}
              style={styles.map}
              initialRegion={mapRegion}
              showsUserLocation
              showsMyLocationButton
              showsCompass
              onPress={() => setSelectedZone(null)}
            >
              {result.zones.map((zone) => {
                const colour = getRiskColour(zone.riskLevel);

                return (
                  <React.Fragment key={zone.id}>
                    <Circle
                      center={{
                        latitude: zone.latitude,
                        longitude: zone.longitude,
                      }}
                      radius={zone.radiusMeters}
                      strokeColor={colour}
                      fillColor={getRiskFillColour(zone.riskLevel)}
                      strokeWidth={2}
                    />

                    <Marker
                      coordinate={{
                        latitude: zone.latitude,
                        longitude: zone.longitude,
                      }}
                      title={zone.name}
                      description={`${zone.riskLevel} awareness zone`}
                      pinColor={colour}
                      onPress={() => setSelectedZone(zone)}
                    />
                  </React.Fragment>
                );
              })}
            </MapView>

            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: getRiskColour("High") },
                  ]}
                />
                <Text style={styles.legendText}>High</Text>
              </View>

              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: getRiskColour("Medium") },
                  ]}
                />
                <Text style={styles.legendText}>Medium</Text>
              </View>

              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: getRiskColour("Low") },
                  ]}
                />
                <Text style={styles.legendText}>Low</Text>
              </View>
            </View>
          </View>

          {selectedZone ? (
            <View style={styles.zoneCard}>
              <View style={styles.zoneHeader}>
                <View style={styles.zoneTitleContainer}>
                  <Text style={styles.zoneName}>{selectedZone.name}</Text>
                  <Text style={styles.zoneDescription}>
                    {getZoneDescription(selectedZone)}
                  </Text>
                </View>

                <View
                  style={[
                    styles.riskBadge,
                    {
                      backgroundColor: getRiskFillColour(
                        selectedZone.riskLevel,
                      ),
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.riskBadgeDot,
                      {
                        backgroundColor: getRiskColour(
                          selectedZone.riskLevel,
                        ),
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.riskBadgeText,
                      {
                        color: getRiskColour(selectedZone.riskLevel),
                      },
                    ]}
                  >
                    {selectedZone.riskLevel}
                  </Text>
                </View>
              </View>

              <View style={styles.zoneMetaRow}>
                <View style={styles.zoneMetaItem}>
                  <Ionicons
                    name="resize-outline"
                    size={17}
                    color="#5C677D"
                  />
                  <Text style={styles.zoneMetaText}>
                    {formatDistance(selectedZone.radiusMeters)} radius
                  </Text>
                </View>

                {result.nearestZone?.id === selectedZone.id &&
                result.isInsideZone ? (
                  <View style={styles.zoneMetaItem}>
                    <Ionicons
                      name="location"
                      size={17}
                      color="#1D5FD1"
                    />
                    <Text style={styles.currentZoneText}>
                      Your current zone
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          ) : (
            <View style={styles.mapHint}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#526078"
              />
              <Text style={styles.mapHintText}>
                Tap a zone marker on the map to view its details.
              </Text>
            </View>
          )}

          <View style={styles.guidanceCard}>
            <View style={styles.guidanceIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={23}
                color="#1D5FD1"
              />
            </View>

            <View style={styles.guidanceContent}>
              <Text style={styles.guidanceTitle}>
                Stay aware, not alarmed
              </Text>
              <Text style={styles.guidanceText}>
                Area Safety provides location-based awareness using configured
                risk zones. Risk levels are intended to support safer banking
                behaviour and do not guarantee that an area is safe or unsafe.
              </Text>
            </View>
          </View>

          <View style={styles.privacyRow}>
            <Ionicons
              name="location-outline"
              size={18}
              color="#69758A"
            />
            <Text style={styles.privacyText}>
              Your current location is checked when Area Safety loads or is
              refreshed. This screen does not display a history of your
              locations.
            </Text>
          </View>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },
  header: {
    minHeight: 72,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E6EAF0",
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F6FA",
  },
  pressed: {
    opacity: 0.65,
  },
  headerTextContainer: {
    flex: 1,
    paddingHorizontal: 14,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#14213D",
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#6A7486",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  centerState: {
    flex: 1,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  centerStateTitle: {
    marginTop: 16,
    fontSize: 19,
    fontWeight: "700",
    color: "#14213D",
    textAlign: "center",
  },
  centerStateText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: "#667085",
    textAlign: "center",
  },
  errorIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FCEAEA",
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#1D5FD1",
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  retryButtonPressed: {
    opacity: 0.8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  statusCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
  },
  statusIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },
  statusText: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  statusDescription: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    color: "#4C5668",
  },
  distanceText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
    color: "#697386",
  },
  sectionHeading: {
    marginTop: 24,
    marginBottom: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#17233D",
  },
  sectionSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: "#707B8D",
  },
  livePill: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF2FF",
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
    backgroundColor: "#1D5FD1",
  },
  liveText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1D5FD1",
  },
  mapCard: {
    height: 390,
    overflow: "hidden",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#DFE4EC",
    backgroundColor: "#FFFFFF",
  },
  map: {
    flex: 1,
  },
  legend: {
    position: "absolute",
    left: 12,
    bottom: 12,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 12,
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.94)",
    borderWidth: 1,
    borderColor: "#E2E6EC",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  legendText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#465268",
  },
  zoneCard: {
    marginTop: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E1E5EB",
    backgroundColor: "#FFFFFF",
  },
  zoneHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  zoneTitleContainer: {
    flex: 1,
    paddingRight: 12,
  },
  zoneName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#17233D",
  },
  zoneDescription: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    color: "#626D80",
  },
  riskBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  riskBadgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 5,
  },
  riskBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  zoneMetaRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#EDF0F4",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  zoneMetaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  zoneMetaText: {
    marginLeft: 6,
    fontSize: 12,
    color: "#5C677D",
  },
  currentZoneText: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: "700",
    color: "#1D5FD1",
  },
  mapHint: {
    marginTop: 12,
    padding: 13,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2F7",
  },
  mapHintText: {
    flex: 1,
    marginLeft: 9,
    fontSize: 12,
    lineHeight: 18,
    color: "#596579",
  },
  guidanceCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DCE4F0",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
  },
  guidanceIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  guidanceContent: {
    flex: 1,
  },
  guidanceTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#17233D",
  },
  guidanceText: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    color: "#626D80",
  },
  privacyRow: {
    marginTop: 18,
    paddingHorizontal: 4,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  privacyText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 11,
    lineHeight: 17,
    color: "#737E90",
  },
});