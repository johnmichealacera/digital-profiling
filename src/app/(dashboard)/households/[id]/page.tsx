import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowLeft, Edit, Eye, MapPin, Plus } from "lucide-react"
import { formatResidentName, computeAge } from "@/lib/utils"
import { SEX_LABELS, CIVIL_STATUS_LABELS } from "@/lib/constants"

interface Props {
  params: Promise<{ id: string }>
}

export default async function HouseholdDetailPage({ params }: Props) {
  const { id } = await params

  const household = await prisma.household.findUnique({
    where: { id },
    include: {
      purok: true,
      residents: {
        where: { status: "ACTIVE" },
        orderBy: [{ isHouseholdHead: "desc" }, { dateOfBirth: "asc" }],
      },
    },
  })

  if (!household) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/households">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              House #{household.houseNo ?? "N/A"}
            </h1>
            <p className="text-muted-foreground">
              {household.purok.name}
              {household.streetSitio ? ` - ${household.streetSitio}` : ""}
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/households/${id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Household Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Household Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">House No.</span>
              <span className="font-medium">{household.houseNo ?? "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Street/Sitio</span>
              <span className="font-medium">
                {household.streetSitio ?? "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Purok</span>
              <span className="font-medium">{household.purok.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Housing Type</span>
              <span className="font-medium">
                {household.housingType ?? "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Roof Material</span>
              <span className="font-medium">
                {household.roofMaterial ?? "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Wall Material</span>
              <span className="font-medium">
                {household.wallMaterial ?? "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Water Source</span>
              <span className="font-medium">
                {household.waterSource ?? "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Toilet Facility</span>
              <span className="font-medium">
                {household.toiletFacility ?? "N/A"}
              </span>
            </div>
            {household.is4PsBeneficiary && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">4Ps ID</span>
                <Badge variant="secondary">
                  {household.fourPsHouseholdId ?? "Yes"}
                </Badge>
              </div>
            )}
            {household.latitude && household.longitude && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Coordinates</span>
                <span className="flex items-center gap-1 font-mono text-xs">
                  <MapPin className="h-3 w-3" />
                  {household.latitude.toFixed(4)},{" "}
                  {household.longitude.toFixed(4)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Members */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              Members ({household.residents.length})
            </CardTitle>
            <Button size="sm" asChild>
              <Link href={`/residents/new?householdId=${id}`}>
                <Plus className="mr-1 h-3 w-3" />
                Add
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Sex</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {household.residents.map((resident) => (
                  <TableRow key={resident.id}>
                    <TableCell className="font-medium">
                      {formatResidentName(resident)}
                    </TableCell>
                    <TableCell>{SEX_LABELS[resident.sex]}</TableCell>
                    <TableCell>{computeAge(resident.dateOfBirth)}</TableCell>
                    <TableCell>
                      {resident.isHouseholdHead ? (
                        <Badge variant="default" className="text-xs">
                          Head
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {resident.relationshipToHead ?? "Member"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/residents/${resident.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {household.residents.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-16 text-center text-muted-foreground"
                    >
                      No members yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
