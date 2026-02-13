import { z } from "zod"

export const householdSchema = z.object({
  houseNo: z.string().optional().nullable(),
  streetSitio: z.string().optional().nullable(),
  purokId: z.string().min(1, "Purok is required"),

  // GIS Coordinates
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),

  // Housing classification
  housingType: z.string().optional().nullable(),
  roofMaterial: z.string().optional().nullable(),
  wallMaterial: z.string().optional().nullable(),
  toiletFacility: z.string().optional().nullable(),
  waterSource: z.string().optional().nullable(),

  // 4Ps
  is4PsBeneficiary: z.boolean().default(false),
  fourPsHouseholdId: z.string().optional().nullable(),
})

export type HouseholdFormData = z.infer<typeof householdSchema>
