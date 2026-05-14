import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Circle, Rect, Line, Polyline } from "react-native-svg";

interface TabIconProps {
  name: "home" | "cards" | "transact" | "messages" | "settings";
  color: string;
  size?: number;
}

export function TabIcon({ name, color, size = 28 }: TabIconProps) {
  const strokeWidth = 1.5;

  switch (name) {
    case "home":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M3 9L12 3L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M9 22V12H15V22"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case "cards":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect
            x="2"
            y="4"
            width="20"
            height="16"
            rx="2"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M2 10H22"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case "transact":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M7 16L17 6"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M17 16L7 6"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M17 6L20 3"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M7 16L4 19"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case "messages":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case "settings":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 15.5C13.933 15.5 15.5 13.933 15.5 12C15.5 10.067 13.933 8.5 12 8.5C10.067 8.5 8.5 10.067 8.5 12C8.5 13.933 10.067 15.5 12 15.5Z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M19.4 15C19.25 15.34 19.2 15.72 19.26 16.09C19.32 16.46 19.49 16.8 19.75 17.06L19.82 17.13C20.03 17.34 20.15 17.63 20.15 17.93C20.15 18.23 20.03 18.52 19.82 18.73L18.73 19.82C18.52 20.03 18.23 20.15 17.93 20.15C17.63 20.15 17.34 20.03 17.13 19.82L17.06 19.75C16.8 19.49 16.46 19.32 16.09 19.26C15.72 19.2 15.34 19.25 15 19.4C14.67 19.54 14.39 19.78 14.19 20.08C13.99 20.38 13.88 20.73 13.88 21.09V21.29C13.88 21.6 13.76 21.89 13.54 22.11C13.32 22.33 13.03 22.45 12.72 22.45H11.28C10.97 22.45 10.68 22.33 10.46 22.11C10.24 21.89 10.12 21.6 10.12 21.29V21.09C10.12 20.73 10.01 20.38 9.81 20.08C9.61 19.78 9.33 19.54 9 19.4C8.66 19.25 8.28 19.2 7.91 19.26C7.54 19.32 7.2 19.49 6.94 19.75L6.87 19.82C6.66 20.03 6.37 20.15 6.07 20.15C5.77 20.15 5.48 20.03 5.27 19.82L4.18 18.73C3.97 18.52 3.85 18.23 3.85 17.93C3.85 17.63 3.97 17.34 4.18 17.13L4.25 17.06C4.51 16.8 4.68 16.46 4.74 16.09C4.8 15.72 4.75 15.34 4.6 15C4.46 14.67 4.22 14.39 3.92 14.19C3.62 13.99 3.27 13.88 2.91 13.88H2.71C2.4 13.88 2.11 13.76 1.89 13.54C1.67 13.32 1.55 13.03 1.55 12.72V11.28C1.55 10.97 1.67 10.68 1.89 10.46C2.11 10.24 2.4 10.12 2.71 10.12H2.91C3.27 10.12 3.62 10.01 3.92 9.81C4.22 9.61 4.46 9.33 4.6 9C4.75 8.66 4.8 8.28 4.74 7.91C4.68 7.54 4.51 7.2 4.25 6.94L4.18 6.87C3.97 6.66 3.85 6.37 3.85 6.07C3.85 5.77 3.97 5.48 4.18 5.27L5.27 4.18C5.48 3.97 5.77 3.85 6.07 3.85C6.37 3.85 6.66 3.97 6.87 4.18L6.94 4.25C7.2 4.51 7.54 4.68 7.91 4.74C8.28 4.8 8.66 4.75 9 4.6C9.33 4.46 9.61 4.22 9.81 3.92C10.01 3.62 10.12 3.27 10.12 2.91V2.71C10.12 2.4 10.24 2.11 10.46 1.89C10.68 1.67 10.97 1.55 11.28 1.55H12.72C13.03 1.55 13.32 1.67 13.54 1.89C13.76 2.11 13.88 2.4 13.88 2.71V2.91C13.88 3.27 13.99 3.62 14.19 3.92C14.39 4.22 14.67 4.46 15 4.6C15.34 4.75 15.72 4.8 16.09 4.74C16.46 4.68 16.8 4.51 17.06 4.25L17.13 4.18C17.34 3.97 17.63 3.85 17.93 3.85C18.23 3.85 18.52 3.97 18.73 4.18L19.82 5.27C20.03 5.48 20.15 5.77 20.15 6.07C20.15 6.37 20.03 6.66 19.82 6.87L19.75 6.94C19.49 7.2 19.32 7.54 19.26 7.91C19.2 8.28 19.25 8.66 19.4 9C19.54 9.33 19.78 9.61 20.08 9.81C20.38 10.01 20.73 10.12 21.09 10.12H21.29C21.6 10.12 21.89 10.24 22.11 10.46C22.33 10.68 22.45 10.97 22.45 11.28V12.72C22.45 13.03 22.33 13.32 22.11 13.54C21.89 13.76 21.6 13.88 21.29 13.88H21.09C20.73 13.88 20.38 13.99 20.08 14.19C19.78 14.39 19.54 14.67 19.4 15Z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    default:
      return null;
  }
}
