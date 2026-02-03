import Mapbox from "@rnmapbox/maps";
import "expo-router/entry";
import "./styles/unistyles";

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN || "no_token");
