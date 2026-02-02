import Mapbox from "@rnmapbox/maps";

import "expo-router/entry";

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN || "no_token");
