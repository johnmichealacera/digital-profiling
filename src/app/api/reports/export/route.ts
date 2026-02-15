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

  if (type === "disaster-profiles") {
    const profiles = await prisma.householdDisasterProfile.findMany({
      include: {
        household: {
          select: {
            houseNo: true,
            purok: { select: { name: true } },
            _count: { select: { residents: true } },
          },
        },
        evacuationCenterRef: { select: { name: true } },
      },
      orderBy: { riskLevel: "asc" },
    })

    const header = [
      "House No", "Purok", "Members", "Risk Level",
      "Has PWD", "Has Senior", "Has Pregnant", "Has Infant", "Has Chronic Ill",
      "Hazards", "Evacuated", "Evacuation Center",
      "Emergency Contact Name", "Emergency Contact No", "Notes",
    ].join(",")

    const rows = profiles.map((p) => {
      return [
        p.household.houseNo ?? "",
        p.household.purok.name,
        p.household._count.residents,
        p.riskLevel,
        p.hasPWD ? "Yes" : "No",
        p.hasSenior ? "Yes" : "No",
        p.hasPregnant ? "Yes" : "No",
        p.hasInfant ? "Yes" : "No",
        p.hasChronicIll ? "Yes" : "No",
        (p.hazardTypes ?? []).join("; "),
        p.evacuatedAt ? "Yes" : "No",
        p.evacuationCenterRef?.name ?? p.evacuationCenter ?? "",
        p.emergencyContactName ?? "",
        p.emergencyContactNo ?? "",
        p.notes ?? "",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    })

    const csv = [header, ...rows].join("\n")
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="disaster_household_profiles_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  }

  if (type === "disaster-evacuation-centers") {
    const centers = await prisma.evacuationCenter.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: {
        evacuatedProfiles: {
          where: { evacuatedAt: { not: null } },
          include: {
            household: { select: { _count: { select: { residents: true } } } },
          },
        },
      },
    })

    const header = [
      "Name", "Address", "Capacity", "Latitude", "Longitude",
      "Contact No", "Current Evacuees", "Facilities",
    ].join(",")

    const rows = centers.map((ec) => {
      const currentEvacuees = ec.evacuatedProfiles.reduce(
        (s, p) => s + p.household._count.residents,
        0
      )
      return [
        ec.name,
        ec.address,
        ec.capacity ?? "",
        ec.latitude ?? "",
        ec.longitude ?? "",
        ec.contactNo ?? "",
        currentEvacuees,
        (ec.facilities ?? []).join("; "),
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    })

    const csv = [header, ...rows].join("\n")
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="disaster_evacuation_centers_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  }

  if (type === "disaster-missing") {
    const reports = await prisma.missingPersonReport.findMany({
      where: { foundAt: null },
      orderBy: { reportedAt: "desc" },
      include: {
        resident: {
          select: {
            firstName: true,
            middleName: true,
            lastName: true,
            suffix: true,
            household: {
              select: {
                houseNo: true,
                purok: { select: { name: true } },
              },
            },
          },
        },
      },
    })

    const header = [
      "Resident Name", "Household", "Reported At", "Notes",
    ].join(",")

    const rows = reports.map((r) => {
      const name = [r.resident.firstName, r.resident.middleName, r.resident.lastName, r.resident.suffix]
        .filter(Boolean)
        .join(" ")
      const household = r.resident.household
        ? `#${r.resident.household.houseNo ?? "?"} - ${r.resident.household.purok.name}`
        : ""
      return [
        name,
        household,
        r.reportedAt.toISOString(),
        r.notes ?? "",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    })

    const csv = [header, ...rows].join("\n")
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="disaster_missing_persons_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  }

  return NextResponse.json({ error: "Unknown export type" }, { status: 400 })
}
