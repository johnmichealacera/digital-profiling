import type { ResidentWithHousehold, ResidentWithHouseholdClient } from "@/types"

export function serializeResidentForClient(
  r: ResidentWithHousehold
): ResidentWithHouseholdClient {
  return {
    ...r,
    monthlyIncome: r.monthlyIncome != null ? String(r.monthlyIncome) : null,
  }
}

export function serializeResidentsForClient(
  residents: ResidentWithHousehold[]
): ResidentWithHouseholdClient[] {
  return residents.map(serializeResidentForClient)
}
