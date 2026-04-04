/**
 * Pure string helper for UI copy. Safe to import from Client Components — no DB.
 */
export function tenantAreaPhraseFromSessionUser(u: {
  tenantTitle?: string | null
  tenantSubtitle?: string | null
}): string {
  const t = u.tenantTitle?.trim()
  const s = u.tenantSubtitle?.trim()
  if (t && s) return `${t} (${s})`
  if (t) return t
  return "your jurisdiction"
}
