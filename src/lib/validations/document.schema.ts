import { z } from "zod"

export const documentRequestSchema = z.object({
  residentId: z.string().min(1, "Resident is required"),
  documentType: z.enum([
    "BARANGAY_CLEARANCE",
    "CERTIFICATE_OF_INDIGENCY",
    "CERTIFICATE_OF_RESIDENCY",
    "BUSINESS_PERMIT",
    "CERTIFICATE_OF_GOOD_MORAL",
    "BARANGAY_ID",
    "FIRST_TIME_JOB_SEEKER",
    "SOLO_PARENT_CERTIFICATE",
  ]),
  purpose: z.string().min(1, "Purpose is required"),

  // Business Permit specific
  businessName: z.string().optional().nullable(),
  businessType: z.string().optional().nullable(),
  businessAddress: z.string().optional().nullable(),

  // Fees
  feeAmount: z.coerce.number().optional().nullable(),
  officialReceipt: z.string().optional().nullable(),

  remarks: z.string().optional().nullable(),
})

export type DocumentRequestFormData = z.infer<typeof documentRequestSchema>
