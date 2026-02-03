import Mapbox from "@rnmapbox/maps";

import { darkTheme } from "@/styles/theme";
import type { Coordinate, Route } from "@/types/navigation";

interface RouteOverlayProps {
  route: Route;
  destination: Coordinate;
}

export default function RouteOverlay({
  route,
  destination,
}: RouteOverlayProps) {
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
            lineColor: darkTheme.colors.primary,
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
            circleColor: darkTheme.colors.destructive,
            circleStrokeColor: darkTheme.colors.foreground,
            circleStrokeWidth: 3,
          }}
        />
      </Mapbox.ShapeSource>
    </>
  );
}
