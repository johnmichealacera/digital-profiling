// ── Document Type Labels ─────────────────────────────────────────────────────

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  BARANGAY_CLEARANCE: "Barangay Clearance",
  CERTIFICATE_OF_INDIGENCY: "Certificate of Indigency",
  CERTIFICATE_OF_RESIDENCY: "Certificate of Residency",
  BUSINESS_PERMIT: "Business Permit",
  CERTIFICATE_OF_GOOD_MORAL: "Certificate of Good Moral Character",
  BARANGAY_ID: "Barangay ID",
  FIRST_TIME_JOB_SEEKER: "First Time Job Seeker Certificate",
  SOLO_PARENT_CERTIFICATE: "Solo Parent Certificate",
}

export const DOCUMENT_TYPE_PREFIXES: Record<string, string> = {
  BARANGAY_CLEARANCE: "BC",
  CERTIFICATE_OF_INDIGENCY: "CI",
  CERTIFICATE_OF_RESIDENCY: "CR",
  BUSINESS_PERMIT: "BP",
  CERTIFICATE_OF_GOOD_MORAL: "CGM",
  BARANGAY_ID: "BID",
  FIRST_TIME_JOB_SEEKER: "FTJS",
  SOLO_PARENT_CERTIFICATE: "SPC",
}

// ── Document Purposes ────────────────────────────────────────────────────────

export const COMMON_PURPOSES = [
  "Employment",
  "Scholarship",
  "Travel Abroad",
  "School Requirement",
  "Bank Transaction",
  "PhilHealth",
  "SSS",
  "Pag-IBIG",
  "NBI Clearance",
  "Police Clearance",
  "Business Permit Application",
  "Court Requirement",
  "Marriage",
  "Other",
]

// ── Civil Status Labels ──────────────────────────────────────────────────────

export const CIVIL_STATUS_LABELS: Record<string, string> = {
  SINGLE: "Single",
  MARRIED: "Married",
  WIDOWED: "Widowed",
  SEPARATED: "Separated",
  ANNULLED: "Annulled",
  LIVE_IN: "Live-in",
}

// ── Sex Labels ───────────────────────────────────────────────────────────────

export const SEX_LABELS: Record<string, string> = {
  MALE: "Male",
  FEMALE: "Female",
}

// ── Educational Attainment Labels ────────────────────────────────────────────

export const EDUCATION_LABELS: Record<string, string> = {
  NO_FORMAL_EDUCATION: "No Formal Education",
  ELEMENTARY_LEVEL: "Elementary Level",
  ELEMENTARY_GRADUATE: "Elementary Graduate",
  HIGH_SCHOOL_LEVEL: "High School Level",
  HIGH_SCHOOL_GRADUATE: "High School Graduate",
  VOCATIONAL: "Vocational",
  COLLEGE_LEVEL: "College Level",
  COLLEGE_GRADUATE: "College Graduate",
  POST_GRADUATE: "Post Graduate",
}

// ── Employment Status Labels ─────────────────────────────────────────────────

export const EMPLOYMENT_LABELS: Record<string, string> = {
  EMPLOYED: "Employed",
  SELF_EMPLOYED: "Self-Employed",
  UNEMPLOYED: "Unemployed",
  RETIRED: "Retired",
  STUDENT: "Student",
  OFW: "OFW",
}

// ── Document Status Labels ───────────────────────────────────────────────────

export const DOCUMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  READY: "Ready for Release",
  RELEASED: "Released",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
}

// ── Blotter Labels ───────────────────────────────────────────────────────────

export const BLOTTER_NATURE_LABELS: Record<string, string> = {
  PHYSICAL_ASSAULT: "Physical Assault",
  VERBAL_ASSAULT: "Verbal Assault",
  THEFT: "Theft",
  TRESPASSING: "Trespassing",
  NOISE_COMPLAINT: "Noise Complaint",
  DOMESTIC_DISPUTE: "Domestic Dispute",
  PROPERTY_DAMAGE: "Property Damage",
  ESTAFA: "Estafa",
  THREAT: "Threat",
  OTHER: "Other",
}

export const BLOTTER_STATUS_LABELS: Record<string, string> = {
  FILED: "Filed",
  UNDER_MEDIATION: "Under Mediation",
  SETTLED: "Settled",
  ESCALATED: "Escalated",
  CLOSED: "Closed",
  WITHDRAWN: "Withdrawn",
}

// ── Project Status Labels ────────────────────────────────────────────────────

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  PLANNED: "Planned",
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
  SUSPENDED: "Suspended",
  CANCELLED: "Cancelled",
}

// ── Budget Category Labels ───────────────────────────────────────────────────

export const BUDGET_CATEGORY_LABELS: Record<string, string> = {
  PERSONAL_SERVICES: "Personal Services",
  MAINTENANCE_AND_OTHER_OPERATING_EXPENSES: "MOOE",
  CAPITAL_OUTLAY: "Capital Outlay",
  TRUST_FUND: "Trust Fund",
}

// ── User Role Labels ─────────────────────────────────────────────────────────

export const USER_ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  CAPTAIN: "Barangay Captain",
  SECRETARY: "Barangay Secretary",
  TREASURER: "Barangay Treasurer",
  KAGAWAD: "Kagawad",
  SK_CHAIRMAN: "SK Chairman",
}

// ── Housing Types ────────────────────────────────────────────────────────────

export const HOUSING_TYPES = ["Owned", "Rented", "Shared", "Informal Settler"]

export const ROOF_MATERIALS = ["G.I. Sheet", "Concrete", "Nipa", "Cogon", "Mixed"]

export const WALL_MATERIALS = [
  "Concrete/Hollow Blocks",
  "Wood",
  "Bamboo",
  "Mixed",
  "Light Materials",
]

export const TOILET_FACILITIES = ["Water-sealed", "Open Pit", "None"]

export const WATER_SOURCES = ["NAWASA/Level III", "Deep Well", "Spring", "River", "Rain Water"]

// ── Blood Types ──────────────────────────────────────────────────────────────

export const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

// ── Religions ────────────────────────────────────────────────────────────────

export const RELIGIONS = [
  "Roman Catholic",
  "Islam",
  "Iglesia ni Cristo",
  "Philippine Independent Church",
  "Seventh-day Adventist",
  "Bible Baptist",
  "Born Again Christian",
  "Jehovah's Witness",
  "UCCP",
  "Other",
]

// ── PWD Types ────────────────────────────────────────────────────────────────

export const PWD_TYPES = [
  "Visual",
  "Hearing",
  "Speech",
  "Physical",
  "Intellectual",
  "Psychosocial",
  "Learning",
  "Multiple Disabilities",
]

// ── Relationship to Head ─────────────────────────────────────────────────────

export const RELATIONSHIPS_TO_HEAD = [
  "Spouse",
  "Son",
  "Daughter",
  "Father",
  "Mother",
  "Brother",
  "Sister",
  "Grandson",
  "Granddaughter",
  "Son-in-law",
  "Daughter-in-law",
  "Nephew",
  "Niece",
  "Boarder",
  "Helper",
  "Other",
]

// ── Barangay Info ────────────────────────────────────────────────────────────

export const BARANGAY_INFO = {
  name: "Taruc",
  municipality: "Socorro",
  province: "Surigao del Norte",
  region: "Caraga Region (Region XIII)",
  zipCode: "8416",
  fullAddress: "Barangay Taruc, Socorro, Surigao del Norte",
} as const

// Map center coordinates (approximate for Socorro, Surigao del Norte)
export const MAP_CENTER: [number, number] = [9.6215, 125.9589]
export const MAP_DEFAULT_ZOOM = 15
