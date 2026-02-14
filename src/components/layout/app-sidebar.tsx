"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  LayoutDashboard,
  Users,
  Home,
  FileText,
  AlertTriangle,
  BadgeCheck,
  Wallet,
  HardHat,
  HeartPulse,
  ShieldAlert,
  Map,
  BarChart3,
  UserCog,
  Settings,
  Shield,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { UserRole } from "@/generated/prisma/client"
import { USER_ROLE_LABELS } from "@/lib/constants"

const NAVIGATION = [
  {
    title: "Main",
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: [
          "SUPER_ADMIN",
          "CAPTAIN",
          "SECRETARY",
          "TREASURER",
          "KAGAWAD",
          "SK_CHAIRMAN",
        ] as UserRole[],
      },
    ],
  },
  {
    title: "Profiling",
    items: [
      {
        name: "Residents",
        href: "/residents",
        icon: Users,
        roles: [
          "SUPER_ADMIN",
          "CAPTAIN",
          "SECRETARY",
          "KAGAWAD",
          "SK_CHAIRMAN",
        ] as UserRole[],
      },
      {
        name: "Households",
        href: "/households",
        icon: Home,
        roles: ["SUPER_ADMIN", "CAPTAIN", "SECRETARY"] as UserRole[],
      },
      {
        name: "Barangay Map",
        href: "/map",
        icon: Map,
        roles: [
          "SUPER_ADMIN",
          "CAPTAIN",
          "SECRETARY",
          "TREASURER",
          "KAGAWAD",
          "SK_CHAIRMAN",
        ] as UserRole[],
      },
    ],
  },
  {
    title: "Services",
    items: [
      {
        name: "Documents",
        href: "/documents",
        icon: FileText,
        roles: ["SUPER_ADMIN", "CAPTAIN", "SECRETARY"] as UserRole[],
      },
      {
        name: "Blotter",
        href: "/blotter",
        icon: AlertTriangle,
        roles: [
          "SUPER_ADMIN",
          "CAPTAIN",
          "SECRETARY",
          "KAGAWAD",
        ] as UserRole[],
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        name: "Officials",
        href: "/officials",
        icon: BadgeCheck,
        roles: ["SUPER_ADMIN", "CAPTAIN", "SECRETARY"] as UserRole[],
      },
      {
        name: "Budget & Finance",
        href: "/budget",
        icon: Wallet,
        roles: ["SUPER_ADMIN", "CAPTAIN", "TREASURER"] as UserRole[],
      },
      {
        name: "Projects",
        href: "/projects",
        icon: HardHat,
        roles: [
          "SUPER_ADMIN",
          "CAPTAIN",
          "SECRETARY",
          "KAGAWAD",
        ] as UserRole[],
      },
    ],
  },
  {
    title: "Health & Safety",
    items: [
      {
        name: "Health Records",
        href: "/health",
        icon: HeartPulse,
        roles: [
          "SUPER_ADMIN",
          "CAPTAIN",
          "SECRETARY",
          "SK_CHAIRMAN",
        ] as UserRole[],
      },
      {
        name: "Disaster Prep",
        href: "/disaster",
        icon: ShieldAlert,
        roles: ["SUPER_ADMIN", "CAPTAIN", "SECRETARY"] as UserRole[],
      },
    ],
  },
  {
    title: "Reports",
    items: [
      {
        name: "Reports & Export",
        href: "/reports",
        icon: BarChart3,
        roles: [
          "SUPER_ADMIN",
          "CAPTAIN",
          "SECRETARY",
          "TREASURER",
        ] as UserRole[],
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        name: "User Management",
        href: "/settings/users",
        icon: UserCog,
        roles: ["SUPER_ADMIN"] as UserRole[],
      },
      {
        name: "Settings",
        href: "/settings/puroks",
        icon: Settings,
        roles: ["SUPER_ADMIN", "CAPTAIN", "SECRETARY"] as UserRole[],
      },
    ],
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = (session?.user?.role ?? "SECRETARY") as UserRole

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Brgy. Taruc</span>
            <span className="text-xs text-muted-foreground">
              Digital Profiling
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {NAVIGATION.map((group) => {
          const visibleItems = group.items.filter((item) =>
            item.roles.includes(userRole)
          )
          if (visibleItems.length === 0) return null

          return (
            <SidebarGroup key={group.title}>
              <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith(item.href)}
                      >
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        })}
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        {session?.user && (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">{session.user.name}</span>
            <span className="text-xs text-muted-foreground">
              {USER_ROLE_LABELS[session.user.role] ?? session.user.role}
            </span>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
