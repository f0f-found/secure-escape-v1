import { Stack } from "expo-router";

export default function SecureEscapeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
