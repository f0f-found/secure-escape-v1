import { Platform } from "react-native";

export const API_BASE_URL =
  Platform.OS === "android"
    ? "http://192.168.1.103:5116"
    : "http://192.168.1.103:5116";
