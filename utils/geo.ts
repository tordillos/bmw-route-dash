import type { Coordinate } from "@/types/navigation";

export function haversineDistance(a: Coordinate, b: Coordinate): number {
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

function pointToSegmentDistance(
  point: Coordinate,
  a: Coordinate,
  b: Coordinate,
): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  if (dx === 0 && dy === 0) return haversineDistance(point, a);

  const t = Math.max(
    0,
    Math.min(
      1,
      ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / (dx * dx + dy * dy),
    ),
  );
  const proj: Coordinate = [a[0] + t * dx, a[1] + t * dy];
  return haversineDistance(point, proj);
}

export function distanceToRoute(
  point: Coordinate,
  routeCoords: Coordinate[],
): number {
  let minDist = Infinity;
  for (let i = 0; i < routeCoords.length - 1; i++) {
    const dist = pointToSegmentDistance(
      point,
      routeCoords[i]!,
      routeCoords[i + 1]!,
    );
    if (dist < minDist) minDist = dist;
  }
  return minDist;
}
