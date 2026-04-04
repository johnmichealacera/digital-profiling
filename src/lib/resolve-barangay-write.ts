import { NextResponse } from "next/server"
import type { Session } from "next-auth"

export type WriteBarangayResult =
  | { ok: true; barangayId: string }
  | { ok: false; response: NextResponse }

/**
 * Barangay ID for creates/updates. Staff always use session assignment.
 * Super admin must pass `bodyBarangayId` (or explicit param). Municipal-only users cannot write by default.
 */
export function resolveWriteBarangayId(
  session: Session | null,
  bodyBarangayId?: string | null
): WriteBarangayResult {
  if (!session?.user?.id) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }

  if (session.user.role === "SUPER_ADMIN") {
    const id = bodyBarangayId?.trim()
    if (!id) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "barangayId is required for this action" },
          { status: 400 }
        ),
      }
    }
    return { ok: true, barangayId: id }
  }

  if (!session.user.barangayId) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "No barangay assignment for this account" },
        { status: 403 }
      ),
    }
  }

  return { ok: true, barangayId: session.user.barangayId }
}
