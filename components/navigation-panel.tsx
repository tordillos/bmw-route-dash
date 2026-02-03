import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { darkTheme } from "@/styles/theme";
import type { RouteStep } from "@/types/navigation";

interface NavigationPanelProps {
  currentStep: RouteStep | undefined;
  distanceToNextManeuver: number | undefined;
  remainingDistance: number;
  remainingDuration: number;
  onEnd: () => void;
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatETA(seconds: number): string {
  const arrival = new Date(Date.now() + seconds * 1000);
  return arrival.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>["name"];

function getManeuverIcon(type: string, modifier?: string): MaterialIconName {
  if (type === "arrive") return "flag";
  if (type === "depart") return "navigation";
  if (type === "roundabout" || type === "rotary") return "rotate-right";
  if (type === "merge") return "merge-type";
  if (type === "fork") return "call-split";
  if (modifier?.includes("left")) return "turn-left";
  if (modifier?.includes("right")) return "turn-right";
  if (modifier === "straight") return "straight";
  if (modifier === "uturn") return "u-turn-left";
  return "straight";
}

export default function NavigationPanel({
  currentStep,
  distanceToNextManeuver,
  remainingDistance,
  remainingDuration,
  onEnd,
}: NavigationPanelProps) {
  const insets = useSafeAreaInsets();

  if (!currentStep) return null;

  const icon = getManeuverIcon(
    currentStep.maneuver.type,
    currentStep.maneuver.modifier,
  );

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: insets.bottom + darkTheme.space(3) },
      ]}
    >
      <View style={styles.stepCard}>
        <MaterialIcons
          name={icon}
          size={32}
          color={darkTheme.colors.primary}
          style={styles.icon}
        />
        <View style={styles.stepInfo}>
          <Text style={styles.instruction} numberOfLines={2}>
            {currentStep.maneuver.instruction}
          </Text>
          <Text style={styles.stepDistance}>
            {formatDistance(distanceToNextManeuver ?? currentStep.distance)}
          </Text>
        </View>
      </View>

      <View style={styles.bottomBar}>
        <View style={styles.eta}>
          <Text style={styles.etaTime}>{formatETA(remainingDuration)}</Text>
          <Text style={styles.etaDetail}>
            {formatDistance(remainingDistance)}
          </Text>
        </View>

        <Pressable style={styles.endButton} onPress={onEnd}>
          <MaterialIcons
            name="close"
            size={20}
            color={darkTheme.colors.destructiveForeground}
          />
          <Text style={styles.endText}>End</Text>
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
  stepCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: t.space(4),
  },
  icon: {
    marginRight: t.space(3),
  },
  stepInfo: {
    flex: 1,
  },
  instruction: {
    color: t.colors.cardForeground,
    fontSize: t.fontSize.lg,
    fontWeight: t.fontWeight.semibold,
  },
  stepDistance: {
    color: t.colors.mutedForeground,
    fontSize: t.fontSize.sm,
    marginTop: t.space(0.5),
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eta: {
    flex: 1,
  },
  etaTime: {
    color: t.colors.success,
    fontSize: t.fontSize.xl,
    fontWeight: t.fontWeight.bold,
  },
  etaDetail: {
    color: t.colors.mutedForeground,
    fontSize: t.fontSize.sm,
    marginTop: t.space(0.5),
  },
  endButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: t.colors.destructive,
    borderRadius: t.radius.xl,
    paddingVertical: t.space(2.5),
    paddingHorizontal: t.space(4),
    gap: t.gap(1.5),
  },
  endText: {
    color: t.colors.destructiveForeground,
    fontSize: t.fontSize.base,
    fontWeight: t.fontWeight.semibold,
  },
}));
