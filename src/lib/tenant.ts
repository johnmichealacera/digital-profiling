import type { Session } from "next-auth"
import type { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import type { UserRole } from "@/generated/prisma/client"

/**
 * Barangay IDs the session may access. `null` means all barangays (super admin).
 * Empty array means no access.
 */
export async function getTenantBarangayIds(
  session: Session | null
): Promise<string[] | null> {
  if (!session?.user?.id) return []
  const role = session.user.role as UserRole
  if (role === "SUPER_ADMIN") return null

  if (session.user.barangayId) return [session.user.barangayId]

  if (session.user.municipalityId) {
    const rows = await prisma.barangay.findMany({
      where: { municipalityId: session.user.municipalityId },
      select: { id: true },
    })
    return rows.map((r) => r.id)
  }

  return []
}

/** `true` if session can read/write this barangay row. */
export function canAccessBarangayId(
  session: Session | null,
  barangayId: string | null | undefined,
  tenantIds: string[] | null
): boolean {
  if (!barangayId) return false
  if (tenantIds === null) {
    return session?.user?.role === "SUPER_ADMIN"
  }
  return tenantIds.includes(barangayId)
}

export function householdWhereForTenant(
  tenantIds: string[] | null
): Prisma.HouseholdWhereInput {
  if (tenantIds === null) return {}
  if (tenantIds.length === 0) return { id: { in: [] } }
  if (tenantIds.length === 1) return { barangayId: tenantIds[0]! }
  return { barangayId: { in: tenantIds } }
}

export function residentWhereForTenant(
  tenantIds: string[] | null
): Prisma.ResidentWhereInput {
  if (tenantIds === null) {
    return {}
  }
  if (tenantIds.length === 0) return { id: { in: [] } }
  return {
    household: { is: householdWhereForTenant(tenantIds) },
  }
}

export function purokWhereForTenant(
  tenantIds: string[] | null
): Prisma.PurokWhereInput {
  if (tenantIds === null) return {}
  if (tenantIds.length === 0) return { id: { in: [] } }
  if (tenantIds.length === 1) return { barangayId: tenantIds[0]! }
  return { barangayId: { in: tenantIds } }
}

export function barangayEntityWhere(
  tenantIds: string[] | null
): Prisma.BarangayWhereInput {
  if (tenantIds === null) return {}
  if (tenantIds.length === 0) return { id: { in: [] } }
  if (tenantIds.length === 1) return { id: tenantIds[0]! }
  return { id: { in: tenantIds } }
}

/** For `where: { ...base, barangayId: barangayIdFilter(tenantIds)! }` — omit key when null. */
export function barangayIdFilter(
  tenantIds: string[] | null
): Prisma.StringFilter | undefined {
  if (tenantIds === null) return undefined
  if (tenantIds.length === 0) return { equals: "__no_such_barangay__" }
  if (tenantIds.length === 1) return { equals: tenantIds[0]! }
  return { in: tenantIds }
}

/** Returns false if resident missing, unassigned, or outside tenant. Super admin always true. */
export async function assertPurokInTenant(
  purokId: string,
  tenantIds: string[] | null
): Promise<boolean> {
  if (tenantIds === null) return true
  const p = await prisma.purok.findUnique({
    where: { id: purokId },
    select: { barangayId: true },
  })
  if (!p) return false
  return tenantIds.includes(p.barangayId)
}

export async function assertHouseholdInTenant(
  householdId: string,
  tenantIds: string[] | null
): Promise<boolean> {
  if (tenantIds === null) return true
  const h = await prisma.household.findUnique({
    where: { id: householdId },
    select: { barangayId: true },
  })
  if (!h) return false
  return tenantIds.includes(h.barangayId)
}

export async function assertDocumentInTenant(
  documentId: string,
  tenantIds: string[] | null
): Promise<boolean> {
  if (tenantIds === null) return true
  const d = await prisma.documentRequest.findUnique({
    where: { id: documentId },
    select: { barangayId: true },
  })
  return !!d && tenantIds.includes(d.barangayId)
}

export async function assertBlotterInTenant(
  blotterId: string,
  tenantIds: string[] | null
): Promise<boolean> {
  if (tenantIds === null) return true
  const b = await prisma.blotter.findUnique({
    where: { id: blotterId },
    select: { barangayId: true },
  })
  return !!b && tenantIds.includes(b.barangayId)
}

export async function assertProjectInTenant(
  projectId: string,
  tenantIds: string[] | null
): Promise<boolean> {
  if (tenantIds === null) return true
  const p = await prisma.project.findUnique({
    where: { id: projectId },
    select: { barangayId: true },
  })
  return !!p && tenantIds.includes(p.barangayId)
}

export async function assertBudgetYearInTenant(
  budgetYearId: string,
  tenantIds: string[] | null
): Promise<boolean> {
  if (tenantIds === null) return true
  const y = await prisma.budgetYear.findUnique({
    where: { id: budgetYearId },
    select: { barangayId: true },
  })
  return !!y && tenantIds.includes(y.barangayId)
}

export async function assertOfficialInTenant(
  officialId: string,
  tenantIds: string[] | null
): Promise<boolean> {
  if (tenantIds === null) return true
  const o = await prisma.barangayOfficial.findUnique({
    where: { id: officialId },
    select: { barangayId: true },
  })
  return !!o && tenantIds.includes(o.barangayId)
}

export async function assertDisasterEventInTenant(
  eventId: string,
  tenantIds: string[] | null
): Promise<boolean> {
  if (tenantIds === null) return true
  const e = await prisma.disasterEvent.findUnique({
    where: { id: eventId },
    select: { barangayId: true },
  })
  return !!e && tenantIds.includes(e.barangayId)
}

export async function assertEvacuationCenterInTenant(
  centerId: string,
  tenantIds: string[] | null
): Promise<boolean> {
  if (tenantIds === null) return true
  const c = await prisma.evacuationCenter.findUnique({
    where: { id: centerId },
    select: { barangayId: true },
  })
  return !!c && tenantIds.includes(c.barangayId)
}

export async function assertResidentInTenant(
  residentId: string,
  tenantIds: string[] | null
): Promise<boolean> {
  if (tenantIds === null) return true
  const r = await prisma.resident.findUnique({
    where: { id: residentId },
    select: {
      householdId: true,
      household: { select: { barangayId: true } },
    },
  })
  if (!r?.householdId || !r.household) return false
  return tenantIds.includes(r.household.barangayId)
}
