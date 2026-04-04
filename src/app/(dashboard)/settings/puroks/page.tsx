import { redirect } from "next/navigation"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getTenantBarangayIds, purokWhereForTenant } from "@/lib/tenant"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const ALLOWED = new Set(["SUPER_ADMIN", "CAPTAIN", "SECRETARY"])

export default async function SettingsPuroksPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || !ALLOWED.has(session.user.role)) {
    redirect("/dashboard")
  }

  if (session.user.role === "SUPER_ADMIN") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Puroks</h1>
          <p className="text-muted-foreground">
            Puroks belong to a barangay and are used when registering households
            and residents.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Super Admin</CardTitle>
            <CardDescription>
              New barangays get a default <span className="font-medium">Purok 1</span>.
              To add more puroks for a barangay, use the management tools there
              when available, or adjust records in the database.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary">
              <Link href="/settings/barangays">Open Barangays & municipalities</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const tenantIds = await getTenantBarangayIds(session)
  const puroks = await prisma.purok.findMany({
    where: purokWhereForTenant(tenantIds),
    include: {
      barangay: {
        select: {
          name: true,
          municipality: { select: { name: true, province: true } },
        },
      },
    },
    orderBy: [{ barangayId: "asc" }, { order: "asc" }, { name: "asc" }],
  })

  const showBarangayColumn =
    session.user.municipalityId != null && !session.user.barangayId

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Puroks</h1>
        <p className="text-muted-foreground">
          Puroks in your jurisdiction. They appear when assigning households and
          on reports and maps.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Your puroks</CardTitle>
          <CardDescription>
            {puroks.length} purok{puroks.length === 1 ? "" : "s"} · Need another
            purok? Ask a Super Admin or use barangay setup when your process
            allows it.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:px-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Order</TableHead>
                  {showBarangayColumn ? (
                    <TableHead>Barangay</TableHead>
                  ) : null}
                  <TableHead>Municipality</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {puroks.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {p.order}
                    </TableCell>
                    {showBarangayColumn ? (
                      <TableCell className="text-sm">
                        {p.barangay.name}
                      </TableCell>
                    ) : null}
                    <TableCell className="text-muted-foreground text-sm">
                      {p.barangay.municipality.name},{" "}
                      {p.barangay.municipality.province}
                    </TableCell>
                  </TableRow>
                ))}
                {puroks.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={showBarangayColumn ? 4 : 3}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No puroks in your scope.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
