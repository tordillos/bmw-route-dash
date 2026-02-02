import type { Coordinate, GeocodingFeature, Route } from "@/types/navigation";

const TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN || "";
const BASE = "https://api.mapbox.com";

export async function searchPlaces(
  query: string,
  proximity?: Coordinate,
): Promise<GeocodingFeature[]> {
  if (!query.trim()) return [];

  const params = new URLSearchParams({
    access_token: TOKEN,
    autocomplete: "true",
    limit: "5",
    types: "place,address,poi",
  });

  if (proximity) {
    params.set("proximity", `${proximity[0]},${proximity[1]}`);
  }

  const url = `${BASE}/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params}`;
  const res = await fetch(url);

  if (!res.ok) throw new Error(`Geocoding failed: ${res.status}`);

  const data = await res.json();
  return data.features as GeocodingFeature[];
}

export async function getDirections(
  origin: Coordinate,
  destination: Coordinate,
): Promise<Route> {
  const coords = `${origin[0]},${origin[1]};${destination[0]},${destination[1]}`;
  const params = new URLSearchParams({
    access_token: TOKEN,
    geometries: "geojson",
    overview: "full",
    steps: "true",
  });

  const url = `${BASE}/directions/v5/mapbox/driving/${coords}?${params}`;
  const res = await fetch(url);

  if (!res.ok) throw new Error(`Directions failed: ${res.status}`);

  const data = await res.json();

  if (!data.routes?.length) throw new Error("No route found");

  return data.routes[0] as Route;
}
