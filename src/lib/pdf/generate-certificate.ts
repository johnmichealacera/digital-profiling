import { PDFDocument, rgb, StandardFonts, PageSizes } from "pdf-lib"
import {
  formatFormalName,
  formatResidentName,
  formatDate,
  computeAge,
} from "@/lib/utils"
import { CIVIL_STATUS_LABELS } from "@/lib/constants"
import type {
  DocumentRequest,
  Resident,
  Household,
  Purok,
  BarangayOfficial,
} from "@/generated/prisma/client"

export type CertificateBranding = {
  barangayName: string
  municipalityName: string
  province: string
  /** e.g. "Barangay Taruc, Socorro, Surigao del Norte" */
  fullAddressLine: string
}

interface GenerateParams {
  document: DocumentRequest
  resident: Resident
  household: (Household & { purok: Purok }) | null
  captain: BarangayOfficial | null
  branding: CertificateBranding
}

export async function generateCertificatePdf({
  document: doc,
  resident,
  household,
  captain,
  branding,
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
  drawCentered(`Province of ${branding.province}`, y, 11)
  y -= 16
  drawCentered(`Municipality of ${branding.municipalityName}`, y, 11)
  y -= 16
  drawCentered(`BARANGAY ${branding.barangayName.toUpperCase()}`, y, 12, fontBold)
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
    BUSINESS_PERMIT: "BARANGAY BUSINESS PERMIT ENDORSEMENT",
    BARANGAY_ID: "BARANGAY IDENTIFICATION",
    CEDULA: "COMMUNITY TAX CERTIFICATE",
    SK_CERTIFICATION: "SANGGUNIANG KABATAAN CERTIFICATION",
    SENIOR_CITIZEN_ID_ENDORSEMENT: "SENIOR CITIZEN ID ENDORSEMENT",
    PWD_ID_ENDORSEMENT: "PERSON WITH DISABILITY ID ENDORSEMENT",
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
    ? `${household.purok.name}, Barangay ${branding.barangayName}, ${branding.municipalityName}, ${branding.province}`
    : `Barangay ${branding.barangayName}, ${branding.municipalityName}, ${branding.province}`

  page.drawText("TO WHOM IT MAY CONCERN:", {
    x: leftMargin,
    y,
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
    case "FIRST_TIME_JOB_SEEKER":
      bodyText =
        `       This is to certify that ${fullName}, ${age} years old, ${civilStatus}, ` +
        `Filipino, and a bonafide resident of ${address}, is a FIRST-TIME JOB SEEKER in accordance ` +
        `with Republic Act No. 11261, otherwise known as the "First Time Jobseekers Assistance Act".\n\n` +
        `       This CERTIFICATE is being issued upon the request of the above-named person ` +
        `for ${doc.purpose} purposes.`
      break
    case "SOLO_PARENT_CERTIFICATE":
      bodyText =
        `       This is to certify that ${fullName}, ${age} years old, ${civilStatus}, ` +
        `Filipino, and a bonafide resident of ${address}, is a SOLO PARENT as defined under ` +
        `Republic Act No. 8972, otherwise known as the "Solo Parents' Welfare Act of 2000".\n\n` +
        `       This CERTIFICATE is being issued upon the request of the above-named person ` +
        `for ${doc.purpose} purposes.`
      break
    case "BUSINESS_PERMIT":
      bodyText =
        `       This is to certify that ${fullName}, ${age} years old, ${civilStatus}, ` +
        `Filipino, and a bonafide resident of ${address}, is hereby granted a BARANGAY BUSINESS PERMIT ` +
        `to operate${doc.businessName ? ` "${doc.businessName}"` : " a business"}` +
        `${doc.businessType ? ` (${doc.businessType})` : ""}` +
        `${doc.businessAddress ? ` located at ${doc.businessAddress}` : ""}` +
        ` within the jurisdiction of this barangay.\n\n` +
        `       This PERMIT is being issued upon the request of the above-named person ` +
        `for ${doc.purpose} purposes.`
      break
    case "BARANGAY_ID":
      bodyText =
        `       This is to certify that ${fullName}, ${age} years old, ${civilStatus}, ` +
        `Filipino, is a REGISTERED RESIDENT of ${address}.\n\n` +
        `       This BARANGAY IDENTIFICATION is issued to certify the residency of the above-named person ` +
        `within the jurisdiction of this barangay.`
      break
    case "CEDULA": {
      const taxYear = new Date().getFullYear()
      bodyText =
        `       This is to certify that ${fullName}, ${age} years old, ${civilStatus}, ` +
        `Filipino, and a bonafide resident of ${address}, has paid the Community Tax for the year ${taxYear} ` +
        `at the Office of the Barangay ${branding.barangayName}, ${branding.municipalityName}, ${branding.province}.\n\n` +
        `       This COMMUNITY TAX CERTIFICATE (CEDULA) is issued in accordance with the Local Government ` +
        `Code of 1991 (Republic Act No. 7160) upon the request of the above-named person ` +
        `for ${doc.purpose} purposes.`
      break
    }
    case "SK_CERTIFICATION":
      bodyText =
        `       This is to certify that ${fullName}, ${age} years old, ${civilStatus}, ` +
        `Filipino, and a bonafide resident of ${address}, is a registered youth constituent of this barangay ` +
        `and is eligible for Sangguniang Kabataan (SK) programs and activities in accordance with ` +
        `Republic Act No. 10742, otherwise known as the "Sangguniang Kabataan Reform Act of 2015".\n\n` +
        `       This SK CERTIFICATION is being issued upon the request of the above-named person ` +
        `for ${doc.purpose} purposes.`
      break
    case "SENIOR_CITIZEN_ID_ENDORSEMENT":
      bodyText =
        `       This is to certify that ${fullName}, ${age} years old, ${civilStatus}, ` +
        `Filipino, and a bonafide resident of ${address}, is a SENIOR CITIZEN of this barangay ` +
        `in accordance with Republic Act No. 9994, otherwise known as the "Expanded Senior Citizens Act of 2010".\n\n` +
        `       This office hereby ENDORSES the above-named person for the processing of his/her Senior Citizen ` +
        `Identification Card at the Office for Senior Citizens Affairs (OSCA) of ${branding.municipalityName}.\n\n` +
        `       This endorsement is being issued upon the request of the above-named person ` +
        `for ${doc.purpose} purposes.`
      break
    case "PWD_ID_ENDORSEMENT":
      bodyText =
        `       This is to certify that ${fullName}, ${age} years old, ${civilStatus}, ` +
        `Filipino, and a bonafide resident of ${address}, is a PERSON WITH DISABILITY (PWD) ` +
        `in this barangay in accordance with Republic Act No. 7277 (Magna Carta for Persons with Disability) ` +
        `as amended by Republic Act No. 9442.\n\n` +
        `       This office hereby ENDORSES the above-named person for the processing of his/her PWD ` +
        `Identification Card at the City/Municipal Social Welfare and Development Office (CSWDO/MSWDO) ` +
        `of ${branding.municipalityName}.\n\n` +
        `       This endorsement is being issued upon the request of the above-named person ` +
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
  page.drawText(`       Issued this ${today} at ${branding.fullAddressLine}.`, {
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
