import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import type { Prisma } from "@/generated/prisma/client"
import { formatResidentName } from "@/lib/utils"
import {
  assertDisasterEventInTenant,
  assertResidentInTenant,
  getTenantBarangayIds,
  residentWhereForTenant,
} from "@/lib/tenant"

const createSchema = z.object({
  residentId: z.string().min(1),
  disasterEventId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const tenantIds = await getTenantBarangayIds(session)
  const { searchParams } = new URL(req.url)
  const eventId = searchParams.get("eventId")

  const resFilter = residentWhereForTenant(tenantIds)
  const where: Prisma.MissingPersonReportWhereInput = {
    foundAt: null,
    ...(Object.keys(resFilter).length > 0
      ? { resident: { is: resFilter } }
      : {}),
  }
  if (eventId !== null && eventId !== undefined && eventId !== "") {
    where.disasterEventId = eventId
  }

  const reports = await prisma.missingPersonReport.findMany({
    where,
    orderBy: { reportedAt: "desc" },
    include: {
      resident: {
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          suffix: true,
          household: { select: { houseNo: true, purok: { select: { name: true } } } },
        },
      },
      disasterEvent: { select: { id: true, title: true, status: true } },
    },
  })

  const list = reports.map((r) => ({
    id: r.id,
    residentId: r.residentId,
    residentName: formatResidentName(r.resident),
    household: r.resident.household
      ? `#${r.resident.household.houseNo ?? "?"} - ${r.resident.household.purok.name}`
      : null,
    reportedAt: r.reportedAt.toISOString(),
    notes: r.notes,
    disasterEvent: r.disasterEvent,
  }))

  return NextResponse.json(list)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const tenantIds = await getTenantBarangayIds(session)

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  if (!(await assertResidentInTenant(parsed.data.residentId, tenantIds))) {
    return NextResponse.json({ error: "Resident not found" }, { status: 404 })
  }

  if (
    parsed.data.disasterEventId &&
    !(await assertDisasterEventInTenant(parsed.data.disasterEventId, tenantIds))
  ) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 })
  }

  const resident = await prisma.resident.findUnique({
    where: { id: parsed.data.residentId },
  })
  if (!resident) {
    return NextResponse.json({ error: "Resident not found" }, { status: 404 })
  }

  const existing = await prisma.missingPersonReport.findFirst({
    where: { residentId: parsed.data.residentId, foundAt: null },
  })
  if (existing) {
    return NextResponse.json(
      { error: "Resident already reported as missing" },
      { status: 409 }
    )
  }

  const report = await prisma.missingPersonReport.create({
    data: {
      residentId: parsed.data.residentId,
      disasterEventId: parsed.data.disasterEventId ?? null,
      notes: parsed.data.notes ?? null,
    },
  })

  return NextResponse.json(report, { status: 201 })
}
