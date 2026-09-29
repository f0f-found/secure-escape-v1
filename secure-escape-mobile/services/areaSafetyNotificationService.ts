import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { AreaSafetyResult } from "./areaSafetyService";

const LAST_AREA_SAFETY_ALERT_KEY = "last-area-safety-alert-v3";
const ANDROID_CHANNEL_ID = "area-safety";

type AlertableStatus =
  | "inside-high"
  | "inside-medium"
  | "nearby-high"
  | "nearby-medium";

function isAlertableStatus(
  status: AreaSafetyResult["status"],
): status is AlertableStatus {
  return (
    status === "inside-high" ||
    status === "inside-medium" ||
    status === "nearby-high" ||
    status === "nearby-medium"
  );
}

function getNotificationContent(result: AreaSafetyResult) {
  const zoneName =
    result.nearestZone?.name ?? "a safety awareness zone";

  switch (result.status) {
    case "inside-high":
      return {
        title: "Safety alert",
        body: `You are currently within the ${zoneName} higher-risk awareness zone. Stay aware of your surroundings and keep your banking details private.`,
      };

    case "inside-medium":
      return {
        title: "Area safety update",
        body: `You are currently within the ${zoneName} elevated-risk awareness zone. Stay aware of your surroundings and keep your banking details private.`,
      };

    case "nearby-high":
      return {
        title: "Safety alert",
        body: `You are approaching the ${zoneName} higher-risk awareness zone. Stay aware of your surroundings and keep your banking details private.`,
      };

    case "nearby-medium":
      return {
        title: "Area safety update",
        body: `You are approaching the ${zoneName} elevated-risk awareness zone. Stay aware of your surroundings and keep your banking details private.`,
      };

    default:
      return null;
  }
}

function getLocalDateKey(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function buildAlertKey(
  result: AreaSafetyResult,
): string | null {
  if (!isAlertableStatus(result.status) || !result.nearestZone) {
    return null;
  }

  const localDate = getLocalDateKey();

  return `${result.nearestZone.id}:${result.status}:${localDate}`;
}

async function configureAndroidNotificationChannel(): Promise<void> {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync(
    ANDROID_CHANNEL_ID,
    {
      name: "Area Safety",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
      enableVibrate: true,
      showBadge: true,
    },
  );
}

async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") {
    return false;
  }

  if (Platform.OS === "android") {
    await configureAndroidNotificationChannel();
  }

  const currentPermissions =
    await Notifications.getPermissionsAsync();

  if (currentPermissions.granted) {
    return true;
  }

  const requestedPermissions =
    await Notifications.requestPermissionsAsync();

  return requestedPermissions.granted;
}

export async function notifyForAreaSafety(
  result: AreaSafetyResult,
): Promise<void> {
  if (Platform.OS === "web") {
    return;
  }

  const alertKey = buildAlertKey(result);

  if (!alertKey) {
    await SecureStore.deleteItemAsync(
      LAST_AREA_SAFETY_ALERT_KEY,
    );
    return;
  }

  const previousAlertKey = await SecureStore.getItemAsync(
    LAST_AREA_SAFETY_ALERT_KEY,
  );

  if (previousAlertKey === alertKey) {
    return;
  }

  const hasPermission = await ensureNotificationPermission();

  if (!hasPermission) {
    return;
  }

  const content = getNotificationContent(result);

  if (!content) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: content.title,
      body: content.body,
      data: {
        type: "area-safety",
        zoneId: result.nearestZone?.id,
        riskLevel: result.nearestZone?.riskLevel,
        areaSafetyStatus: result.status,
      },
      sound: "default",
    },
    trigger:
      Platform.OS === "android"
        ? {
            type:
              Notifications.SchedulableTriggerInputTypes
                .TIME_INTERVAL,
            seconds: 1,
            channelId: ANDROID_CHANNEL_ID,
          }
        : null,
  });

  await SecureStore.setItemAsync(
    LAST_AREA_SAFETY_ALERT_KEY,
    alertKey,
  );
}