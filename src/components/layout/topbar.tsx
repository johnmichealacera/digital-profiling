"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronDown, LogOut, UserCircle } from "lucide-react"
import { USER_ROLE_LABELS } from "@/lib/constants"
import { UserProfileDialog } from "@/components/layout/user-profile-dialog"

export function Topbar() {
  const { data: session } = useSession()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "U"

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data?.avatarUrl) setAvatarUrl(data.avatarUrl) })
  }, [])

  return (
    <>
      <header className="flex h-16 items-center gap-4 border-b bg-background px-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-6" />
        <div className="flex-1" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2.5 h-12 px-3 rounded-xl">
              <Avatar className="h-9 w-9 shrink-0">
                {avatarUrl && (
                  <AvatarImage src={avatarUrl} alt={session?.user?.name ?? ""} className="object-cover" />
                )}
                <AvatarFallback className="text-sm font-semibold">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start min-w-0 max-w-[140px]">
                <span className="text-sm font-medium leading-tight truncate w-full">
                  {session?.user?.name ?? "User"}
                </span>
                <span className="text-xs text-muted-foreground leading-tight truncate w-full">
                  {USER_ROLE_LABELS[session?.user?.role ?? ""] ?? session?.user?.role}
                </span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 shrink-0">
                  {avatarUrl && (
                    <AvatarImage src={avatarUrl} alt={session?.user?.name ?? ""} className="object-cover" />
                  )}
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <p className="text-sm font-medium truncate">{session?.user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {USER_ROLE_LABELS[session?.user?.role ?? ""] ?? session?.user?.role}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setProfileOpen(true)}
            >
              <UserCircle className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {session?.user && (
        <UserProfileDialog
          open={profileOpen}
          onOpenChange={setProfileOpen}
          user={{
            name: session.user.name,
            email: session.user.email,
            role: session.user.role,
            position: session.user.position,
          }}
          avatarUrl={avatarUrl}
          initials={initials}
          onAvatarChange={setAvatarUrl}
        />
      )}
    </>
  )
}
