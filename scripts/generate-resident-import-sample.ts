/**
 * Writes public/resident-import-sample.xlsx (same layout as the in-app template).
 * Run: npx tsx scripts/generate-resident-import-sample.ts
 */
import * as path from "path"
import * as XLSX from "xlsx"
import { buildTemplateWorkbook } from "../src/lib/resident-import"

const out = path.join(__dirname, "..", "public", "resident-import-sample.xlsx")
const wb = buildTemplateWorkbook()
XLSX.writeFile(wb, out)
console.info("Wrote", out)
