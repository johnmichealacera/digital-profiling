import type { UserRole } from "@/generated/prisma/client"

// Route-level permissions by role
const ROLE_ROUTES: Record<UserRole, string[]> = {
  SUPER_ADMIN: ["/"], // all routes
  BARANGAY_ADMIN: [
    "/dashboard",
    "/residents",
    "/households",
    "/documents",
    "/blotter",
    "/officials",
    "/budget",
    "/projects",
    "/health",
    "/disaster",
    "/map",
    "/reports",
    "/settings",
  ],
  CAPTAIN: [
    "/dashboard",
    "/residents",
    "/households",
    "/documents",
    "/blotter",
    "/officials",
    "/budget",
    "/projects",
    "/health",
    "/disaster",
    "/map",
    "/reports",
    "/settings/officials",
    "/settings/puroks",
  ],
  SECRETARY: [
    "/dashboard",
    "/residents",
    "/households",
    "/documents",
    "/blotter",
    "/officials",
    "/budget",
    "/projects",
    "/health",
    "/disaster",
    "/map",
    "/reports",
    "/settings/puroks",
  ],
  TREASURER: ["/dashboard", "/budget", "/map", "/reports"],
  KAGAWAD: ["/dashboard", "/residents", "/blotter", "/map"],
  SK_CHAIRMAN: ["/dashboard", "/residents", "/health", "/map"],
}

export function canAccessRoute(role: UserRole, pathname: string): boolean {
  if (role === "SUPER_ADMIN") return true

  const allowedRoutes = ROLE_ROUTES[role]
  return allowedRoutes.some((route) => pathname.startsWith(route))
}

// Action-level permissions
type Action = "create" | "read" | "update" | "delete" | "approve"

const MODULE_PERMISSIONS: Record<string, Record<Action, UserRole[]>> = {
  residents: {
    create: ["SUPER_ADMIN", "BARANGAY_ADMIN", "CAPTAIN", "SECRETARY"],
    read: ["SUPER_ADMIN", "BARANGAY_ADMIN", "CAPTAIN", "SECRETARY", "KAGAWAD", "SK_CHAIRMAN"],
    update: ["SUPER_ADMIN", "BARANGAY_ADMIN", "CAPTAIN", "SECRETARY"],
    delete: ["SUPER_ADMIN", "BARANGAY_ADMIN"],
    approve: [],
  },
  households: {
    create: ["SUPER_ADMIN", "BARANGAY_ADMIN", "CAPTAIN", "SECRETARY"],
    read: ["SUPER_ADMIN", "BARANGAY_ADMIN", "CAPTAIN", "SECRETARY"],
    update: ["SUPER_ADMIN", "BARANGAY_ADMIN", "CAPTAIN", "SECRETARY"],
    delete: ["SUPER_ADMIN", "BARANGAY_ADMIN"],
    approve: [],
  },
  documents: {
    create: ["SUPER_ADMIN", "BARANGAY_ADMIN", "CAPTAIN", "SECRETARY"],
    read: ["SUPER_ADMIN", "BARANGAY_ADMIN", "CAPTAIN", "SECRETARY"],
    update: ["SUPER_ADMIN", "BARANGAY_ADMIN", "CAPTAIN", "SECRETARY"],
    delete: ["SUPER_ADMIN", "BARANGAY_ADMIN"],
    approve: ["SUPER_ADMIN", "BARANGAY_ADMIN", "CAPTAIN"],
  },
  blotter: {
    create: ["SUPER_ADMIN", "BARANGAY_ADMIN", "CAPTAIN", "SECRETARY", "KAGAWAD"],
    read: ["SUPER_ADMIN", "BARANGAY_ADMIN", "CAPTAIN", "SECRETARY", "KAGAWAD"],
    update: ["SUPER_ADMIN", "BARANGAY_ADMIN", "CAPTAIN", "SECRETARY"],
    delete: ["SUPER_ADMIN", "BARANGAY_ADMIN"],
    approve: ["SUPER_ADMIN", "BARANGAY_ADMIN", "CAPTAIN"],
  },
  budget: {
    create: ["SUPER_ADMIN", "BARANGAY_ADMIN", "CAPTAIN", "TREASURER"],
    read: ["SUPER_ADMIN", "BARANGAY_ADMIN", "CAPTAIN", "SECRETARY", "TREASURER"],
    update: ["SUPER_ADMIN", "BARANGAY_ADMIN", "CAPTAIN", "TREASURER"],
    delete: ["SUPER_ADMIN", "BARANGAY_ADMIN"],
    approve: ["SUPER_ADMIN", "BARANGAY_ADMIN", "CAPTAIN"],
  },
  projects: {
    create: ["SUPER_ADMIN", "BARANGAY_ADMIN", "CAPTAIN", "SECRETARY"],
    read: ["SUPER_ADMIN", "BARANGAY_ADMIN", "CAPTAIN", "SECRETARY", "KAGAWAD"],
    update: ["SUPER_ADMIN", "BARANGAY_ADMIN", "CAPTAIN", "SECRETARY"],
    delete: ["SUPER_ADMIN", "BARANGAY_ADMIN"],
    approve: [],
  },
  health: {
    create: ["SUPER_ADMIN", "BARANGAY_ADMIN", "CAPTAIN", "SECRETARY", "SK_CHAIRMAN"],
    read: ["SUPER_ADMIN", "BARANGAY_ADMIN", "CAPTAIN", "SECRETARY", "SK_CHAIRMAN"],
    update: ["SUPER_ADMIN", "BARANGAY_ADMIN", "CAPTAIN", "SECRETARY"],
    delete: ["SUPER_ADMIN", "BARANGAY_ADMIN"],
    approve: [],
  },
  users: {
    create: ["SUPER_ADMIN", "BARANGAY_ADMIN"],
    read: ["SUPER_ADMIN", "BARANGAY_ADMIN"],
    update: ["SUPER_ADMIN", "BARANGAY_ADMIN"],
    delete: ["SUPER_ADMIN", "BARANGAY_ADMIN"],
    approve: [],
  },
}

export function canPerformAction(
  role: UserRole,
  module: string,
  action: Action
): boolean {
  if (role === "SUPER_ADMIN") return true

  const permissions = MODULE_PERMISSIONS[module]
  if (!permissions) return false

  return permissions[action]?.includes(role) ?? false
}
