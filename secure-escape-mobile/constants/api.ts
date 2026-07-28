// import { Platform } from "react-native";

const LOCAL_IP = "192.168.1.103";
// const LOCAL_IP = "192.168.8.153";

// export const API_BASE_URL =
//   Platform.OS === "web" ? "http://localhost:5116" : `http://${LOCAL_IP}:5116`;
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;
