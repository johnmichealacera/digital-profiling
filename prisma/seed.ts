import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { hash } from "bcryptjs"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding database...")

  // ── Puroks ─────────────────────────────────────────────────────────────────
  const puroks = await Promise.all(
    [
      { name: "Purok 1", description: "Lower Taruc", order: 1 },
      { name: "Purok 2", description: "Central Taruc", order: 2 },
      { name: "Purok 3", description: "Upper Taruc", order: 3 },
      { name: "Purok 4", description: "Sitio Riverside", order: 4 },
      { name: "Purok 5", description: "Sitio Hillside", order: 5 },
      { name: "Purok 6", description: "Sitio Seaside", order: 6 },
    ].map((p) =>
      prisma.purok.upsert({
        where: { name: p.name },
        update: {},
        create: p,
      })
    )
  )
  console.log(`Created ${puroks.length} puroks`)

  // ── Super Admin ────────────────────────────────────────────────────────────
  const hashedPassword = await hash("admin123", 12)
  const admin = await prisma.user.upsert({
    where: { email: "admin@barangaytaruc.gov.ph" },
    update: {},
    create: {
      email: "admin@barangaytaruc.gov.ph",
      name: "System Administrator",
      password: hashedPassword,
      role: "SUPER_ADMIN",
      position: "System Administrator",
    },
  })
  console.log(`Created super admin: ${admin.email}`)

  // ── Additional Staff Accounts ──────────────────────────────────────────────
  const staffPassword = await hash("staff123", 12)
  const staffAccounts = [
    {
      email: "captain@barangaytaruc.gov.ph",
      name: "Roberto M. Santos",
      role: "CAPTAIN" as const,
      position: "Barangay Captain",
    },
    {
      email: "secretary@barangaytaruc.gov.ph",
      name: "Maria Clara L. Reyes",
      role: "SECRETARY" as const,
      position: "Barangay Secretary",
    },
    {
      email: "treasurer@barangaytaruc.gov.ph",
      name: "Jose R. Dela Cruz",
      role: "TREASURER" as const,
      position: "Barangay Treasurer",
    },
  ]

  for (const staff of staffAccounts) {
    await prisma.user.upsert({
      where: { email: staff.email },
      update: {},
      create: { ...staff, password: staffPassword },
    })
  }
  console.log(`Created ${staffAccounts.length} staff accounts`)

  // ── Barangay Officials ─────────────────────────────────────────────────────
  const officials = [
    { firstName: "Roberto", middleName: "Magtanggol", lastName: "Santos", position: "Barangay Captain", committee: null },
    { firstName: "Maria Clara", middleName: "Lacsamana", lastName: "Reyes", position: "Barangay Secretary", committee: null },
    { firstName: "Jose", middleName: "Rizal", lastName: "Dela Cruz", position: "Barangay Treasurer", committee: null },
    { firstName: "Antonio", middleName: "Bautista", lastName: "Garcia", position: "Barangay Kagawad", committee: "Peace & Order" },
    { firstName: "Rosalinda", middleName: "Pangilinan", lastName: "Aquino", position: "Barangay Kagawad", committee: "Health & Sanitation" },
    { firstName: "Fernando", middleName: "Cruz", lastName: "Mendoza", position: "Barangay Kagawad", committee: "Education" },
    { firstName: "Esperanza", middleName: "Lim", lastName: "Tan", position: "Barangay Kagawad", committee: "Infrastructure" },
    { firstName: "Pedro", middleName: "Magbanua", lastName: "Villanueva", position: "Barangay Kagawad", committee: "Agriculture & Livelihood" },
    { firstName: "Gloria", middleName: "Santos", lastName: "Ramos", position: "Barangay Kagawad", committee: "Women & Family" },
    { firstName: "Ricardo", middleName: "Flores", lastName: "Bautista", position: "Barangay Kagawad", committee: "Environment" },
    { firstName: "Miguel", middleName: "Antonio", lastName: "Cruz", position: "SK Chairman", committee: "Youth Development" },
  ]

  for (const official of officials) {
    await prisma.barangayOfficial.create({
      data: {
        ...official,
        termStart: new Date("2023-06-30"),
        termEnd: new Date("2026-06-30"),
        isIncumbent: true,
      },
    })
  }
  console.log(`Created ${officials.length} barangay officials`)

  // ── Sample Households & Residents ──────────────────────────────────────────
  // Base coordinates near Socorro, Surigao del Norte
  const baseLat = 9.6215
  const baseLng = 125.9589

  const sampleHouseholds = [
    {
      houseNo: "001",
      streetSitio: "Main Road",
      purokId: puroks[0].id,
      latitude: baseLat + 0.001,
      longitude: baseLng + 0.001,
      housingType: "Owned",
      roofMaterial: "G.I. Sheet",
      wallMaterial: "Concrete/Hollow Blocks",
      toiletFacility: "Water-sealed",
      waterSource: "Deep Well",
      residents: [
        { firstName: "Juan", middleName: "Bautista", lastName: "Dela Cruz", suffix: "Sr.", sex: "MALE" as const, dateOfBirth: new Date("1965-03-15"), civilStatus: "MARRIED" as const, isHouseholdHead: true, occupation: "Farmer", employmentStatus: "SELF_EMPLOYED" as const, educationalAttainment: "HIGH_SCHOOL_GRADUATE" as const, voterStatus: true, isSeniorCitizen: true, contactNo: "09171234567" },
        { firstName: "Remedios", middleName: "Santos", lastName: "Dela Cruz", sex: "FEMALE" as const, dateOfBirth: new Date("1968-07-22"), civilStatus: "MARRIED" as const, relationshipToHead: "Spouse", occupation: "Housewife", employmentStatus: "UNEMPLOYED" as const, educationalAttainment: "HIGH_SCHOOL_GRADUATE" as const, voterStatus: true, isSeniorCitizen: false },
        { firstName: "Juan", middleName: "Bautista", lastName: "Dela Cruz", suffix: "Jr.", sex: "MALE" as const, dateOfBirth: new Date("1992-11-05"), civilStatus: "SINGLE" as const, relationshipToHead: "Son", occupation: "Construction Worker", employmentStatus: "EMPLOYED" as const, educationalAttainment: "COLLEGE_LEVEL" as const, voterStatus: true },
      ],
    },
    {
      houseNo: "002",
      streetSitio: "Main Road",
      purokId: puroks[0].id,
      latitude: baseLat + 0.0015,
      longitude: baseLng + 0.0012,
      housingType: "Owned",
      roofMaterial: "G.I. Sheet",
      wallMaterial: "Wood",
      toiletFacility: "Water-sealed",
      waterSource: "NAWASA/Level III",
      is4PsBeneficiary: true,
      fourPsHouseholdId: "4PS-2023-00123",
      residents: [
        { firstName: "Pedro", middleName: "Magbanua", lastName: "Santos", sex: "MALE" as const, dateOfBirth: new Date("1980-05-10"), civilStatus: "MARRIED" as const, isHouseholdHead: true, occupation: "Fisherman", employmentStatus: "SELF_EMPLOYED" as const, educationalAttainment: "ELEMENTARY_GRADUATE" as const, voterStatus: true, is4PsBeneficiary: true },
        { firstName: "Ana", middleName: "Lim", lastName: "Santos", sex: "FEMALE" as const, dateOfBirth: new Date("1983-09-18"), civilStatus: "MARRIED" as const, relationshipToHead: "Spouse", employmentStatus: "UNEMPLOYED" as const, educationalAttainment: "ELEMENTARY_GRADUATE" as const, voterStatus: true, is4PsBeneficiary: true },
        { firstName: "Mark", lastName: "Santos", sex: "MALE" as const, dateOfBirth: new Date("2008-02-14"), civilStatus: "SINGLE" as const, relationshipToHead: "Son", employmentStatus: "STUDENT" as const, educationalAttainment: "HIGH_SCHOOL_LEVEL" as const, is4PsBeneficiary: true },
        { firstName: "Angel", lastName: "Santos", sex: "FEMALE" as const, dateOfBirth: new Date("2012-06-30"), civilStatus: "SINGLE" as const, relationshipToHead: "Daughter", employmentStatus: "STUDENT" as const, educationalAttainment: "ELEMENTARY_LEVEL" as const, is4PsBeneficiary: true },
      ],
    },
    {
      houseNo: "015",
      streetSitio: "Riverside Drive",
      purokId: puroks[1].id,
      latitude: baseLat - 0.001,
      longitude: baseLng + 0.002,
      housingType: "Owned",
      roofMaterial: "Concrete",
      wallMaterial: "Concrete/Hollow Blocks",
      toiletFacility: "Water-sealed",
      waterSource: "NAWASA/Level III",
      residents: [
        { firstName: "Ricardo", middleName: "Flores", lastName: "Bautista", sex: "MALE" as const, dateOfBirth: new Date("1958-12-25"), civilStatus: "WIDOWED" as const, isHouseholdHead: true, occupation: "Retired Teacher", employmentStatus: "RETIRED" as const, educationalAttainment: "COLLEGE_GRADUATE" as const, voterStatus: true, isSeniorCitizen: true, seniorCitizenIdNo: "SC-2023-0045" },
      ],
    },
    {
      houseNo: "023",
      streetSitio: "Hillside Road",
      purokId: puroks[2].id,
      latitude: baseLat + 0.002,
      longitude: baseLng - 0.001,
      housingType: "Owned",
      roofMaterial: "G.I. Sheet",
      wallMaterial: "Wood",
      toiletFacility: "Open Pit",
      waterSource: "Spring",
      residents: [
        { firstName: "Lorna", middleName: "Gonzales", lastName: "Magno", sex: "FEMALE" as const, dateOfBirth: new Date("1975-04-08"), civilStatus: "SEPARATED" as const, isHouseholdHead: true, occupation: "Vendor", employmentStatus: "SELF_EMPLOYED" as const, educationalAttainment: "HIGH_SCHOOL_LEVEL" as const, voterStatus: true, isSoloParent: true, soloParentIdNo: "SP-2024-0012" },
        { firstName: "Joshua", lastName: "Magno", sex: "MALE" as const, dateOfBirth: new Date("2005-08-20"), civilStatus: "SINGLE" as const, relationshipToHead: "Son", employmentStatus: "STUDENT" as const, educationalAttainment: "COLLEGE_LEVEL" as const },
        { firstName: "Hannah", lastName: "Magno", sex: "FEMALE" as const, dateOfBirth: new Date("2010-01-15"), civilStatus: "SINGLE" as const, relationshipToHead: "Daughter", employmentStatus: "STUDENT" as const, educationalAttainment: "HIGH_SCHOOL_LEVEL" as const },
      ],
    },
    {
      houseNo: "030",
      streetSitio: "Seaside Lane",
      purokId: puroks[3].id,
      latitude: baseLat - 0.002,
      longitude: baseLng + 0.003,
      housingType: "Owned",
      roofMaterial: "G.I. Sheet",
      wallMaterial: "Mixed",
      toiletFacility: "Water-sealed",
      waterSource: "Deep Well",
      residents: [
        { firstName: "Ernesto", middleName: "Villareal", lastName: "Reyes", sex: "MALE" as const, dateOfBirth: new Date("1970-10-01"), civilStatus: "MARRIED" as const, isHouseholdHead: true, occupation: "Fisherman", employmentStatus: "SELF_EMPLOYED" as const, educationalAttainment: "ELEMENTARY_GRADUATE" as const, voterStatus: true },
        { firstName: "Corazon", middleName: "Aquino", lastName: "Reyes", sex: "FEMALE" as const, dateOfBirth: new Date("1972-02-25"), civilStatus: "MARRIED" as const, relationshipToHead: "Spouse", occupation: "Sari-sari Store", employmentStatus: "SELF_EMPLOYED" as const, voterStatus: true },
        { firstName: "Marvin", lastName: "Reyes", sex: "MALE" as const, dateOfBirth: new Date("1995-06-12"), civilStatus: "SINGLE" as const, relationshipToHead: "Son", isOFW: true, employmentStatus: "OFW" as const, educationalAttainment: "COLLEGE_GRADUATE" as const, voterStatus: true },
      ],
    },
    {
      houseNo: "042",
      streetSitio: "Center Street",
      purokId: puroks[4].id,
      latitude: baseLat + 0.003,
      longitude: baseLng - 0.002,
      housingType: "Rented",
      roofMaterial: "G.I. Sheet",
      wallMaterial: "Concrete/Hollow Blocks",
      toiletFacility: "Water-sealed",
      waterSource: "NAWASA/Level III",
      residents: [
        { firstName: "Manuel", middleName: "Torres", lastName: "Garcia", sex: "MALE" as const, dateOfBirth: new Date("1960-08-14"), civilStatus: "MARRIED" as const, isHouseholdHead: true, occupation: "Retired", employmentStatus: "RETIRED" as const, voterStatus: true, isSeniorCitizen: true, seniorCitizenIdNo: "SC-2023-0078", isPwd: true, pwdIdNo: "PWD-2022-0015", pwdType: "Physical" },
        { firstName: "Luisa", middleName: "Mendoza", lastName: "Garcia", sex: "FEMALE" as const, dateOfBirth: new Date("1963-03-03"), civilStatus: "MARRIED" as const, relationshipToHead: "Spouse", employmentStatus: "RETIRED" as const, voterStatus: true, isSeniorCitizen: true, seniorCitizenIdNo: "SC-2023-0079" },
      ],
    },
  ]

  for (const hh of sampleHouseholds) {
    const { residents: residentData, ...householdData } = hh
    const household = await prisma.household.create({
      data: householdData,
    })

    for (const resident of residentData) {
      await prisma.resident.create({
        data: {
          ...resident,
          householdId: household.id,
          citizenship: "Filipino",
        },
      })
    }
  }

  const totalResidents = sampleHouseholds.reduce(
    (acc, hh) => acc + hh.residents.length,
    0
  )
  console.log(
    `Created ${sampleHouseholds.length} households with ${totalResidents} residents`
  )

  // ── System Settings ────────────────────────────────────────────────────────
  const settings = [
    { key: "barangay_name", value: "Taruc", description: "Barangay name" },
    { key: "municipality", value: "Socorro", description: "Municipality" },
    { key: "province", value: "Surigao del Norte", description: "Province" },
    { key: "region", value: "Caraga Region (Region XIII)", description: "Region" },
    { key: "zip_code", value: "8416", description: "ZIP Code" },
    { key: "clearance_fee", value: "50.00", description: "Barangay clearance fee" },
    { key: "indigency_fee", value: "0.00", description: "Certificate of indigency fee (free)" },
    { key: "residency_fee", value: "50.00", description: "Certificate of residency fee" },
    { key: "business_permit_fee", value: "200.00", description: "Business permit fee" },
  ]

  for (const setting of settings) {
    await prisma.systemSettings.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    })
  }
  console.log(`Created ${settings.length} system settings`)

  // ── Evacuation Centers ─────────────────────────────────────────────────────
  await prisma.evacuationCenter.create({
    data: {
      name: "Taruc Elementary School",
      address: "Purok 2, Barangay Taruc, Socorro",
      capacity: 200,
      latitude: baseLat + 0.0005,
      longitude: baseLng + 0.0008,
      contactNo: "09170001234",
      facilities: ["Comfort Room", "Water Supply", "Power Supply"],
      isActive: true,
    },
  })

  await prisma.evacuationCenter.create({
    data: {
      name: "Barangay Hall - Taruc",
      address: "Purok 1, Barangay Taruc, Socorro",
      capacity: 80,
      latitude: baseLat,
      longitude: baseLng,
      facilities: ["Comfort Room", "Water Supply", "Power Supply", "First Aid"],
      isActive: true,
    },
  })
  console.log("Created 2 evacuation centers")

  console.log("\nSeeding complete!")
  console.log("\nDefault login credentials:")
  console.log("  Super Admin:  admin@barangaytaruc.gov.ph / admin123")
  console.log("  Captain:      captain@barangaytaruc.gov.ph / staff123")
  console.log("  Secretary:    secretary@barangaytaruc.gov.ph / staff123")
  console.log("  Treasurer:    treasurer@barangaytaruc.gov.ph / staff123")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
