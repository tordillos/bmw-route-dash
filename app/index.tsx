import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Mapbox from "@rnmapbox/maps";
import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import NavigationPanel from "@/components/navigation-panel";
import RouteOverlay from "@/components/route-overlay";
import RoutePreviewBar from "@/components/route-preview-bar";
import SearchBar from "@/components/search-bar";
import useNavigation from "@/hooks/use-navigation";
import { darkTheme } from "@/styles/theme";
import type { Coordinate } from "@/types/navigation";

const DEFAULT_CENTER: Coordinate = [12.338, 45.4385];
const DEFAULT_ZOOM = 17.4;
const NAV_ZOOM = 17;
const NAV_PITCH = 45;

export default function MapScreen() {
  const cameraRef = useRef<Mapbox.Camera>(null);
  const [userLocation, setUserLocation] = useState<Coordinate | null>(null);
  const locationRef = useRef<Coordinate | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(true);

  const nav = useNavigation();

  // Reset camera following when navigation starts
  useEffect(() => {
    if (nav.mode === "navigating") setIsFollowing(true);
  }, [nav.mode]);

  const handleTrackingModeChange = useCallback(
    (event: { nativeEvent: { payload: { followUserLocation: boolean } } }) => {
      if (nav.mode === "navigating") {
        setIsFollowing(event.nativeEvent.payload.followUserLocation);
      }
    },
    [nav.mode],
  );

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
          distanceInterval: 5,
        },
        (location) => {
          const coords: Coordinate = [
            location.coords.longitude,
            location.coords.latitude,
          ];
          locationRef.current = coords;

          if (nav.mode === "navigating") {
            // During navigation, only update the hook (step/reroute logic).
            // Camera tracking is handled natively by Mapbox — no React state needed.
            nav.updateUserLocation(coords);
          } else {
            // Outside navigation, update state for camera setCamera calls.
            setUserLocation(coords);
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
    const loc = userLocation ?? locationRef.current;
    if (!loc) return;
    cameraRef.current?.setCamera({
      centerCoordinate: loc,
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
          followUserLocation={isNavigating && isFollowing}
          followUserMode={Mapbox.UserTrackingMode.FollowWithHeading}
          followZoomLevel={isNavigating ? NAV_ZOOM : undefined}
          followPitch={isNavigating ? NAV_PITCH : undefined}
          onUserTrackingModeChange={handleTrackingModeChange}
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
          <ActivityIndicator size="large" color={darkTheme.colors.primary} />
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
            const loc = userLocation ?? locationRef.current;
            if (loc) {
              nav.selectDestination(feature, loc);
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
          distanceToNextManeuver={nav.distanceToNextManeuver}
          remainingDistance={remainingDistance}
          remainingDuration={remainingDuration}
          onEnd={nav.endNavigation}
        />
      )}

      {/* Re-center button — visible when user pans during navigation */}
      {isNavigating && !isFollowing && (
        <Pressable
          style={styles.recenterButton}
          onPress={() => setIsFollowing(true)}
        >
          <MaterialIcons
            name="navigation"
            size={24}
            color={darkTheme.colors.primaryForeground}
          />
        </Pressable>
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
            color={
              userLocation
                ? darkTheme.colors.primaryForeground
                : darkTheme.colors.input
            }
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create((t) => ({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  errorBanner: {
    position: "absolute",
    top: t.space(15),
    left: t.space(4),
    right: t.space(4),
    backgroundColor: t.colors.destructiveOverlay,
    padding: t.space(3),
    borderRadius: t.radius.lg,
  },
  errorText: {
    color: t.colors.destructiveForeground,
    textAlign: "center",
    fontSize: t.fontSize.sm,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: t.colors.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  locateButton: {
    position: "absolute",
    bottom: t.space(10),
    right: t.space(4),
    backgroundColor: t.colors.primary,
    width: t.size(12),
    height: t.size(12),
    borderRadius: t.radius.xxxl,
    justifyContent: "center",
    alignItems: "center",
    ...t.shadow.md,
  },
  locateButtonDisabled: {
    backgroundColor: t.colors.secondary,
  },
  locateButtonPreview: {
    bottom: t.space(40),
  },
  recenterButton: {
    position: "absolute",
    bottom: t.space(42),
    alignSelf: "center",
    backgroundColor: t.colors.primary,
    width: t.size(12),
    height: t.size(12),
    borderRadius: t.radius.xxxl,
    justifyContent: "center",
    alignItems: "center",
    ...t.shadow.md,
  },
}));
