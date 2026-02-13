import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { generateCertificatePdf } from "@/lib/pdf/generate-certificate"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

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

  // Get incumbent captain for signature
  const captain = await prisma.barangayOfficial.findFirst({
    where: { position: "Barangay Captain", isIncumbent: true },
  })

  const pdfBytes: any = await generateCertificatePdf({
    document,
    resident: document.resident,
    household: document.resident.household,
    captain,
  })

  return new NextResponse(pdfBytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${document.controlNo}.pdf"`,
    },
  })
}
