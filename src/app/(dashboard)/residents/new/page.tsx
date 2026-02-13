import { prisma } from "@/lib/prisma"
import { ResidentForm } from "@/components/residents/resident-form"

export default async function NewResidentPage() {
  const [puroks, households] = await Promise.all([
    prisma.purok.findMany({ orderBy: { order: "asc" } }),
    prisma.household.findMany({
      include: { purok: true },
      orderBy: [{ purok: { order: "asc" } }, { houseNo: "asc" }],
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add New Resident</h1>
        <p className="text-muted-foreground">
          Register a new resident of Barangay Taruc
        </p>
      </div>
      <ResidentForm puroks={puroks} households={households} />
    </div>
  )
}
