export type Coordinates = { lat: number; lng: number };

export const locationCoordinates: Record<string, Coordinates> = {
  "Aurora, CO": { lat: 39.7294, lng: -104.8319 },
  "Denver, CO": { lat: 39.7392, lng: -104.9903 },
  "Lakewood, CO": { lat: 39.7047, lng: -105.0814 },
  "Golden, CO": { lat: 39.7555, lng: -105.2211 },
};

export function normalizeLocation(location: string) {
  return location.includes(",") ? location.trim() : `${location.trim()}, CO`;
}

export function getCoordinates(location: string) {
  return locationCoordinates[normalizeLocation(location)] || null;
}

export function getDistanceMiles(fromLocation: string, toLocation: string) {
  const from = getCoordinates(fromLocation);
  const to = getCoordinates(toLocation);
  if (!from || !to) return null;

  const earthRadiusMiles = 3958.8;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(from.lat)) * Math.cos(toRadians(to.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(earthRadiusMiles * c);
}
