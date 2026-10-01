import { useEffect, useRef } from "react";
import { AppState, Keyboard, Platform } from "react-native";
import { useRouter } from "expo-router";
import { API_BASE_URL } from "@/constants/api";
import {
  clearAuthToken,
  getAuthToken,
  getLastActivity,
  SESSION_TIMEOUT_MS,
  setLastActivityNow,
} from "@/services/tokenStore";

const SYNC_INTERVAL_MS = 15_000;

// Only user interaction renews the local timer. A periodic check never counts
// as activity, and a backgrounded app never sends keep-alive requests.
export function useSessionActivity(route: string) {
  const router = useRouter();
  const recordActivity = useRef<() => void>(() => {});

  useEffect(() => {
    let disposed = false;
    let token: string | null = null;
    let lastActivity = 0;
    let syncedActivity = 0;
    let lastSync = 0;
    let syncing = false;
    let ending = false;
    let foreground = AppState.currentState !== "background" &&
      AppState.currentState !== "inactive";
    let storageWrites = Promise.resolve();
    let activeRequest: AbortController | null = null;

    const endSession = async () => {
      if (disposed || ending || !token) return;
      ending = true;
      await storageWrites;
      // An old request must never clear a newer PIN login.
      if (disposed || (await getAuthToken()) !== token) return;
      await clearAuthToken();
      if (!disposed) router.replace("/(auth)");
    };

    const syncActivity = async (force = false) => {
      if (disposed || ending || !token || syncing || !foreground) return;
      if (Date.now() - lastActivity >= SESSION_TIMEOUT_MS) {
        await endSession();
        return;
      }
      if (!force && (lastActivity <= syncedActivity ||
          Date.now() - lastSync < SYNC_INTERVAL_MS)) return;
      syncing = true;
      lastSync = Date.now();
      const activitySent = lastActivity;
      const controller = new AbortController();
      activeRequest = controller;
      const timeout = setTimeout(() => controller.abort(), 10_000);
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/activity`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (response.status === 401) await endSession();
        else if (response.ok) syncedActivity = activitySent;
      } catch {
        // Connectivity failures are not proof that the session was revoked.
      } finally {
        clearTimeout(timeout);
        activeRequest = null;
        syncing = false;
      }
    };

    const record = () => {
      if (disposed || ending || !token || !foreground) return;
      const now = Date.now();
      if (now - lastActivity >= SESSION_TIMEOUT_MS) {
        void endSession();
        return;
      }
      // Coalesce scroll/touch events to avoid excessive secure-store writes.
      if (now - lastActivity < 1000) return;
      lastActivity = now;
      storageWrites = storageWrites.then(() => setLastActivityNow(now))
        .catch(() => {});
      void syncActivity();
    };
    recordActivity.current = record;

    const initialize = async () => {
      const [storedToken, storedActivity] = await Promise.all([
        getAuthToken(), getLastActivity(),
      ]);
      if (disposed) return;
      token = storedToken;
      lastActivity = storedActivity ?? 0;
      await syncActivity(true);
    };
    void initialize().catch(() => {});

    const timer = setInterval(() => {
      if (!foreground || !token) return;
      if (Date.now() - lastActivity >= SESSION_TIMEOUT_MS) void endSession();
      else void syncActivity();
    }, 1000);

    const appState = AppState.addEventListener("change", (state) => {
      // Flush recent interaction once before background timers are suspended.
      if (state !== "active" && foreground && lastActivity > syncedActivity) {
        void syncActivity(true);
      }
      foreground = state === "active";
      if (foreground) void syncActivity(true);
    });
    const keyboard = Keyboard.addListener("keyboardDidShow", record);
    const webEvents = ["pointerdown", "pointermove", "keydown", "input", "wheel"];
    const visibilityChanged = () => {
      if (document.visibilityState !== "visible" && foreground && lastActivity > syncedActivity) {
        void syncActivity(true);
      }
      foreground = document.visibilityState === "visible";
      if (foreground) void syncActivity(true);
    };
    if (Platform.OS === "web") {
      foreground = document.visibilityState === "visible";
      webEvents.forEach((event) => document.addEventListener(event, record, { passive: true }));
      document.addEventListener("visibilitychange", visibilityChanged);
    }

    return () => {
      disposed = true;
      activeRequest?.abort();
      recordActivity.current = () => {};
      clearInterval(timer);
      appState.remove();
      keyboard.remove();
      if (Platform.OS === "web") {
        webEvents.forEach((event) => document.removeEventListener(event, record));
        document.removeEventListener("visibilitychange", visibilityChanged);
      }
    };
  }, [route, router]);

  return () => recordActivity.current();
}
