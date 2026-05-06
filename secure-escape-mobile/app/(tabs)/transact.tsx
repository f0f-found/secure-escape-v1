import { Text, View, StyleSheet } from "react-native";

export default function TransactScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transact</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFBFC",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
