import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type") || "residents"

  if (type === "residents") {
    const residents = await prisma.resident.findMany({
      where: { status: "ACTIVE" },
      include: { household: { include: { purok: { select: { name: true } } } } },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    })

    const header = [
      "Last Name", "First Name", "Middle Name", "Suffix",
      "Date of Birth", "Sex", "Civil Status", "Contact No",
      "House No", "Purok",
      "Education", "Employment", "Occupation",
      "Voter", "Senior", "PWD", "Solo Parent", "4Ps",
    ].join(",")

    const rows = residents.map((r) => {
      return [
        r.lastName,
        r.firstName,
        r.middleName ?? "",
        r.suffix ?? "",
        r.dateOfBirth.toISOString().split("T")[0],
        r.sex,
        r.civilStatus,
        r.contactNo ?? "",
        r.household?.houseNo ?? "",
        r.household?.purok?.name ?? "",
        r.educationalAttainment ?? "",
        r.employmentStatus ?? "",
        r.occupation ?? "",
        r.voterStatus ? "Yes" : "No",
        r.isSeniorCitizen ? "Yes" : "No",
        r.isPwd ? "Yes" : "No",
        r.isSoloParent ? "Yes" : "No",
        r.is4PsBeneficiary ? "Yes" : "No",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    })

    const csv = [header, ...rows].join("\n")

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="residents_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  }

  if (type === "households") {
    const households = await prisma.household.findMany({
      include: {
        purok: { select: { name: true } },
        _count: { select: { residents: true } },
      },
      orderBy: { houseNo: "asc" },
    })

    const header = [
      "House No", "Purok", "Street/Sitio",
      "Members", "4Ps", "Housing Type",
      "Latitude", "Longitude",
    ].join(",")

    const rows = households.map((h) => {
      return [
        h.houseNo ?? "",
        h.purok.name,
        h.streetSitio ?? "",
        h._count.residents,
        h.is4PsBeneficiary ? "Yes" : "No",
        h.housingType ?? "",
        h.latitude ?? "",
        h.longitude ?? "",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    })

    const csv = [header, ...rows].join("\n")

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="households_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  }

  return NextResponse.json({ error: "Unknown export type" }, { status: 400 })
}
