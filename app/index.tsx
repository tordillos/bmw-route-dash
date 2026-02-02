import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Mapbox from "@rnmapbox/maps";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const DEFAULT_CENTER: [number, number] = [12.338, 45.4385];
const DEFAULT_ZOOM = 17.4;

export default function MapScreen() {
  const cameraRef = useRef<Mapbox.Camera>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
          const coords: [number, number] = [
            location.coords.longitude,
            location.coords.latitude,
          ];
          setUserLocation(coords);
          cameraRef.current?.setCamera({
            centerCoordinate: coords,
            zoomLevel: DEFAULT_ZOOM,
            animationDuration: 1000,
          });
        },
      );
    })();

    return () => {
      subscription?.remove();
    };
  }, []);

  const goToMyLocation = () => {
    if (!userLocation) return;
    cameraRef.current?.setCamera({
      centerCoordinate: userLocation,
      zoomLevel: DEFAULT_ZOOM,
      animationDuration: 1000,
    });
  };

  return (
    <View style={styles.container}>
      <Mapbox.MapView style={styles.map}>
        <Mapbox.Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: DEFAULT_CENTER,
            zoomLevel: DEFAULT_ZOOM,
          }}
        />
        <Mapbox.LocationPuck puckBearingEnabled puckBearing="heading" />
      </Mapbox.MapView>

      {errorMsg && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}

      <Pressable
        style={[
          styles.locateButton,
          !userLocation && styles.locateButtonDisabled,
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
});
