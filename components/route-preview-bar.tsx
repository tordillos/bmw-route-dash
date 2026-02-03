import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { darkTheme } from "@/styles/theme";
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
    <View
      style={[
        styles.container,
        { paddingBottom: insets.bottom + darkTheme.space(3) },
      ]}
    >
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

const styles = StyleSheet.create((t) => ({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: t.colors.card,
    borderTopLeftRadius: t.radius.xxl,
    borderTopRightRadius: t.radius.xxl,
    paddingTop: t.space(4),
    paddingHorizontal: t.space(4),
  },
  info: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: t.space(4),
  },
  duration: {
    color: t.colors.cardForeground,
    fontSize: t.fontSize.xxl,
    fontWeight: t.fontWeight.bold,
    marginRight: t.space(3),
  },
  distance: {
    color: t.colors.mutedForeground,
    fontSize: t.fontSize.base,
  },
  actions: {
    flexDirection: "row",
    gap: t.gap(3),
  },
  cancelButton: {
    flex: 1,
    backgroundColor: t.colors.secondary,
    borderRadius: t.radius.xl,
    paddingVertical: t.space(3.5),
    alignItems: "center",
  },
  cancelText: {
    color: t.colors.secondaryForeground,
    fontSize: t.fontSize.base,
    fontWeight: t.fontWeight.semibold,
  },
  startButton: {
    flex: 1,
    backgroundColor: t.colors.primary,
    borderRadius: t.radius.xl,
    paddingVertical: t.space(3.5),
    alignItems: "center",
  },
  startText: {
    color: t.colors.primaryForeground,
    fontSize: t.fontSize.base,
    fontWeight: t.fontWeight.semibold,
  },
}));
