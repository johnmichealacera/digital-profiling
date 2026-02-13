import { PDFDocument, rgb, StandardFonts, PageSizes } from "pdf-lib"
import {
  formatFormalName,
  formatResidentName,
  formatDate,
  computeAge,
} from "@/lib/utils"
import { CIVIL_STATUS_LABELS, BARANGAY_INFO } from "@/lib/constants"
import type {
  DocumentRequest,
  Resident,
  Household,
  Purok,
  BarangayOfficial,
} from "@/generated/prisma/client"

interface GenerateParams {
  document: DocumentRequest
  resident: Resident
  household: (Household & { purok: Purok }) | null
  captain: BarangayOfficial | null
}

export async function generateCertificatePdf({
  document: doc,
  resident,
  household,
  captain,
}: GenerateParams): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage(PageSizes.Letter)
  const { width, height } = page.getSize()

  const fontRegular = await pdfDoc.embedFont(StandardFonts.TimesRoman)
  const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
  const fontItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic)

  const black = rgb(0, 0, 0)
  const darkGray = rgb(0.2, 0.2, 0.2)

  let y = height - 60

  // ── Header ───────────────────────────────────────────────────────────────
  function drawCentered(text: string, yPos: number, size: number, font = fontRegular) {
    const textWidth = font.widthOfTextAtSize(text, size)
    page.drawText(text, {
      x: (width - textWidth) / 2,
      y: yPos,
      size,
      font,
      color: black,
    })
  }

  drawCentered("Republic of the Philippines", y, 11)
  y -= 16
  drawCentered(`Province of ${BARANGAY_INFO.province}`, y, 11)
  y -= 16
  drawCentered(`Municipality of ${BARANGAY_INFO.municipality}`, y, 11)
  y -= 16
  drawCentered(`BARANGAY ${BARANGAY_INFO.name.toUpperCase()}`, y, 12, fontBold)
  y -= 14
  drawCentered(`Office of the Punong Barangay`, y, 10, fontItalic)

  // Horizontal line
  y -= 15
  page.drawLine({
    start: { x: 60, y },
    end: { x: width - 60, y },
    thickness: 1.5,
    color: black,
  })

  // ── Document Title ────────────────────────────────────────────────────────
  y -= 35
  const titleMap: Record<string, string> = {
    BARANGAY_CLEARANCE: "BARANGAY CLEARANCE",
    CERTIFICATE_OF_INDIGENCY: "CERTIFICATE OF INDIGENCY",
    CERTIFICATE_OF_RESIDENCY: "CERTIFICATE OF RESIDENCY",
    CERTIFICATE_OF_GOOD_MORAL: "CERTIFICATE OF GOOD MORAL CHARACTER",
    FIRST_TIME_JOB_SEEKER: "FIRST TIME JOB SEEKER CERTIFICATE",
    SOLO_PARENT_CERTIFICATE: "SOLO PARENT CERTIFICATE",
    BUSINESS_PERMIT: "BARANGAY BUSINESS PERMIT",
    BARANGAY_ID: "BARANGAY IDENTIFICATION",
  }
  const title = titleMap[doc.documentType] || "CERTIFICATE"
  drawCentered(title, y, 16, fontBold)

  // Control number
  y -= 18
  drawCentered(`Control No.: ${doc.controlNo}`, y, 9, fontItalic)

  // ── Body ──────────────────────────────────────────────────────────────────
  y -= 40
  const leftMargin = 72
  const lineHeight = 18
  const fontSize = 11

  const fullName = formatFormalName(resident)
  const age = computeAge(resident.dateOfBirth)
  const civilStatus = CIVIL_STATUS_LABELS[resident.civilStatus] || resident.civilStatus
  const address = household
    ? `${household.purok.name}, Barangay ${BARANGAY_INFO.name}, ${BARANGAY_INFO.municipality}, ${BARANGAY_INFO.province}`
    : `Barangay ${BARANGAY_INFO.name}, ${BARANGAY_INFO.municipality}, ${BARANGAY_INFO.province}`

  page.drawText("TO WHOM IT MAY CONCERN:", {
    x: leftMargin,
    size: fontSize,
    font: fontBold,
    color: black,
  })

  y -= lineHeight * 2

  // Generate body text based on document type
  let bodyText = ""
  switch (doc.documentType) {
    case "BARANGAY_CLEARANCE":
      bodyText =
        `       This is to certify that ${fullName}, ${age} years old, ${civilStatus}, ` +
        `Filipino, and a bonafide resident of ${address}, is known to be a person of good moral character ` +
        `and has NO DEROGATORY RECORD on file in this barangay.\n\n` +
        `       This BARANGAY CLEARANCE is being issued upon the request of the above-named person ` +
        `for ${doc.purpose} purposes.`
      break
    case "CERTIFICATE_OF_INDIGENCY":
      bodyText =
        `       This is to certify that ${fullName}, ${age} years old, ${civilStatus}, ` +
        `Filipino, and a resident of ${address}, belongs to an INDIGENT FAMILY in this barangay.\n\n` +
        `       This CERTIFICATE OF INDIGENCY is being issued upon the request of the above-named person ` +
        `for ${doc.purpose} purposes.`
      break
    case "CERTIFICATE_OF_RESIDENCY":
      bodyText =
        `       This is to certify that ${fullName}, ${age} years old, ${civilStatus}, ` +
        `Filipino, is a BONAFIDE RESIDENT of ${address}` +
        `${resident.yearsInBarangay ? ` for ${resident.yearsInBarangay} year(s)` : ""}.\n\n` +
        `       This CERTIFICATE OF RESIDENCY is being issued upon the request of the above-named person ` +
        `for ${doc.purpose} purposes.`
      break
    case "CERTIFICATE_OF_GOOD_MORAL":
      bodyText =
        `       This is to certify that ${fullName}, ${age} years old, ${civilStatus}, ` +
        `Filipino, and a bonafide resident of ${address}, is known to be a person of ` +
        `GOOD MORAL CHARACTER and has not been involved in any criminal activity in this barangay.\n\n` +
        `       This CERTIFICATE is being issued upon the request of the above-named person ` +
        `for ${doc.purpose} purposes.`
      break
    default:
      bodyText =
        `       This is to certify that ${fullName}, ${age} years old, ${civilStatus}, ` +
        `Filipino, and a bonafide resident of ${address}.\n\n` +
        `       This CERTIFICATE is being issued upon the request of the above-named person ` +
        `for ${doc.purpose} purposes.`
  }

  // Draw wrapped text
  const maxWidth = width - leftMargin * 2
  const paragraphs = bodyText.split("\n")

  for (const paragraph of paragraphs) {
    if (paragraph.trim() === "") {
      y -= lineHeight / 2
      continue
    }

    const words = paragraph.split(" ")
    let currentLine = ""

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const testWidth = fontRegular.widthOfTextAtSize(testLine, fontSize)

      if (testWidth > maxWidth && currentLine) {
        page.drawText(currentLine, {
          x: leftMargin,
          y,
          size: fontSize,
          font: fontRegular,
          color: darkGray,
        })
        y -= lineHeight
        currentLine = word
      } else {
        currentLine = testLine
      }
    }

    if (currentLine) {
      page.drawText(currentLine, {
        x: leftMargin,
        y,
        size: fontSize,
        font: fontRegular,
        color: darkGray,
      })
      y -= lineHeight
    }
  }

  // ── Date & Validity ───────────────────────────────────────────────────────
  y -= lineHeight
  const today = formatDate(new Date())
  page.drawText(`       Issued this ${today} at ${BARANGAY_INFO.fullAddress}.`, {
    x: leftMargin,
    y,
    size: fontSize,
    font: fontRegular,
    color: darkGray,
  })

  // ── Signature Block ───────────────────────────────────────────────────────
  y -= lineHeight * 4
  const sigX = width - 250

  if (captain) {
    const captainName = formatFormalName(captain).toUpperCase()
    const nameWidth = fontBold.widthOfTextAtSize(captainName, 12)
    page.drawText(captainName, {
      x: sigX + (180 - nameWidth) / 2,
      y,
      size: 12,
      font: fontBold,
      color: black,
    })
    y -= 14
    const posTitle = "Punong Barangay"
    const titleWidth = fontRegular.widthOfTextAtSize(posTitle, 10)
    page.drawText(posTitle, {
      x: sigX + (180 - titleWidth) / 2,
      y,
      size: 10,
      font: fontRegular,
      color: darkGray,
    })
  }

  // ── Footer ────────────────────────────────────────────────────────────────
  page.drawText("Not valid without official seal.", {
    x: leftMargin,
    y: 50,
    size: 8,
    font: fontItalic,
    color: darkGray,
  })

  return pdfDoc.save()
}
