import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getTenantBarangayIds, barangayIdFilter } from "@/lib/tenant"
import { canPerformAction } from "@/lib/permissions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Plus, Gift, Users, CheckCircle } from "lucide-react"
import {
  AYUDA_TYPE_LABELS,
  AYUDA_STATUS_LABELS,
  AYUDA_SOURCE_LABELS,
} from "@/lib/constants"
import type { UserRole } from "@/generated/prisma/client"

export const dynamic = "force-dynamic"

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  PLANNED: "outline",
  ONGOING: "default",
  COMPLETED: "secondary",
  CANCELLED: "destructive",
}

export default async function AyudaPage() {
  const session = await getServerSession(authOptions)
  const tenantIds = session ? await getTenantBarangayIds(session) : []
  const bid = barangayIdFilter(tenantIds)
  const role = session?.user?.role as UserRole | undefined
  const canCreate = role ? canPerformAction(role, "ayuda", "create") : false

  const programs = await prisma.ayudaProgram.findMany({
    where: bid ? { barangayId: bid } : {},
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { distributions: true } },
      distributions: { select: { status: true } },
    },
  })

  type ProgramItem = (typeof programs)[number]

  const totals = {
    total: programs.length,
    ongoing: programs.filter((p: ProgramItem) => p.status === "ONGOING").length,
    beneficiaries: programs.reduce(
      (s: number, p: ProgramItem) => s + p._count.distributions,
      0
    ),
    claimed: programs.reduce(
      (s: number, p: ProgramItem) =>
        s + p.distributions.filter((d: { status: string }) => d.status === "CLAIMED").length,
      0
    ),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ayuda Programs</h1>
          <p className="text-muted-foreground">
            Government aid and assistance distribution management
          </p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/ayuda/new">
              <Plus className="mr-2 h-4 w-4" />
              New Program
            </Link>
          </Button>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Programs
            </CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active / Ongoing
            </CardTitle>
            <Gift className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totals.ongoing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Beneficiaries
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.beneficiaries}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Claimed
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totals.claimed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Programs list */}
      <div className="space-y-3">
        {programs.length === 0 ? (
          <div className="rounded-md border p-12 text-center text-muted-foreground">
            No ayuda programs yet. Create one to start tracking distributions.
          </div>
        ) : (
          programs.map((program: ProgramItem) => {
            const claimed = program.distributions.filter(
              (d: { status: string }) => d.status === "CLAIMED"
            ).length
            const total = program._count.distributions
            const pct = total > 0 ? Math.round((claimed / total) * 100) : 0
            return (
              <Link key={program.id} href={`/ayuda/${program.id}`}>
                <Card className="hover:bg-muted/30 transition-colors cursor-pointer">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{program.name}</span>
                        <Badge
                          variant={STATUS_VARIANT[program.status] ?? "outline"}
                        >
                          {AYUDA_STATUS_LABELS[program.status] ?? program.status}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {AYUDA_TYPE_LABELS[program.type] ?? program.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {AYUDA_SOURCE_LABELS[program.source]} &middot;{" "}
                        {total} beneficiar{total === 1 ? "y" : "ies"} &middot;{" "}
                        {claimed} claimed
                      </p>
                      {total > 0 && (
                        <div className="mt-2 h-1.5 w-full max-w-xs rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="text-right text-sm text-muted-foreground shrink-0">
                      {pct}%
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
