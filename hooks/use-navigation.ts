import { useCallback, useRef, useState } from "react";

import { getDirections } from "@/services/mapbox";
import { distanceToRoute, haversineDistance } from "@/utils/geo";
import type {
  Coordinate,
  GeocodingFeature,
  NavigationState,
  Route,
} from "@/types/navigation";

const INITIAL_STATE: NavigationState = {
  mode: "idle",
  destination: null,
  route: null,
  currentStepIndex: 0,
};

const STEP_ADVANCE_THRESHOLD_M = 30;
const OFF_ROUTE_THRESHOLD_M = 50;
const REROUTE_COOLDOWN_MS = 10_000;

export default function useNavigation() {
  const [state, setState] = useState<NavigationState>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [distanceToNextManeuver, setDistanceToNextManeuver] = useState<
    number | undefined
  >();
  const stateRef = useRef(state);
  stateRef.current = state;
  const lastRerouteTime = useRef(0);

  const startSearching = useCallback(() => {
    setState((prev) => ({ ...prev, mode: "searching" }));
  }, []);

  const cancelSearch = useCallback(() => {
    setState(INITIAL_STATE);
    setError(null);
  }, []);

  const selectDestination = useCallback(
    async (feature: GeocodingFeature, userLocation: Coordinate) => {
      setLoading(true);
      setError(null);
      try {
        const route: Route = await getDirections(userLocation, feature.center);
        setState({
          mode: "preview",
          destination: feature,
          route,
          currentStepIndex: 0,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Route calculation failed");
        setState((prev) => ({ ...prev, mode: "idle" }));
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const triggerReroute = useCallback(
    async (currentLocation: Coordinate, destinationCoord: Coordinate) => {
      try {
        const newRoute = await getDirections(currentLocation, destinationCoord);
        setState((prev) => {
          if (prev.mode !== "navigating") return prev;
          return { ...prev, route: newRoute, currentStepIndex: 0 };
        });
      } catch {
        // Silent failure — will retry on next location update after cooldown
      }
    },
    [],
  );

  const startNavigation = useCallback(() => {
    lastRerouteTime.current = 0;
    setState((prev) => ({
      ...prev,
      mode: "navigating",
      currentStepIndex: 0,
    }));
  }, []);

  const updateUserLocation = useCallback(
    (location: Coordinate) => {
      // Step advancement
      setState((prev) => {
        if (prev.mode !== "navigating" || !prev.route) return prev;

        const steps = prev.route.legs[0]?.steps;
        if (!steps) return prev;

        let idx = prev.currentStepIndex;

        // Advance through steps when close enough to next maneuver
        while (idx < steps.length - 1) {
          const nextStep = steps[idx + 1];
          if (!nextStep) break;
          const dist = haversineDistance(location, nextStep.maneuver.location);
          if (dist < STEP_ADVANCE_THRESHOLD_M) {
            idx++;
          } else {
            break;
          }
        }

        // Check if we reached the final destination
        if (idx >= steps.length - 1) {
          const lastStep = steps[steps.length - 1];
          if (lastStep) {
            const distToEnd = haversineDistance(
              location,
              lastStep.maneuver.location,
            );
            if (distToEnd < STEP_ADVANCE_THRESHOLD_M) {
              return INITIAL_STATE;
            }
          }
        }

        if (idx !== prev.currentStepIndex) {
          return { ...prev, currentStepIndex: idx };
        }
        return prev;
      });

      // Live distance to next maneuver (read from ref for latest state)
      const current = stateRef.current;
      if (current.mode === "navigating" && current.route) {
        const steps = current.route.legs[0]?.steps;
        const step = steps?.[current.currentStepIndex];
        if (step) {
          setDistanceToNextManeuver(
            haversineDistance(location, step.maneuver.location),
          );
        }
      }

      // Off-route detection (read from ref to avoid stale closure)
      const snap = stateRef.current;
      if (snap.mode !== "navigating" || !snap.route || !snap.destination)
        return;

      const dist = distanceToRoute(location, snap.route.geometry.coordinates);
      const now = Date.now();
      if (
        dist > OFF_ROUTE_THRESHOLD_M &&
        now - lastRerouteTime.current > REROUTE_COOLDOWN_MS
      ) {
        lastRerouteTime.current = now;
        triggerReroute(location, snap.destination.center);
      }
    },
    [triggerReroute],
  );

  const endNavigation = useCallback(() => {
    setState(INITIAL_STATE);
    setError(null);
    setDistanceToNextManeuver(undefined);
  }, []);

  return {
    ...state,
    loading,
    error,
    distanceToNextManeuver,
    startSearching,
    cancelSearch,
    selectDestination,
    startNavigation,
    updateUserLocation,
    endNavigation,
  };
}
