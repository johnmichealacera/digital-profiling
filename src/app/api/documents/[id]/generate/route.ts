import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { generateCertificatePdf } from "@/lib/pdf/generate-certificate"
import { assertDocumentInTenant, getTenantBarangayIds } from "@/lib/tenant"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const tenantIds = await getTenantBarangayIds(session)
  const { id } = await params

  if (!(await assertDocumentInTenant(id, tenantIds))) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 })
  }

  const document = await prisma.documentRequest.findUnique({
    where: { id },
    include: {
      resident: {
        include: { household: { include: { purok: true } } },
      },
    },
  })

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 })
  }

  const brgy = await prisma.barangay.findUnique({
    where: { id: document.barangayId },
    include: { municipality: true },
  })
  if (!brgy) {
    return NextResponse.json(
      { error: "Barangay configuration missing" },
      { status: 500 }
    )
  }

  const captain = await prisma.barangayOfficial.findFirst({
    where: {
      barangayId: document.barangayId,
      position: "Barangay Captain",
      isIncumbent: true,
    },
  })

  const zip = brgy.zipCode ? ` ${brgy.zipCode}` : ""
  const branding = {
    barangayName: brgy.name,
    municipalityName: brgy.municipality.name,
    province: brgy.province,
    fullAddressLine: `Barangay ${brgy.name}, ${brgy.municipality.name}, ${brgy.province}${zip}`,
  }

  const pdfBytes = await generateCertificatePdf({
    document,
    resident: document.resident,
    household: document.resident.household,
    captain,
    branding,
  })

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${document.controlNo}.pdf"`,
    },
  })
}
