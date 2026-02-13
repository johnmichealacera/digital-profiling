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

export type ResidentWithAll = Resident & {
  household: (Household & { purok: Purok }) | null
  documentRequests: DocumentRequest[]
  healthRecords: HealthRecord[]
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

export type DocumentRequestWithResident = DocumentRequest & {
  resident: Resident
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
