import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { UserManagementClient } from "@/components/settings/user-management-client"

export default async function SettingsUsersPage() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== "SUPER_ADMIN") {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User management</h1>
        <p className="text-muted-foreground">
          Create accounts and assign barangay or municipality access. Super Admin
          has full system access without a barangay.
        </p>
      </div>
      <UserManagementClient />
    </div>
  )
}
