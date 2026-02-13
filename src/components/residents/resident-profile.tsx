"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, FileText, User } from "lucide-react"
import {
  formatResidentName,
  formatFormalName,
  computeAge,
  formatDate,
  formatPeso,
} from "@/lib/utils"
import {
  CIVIL_STATUS_LABELS,
  SEX_LABELS,
  EDUCATION_LABELS,
  EMPLOYMENT_LABELS,
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_STATUS_LABELS,
} from "@/lib/constants"
import type { ResidentWithAll } from "@/types"

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

export function ResidentProfile({ resident }: { resident: ResidentWithAll }) {
  const age = computeAge(resident.dateOfBirth)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/residents">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {formatResidentName(resident)}
            </h1>
            <p className="text-muted-foreground">
              {resident.household?.purok.name ?? "Unassigned"} &middot; {age}{" "}
              years old
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/residents/${resident.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
      </div>

      {/* Classifications */}
      <div className="flex flex-wrap gap-2">
        {resident.isHouseholdHead && <Badge>Head of Household</Badge>}
        {resident.isSeniorCitizen && (
          <Badge variant="secondary">Senior Citizen</Badge>
        )}
        {resident.isPwd && (
          <Badge variant="secondary">
            PWD{resident.pwdType ? ` (${resident.pwdType})` : ""}
          </Badge>
        )}
        {resident.is4PsBeneficiary && (
          <Badge variant="secondary">4Ps Beneficiary</Badge>
        )}
        {resident.isSoloParent && (
          <Badge variant="secondary">Solo Parent</Badge>
        )}
        {resident.isOFW && <Badge variant="secondary">OFW</Badge>}
        {resident.voterStatus && (
          <Badge variant="outline">Registered Voter</Badge>
        )}
        {resident.isSkMember && <Badge variant="outline">SK Member</Badge>}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <InfoRow label="Full Name" value={formatFormalName(resident)} />
            <InfoRow label="Sex" value={SEX_LABELS[resident.sex]} />
            <InfoRow
              label="Date of Birth"
              value={`${formatDate(resident.dateOfBirth)} (${age} yrs)`}
            />
            <InfoRow label="Place of Birth" value={resident.placeOfBirth} />
            <InfoRow
              label="Civil Status"
              value={CIVIL_STATUS_LABELS[resident.civilStatus]}
            />
            <InfoRow label="Citizenship" value={resident.citizenship} />
            <InfoRow label="Religion" value={resident.religion} />
            <InfoRow label="Blood Type" value={resident.bloodType} />
          </CardContent>
        </Card>

        {/* Contact & Address */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact & Address</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <InfoRow label="Contact No." value={resident.contactNo} />
            <InfoRow label="Email" value={resident.emailAddress} />
            <InfoRow
              label="Household"
              value={
                resident.household
                  ? `#${resident.household.houseNo ?? "N/A"}, ${resident.household.streetSitio ?? ""}`
                  : "Unassigned"
              }
            />
            <InfoRow
              label="Purok"
              value={resident.household?.purok.name ?? "N/A"}
            />
            <InfoRow
              label="Relationship to Head"
              value={
                resident.isHouseholdHead
                  ? "Head"
                  : resident.relationshipToHead
              }
            />
            <InfoRow
              label="Years in Barangay"
              value={resident.yearsInBarangay?.toString()}
            />
          </CardContent>
        </Card>

        {/* Education & Employment */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Education & Employment</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <InfoRow
              label="Educational Attainment"
              value={
                resident.educationalAttainment
                  ? EDUCATION_LABELS[resident.educationalAttainment]
                  : null
              }
            />
            <InfoRow
              label="Employment Status"
              value={
                resident.employmentStatus
                  ? EMPLOYMENT_LABELS[resident.employmentStatus]
                  : null
              }
            />
            <InfoRow label="Occupation" value={resident.occupation} />
            <InfoRow label="Employer" value={resident.employer} />
            <InfoRow
              label="Monthly Income"
              value={
                resident.monthlyIncome
                  ? formatPeso(resident.monthlyIncome.toString())
                  : null
              }
            />
          </CardContent>
        </Card>

        {/* Government IDs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Government IDs</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <InfoRow label="PhilSys National ID" value={resident.nationalIdNo} />
            <InfoRow label="PhilHealth" value={resident.philhealthNo} />
            <InfoRow label="SSS" value={resident.sssNo} />
            <InfoRow label="Pag-IBIG" value={resident.pagibigNo} />
            <InfoRow label="TIN" value={resident.tinNo} />
            <InfoRow label="Voter's ID" value={resident.voterIdNo} />
            <InfoRow
              label="Senior Citizen ID"
              value={resident.seniorCitizenIdNo}
            />
            <InfoRow label="PWD ID" value={resident.pwdIdNo} />
            <InfoRow label="Solo Parent ID" value={resident.soloParentIdNo} />
          </CardContent>
        </Card>
      </div>

      {/* Document History */}
      {resident.documentRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Document Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {resident.documentRequests.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {DOCUMENT_TYPE_LABELS[doc.documentType] ??
                        doc.documentType}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {doc.controlNo} &middot; {doc.purpose}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {DOCUMENT_STATUS_LABELS[doc.status] ?? doc.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
