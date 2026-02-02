export type Coordinate = [longitude: number, latitude: number];

export type NavigationMode = "idle" | "searching" | "preview" | "navigating";

export interface GeocodingFeature {
  id: string;
  place_name: string;
  center: Coordinate;
}

export interface RouteStep {
  maneuver: {
    instruction: string;
    type: string;
    modifier?: string;
    location: Coordinate;
  };
  distance: number;
  duration: number;
}

export interface RouteLeg {
  steps: RouteStep[];
  distance: number;
  duration: number;
}

export interface Route {
  geometry: {
    type: "LineString";
    coordinates: Coordinate[];
  };
  legs: RouteLeg[];
  distance: number;
  duration: number;
}

export interface NavigationState {
  mode: NavigationMode;
  destination: GeocodingFeature | null;
  route: Route | null;
  currentStepIndex: number;
}
