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

function norm(v: string | null | undefined): string {
  return (v ?? "").trim().toLowerCase().replace(/\s+/g, " ")
}

function idNorm(v: string | null | undefined): string {
  return (v ?? "").trim().toLowerCase().replace(/[\s-]+/g, "")
}

function nameDobSexKey(input: {
  firstName?: string | null
  middleName?: string | null
  lastName?: string | null
  suffix?: string | null
  dateOfBirth?: Date | null
  sex?: string | null
}): string | null {
  if (!input.firstName || !input.lastName || !input.dateOfBirth || !input.sex) return null
  const dob = input.dateOfBirth.toISOString().slice(0, 10)
  return [
    norm(input.firstName),
    norm(input.middleName ?? ""),
    norm(input.lastName),
    norm(input.suffix ?? ""),
    dob,
    norm(input.sex),
  ].join("|")
}

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
    if (session.user.barangayId) {
      importBarangayId = session.user.barangayId
    } else if (paramBarangayId) {
      importBarangayId = paramBarangayId
    } else if (tenantIds && tenantIds.length === 1) {
      importBarangayId = tenantIds[0]!
    } else {
      return NextResponse.json(
        {
          error:
            "barangayId is required for municipality-scoped accounts with multiple barangays",
        },
        { status: 400 }
      )
    }
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

  const existingResidents = await prisma.resident.findMany({
    where: {
      OR: [
        { household: { is: { barangayId: importBarangayId } } },
        { householdId: null, barangayId: importBarangayId },
      ],
    },
    select: {
      id: true,
      firstName: true,
      middleName: true,
      lastName: true,
      suffix: true,
      dateOfBirth: true,
      sex: true,
      voterIdNo: true,
      philhealthNo: true,
      sssNo: true,
      pagibigNo: true,
      tinNo: true,
      nationalIdNo: true,
      seniorCitizenIdNo: true,
      pwdIdNo: true,
      soloParentIdNo: true,
    },
  })

  const existingNameDobSex = new Set<string>()
  const existingIdKeys = new Set<string>()

  for (const r of existingResidents) {
    const k = nameDobSexKey(r)
    if (k) existingNameDobSex.add(k)
    const ids: Array<[string, string | null]> = [
      ["voterIdNo", r.voterIdNo],
      ["philhealthNo", r.philhealthNo],
      ["sssNo", r.sssNo],
      ["pagibigNo", r.pagibigNo],
      ["tinNo", r.tinNo],
      ["nationalIdNo", r.nationalIdNo],
      ["seniorCitizenIdNo", r.seniorCitizenIdNo],
      ["pwdIdNo", r.pwdIdNo],
      ["soloParentIdNo", r.soloParentIdNo],
    ]
    for (const [field, raw] of ids) {
      const val = idNorm(raw)
      if (val) existingIdKeys.add(`${field}|${val}`)
    }
  }

  // Track duplicates inside the uploaded file too.
  const seenImportNameDobSex = new Set<string>()
  const seenImportIdKeys = new Set<string>()

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

    const duplicateMessages: string[] = []

    const parsedNameKey = nameDobSexKey({
      firstName: parsed.data.firstName,
      middleName: parsed.data.middleName,
      lastName: parsed.data.lastName,
      suffix: parsed.data.suffix,
      dateOfBirth: parsed.data.dateOfBirth as Date | undefined,
      sex: parsed.data.sex as string | undefined,
    })
    if (parsedNameKey) {
      if (existingNameDobSex.has(parsedNameKey)) {
        duplicateMessages.push(
          "possible duplicate: resident with same full name, birth date, and sex already exists"
        )
      }
      if (seenImportNameDobSex.has(parsedNameKey)) {
        duplicateMessages.push(
          "duplicate within import file: same full name, birth date, and sex already appeared in another row"
        )
      }
    }

    const parsedIds: Array<[string, string | null | undefined]> = [
      ["voterIdNo", parsed.data.voterIdNo],
      ["philhealthNo", parsed.data.philhealthNo],
      ["sssNo", parsed.data.sssNo],
      ["pagibigNo", parsed.data.pagibigNo],
      ["tinNo", parsed.data.tinNo],
      ["nationalIdNo", parsed.data.nationalIdNo],
      ["seniorCitizenIdNo", parsed.data.seniorCitizenIdNo],
      ["pwdIdNo", parsed.data.pwdIdNo],
      ["soloParentIdNo", parsed.data.soloParentIdNo],
    ]
    for (const [field, raw] of parsedIds) {
      const normalized = idNorm(raw)
      if (!normalized) continue
      const key = `${field}|${normalized}`
      if (existingIdKeys.has(key)) {
        duplicateMessages.push(`possible duplicate: ${field} already exists`)
      }
      if (seenImportIdKeys.has(key)) {
        duplicateMessages.push(
          `duplicate within import file: ${field} repeated in another row`
        )
      }
    }

    if (duplicateMessages.length > 0) {
      errors.push({ row: rowNumber, messages: duplicateMessages })
      continue
    }

    try {
      await prisma.resident.create({ data: parsed.data })
      created++
      if (parsedNameKey) {
        existingNameDobSex.add(parsedNameKey)
        seenImportNameDobSex.add(parsedNameKey)
      }
      for (const [field, raw] of parsedIds) {
        const normalized = idNorm(raw)
        if (!normalized) continue
        const key = `${field}|${normalized}`
        existingIdKeys.add(key)
        seenImportIdKeys.add(key)
      }
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
