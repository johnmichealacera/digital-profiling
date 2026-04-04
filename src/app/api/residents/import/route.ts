import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canPerformAction } from "@/lib/permissions"
import {
  buildHouseholdLookupKey,
  parseResidentImportBuffer,
  parseResidentRow,
} from "@/lib/resident-import"
import { canAccessBarangayId, getTenantBarangayIds } from "@/lib/tenant"

const MAX_BYTES = 5 * 1024 * 1024

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!canPerformAction(session.user.role, "residents", "create")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const tenantIds = await getTenantBarangayIds(session)
  const paramBarangayId = req.nextUrl.searchParams.get("barangayId")?.trim()

  let importBarangayId: string
  if (session.user.role === "SUPER_ADMIN") {
    if (!paramBarangayId) {
      return NextResponse.json(
        { error: "Query parameter barangayId is required for import" },
        { status: 400 }
      )
    }
    importBarangayId = paramBarangayId
  } else {
    if (!session.user.barangayId) {
      return NextResponse.json(
        { error: "No barangay assignment for this account" },
        { status: 403 }
      )
    }
    importBarangayId = session.user.barangayId
  }

  if (!canAccessBarangayId(session, importBarangayId, tenantIds)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json(
      { error: "Expected multipart form data" },
      { status: 400 }
    )
  }

  const file = formData.get("file")
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: 'Missing file field "file"' },
      { status: 400 }
    )
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File too large (max 5 MB)" },
      { status: 400 }
    )
  }

  const buf = Buffer.from(await file.arrayBuffer())
  const { rows, parseError } = parseResidentImportBuffer(buf)
  if (parseError) {
    return NextResponse.json({ error: parseError }, { status: 400 })
  }

  const households = await prisma.household.findMany({
    where: { barangayId: importBarangayId },
    include: { purok: true },
  })
  const householdIdByKey = new Map<string, string>()
  for (const h of households) {
    const key = buildHouseholdLookupKey(h.houseNo, h.purok.name, importBarangayId)
    householdIdByKey.set(key, h.id)
  }

  const errors: { row: number; messages: string[] }[] = []
  let created = 0

  for (let i = 0; i < rows.length; i++) {
    const rowNumber = i + 2
    const parsed = parseResidentRow(
      rows[i]!,
      rowNumber,
      householdIdByKey,
      importBarangayId
    )
    if (!parsed.data) {
      errors.push({ row: parsed.rowNumber, messages: parsed.errors })
      continue
    }

    try {
      await prisma.resident.create({ data: parsed.data })
      created++
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Database error"
      errors.push({ row: rowNumber, messages: [msg] })
    }
  }

  return NextResponse.json({
    created,
    failed: errors.length,
    errors,
  })
}
