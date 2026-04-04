import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { BarangayManagementClient } from "@/components/settings/barangay-management-client"

export default async function SettingsBarangaysPage() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== "SUPER_ADMIN") {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Barangays & municipalities</h1>
        <p className="text-muted-foreground">
          Create municipalities, then add barangays under them. Each new barangay gets a
          default <span className="font-medium">Purok 1</span> so you can register
          households right away.
        </p>
      </div>
      <BarangayManagementClient />
    </div>
  )
}
