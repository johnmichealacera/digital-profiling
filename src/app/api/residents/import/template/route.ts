import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import * as XLSX from "xlsx"
import { authOptions } from "@/lib/auth"
import { canPerformAction } from "@/lib/permissions"
import { buildTemplateWorkbook } from "@/lib/resident-import"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!canPerformAction(session.user.role, "residents", "create")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const wb = buildTemplateWorkbook()
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="resident-import-template.xlsx"',
    },
  })
}
