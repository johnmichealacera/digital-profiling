/**
 * One-time / idempotent: ensure default Municipality + Barangay exist and fill barangayId on all rows.
 * Run after `prisma db push` when introducing tenancy: npx tsx scripts/backfill-barangay-tenancy.ts
 */
import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const muni = await prisma.municipality.upsert({
    where: {
      name_province: {
        name: "Socorro",
        province: "Surigao del Norte",
      },
    },
    create: {
      name: "Socorro",
      province: "Surigao del Norte",
      region: "Caraga Region (Region XIII)",
    },
    update: {},
  })

  const brgy = await prisma.barangay.upsert({
    where: {
      municipalityId_name: {
        municipalityId: muni.id,
        name: "Taruc",
      },
    },
    create: {
      name: "Taruc",
      municipalityId: muni.id,
      province: "Surigao del Norte",
      zipCode: "8416",
      region: "Caraga Region (Region XIII)",
      mapCenterLat: 9.6215,
      mapCenterLng: 125.9589,
      mapDefaultZoom: 15,
      code: "TRC",
    },
    update: {
      zipCode: "8416",
      mapCenterLat: 9.6215,
      mapCenterLng: 125.9589,
      code: "TRC",
    },
  })

  const qid = brgy.id.replace(/'/g, "''")

  await prisma.$executeRawUnsafe(
    `UPDATE "puroks" SET "barangayId" = '${qid}' WHERE "barangayId" IS NULL`
  )

  await prisma.$executeRawUnsafe(`
    UPDATE "households" h
    SET "barangayId" = p."barangayId"
    FROM "puroks" p
    WHERE h."purokId" = p.id AND h."barangayId" IS NULL
  `)

  await prisma.$executeRawUnsafe(
    `UPDATE "households" SET "barangayId" = '${qid}' WHERE "barangayId" IS NULL`
  )

  await prisma.user.updateMany({
    where: { role: { not: "SUPER_ADMIN" }, barangayId: null },
    data: { barangayId: brgy.id },
  })

  await prisma.$executeRawUnsafe(
    `UPDATE "barangay_officials" SET "barangayId" = '${qid}' WHERE "barangayId" IS NULL`
  )

  await prisma.$executeRawUnsafe(`
    UPDATE "document_requests" d
    SET "barangayId" = h."barangayId"
    FROM "residents" r
    LEFT JOIN "households" h ON h.id = r."householdId"
    WHERE d."residentId" = r.id AND d."barangayId" IS NULL
  `)

  await prisma.$executeRawUnsafe(
    `UPDATE "document_requests" SET "barangayId" = '${qid}' WHERE "barangayId" IS NULL`
  )

  const blotterSql = `
    UPDATE "blotters" b
    SET "barangayId" = COALESCE(
      (SELECT h."barangayId" FROM "residents" r JOIN "households" h ON h.id = r."householdId" WHERE r.id = b."complainantId"),
      (SELECT h."barangayId" FROM "residents" r JOIN "households" h ON h.id = r."householdId" WHERE r.id = b."respondentId"),
      '${brgy.id.replace(/'/g, "''")}'
    )
    WHERE b."barangayId" IS NULL`
  await prisma.$executeRawUnsafe(blotterSql)

  await prisma.$executeRawUnsafe(
    `UPDATE "budget_years" SET "barangayId" = '${qid}' WHERE "barangayId" IS NULL`
  )

  const projectSql = `
    UPDATE "projects" p
    SET "barangayId" = COALESCE(u."barangayId", '${brgy.id.replace(/'/g, "''")}')
    FROM "users" u
    WHERE p."createdById" = u.id AND p."barangayId" IS NULL`
  await prisma.$executeRawUnsafe(projectSql)

  await prisma.$executeRawUnsafe(
    `UPDATE "projects" SET "barangayId" = '${qid}' WHERE "barangayId" IS NULL`
  )

  await prisma.$executeRawUnsafe(
    `UPDATE "disaster_events" SET "barangayId" = '${qid}' WHERE "barangayId" IS NULL`
  )

  await prisma.$executeRawUnsafe(
    `UPDATE "evacuation_centers" SET "barangayId" = '${qid}' WHERE "barangayId" IS NULL`
  )

  console.info("Backfill complete. Default barangay:", brgy.id, brgy.name)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
