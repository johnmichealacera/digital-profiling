import { prisma } from "@/lib/prisma"
import { ProjectList } from "@/components/projects/project-list"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { barangayIdFilter, getTenantBarangayIds } from "@/lib/tenant"

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions)
  const tenantIds = session ? await getTenantBarangayIds(session) : []
  const bFilter = barangayIdFilter(tenantIds)

  const projects = await prisma.project.findMany({
    where: bFilter ? { barangayId: bFilter } : {},
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { id: true, name: true } },
      _count: { select: { updates: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Projects Monitoring</h1>
        <p className="text-muted-foreground">
          Track barangay development projects and progress
        </p>
      </div>
      <ProjectList projects={JSON.parse(JSON.stringify(projects))} />
    </div>
  )
}
