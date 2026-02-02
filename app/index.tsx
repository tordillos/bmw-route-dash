import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Mapbox from "@rnmapbox/maps";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import NavigationPanel from "@/components/NavigationPanel";
import RouteOverlay from "@/components/RouteOverlay";
import RoutePreviewBar from "@/components/RoutePreviewBar";
import SearchBar from "@/components/SearchBar";
import useNavigation from "@/hooks/useNavigation";
import type { Coordinate } from "@/types/navigation";

const DEFAULT_CENTER: Coordinate = [12.338, 45.4385];
const DEFAULT_ZOOM = 17.4;
const NAV_ZOOM = 17;
const NAV_PITCH = 45;

export default function MapScreen() {
  const cameraRef = useRef<Mapbox.Camera>(null);
  const [userLocation, setUserLocation] = useState<Coordinate | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const nav = useNavigation();

  // Location tracking
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10,
        },
        (location) => {
          const coords: Coordinate = [
            location.coords.longitude,
            location.coords.latitude,
          ];
          setUserLocation(coords);

          if (nav.mode === "navigating") {
            nav.updateUserLocation(coords);
          }
        },
      );
    })();

    return () => {
      subscription?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nav.mode]);

  // Camera management based on navigation mode
  useEffect(() => {
    if (nav.mode === "idle" && userLocation) {
      cameraRef.current?.setCamera({
        centerCoordinate: userLocation,
        zoomLevel: DEFAULT_ZOOM,
        animationDuration: 1000,
      });
    }
  }, [nav.mode, userLocation]);

  useEffect(() => {
    if (nav.mode === "preview" && nav.route) {
      const coords = nav.route.geometry.coordinates;
      const lngs = coords.map((c) => c[0]);
      const lats = coords.map((c) => c[1]);

      const ne: Coordinate = [Math.max(...lngs), Math.max(...lats)];
      const sw: Coordinate = [Math.min(...lngs), Math.min(...lats)];

      cameraRef.current?.fitBounds(ne, sw, [100, 60, 200, 60], 1000);
    }
  }, [nav.mode, nav.route]);

  const goToMyLocation = () => {
    if (!userLocation) return;
    cameraRef.current?.setCamera({
      centerCoordinate: userLocation,
      zoomLevel: DEFAULT_ZOOM,
      animationDuration: 1000,
    });
  };

  // Compute remaining distance/duration for active navigation
  const remainingDistance =
    nav.mode === "navigating" && nav.route
      ? (nav.route.legs[0]?.steps
          .slice(nav.currentStepIndex)
          .reduce((sum, s) => sum + s.distance, 0) ?? 0)
      : 0;

  const remainingDuration =
    nav.mode === "navigating" && nav.route
      ? (nav.route.legs[0]?.steps
          .slice(nav.currentStepIndex)
          .reduce((sum, s) => sum + s.duration, 0) ?? 0)
      : 0;

  const currentStep =
    nav.mode === "navigating" && nav.route
      ? nav.route.legs[0]?.steps[nav.currentStepIndex]
      : undefined;

  const isNavigating = nav.mode === "navigating";

  return (
    <View style={styles.container}>
      <Mapbox.MapView style={styles.map}>
        <Mapbox.Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: DEFAULT_CENTER,
            zoomLevel: DEFAULT_ZOOM,
          }}
          followUserLocation={isNavigating}
          followUserMode={Mapbox.UserTrackingMode.FollowWithCourse}
          followZoomLevel={isNavigating ? NAV_ZOOM : undefined}
          followPitch={isNavigating ? NAV_PITCH : undefined}
        />
        <Mapbox.LocationPuck puckBearingEnabled puckBearing="heading" />

        {(nav.mode === "preview" || nav.mode === "navigating") &&
          nav.route &&
          nav.destination && (
            <RouteOverlay
              route={nav.route}
              destination={nav.destination.center}
            />
          )}
      </Mapbox.MapView>

      {errorMsg && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}

      {nav.error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{nav.error}</Text>
        </View>
      )}

      {nav.loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1a73e8" />
        </View>
      )}

      {/* Search bar (idle & searching modes) */}
      {(nav.mode === "idle" || nav.mode === "searching") && (
        <SearchBar
          proximity={userLocation}
          isSearching={nav.mode === "searching"}
          onFocus={nav.startSearching}
          onCancel={nav.cancelSearch}
          onSelect={(feature) => {
            if (userLocation) {
              nav.selectDestination(feature, userLocation);
            }
          }}
        />
      )}

      {/* Route preview */}
      {nav.mode === "preview" && nav.route && (
        <RoutePreviewBar
          route={nav.route}
          onStart={nav.startNavigation}
          onCancel={nav.cancelSearch}
        />
      )}

      {/* Navigation panel */}
      {nav.mode === "navigating" && (
        <NavigationPanel
          currentStep={currentStep}
          remainingDistance={remainingDistance}
          remainingDuration={remainingDuration}
          onEnd={nav.endNavigation}
        />
      )}

      {/* Locate button — hidden during navigation */}
      {!isNavigating && (
        <Pressable
          style={[
            styles.locateButton,
            !userLocation && styles.locateButtonDisabled,
            nav.mode === "preview" && styles.locateButtonPreview,
          ]}
          onPress={goToMyLocation}
          disabled={!userLocation}
        >
          <MaterialIcons
            name="my-location"
            size={24}
            color={userLocation ? "#fff" : "#666"}
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  errorBanner: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: "rgba(200, 0, 0, 0.8)",
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 14,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  locateButton: {
    position: "absolute",
    bottom: 40,
    right: 16,
    backgroundColor: "#1a73e8",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  locateButtonDisabled: {
    backgroundColor: "#333",
  },
  locateButtonPreview: {
    bottom: 160,
  },
});
