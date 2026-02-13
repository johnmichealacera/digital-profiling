import { prisma } from "@/lib/prisma"
import { HouseholdForm } from "@/components/households/household-form"

export default async function NewHouseholdPage() {
  const puroks = await prisma.purok.findMany({ orderBy: { order: "asc" } })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add New Household</h1>
        <p className="text-muted-foreground">
          Register a new household in Barangay Taruc
        </p>
      </div>
      <HouseholdForm puroks={puroks} />
    </div>
  )
}
