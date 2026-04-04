import type { UserRole } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"

export type TenantBranding = {
  /** Primary line, e.g. "Brgy. Taruc" or municipality name or "Digital Profiling" */
  tenantTitle: string
  /** Secondary line, e.g. "Socorro, Surigao del Norte" */
  tenantSubtitle: string
  /** From barangay/municipality settings; null → use app default (constants) */
  tenantMapCenterLat: number | null
  tenantMapCenterLng: number | null
  tenantMapDefaultZoom: number
}

async function mapFromMunicipalityBarangays(municipalityId: string): Promise<{
  tenantMapCenterLat: number | null
  tenantMapCenterLng: number | null
  tenantMapDefaultZoom: number
}> {
  const barangays = await prisma.barangay.findMany({
    where: {
      municipalityId,
      mapCenterLat: { not: null },
      mapCenterLng: { not: null },
    },
    select: {
      mapCenterLat: true,
      mapCenterLng: true,
      mapDefaultZoom: true,
    },
  })
  if (barangays.length === 0) {
    return {
      tenantMapCenterLat: null,
      tenantMapCenterLng: null,
      tenantMapDefaultZoom: 13,
    }
  }
  const lat =
    barangays.reduce((s, b) => s + (b.mapCenterLat as number), 0) /
    barangays.length
  const lng =
    barangays.reduce((s, b) => s + (b.mapCenterLng as number), 0) /
    barangays.length
  const zoomAvg =
    barangays.reduce((s, b) => s + b.mapDefaultZoom, 0) / barangays.length
  const zoom = Math.round(Math.min(16, Math.max(10, zoomAvg)))
  return {
    tenantMapCenterLat: lat,
    tenantMapCenterLng: lng,
    tenantMapDefaultZoom: zoom,
  }
}

/**
 * Labels for sidebar, dashboard copy, etc. Uses DB for barangay/municipality names.
 */
export async function resolveTenantBranding(params: {
  role: UserRole
  barangayId: string | null | undefined
  municipalityId: string | null | undefined
}): Promise<TenantBranding> {
  const emptyMap = {
    tenantMapCenterLat: null as number | null,
    tenantMapCenterLng: null as number | null,
    tenantMapDefaultZoom: 15,
  }

  if (params.role === "SUPER_ADMIN") {
    return {
      tenantTitle: "Digital Profiling",
      tenantSubtitle: "System administration · All barangays",
      ...emptyMap,
    }
  }

  if (params.barangayId) {
    const b = await prisma.barangay.findUnique({
      where: { id: params.barangayId },
      include: {
        municipality: { select: { name: true, province: true } },
      },
    })
    if (!b) {
      return {
        tenantTitle: "Barangay",
        tenantSubtitle: "Jurisdiction not found — contact support",
        ...emptyMap,
      }
    }
    const lat = b.mapCenterLat
    const lng = b.mapCenterLng
    const hasCenter =
      lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng)
    return {
      tenantTitle: `Brgy. ${b.name}`,
      tenantSubtitle: `${b.municipality.name}, ${b.municipality.province}`,
      tenantMapCenterLat: hasCenter ? lat : null,
      tenantMapCenterLng: hasCenter ? lng : null,
      tenantMapDefaultZoom: b.mapDefaultZoom,
    }
  }

  if (params.municipalityId) {
    const m = await prisma.municipality.findUnique({
      where: { id: params.municipalityId },
      select: {
        name: true,
        province: true,
        mapCenterLat: true,
        mapCenterLng: true,
        mapDefaultZoom: true,
      },
    })
    if (!m) {
      return {
        tenantTitle: "Municipality",
        tenantSubtitle: "Jurisdiction not found — contact support",
        ...emptyMap,
      }
    }
    const mLat = m.mapCenterLat
    const mLng = m.mapCenterLng
    const mHas =
      mLat != null &&
      mLng != null &&
      Number.isFinite(mLat) &&
      Number.isFinite(mLng)
    if (mHas) {
      return {
        tenantTitle: m.name,
        tenantSubtitle: `${m.province} · All barangays`,
        tenantMapCenterLat: mLat,
        tenantMapCenterLng: mLng,
        tenantMapDefaultZoom: m.mapDefaultZoom,
      }
    }
    const fromBarangays = await mapFromMunicipalityBarangays(params.municipalityId)
    return {
      tenantTitle: m.name,
      tenantSubtitle: `${m.province} · All barangays`,
      ...fromBarangays,
    }
  }

  return {
    tenantTitle: "Digital Profiling",
    tenantSubtitle: "No barangay assignment",
    ...emptyMap,
  }
}
