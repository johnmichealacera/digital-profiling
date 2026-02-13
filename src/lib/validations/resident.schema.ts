import { z } from "zod"

export const residentSchema = z.object({
  householdId: z.string().optional().nullable(),

  // Name
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional().nullable(),
  lastName: z.string().min(1, "Last name is required"),
  suffix: z.string().optional().nullable(),

  // Demographics
  sex: z.enum(["MALE", "FEMALE"]),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  placeOfBirth: z.string().optional().nullable(),
  civilStatus: z.enum([
    "SINGLE",
    "MARRIED",
    "WIDOWED",
    "SEPARATED",
    "ANNULLED",
    "LIVE_IN",
  ]),
  citizenship: z.string().default("Filipino"),
  religion: z.string().optional().nullable(),
  bloodType: z.string().optional().nullable(),

  // Contact
  contactNo: z.string().optional().nullable(),
  emailAddress: z.string().email().optional().nullable().or(z.literal("")),

  // Government IDs
  voterStatus: z.boolean().default(false),
  voterIdNo: z.string().optional().nullable(),
  philhealthNo: z.string().optional().nullable(),
  sssNo: z.string().optional().nullable(),
  pagibigNo: z.string().optional().nullable(),
  tinNo: z.string().optional().nullable(),
  nationalIdNo: z.string().optional().nullable(),

  // Classification flags
  isSeniorCitizen: z.boolean().default(false),
  seniorCitizenIdNo: z.string().optional().nullable(),
  isPwd: z.boolean().default(false),
  pwdIdNo: z.string().optional().nullable(),
  pwdType: z.string().optional().nullable(),
  isSoloParent: z.boolean().default(false),
  soloParentIdNo: z.string().optional().nullable(),
  is4PsBeneficiary: z.boolean().default(false),
  isOFW: z.boolean().default(false),
  isIndigenousPeople: z.boolean().default(false),
  indigenousGroup: z.string().optional().nullable(),
  isSkMember: z.boolean().default(false),

  // Education & Employment
  educationalAttainment: z
    .enum([
      "NO_FORMAL_EDUCATION",
      "ELEMENTARY_LEVEL",
      "ELEMENTARY_GRADUATE",
      "HIGH_SCHOOL_LEVEL",
      "HIGH_SCHOOL_GRADUATE",
      "VOCATIONAL",
      "COLLEGE_LEVEL",
      "COLLEGE_GRADUATE",
      "POST_GRADUATE",
    ])
    .optional()
    .nullable(),
  occupation: z.string().optional().nullable(),
  employmentStatus: z
    .enum(["EMPLOYED", "SELF_EMPLOYED", "UNEMPLOYED", "RETIRED", "STUDENT", "OFW"])
    .optional()
    .nullable(),
  employer: z.string().optional().nullable(),
  monthlyIncome: z.coerce.number().optional().nullable(),

  // Residency
  yearsInBarangay: z.coerce.number().int().optional().nullable(),
  previousAddress: z.string().optional().nullable(),

  // Household
  isHouseholdHead: z.boolean().default(false),
  relationshipToHead: z.string().optional().nullable(),
})

export type ResidentFormData = z.infer<typeof residentSchema>
