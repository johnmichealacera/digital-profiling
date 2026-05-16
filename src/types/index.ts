import type {
  Resident,
  Household,
  Purok,
  DocumentRequest,
  Blotter,
  BarangayOfficial,
  HealthRecord,
  User,
} from "@/generated/prisma/client"

// ── Resident with relations ──────────────────────────────────────────────────

export type ResidentWithHousehold = Resident & {
  household: (Household & { purok: Purok }) | null
}

/** Resident row safe to pass from Server → Client (no Prisma Decimal). */
export type ResidentWithHouseholdClient = Omit<
  ResidentWithHousehold,
  "monthlyIncome"
> & {
  monthlyIncome: string | null
}

export type ResidentWithAll = Resident & {
  household: (Household & { purok: Purok }) | null
  documentRequests: DocumentRequest[]
  healthRecords: HealthRecord[]
}

/** DocumentRequest with Decimal fields serialized for Client Components. */
export type DocumentRequestClient = Omit<DocumentRequest, "feeAmount"> & {
  feeAmount: string | null
}

/** Safe to pass Server → Client (all Decimal fields serialized to string). */
export type ResidentWithAllClient = Omit<ResidentWithAll, "monthlyIncome" | "documentRequests"> & {
  monthlyIncome: string | null
  documentRequests: DocumentRequestClient[]
}

// ── Household with relations ─────────────────────────────────────────────────

export type HouseholdWithPurok = Household & {
  purok: Purok
}

export type HouseholdWithResidents = Household & {
  purok: Purok
  residents: Resident[]
}

// ── Document with relations ──────────────────────────────────────────────────

/** Minimal resident shape used in the documents list — no Decimal fields. */
export type ResidentForDocument = Pick<
  Resident,
  "id" | "firstName" | "middleName" | "lastName" | "suffix"
>

export type DocumentRequestWithResident = DocumentRequest & {
  resident: ResidentForDocument
  encodedBy: Pick<User, "id" | "name"> | null
  issuedBy: Pick<User, "id" | "name"> | null
}

// ── Blotter with relations ───────────────────────────────────────────────────

export type BlotterWithParties = Blotter & {
  complainant: Resident | null
  respondent: Resident | null
  filedBy: Pick<User, "id" | "name"> | null
}

// ── Dashboard Stats ──────────────────────────────────────────────────────────

export type DashboardStats = {
  totalPopulation: number
  totalHouseholds: number
  maleCount: number
  femaleCount: number
  seniorCitizenCount: number
  pwdCount: number
  fourPsCount: number
  soloParentCount: number
  registeredVoters: number
  ofwCount: number
  ageBrackets: {
    bracket: string
    male: number
    female: number
  }[]
  populationByPurok: {
    purok: string
    count: number
  }[]
  civilStatusDistribution: {
    status: string
    count: number
  }[]
  documentsThisMonth: number
  pendingDocuments: number
  activeBlotters: number
}

// ── Map Data ─────────────────────────────────────────────────────────────────

export type MapHousehold = {
  id: string
  houseNo: string | null
  latitude: number
  longitude: number
  purok: {
    id: string
    name: string
  }
  residentCount: number
  headOfHousehold: string | null
  is4PsBeneficiary: boolean
}

// ── API Response ─────────────────────────────────────────────────────────────

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
