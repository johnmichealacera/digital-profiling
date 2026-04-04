import type { UserRole } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"

export type TenantBranding = {
  /** Primary line, e.g. "Brgy. Taruc" or municipality name or "Digital Profiling" */
  tenantTitle: string
  /** Secondary line, e.g. "Socorro, Surigao del Norte" */
  tenantSubtitle: string
}

/**
 * Labels for sidebar, dashboard copy, etc. Uses DB for barangay/municipality names.
 */
export async function resolveTenantBranding(params: {
  role: UserRole
  barangayId: string | null | undefined
  municipalityId: string | null | undefined
}): Promise<TenantBranding> {
  if (params.role === "SUPER_ADMIN") {
    return {
      tenantTitle: "Digital Profiling",
      tenantSubtitle: "System administration · All barangays",
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
      }
    }
    return {
      tenantTitle: `Brgy. ${b.name}`,
      tenantSubtitle: `${b.municipality.name}, ${b.municipality.province}`,
    }
  }

  if (params.municipalityId) {
    const m = await prisma.municipality.findUnique({
      where: { id: params.municipalityId },
      select: { name: true, province: true },
    })
    if (!m) {
      return {
        tenantTitle: "Municipality",
        tenantSubtitle: "Jurisdiction not found — contact support",
      }
    }
    return {
      tenantTitle: m.name,
      tenantSubtitle: `${m.province} · All barangays`,
    }
  }

  return {
    tenantTitle: "Digital Profiling",
    tenantSubtitle: "No barangay assignment",
  }
}
