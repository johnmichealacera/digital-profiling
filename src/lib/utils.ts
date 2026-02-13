import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { differenceInYears, format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Name Formatting ──────────────────────────────────────────────────────────

export function formatResidentName(resident: {
  firstName: string
  middleName?: string | null
  lastName: string
  suffix?: string | null
}): string {
  const middle = resident.middleName
    ? ` ${resident.middleName.charAt(0)}.`
    : ""
  const suffix = resident.suffix ? ` ${resident.suffix}` : ""
  return `${resident.firstName}${middle} ${resident.lastName}${suffix}`
}

export function formatFormalName(resident: {
  firstName: string
  middleName?: string | null
  lastName: string
  suffix?: string | null
}): string {
  const parts = [resident.firstName, resident.middleName, resident.lastName].filter(Boolean)
  const suffix = resident.suffix ? `, ${resident.suffix}` : ""
  return `${parts.join(" ")}${suffix}`.toUpperCase()
}

// ── Age & Date Utilities ─────────────────────────────────────────────────────

export function computeAge(dateOfBirth: Date): number {
  return differenceInYears(new Date(), dateOfBirth)
}

export function isSeniorCitizen(dateOfBirth: Date): boolean {
  return computeAge(dateOfBirth) >= 60
}

export function isSKEligible(dateOfBirth: Date): boolean {
  const age = computeAge(dateOfBirth)
  return age >= 15 && age <= 30
}

export function isMinor(dateOfBirth: Date): boolean {
  return computeAge(dateOfBirth) < 18
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "MMMM d, yyyy")
}

export function formatShortDate(date: Date | string): string {
  return format(new Date(date), "MMM d, yyyy")
}

// ── Currency ─────────────────────────────────────────────────────────────────

export function formatPeso(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(num)
}

// ── Control Number Generation ────────────────────────────────────────────────

export function generateControlNo(prefix: string, sequence: number): string {
  const year = new Date().getFullYear()
  return `${prefix}-${year}-${String(sequence).padStart(6, "0")}`
}
