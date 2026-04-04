import Image from "next/image"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatResidentName } from "@/lib/utils"
import {
  bucketOfficialsByLayoutTier,
  segmentOfficialsByBarangay,
  sortOfficialsByHierarchy,
} from "@/lib/official-rank"
import { User } from "lucide-react"

export type DashboardLeadershipOfficial = {
  id: string
  firstName: string
  middleName?: string | null
  lastName: string
  suffix?: string | null
  position: string
  committee?: string | null
  photoUrl?: string | null
  contactNo?: string | null
  barangay: {
    name: string
    municipality: { name: string; province: string }
  }
}

function OfficialRow({
  o,
  showBarangay,
  prominent,
  compact,
}: {
  o: DashboardLeadershipOfficial
  showBarangay?: boolean
  prominent?: boolean
  compact?: boolean
}) {
  const avatar = prominent
    ? "h-[4.5rem] w-[4.5rem]"
    : compact
      ? "h-12 w-12"
      : "h-14 w-14"
  const sizes = prominent ? "72px" : compact ? "48px" : "56px"
  const icon = prominent ? "h-9 w-9" : compact ? "h-6 w-6" : "h-7 w-7"

  return (
    <div
      className={`flex flex-wrap items-center gap-4 p-4 ${
        prominent
          ? "rounded-lg border border-primary/25 bg-primary/[0.03]"
          : "rounded-lg border bg-card"
      }`}
    >
      <div
        className={`relative shrink-0 overflow-hidden rounded-full border bg-muted ${avatar}`}
      >
        {o.photoUrl ? (
          <Image
            src={o.photoUrl}
            alt=""
            fill
            className="object-cover"
            sizes={sizes}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <User
              className={`${icon} ${prominent ? "text-primary" : "text-muted-foreground"}`}
            />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={
            prominent ? "text-lg font-semibold leading-tight" : "font-semibold leading-tight"
          }
        >
          {formatResidentName(o)}
        </p>
        <p className="text-sm text-primary">{o.position}</p>
        {o.committee ? (
          <p className="text-xs text-muted-foreground">{o.committee}</p>
        ) : null}
        {showBarangay ? (
          <p className="text-xs text-muted-foreground">
            Brgy. {o.barangay.name} · {o.barangay.municipality.name},{" "}
            {o.barangay.municipality.province}
          </p>
        ) : null}
      </div>
    </div>
  )
}

export function DashboardLeadership({
  officials,
  showBarangay,
}: {
  officials: DashboardLeadershipOfficial[]
  showBarangay?: boolean
}) {
  if (officials.length === 0) {
    return null
  }

  const segments = segmentOfficialsByBarangay(officials)
  const showBarangayHeading = segments.length > 1

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Barangay leadership</CardTitle>
        <CardDescription>
          Punong Barangay / Captain first, then secretary, treasurer, kagawads
          (up to three per row), and SK officers in the same order.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-10">
        {segments.map((segment, segIdx) => {
          const tiers = bucketOfficialsByLayoutTier(
            sortOfficialsByHierarchy(segment)
          )
          const brgyName = segment[0]?.barangay.name

          return (
            <div key={segIdx} className="space-y-8">
              {showBarangayHeading && brgyName ? (
                <div className="border-b pb-2">
                  <h3 className="text-base font-semibold tracking-tight">
                    Brgy. {brgyName}
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    {segment[0]?.barangay.municipality.name},{" "}
                    {segment[0]?.barangay.municipality.province}
                  </p>
                </div>
              ) : null}
              <div className="space-y-8">
                {tiers.map((section) => (
                  <div key={section.tierRank} className="space-y-3">
                    <h4 className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                      {section.title}
                    </h4>
                    {section.layout === "full" ? (
                      <div className="mx-auto flex max-w-3xl flex-col gap-3">
                        {section.members.map((o) => (
                          <OfficialRow
                            key={o.id}
                            o={o}
                            showBarangay={showBarangay}
                            prominent={section.tierRank === 0}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {section.members.map((o) => (
                          <OfficialRow
                            key={o.id}
                            o={o}
                            showBarangay={showBarangay}
                            compact
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
