import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { B, W, W40 } from "./constants";

export default function PermissionLoading() {
  return (
    <View style={styles.root}>
      <ActivityIndicator size="large" color={W} />
      <Text style={styles.muted}>Loading</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: B,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  muted: {
    color: W40,
    fontSize: 14,
    fontWeight: "500",
  },
});
