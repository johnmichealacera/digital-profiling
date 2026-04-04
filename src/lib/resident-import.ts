import * as XLSX from "xlsx"
import { format, isValid, parse, parseISO } from "date-fns"
import type { Prisma } from "@/generated/prisma/client"

/** Row 1 headers — use these exact names (snake_case). */
export const RESIDENT_IMPORT_HEADERS = [
  "first_name",
  "middle_name",
  "last_name",
  "suffix",
  "sex",
  "date_of_birth",
  "place_of_birth",
  "civil_status",
  "citizenship",
  "religion",
  "blood_type",
  "contact_no",
  "email_address",
  "voter_status",
  "voter_id_no",
  "philhealth_no",
  "sss_no",
  "pagibig_no",
  "tin_no",
  "national_id_no",
  "is_senior_citizen",
  "senior_citizen_id_no",
  "is_pwd",
  "pwd_id_no",
  "pwd_type",
  "is_solo_parent",
  "solo_parent_id_no",
  "is_4ps_beneficiary",
  "is_ofw",
  "is_indigenous_people",
  "indigenous_group",
  "is_sk_member",
  "educational_attainment",
  "occupation",
  "employment_status",
  "employer",
  "monthly_income",
  "years_in_barangay",
  "previous_address",
  "household_house_no",
  "household_purok_name",
  "is_household_head",
  "relationship_to_head",
] as const

export type ResidentImportHeader = (typeof RESIDENT_IMPORT_HEADERS)[number]

const CANONICAL = new Set<string>(RESIDENT_IMPORT_HEADERS)

/** Map alternate header labels → canonical. */
function normalizeHeaderKey(raw: string): string | null {
  const k = raw.trim().toLowerCase().replace(/\s+/g, "_")
  if (CANONICAL.has(k)) return k
  const aliases: Record<string, string> = {
    firstname: "first_name",
    "first name": "first_name",
    middlename: "middle_name",
    "middle name": "middle_name",
    lastname: "last_name",
    "last name": "last_name",
    gender: "sex",
    dob: "date_of_birth",
    dateofbirth: "date_of_birth",
    birth_date: "date_of_birth",
    contact: "contact_no",
    phone: "contact_no",
    mobile: "contact_no",
    email: "email_address",
    sss_no: "sss_no",
    sss: "sss_no",
    sss_number: "sss_no",
    philhealth: "philhealth_no",
    pag_ibig_no: "pagibig_no",
    philsys: "national_id_no",
    national_id: "national_id_no",
    is_4ps: "is_4ps_beneficiary",
    fourps: "is_4ps_beneficiary",
    education: "educational_attainment",
    house_no: "household_house_no",
    purok: "household_purok_name",
    purok_name: "household_purok_name",
    relationship: "relationship_to_head",
  }
  const mapped = aliases[k]
  if (mapped && CANONICAL.has(mapped)) return mapped
  return CANONICAL.has(k) ? k : null
}

export function parseBooleanCell(val: unknown): boolean {
  if (val === true || val === 1) return true
  if (val === false || val === 0) return false
  if (val == null || val === "") return false
  const s = String(val).trim().toLowerCase()
  return s === "true" || s === "yes" || s === "y" || s === "1" || s === "x"
}

export function parseDateOfBirth(val: unknown): string | null {
  if (val == null || val === "") return null
  if (val instanceof Date && !Number.isNaN(val.getTime())) {
    return format(val, "yyyy-MM-dd")
  }
  if (typeof val === "number") {
    const d = XLSX.SSF.parse_date_code(val)
    if (!d) return null
    try {
      const dt = new Date(Date.UTC(d.y, d.m - 1, d.d))
      return format(dt, "yyyy-MM-dd")
    } catch {
      return null
    }
  }
  const s = String(val).trim()
  const iso = parseISO(s)
  if (isValid(iso)) return format(iso, "yyyy-MM-dd")
  for (const fmt of ["MM/dd/yyyy", "dd/MM/yyyy", "yyyy/MM/dd", "M/d/yyyy"]) {
    try {
      const p = parse(s, fmt, new Date())
      if (isValid(p)) return format(p, "yyyy-MM-dd")
    } catch {
      /* next */
    }
  }
  return null
}

function emptyToNull(v: unknown): string | null {
  if (v == null || v === "") return null
  const s = String(v).trim()
  return s === "" ? null : s
}

const SEX = new Set(["MALE", "FEMALE"])
const CIVIL = new Set([
  "SINGLE",
  "MARRIED",
  "WIDOWED",
  "SEPARATED",
  "ANNULLED",
  "LIVE_IN",
])
const EDU = new Set([
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
const EMP = new Set([
  "EMPLOYED",
  "SELF_EMPLOYED",
  "UNEMPLOYED",
  "RETIRED",
  "STUDENT",
  "OFW",
])

function normEnum(s: string, allowed: Set<string>): string | null {
  let u = s.trim().toUpperCase().replace(/[\s-]+/g, "_")
  if (u === "LIVEIN") u = "LIVE_IN"
  if (allowed.has(u)) return u
  return null
}

function getStr(row: Record<string, unknown>, key: string): string {
  const v = row[key]
  if (v == null || v === "") return ""
  return String(v).trim()
}

export type ParsedImportRow = {
  rowNumber: number
  data: Prisma.ResidentCreateInput | null
  errors: string[]
}

export function sheetRowsToObjects(
  sheet: XLSX.WorkSheet,
  headerRowIndex = 0
): Record<string, unknown>[] {
  const rows = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(
    sheet,
    { header: 1, defval: null, raw: true }
  ) as unknown as (string | number | boolean | null)[][]

  if (!rows.length || rows.length <= headerRowIndex) return []

  const headerCells = rows[headerRowIndex] ?? []
  const keys: (string | null)[] = headerCells.map((h) => {
    if (h == null || h === "") return null
    return normalizeHeaderKey(String(h))
  })

  const out: Record<string, unknown>[] = []
  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const line = rows[i] ?? []
    const obj: Record<string, unknown> = {}
    let any = false
    for (let c = 0; c < keys.length; c++) {
      const k = keys[c]
      if (!k) continue
      const cell = line[c]
      if (cell != null && cell !== "") any = true
      obj[k] = cell
    }
    if (any) out.push(obj)
  }
  return out
}

export function buildHouseholdLookupKey(
  houseNo: string | null | undefined,
  purokName: string | null | undefined
): string {
  const h = (houseNo ?? "").trim().toLowerCase()
  const p = (purokName ?? "").trim().toLowerCase()
  return `${h}|${p}`
}

export function parseResidentRow(
  row: Record<string, unknown>,
  rowNumber: number,
  householdIdByKey: Map<string, string>
): ParsedImportRow {
  const errors: string[] = []

  const firstName = getStr(row, "first_name")
  const lastName = getStr(row, "last_name")
  if (!firstName) errors.push("first_name is required")
  if (!lastName) errors.push("last_name is required")

  const sexRaw = getStr(row, "sex")
  const sex = normEnum(sexRaw, SEX)
  if (!sex) errors.push(`sex must be MALE or FEMALE (got "${sexRaw}")`)

  const dobStr = parseDateOfBirth(row["date_of_birth"])
  if (!dobStr) errors.push("date_of_birth is required (use YYYY-MM-DD or Excel date)")

  const civilRaw = getStr(row, "civil_status") || "SINGLE"
  const civilStatus = normEnum(civilRaw, CIVIL)
  if (!civilStatus)
    errors.push(`invalid civil_status "${civilRaw}"`)

  let educationalAttainment: Prisma.ResidentCreateInput["educationalAttainment"]
  const eduRaw = getStr(row, "educational_attainment")
  if (eduRaw) {
    const e = normEnum(eduRaw, EDU)
    if (!e) errors.push(`invalid educational_attainment "${eduRaw}"`)
    else educationalAttainment = e as Prisma.ResidentCreateInput["educationalAttainment"]
  }

  let employmentStatus: Prisma.ResidentCreateInput["employmentStatus"]
  const empRaw = getStr(row, "employment_status")
  if (empRaw) {
    const e = normEnum(empRaw, EMP)
    if (!e) errors.push(`invalid employment_status "${empRaw}"`)
    else employmentStatus = e as Prisma.ResidentCreateInput["employmentStatus"]
  }

  const hhNo = emptyToNull(row["household_house_no"])
  const purokName = emptyToNull(row["household_purok_name"])
  let householdId: string | undefined
  if (hhNo || purokName) {
    if (!hhNo || !purokName) {
      errors.push(
        "household_house_no and household_purok_name must both be set to assign a household, or both left empty"
      )
    } else {
      const key = buildHouseholdLookupKey(hhNo, purokName)
      const id = householdIdByKey.get(key)
      if (!id)
        errors.push(
          `no household found for house "${hhNo}" in purok "${purokName}"`
        )
      else householdId = id
    }
  }

  const email = emptyToNull(row["email_address"])
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.push("invalid email_address")

  const monthlyRaw = row["monthly_income"]
  let monthlyIncome: number | undefined
  if (monthlyRaw != null && monthlyRaw !== "") {
    const n = Number(monthlyRaw)
    if (Number.isNaN(n)) errors.push("monthly_income must be a number")
    else monthlyIncome = n
  }

  const yearsRaw = row["years_in_barangay"]
  let yearsInBarangay: number | undefined
  if (yearsRaw != null && yearsRaw !== "") {
    const n = parseInt(String(yearsRaw), 10)
    if (Number.isNaN(n)) errors.push("years_in_barangay must be an integer")
    else yearsInBarangay = n
  }

  if (errors.length > 0) {
    return { rowNumber, data: null, errors }
  }

  const dateOfBirth = new Date(dobStr!)

  const data: Prisma.ResidentCreateInput = {
    firstName,
    middleName: emptyToNull(row["middle_name"]),
    lastName,
    suffix: emptyToNull(row["suffix"]),
    sex: sex as Prisma.ResidentCreateInput["sex"],
    dateOfBirth,
    placeOfBirth: emptyToNull(row["place_of_birth"]),
    civilStatus: civilStatus as Prisma.ResidentCreateInput["civilStatus"],
    citizenship: emptyToNull(row["citizenship"]) ?? "Filipino",
    religion: emptyToNull(row["religion"]),
    bloodType: emptyToNull(row["blood_type"]),
    contactNo: emptyToNull(row["contact_no"]),
    emailAddress: email,
    voterStatus: parseBooleanCell(row["voter_status"]),
    voterIdNo: emptyToNull(row["voter_id_no"]),
    philhealthNo: emptyToNull(row["philhealth_no"]),
    sssNo: emptyToNull(row["sss_no"]),
    pagibigNo: emptyToNull(row["pagibig_no"]),
    tinNo: emptyToNull(row["tin_no"]),
    nationalIdNo: emptyToNull(row["national_id_no"]),
    isSeniorCitizen: parseBooleanCell(row["is_senior_citizen"]),
    seniorCitizenIdNo: emptyToNull(row["senior_citizen_id_no"]),
    isPwd: parseBooleanCell(row["is_pwd"]),
    pwdIdNo: emptyToNull(row["pwd_id_no"]),
    pwdType: emptyToNull(row["pwd_type"]),
    isSoloParent: parseBooleanCell(row["is_solo_parent"]),
    soloParentIdNo: emptyToNull(row["solo_parent_id_no"]),
    is4PsBeneficiary: parseBooleanCell(row["is_4ps_beneficiary"]),
    isOFW: parseBooleanCell(row["is_ofw"]),
    isIndigenousPeople: parseBooleanCell(row["is_indigenous_people"]),
    indigenousGroup: emptyToNull(row["indigenous_group"]),
    isSkMember: parseBooleanCell(row["is_sk_member"]),
    educationalAttainment,
    occupation: emptyToNull(row["occupation"]),
    employmentStatus,
    employer: emptyToNull(row["employer"]),
    monthlyIncome,
    yearsInBarangay,
    previousAddress: emptyToNull(row["previous_address"]),
    isHouseholdHead: parseBooleanCell(row["is_household_head"]),
    relationshipToHead: emptyToNull(row["relationship_to_head"]),
    status: "ACTIVE",
  }

  if (householdId) {
    data.household = { connect: { id: householdId } }
  }

  return { rowNumber, data, errors: [] }
}

export function parseResidentImportBuffer(buffer: Buffer): {
  rows: Record<string, unknown>[]
  sheetName: string
  parseError?: string
} {
  try {
    const wb = XLSX.read(buffer, { type: "buffer", cellDates: true })
    const preferred = wb.SheetNames.find(
      (n) => n.trim().toLowerCase() === "residents"
    )
    const sheetName = preferred ?? wb.SheetNames[0]
    if (!sheetName) return { rows: [], sheetName: "", parseError: "No sheets found" }
    const sheet = wb.Sheets[sheetName]
    if (!sheet) return { rows: [], sheetName: "", parseError: "Empty workbook" }
    const rows = sheetRowsToObjects(sheet, 0)
    return { rows, sheetName }
  } catch (e) {
    return {
      rows: [],
      sheetName: "",
      parseError: e instanceof Error ? e.message : "Failed to read file",
    }
  }
}

type TemplateCell = string | number | boolean

/** Default cell values when a sample row omits a column. */
const TEMPLATE_ROW_DEFAULTS: Partial<
  Record<ResidentImportHeader, TemplateCell>
> = {
  suffix: "",
  place_of_birth: "Socorro, Surigao del Norte",
  civil_status: "SINGLE",
  citizenship: "Filipino",
  religion: "Catholic",
  blood_type: "",
  contact_no: "",
  email_address: "",
  voter_status: false,
  voter_id_no: "",
  philhealth_no: "",
  sss_no: "",
  pagibig_no: "",
  tin_no: "",
  national_id_no: "",
  is_senior_citizen: false,
  senior_citizen_id_no: "",
  is_pwd: false,
  pwd_id_no: "",
  pwd_type: "",
  is_solo_parent: false,
  solo_parent_id_no: "",
  is_4ps_beneficiary: false,
  is_ofw: false,
  is_indigenous_people: false,
  indigenous_group: "",
  is_sk_member: false,
  educational_attainment: "",
  occupation: "",
  employment_status: "",
  employer: "",
  monthly_income: "",
  years_in_barangay: "",
  previous_address: "",
  household_house_no: "",
  household_purok_name: "",
  is_household_head: false,
  relationship_to_head: "",
}

const TEMPLATE_FIRST_NAMES = [
  "Maria",
  "Jose",
  "Ana",
  "Miguel",
  "Rosa",
  "Antonio",
  "Lourdes",
  "Fernando",
  "Carmen",
  "Roberto",
  "Teresa",
  "Daniel",
  "Grace",
  "Emilio",
  "Patricia",
  "Ramon",
  "Elena",
  "Carlos",
  "Joy",
  "Alberto",
  "Imelda",
  "Paolo",
  "Christine",
  "Eduardo",
  "Jennifer",
  "Marco",
  "Angela",
  "Ryan",
  "Michelle",
  "Kevin",
] as const

const TEMPLATE_MIDDLE_NAMES = [
  "Santos",
  "Reyes",
  "Cruz",
  "Garcia",
  "Mendoza",
  "Torres",
  "Bautista",
  "Aquino",
  "Lim",
  "Flores",
  "Ramos",
  "Villanueva",
  "Gonzales",
  "Navarro",
  "Delos Santos",
  "Magbanua",
  "Tan",
  "Rivera",
  "Castillo",
  "Romero",
  "Herrera",
  "Medina",
  "Aguilar",
  "Morales",
  "Ortiz",
  "Silva",
  "Castro",
  "Vargas",
  "Jimenez",
  "Pangilinan",
] as const

const TEMPLATE_LAST_NAMES = [
  "Reyes",
  "Dela Cruz",
  "Santos",
  "Garcia",
  "Mendoza",
  "Torres",
  "Bautista",
  "Aquino",
  "Magno",
  "Villanueva",
  "Ramos",
  "Tan",
  "Lim",
  "Gonzales",
  "Navarro",
  "Flores",
  "Mendoza",
  "Rivera",
  "Castillo",
  "Romero",
  "Herrera",
  "Medina",
  "Aguilar",
  "Vargas",
  "Silva",
  "Castro",
  "Morales",
  "Ortiz",
  "Gutierrez",
  "Salazar",
] as const

const TEMPLATE_CIVIL = [
  "SINGLE",
  "MARRIED",
  "WIDOWED",
  "SEPARATED",
  "ANNULLED",
  "LIVE_IN",
] as const

const TEMPLATE_EDU = [
  "NO_FORMAL_EDUCATION",
  "ELEMENTARY_LEVEL",
  "ELEMENTARY_GRADUATE",
  "HIGH_SCHOOL_LEVEL",
  "HIGH_SCHOOL_GRADUATE",
  "VOCATIONAL",
  "COLLEGE_LEVEL",
  "COLLEGE_GRADUATE",
  "POST_GRADUATE",
] as const

const TEMPLATE_EMP = [
  "EMPLOYED",
  "SELF_EMPLOYED",
  "UNEMPLOYED",
  "RETIRED",
  "STUDENT",
  "OFW",
] as const

const TEMPLATE_OCCUPATIONS = [
  "Public School Teacher",
  "Farmer",
  "Fisherman",
  "Sari-sari Store Owner",
  "OFW — Seafarer",
  "Nurse",
  "Construction Worker",
  "Vendor",
  "Office Clerk",
  "Driver",
  "Housewife",
  "Mechanic",
  "Barangay Tanod",
  "Student",
  "Retired",
  "Dressmaker",
  "Electrician",
  "Municipal Employee",
  "Caregiver",
  "Welder",
  "Carpenter",
  "Midwife",
  "Security Guard",
  "Sales Agent",
  "Laundry Worker",
  "Cook",
  "Painter",
  "Laborer",
  "Bank Teller",
  "Pharmacist",
] as const

const TEMPLATE_BLOOD = ["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB+"] as const

const TEMPLATE_EMPLOYERS = [
  "DepEd",
  "Private",
  "Self",
  "DOH",
  "LGU Socorro",
  "SMNI Construction",
  "Local Market",
  "",
  "Manila Shipping Co.",
  "BPO Inc.",
  "",
  "Family Business",
  "Jollibee Franchise",
  "",
  "DSWD",
  "PLDT",
  "",
  "Puregold",
  "Mercury Drug",
  "",
  "7-Eleven",
  "LBC",
  "",
  "Allied Bank",
  "Generika",
  "WalterMart",
  "",
  "Cebu Pacific",
] as const

function pad2(n: number): string {
  return String(n).padStart(2, "0")
}

/** 30 fictional residents for the template / sample workbook (household columns empty = import without linking). */
export function buildTemplateSampleRows(): Partial<
  Record<ResidentImportHeader, TemplateCell>
>[] {
  const rows: Partial<Record<ResidentImportHeader, TemplateCell>>[] = []
  for (let i = 0; i < 30; i++) {
    const sex = i % 2 === 0 ? "FEMALE" : "MALE"
    const birthYear = 1955 + ((i * 3) % 46)
    const birthMonth = (i % 12) + 1
    const birthDay = (i % 27) + 1
    const isSenior = birthYear <= 1965
    const row: Partial<Record<ResidentImportHeader, TemplateCell>> = {
      first_name: TEMPLATE_FIRST_NAMES[i]!,
      middle_name: TEMPLATE_MIDDLE_NAMES[i]!,
      last_name: TEMPLATE_LAST_NAMES[i]!,
      sex,
      date_of_birth: `${birthYear}-${pad2(birthMonth)}-${pad2(birthDay)}`,
      civil_status: TEMPLATE_CIVIL[i % TEMPLATE_CIVIL.length]!,
      blood_type: TEMPLATE_BLOOD[i % TEMPLATE_BLOOD.length]!,
      contact_no: `0917${String(2000000 + i).slice(1)}`,
      voter_status: i % 4 !== 0,
      philhealth_no: i % 5 === 0 ? "" : `12-${String(345678901 + i).padStart(9, "0").slice(0, 9)}-${i % 10}`,
      sss_no: i % 6 === 0 ? "" : `${10 + (i % 89)}-${String(5678901 + i).slice(0, 7)}-${i % 10}`,
      pagibig_no: i % 7 === 0 ? "" : `${String(123456789012 + i).slice(0, 12)}`,
      educational_attainment: TEMPLATE_EDU[i % TEMPLATE_EDU.length]!,
      employment_status: TEMPLATE_EMP[i % TEMPLATE_EMP.length]!,
      occupation: TEMPLATE_OCCUPATIONS[i]!,
      employer: TEMPLATE_EMPLOYERS[i]!,
      monthly_income: 9000 + i * 1750,
      years_in_barangay: 1 + (i % 22),
      is_senior_citizen: isSenior,
      senior_citizen_id_no: isSenior ? `SC-2024-${pad2(i + 1)}` : "",
      is_pwd: i === 5 || i === 18,
      pwd_id_no: i === 5 || i === 18 ? `PWD-2024-${pad2(i + 1)}` : "",
      pwd_type: i === 5 || i === 18 ? "Physical" : "",
      is_solo_parent: i === 11,
      solo_parent_id_no: i === 11 ? "SP-2024-0088" : "",
      is_4ps_beneficiary: i === 3 || i === 4 || i === 12,
      is_ofw: i === 14,
      is_indigenous_people: i === 22,
      indigenous_group: i === 22 ? "Mamanwa" : "",
      is_sk_member: i === 8 || i === 9,
      email_address: i % 10 === 0 ? `sample${i + 1}@example.com` : "",
    }
    rows.push(row)
  }
  return rows
}

function templateRowToAOARow(
  row: Partial<Record<ResidentImportHeader, TemplateCell>>
): TemplateCell[] {
  return RESIDENT_IMPORT_HEADERS.map((h) => {
    const v = row[h]
    if (v !== undefined) return v
    if (h.startsWith("is_")) return false
    return ""
  })
}

export function buildTemplateWorkbook(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new()
  const header = [...RESIDENT_IMPORT_HEADERS]
  const instructions = [
    "Barangay Taruc — Resident import template",
    "Sheet 'Residents': row 1 = headers (do not rename). Data starts row 2.",
    "This file includes 30 sample residents (fictional). Replace or delete rows before real imports.",
    "Required columns: first_name, last_name, sex (MALE or FEMALE), date_of_birth (YYYY-MM-DD or Excel date).",
    "civil_status: SINGLE, MARRIED, WIDOWED, SEPARATED, ANNULLED, LIVE_IN",
    "educational_attainment & employment_status: use UPPER_SNAKE values (see README or empty).",
    "household_house_no + household_purok_name: must match existing household (exact purok name), or leave both empty.",
    "Booleans: TRUE/FALSE, Yes/No, 1/0",
    "sss_no = SSS (Social Security System) number; aliases sss_no / sss accepted.",
    "",
  ]
  const sampleRows = buildTemplateSampleRows().map((partial) => ({
    ...TEMPLATE_ROW_DEFAULTS,
    ...partial,
  }))
  const aoa = [
    header,
    ...sampleRows.map((r) => templateRowToAOARow(r)),
  ]
  const ws = XLSX.utils.aoa_to_sheet(aoa)
  XLSX.utils.book_append_sheet(wb, ws, "Residents")

  const help = XLSX.utils.aoa_to_sheet(
    instructions.map((line) => [line]) as (string | number)[][]
  )
  XLSX.utils.book_append_sheet(wb, help, "Instructions")

  return wb
}
