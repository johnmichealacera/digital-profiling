/**
 * Barangay leadership display order: most senior first.
 * Handles common labels including seed data ("Barangay Captain", "SK Chairman").
 */
export function officialPositionRank(position: string): number {
  const p = position.trim().toLowerCase()
  const isSk = /\bsk\b/i.test(p)

  if (
    p.includes("punong barangay") ||
    p === "barangay captain" ||
    (p.includes("captain") && !isSk)
  ) {
    return 0
  }
  if (p.includes("secretary") && !isSk) return 1
  if (p.includes("treasurer") && !isSk) return 2
  if (p.includes("kagawad") && !isSk) return 3

  if (
    isSk &&
    (p.includes("chairperson") || p.includes("chairman"))
  ) {
    return 4
  }
  if (isSk && p.includes("kagawad")) return 5
  if (isSk && p.includes("secretary")) return 6
  if (isSk && p.includes("treasurer")) return 7

  return 50
}

/** Visual layout: one full-width row vs up to 3 columns (kagawads). */
export type OfficialLayoutMode = "full" | "grid3"

export const OFFICIAL_LAYOUT_TIERS: Array<{
  rank: number
  title: string
  layout: OfficialLayoutMode
}> = [
  { rank: 0, title: "Punong Barangay / Barangay Captain", layout: "full" },
  { rank: 1, title: "Barangay Secretary", layout: "full" },
  { rank: 2, title: "Barangay Treasurer", layout: "full" },
  { rank: 3, title: "Barangay Kagawad", layout: "grid3" },
  { rank: 4, title: "SK Chairperson / Chairman", layout: "full" },
  { rank: 5, title: "SK Kagawad", layout: "grid3" },
  { rank: 6, title: "SK Secretary", layout: "full" },
  { rank: 7, title: "SK Treasurer", layout: "full" },
  { rank: 50, title: "Other roles", layout: "full" },
]

/**
 * Group an already-sorted official list into tiers for display.
 * Within each tier, order matches `sortedList` traversal.
 */
export function bucketOfficialsByLayoutTier<T extends { position: string }>(
  sortedList: T[]
): Array<{
  tierRank: number
  title: string
  layout: OfficialLayoutMode
  members: T[]
}> {
  const buckets = new Map<number, T[]>()
  for (const t of OFFICIAL_LAYOUT_TIERS) {
    buckets.set(t.rank, [])
  }
  for (const o of sortedList) {
    const r = officialPositionRank(o.position)
    const key = r >= 50 ? 50 : r
    if (!buckets.has(key)) {
      buckets.set(key, [])
    }
    buckets.get(key)!.push(o)
  }
  return OFFICIAL_LAYOUT_TIERS.filter(
    (t) => (buckets.get(t.rank)?.length ?? 0) > 0
  ).map((t) => ({
    tierRank: t.rank,
    title: t.title,
    layout: t.layout,
    members: buckets.get(t.rank)!,
  }))
}

/** When multiple barangays appear in the list, split into ordered segments (order of first appearance). */
export function segmentOfficialsByBarangay<
  T extends { barangay?: { name: string } },
>(list: T[]): T[][] {
  if (list.length === 0) return []
  const keys: string[] = []
  const map = new Map<string, T[]>()
  for (const o of list) {
    const k = o.barangay?.name ?? "—"
    if (!map.has(k)) {
      map.set(k, [])
      keys.push(k)
    }
    map.get(k)!.push(o)
  }
  if (keys.length <= 1) return [list]
  return keys.map((k) => map.get(k)!)
}

export function compareOfficialsByRank(
  a: {
    position: string
    lastName: string
    firstName: string
    committee?: string | null
  },
  b: typeof a
): number {
  const ra = officialPositionRank(a.position)
  const rb = officialPositionRank(b.position)
  if (ra !== rb) return ra - rb
  if (ra === 3 || ra === 5) {
    const c = (a.committee ?? "").localeCompare(b.committee ?? "", undefined, {
      sensitivity: "base",
    })
    if (c !== 0) return c
  }
  const ln = a.lastName.localeCompare(b.lastName, undefined, {
    sensitivity: "base",
  })
  if (ln !== 0) return ln
  return a.firstName.localeCompare(b.firstName, undefined, {
    sensitivity: "base",
  })
}

export function sortOfficialsByHierarchy<
  T extends {
    position: string
    lastName: string
    firstName: string
    committee?: string | null
  },
>(list: T[]): T[] {
  return [...list].sort(compareOfficialsByRank)
}

/**
 * Incumbent block first (sorted), then past (sorted).
 * If the list spans more than one barangay, group by barangay name, then rank within each.
 */
export function sortOfficialsForScope<
  T extends {
    position: string
    lastName: string
    firstName: string
    committee?: string | null
    isIncumbent: boolean
    barangay: { name: string }
  },
>(rows: T[]): T[] {
  const incumbent = rows.filter((r) => r.isIncumbent)
  const past = rows.filter((r) => !r.isIncumbent)
  const multiBarangay =
    new Set(rows.map((r) => r.barangay.name)).size > 1

  const sortBlock = (list: T[]) => {
    const copy = [...list]
    if (multiBarangay) {
      copy.sort((a, b) => {
        const bc = a.barangay.name.localeCompare(b.barangay.name, undefined, {
          sensitivity: "base",
        })
        if (bc !== 0) return bc
        return compareOfficialsByRank(a, b)
      })
      return copy
    }
    return sortOfficialsByHierarchy(copy)
  }

  return [...sortBlock(incumbent), ...sortBlock(past)]
}
