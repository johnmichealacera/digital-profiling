import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@/generated/prisma/client"
import { residentPublicRegistrationSchema } from "@/lib/validations/resident.schema"

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const parsed = residentPublicRegistrationSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { barangayId, dateOfBirth, emailAddress, ...rest } = parsed.data

  const barangay = await prisma.barangay.findUnique({
    where: { id: barangayId },
    select: { id: true, name: true },
  })
  if (!barangay) {
    return NextResponse.json({ error: "Barangay not found" }, { status: 404 })
  }

  const dob = new Date(dateOfBirth)
  const duplicate = await prisma.resident.findFirst({
    where: {
      barangayId,
      sex: rest.sex,
      dateOfBirth: dob,
      firstName: { equals: rest.firstName.trim(), mode: "insensitive" },
      lastName: { equals: rest.lastName.trim(), mode: "insensitive" },
      ...(rest.middleName?.trim()
        ? {
            middleName: {
              equals: rest.middleName.trim(),
              mode: "insensitive" as const,
            },
          }
        : {}),
    },
    select: { id: true },
  })

  if (duplicate) {
    return NextResponse.json(
      {
        error:
          "A resident with the same name, birth date, and sex is already registered in this barangay.",
      },
      { status: 409 }
    )
  }

  const createData: Prisma.ResidentUncheckedCreateInput = {
    ...rest,
    firstName: rest.firstName.trim(),
    middleName: rest.middleName?.trim() || null,
    lastName: rest.lastName.trim(),
    suffix: rest.suffix?.trim() || null,
    placeOfBirth: rest.placeOfBirth?.trim() || null,
    contactNo: rest.contactNo.trim(),
    previousAddress: rest.previousAddress.trim(),
    occupation: rest.occupation?.trim() || null,
    dateOfBirth: dob,
    emailAddress: emailAddress || null,
    barangayId,
    citizenship: "Filipino",
    status: "ACTIVE",
  }

  const resident = await prisma.resident.create({
    data: createData,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      barangay: { select: { name: true } },
    },
  })

  return NextResponse.json(
    {
      message: "Registration submitted successfully",
      resident,
    },
    { status: 201 }
  )
}
