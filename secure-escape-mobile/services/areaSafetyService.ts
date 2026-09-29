import * as Location from "expo-location";
import {
  getRiskZones,
  RiskLevel,
  RiskZone,
} from "./riskZoneService";

export type AreaSafetyStatus =
  | "inside-high"
  | "inside-medium"
  | "nearby-high"
  | "nearby-medium"
  | "clear";

export type AreaSafetyResult = {
  status: AreaSafetyStatus;
  currentLocation: {
    latitude: number;
    longitude: number;
    accuracyMeters: number | null;
  };
  nearestZone: RiskZone | null;
  distanceToNearestZoneMeters: number | null;
  distanceToNearestZoneBoundaryMeters: number | null;
  isInsideZone: boolean;
  zones: RiskZone[];
};

const NEARBY_DISTANCE_METERS = 1000;

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

export function calculateDistanceMeters(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number,
): number {
  const earthRadiusMeters = 6371000;

  const latitudeDifference = toRadians(latitude2 - latitude1);
  const longitudeDifference = toRadians(longitude2 - longitude1);

  const firstLatitude = toRadians(latitude1);
  const secondLatitude = toRadians(latitude2);

  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDifference / 2) ** 2;

  const c =
    2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusMeters * c;
}

function getRiskPriority(riskLevel: RiskLevel): number {
  switch (riskLevel) {
    case "High":
      return 3;

    case "Medium":
      return 2;

    case "Low":
      return 1;
  }
}

function getStatus(
  zone: RiskZone | null,
  isInsideZone: boolean,
  distanceToBoundaryMeters: number | null,
): AreaSafetyStatus {
  if (!zone) {
    return "clear";
  }

  if (isInsideZone) {
    if (zone.riskLevel === "High") {
      return "inside-high";
    }

    if (zone.riskLevel === "Medium") {
      return "inside-medium";
    }

    return "clear";
  }

  if (
    distanceToBoundaryMeters !== null &&
    distanceToBoundaryMeters <= NEARBY_DISTANCE_METERS
  ) {
    if (zone.riskLevel === "High") {
      return "nearby-high";
    }

    if (zone.riskLevel === "Medium") {
      return "nearby-medium";
    }
  }

  return "clear";
}

export async function checkAreaSafety(): Promise<AreaSafetyResult> {
  const permission =
    await Location.getForegroundPermissionsAsync();

  let permissionStatus = permission.status;

  if (permissionStatus !== "granted") {
    const requestedPermission =
      await Location.requestForegroundPermissionsAsync();

    permissionStatus = requestedPermission.status;
  }

  if (permissionStatus !== "granted") {
    throw new Error(
      "Location access is required to check Area Safety information.",
    );
  }

  const [position, zones] = await Promise.all([
    Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    }),
    getRiskZones(),
  ]);

  const currentLatitude = position.coords.latitude;
  const currentLongitude = position.coords.longitude;

  const evaluatedZones = zones.map((zone) => {
    const distanceToCenterMeters =
      calculateDistanceMeters(
        currentLatitude,
        currentLongitude,
        zone.latitude,
        zone.longitude,
      );

    const distanceToBoundaryMeters =
      distanceToCenterMeters - zone.radiusMeters;

    return {
      zone,
      distanceToCenterMeters,
      distanceToBoundaryMeters,
      isInsideZone: distanceToBoundaryMeters <= 0,
    };
  });

  /*
   * Only High and Medium zones can trigger Area Safety alerts.
   *
   * A zone is considered relevant when the customer is:
   * 1. Inside the zone, or
   * 2. Outside the zone but within the nearby threshold.
   *
   * This prevents a distant High-risk zone from incorrectly
   * taking priority over a genuinely nearby Medium-risk zone.
   */
  const alertableZones = evaluatedZones.filter(
    (item) =>
      item.zone.riskLevel !== "Low" &&
      (item.isInsideZone ||
        item.distanceToBoundaryMeters <=
          NEARBY_DISTANCE_METERS),
  );

  /*
   * Priority:
   *
   * 1. Being inside a zone takes priority over merely being nearby.
   * 2. If multiple qualifying zones have the same inside/nearby
   *    state, the higher configured risk level takes priority.
   * 3. If the risk level is also the same, use the zone whose
   *    boundary is closest to the customer.
   */
  const rankedAlertableZones = alertableZones.sort(
    (first, second) => {
      if (first.isInsideZone !== second.isInsideZone) {
        return first.isInsideZone ? -1 : 1;
      }

      const firstRiskPriority = getRiskPriority(
        first.zone.riskLevel,
      );

      const secondRiskPriority = getRiskPriority(
        second.zone.riskLevel,
      );

      if (firstRiskPriority !== secondRiskPriority) {
        return secondRiskPriority - firstRiskPriority;
      }

      return (
        Math.abs(first.distanceToBoundaryMeters) -
        Math.abs(second.distanceToBoundaryMeters)
      );
    },
  );

  const selectedAlertZone =
    rankedAlertableZones[0] ?? null;

  /*
   * If no High/Medium zone qualifies for an alert, still identify
   * the physically nearest configured zone for map/details.
   * The overall Area Safety status remains "clear".
   */
  const physicallyNearestZone =
    evaluatedZones
      .slice()
      .sort(
        (first, second) =>
          first.distanceToCenterMeters -
          second.distanceToCenterMeters,
      )[0] ?? null;

  const selectedZone =
    selectedAlertZone ?? physicallyNearestZone;

  const nearestZone = selectedZone?.zone ?? null;

  const isInsideZone =
    selectedAlertZone?.isInsideZone ?? false;

  const distanceToNearestZoneMeters =
    selectedZone?.distanceToCenterMeters ?? null;

  const distanceToNearestZoneBoundaryMeters =
    selectedZone?.distanceToBoundaryMeters ?? null;

  const status = selectedAlertZone
    ? getStatus(
        selectedAlertZone.zone,
        selectedAlertZone.isInsideZone,
        selectedAlertZone.distanceToBoundaryMeters,
      )
    : "clear";

  return {
    status,
    currentLocation: {
      latitude: currentLatitude,
      longitude: currentLongitude,
      accuracyMeters: position.coords.accuracy,
    },
    nearestZone,
    distanceToNearestZoneMeters,
    distanceToNearestZoneBoundaryMeters,
    isInsideZone,
    zones,
  };
}