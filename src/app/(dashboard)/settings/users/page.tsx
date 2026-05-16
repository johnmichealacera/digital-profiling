import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { UserManagementClient } from "@/components/settings/user-management-client"

export default async function SettingsUsersPage() {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role

  if (role !== "SUPER_ADMIN" && role !== "BARANGAY_ADMIN") {
    redirect("/dashboard")
  }

  const isSuperAdmin = role === "SUPER_ADMIN"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User management</h1>
        <p className="text-muted-foreground">
          {isSuperAdmin
            ? "Create accounts and assign barangay or municipality access. Super Admin has full system access without a barangay."
            : "Manage staff accounts for your barangay. You can create and oversee all barangay staff roles."}
        </p>
      </div>
      <UserManagementClient
        callerRole={role}
        callerBarangayId={session?.user?.barangayId ?? null}
      />
    </div>
  )
}
