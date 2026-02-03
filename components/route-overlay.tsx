import Mapbox from "@rnmapbox/maps";
import { useUnistyles } from "react-native-unistyles";

import type { Coordinate, Route } from "@/types/navigation";

interface RouteOverlayProps {
  route: Route;
  destination: Coordinate;
}

export default function RouteOverlay({
  route,
  destination,
}: RouteOverlayProps) {
  const { theme } = useUnistyles();
  const routeGeoJSON: GeoJSON.Feature<GeoJSON.LineString> = {
    type: "Feature",
    properties: {},
    geometry: route.geometry,
  };

  const destinationGeoJSON: GeoJSON.Feature<GeoJSON.Point> = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Point",
      coordinates: destination,
    },
  };

  return (
    <>
      <Mapbox.ShapeSource id="routeSource" shape={routeGeoJSON}>
        <Mapbox.LineLayer
          id="routeLine"
          style={{
            lineColor: theme.colors.primary,
            lineWidth: 5,
            lineCap: "round",
            lineJoin: "round",
          }}
        />
      </Mapbox.ShapeSource>

      <Mapbox.ShapeSource id="destinationSource" shape={destinationGeoJSON}>
        <Mapbox.CircleLayer
          id="destinationCircle"
          style={{
            circleRadius: 8,
            circleColor: theme.colors.destructive,
            circleStrokeColor: theme.colors.foreground,
            circleStrokeWidth: 3,
          }}
        />
      </Mapbox.ShapeSource>
    </>
  );
}
