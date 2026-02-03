import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
    <View style={[styles.container, { paddingBottom: insets.bottom + 12 }]}>
      <View style={styles.stepCard}>
        <MaterialIcons
          name={icon}
          size={32}
          color="#1a73e8"
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
          <MaterialIcons name="close" size={20} color="#fff" />
          <Text style={styles.endText}>End</Text>
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
  stepCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  icon: {
    marginRight: 12,
  },
  stepInfo: {
    flex: 1,
  },
  instruction: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  stepDistance: {
    color: "#999",
    fontSize: 14,
    marginTop: 2,
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
    color: "#4caf50",
    fontSize: 20,
    fontWeight: "700",
  },
  etaDetail: {
    color: "#999",
    fontSize: 14,
    marginTop: 2,
  },
  endButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e53935",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 6,
  },
  endText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
