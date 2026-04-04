import { MAP_CENTER, MAP_DEFAULT_ZOOM } from "@/lib/constants"

/**
 * Map center/zoom from session (JWT). Safe for Client Components — only imports constants.
 */
export function mapViewFromSessionUser(u: {
  tenantMapCenterLat?: number | null
  tenantMapCenterLng?: number | null
  tenantMapDefaultZoom?: number | null
}): { center: [number, number]; zoom: number } {
  const lat = u.tenantMapCenterLat
  const lng = u.tenantMapCenterLng
  if (
    lat != null &&
    lng != null &&
    Number.isFinite(lat) &&
    Number.isFinite(lng)
  ) {
    const z = u.tenantMapDefaultZoom
    const zoom =
      typeof z === "number" && Number.isFinite(z) && z >= 1 && z <= 22
        ? z
        : MAP_DEFAULT_ZOOM
    return { center: [lat, lng], zoom }
  }
  return { center: [MAP_CENTER[0], MAP_CENTER[1]], zoom: MAP_DEFAULT_ZOOM }
}
