import { useCallback, useState } from "react";

import { getDirections } from "@/services/mapbox";
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

function haversineDistance(a: Coordinate, b: Coordinate): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b[1] - a[1]);
  const dLon = toRad(b[0] - a[0]);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const aVal =
    sinDLat * sinDLat +
    Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * sinDLon * sinDLon;
  return R * 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
}

export default function useNavigation() {
  const [state, setState] = useState<NavigationState>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const startNavigation = useCallback(() => {
    setState((prev) => ({
      ...prev,
      mode: "navigating",
      currentStepIndex: 0,
    }));
  }, []);

  const updateUserLocation = useCallback((location: Coordinate) => {
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
  }, []);

  const endNavigation = useCallback(() => {
    setState(INITIAL_STATE);
    setError(null);
  }, []);

  return {
    ...state,
    loading,
    error,
    startSearching,
    cancelSearch,
    selectDestination,
    startNavigation,
    updateUserLocation,
    endNavigation,
  };
}
