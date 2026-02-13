import { z } from "zod"

export const blotterSchema = z.object({
  incidentDate: z.string().min(1, "Incident date is required"),
  incidentPlace: z.string().min(1, "Incident place is required"),
  nature: z.enum([
    "PHYSICAL_ASSAULT",
    "VERBAL_ASSAULT",
    "THEFT",
    "TRESPASSING",
    "NOISE_COMPLAINT",
    "DOMESTIC_DISPUTE",
    "PROPERTY_DAMAGE",
    "ESTAFA",
    "THREAT",
    "OTHER",
  ]),
  natureDetails: z.string().optional().nullable(),
  narrative: z.string().min(1, "Narrative is required"),

  // Parties
  complainantId: z.string().optional().nullable(),
  complainantName: z.string().optional().nullable(),
  respondentId: z.string().optional().nullable(),
  respondentName: z.string().optional().nullable(),
  witnesses: z.array(z.string()).default([]),
})

export type BlotterFormData = z.infer<typeof blotterSchema>
