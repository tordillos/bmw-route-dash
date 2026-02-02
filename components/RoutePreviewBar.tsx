import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { Route } from "@/types/navigation";

interface RoutePreviewBarProps {
  route: Route;
  onStart: () => void;
  onCancel: () => void;
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return remainMins > 0 ? `${hrs} h ${remainMins} min` : `${hrs} h`;
}

export default function RoutePreviewBar({
  route,
  onStart,
  onCancel,
}: RoutePreviewBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 12 }]}>
      <View style={styles.info}>
        <Text style={styles.duration}>{formatDuration(route.duration)}</Text>
        <Text style={styles.distance}>{formatDistance(route.distance)}</Text>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        <Pressable style={styles.startButton} onPress={onStart}>
          <Text style={styles.startText}>Start</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1c1c1e",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  info: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 16,
  },
  duration: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginRight: 12,
  },
  distance: {
    color: "#999",
    fontSize: 16,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#333",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  startButton: {
    flex: 1,
    backgroundColor: "#1a73e8",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  startText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
