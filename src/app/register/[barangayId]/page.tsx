import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { PublicResidentRegistrationForm } from "@/components/residents/public-resident-registration-form"

interface Props {
  params: Promise<{ barangayId: string }>
}

export default async function PublicResidentRegistrationPage({ params }: Props) {
  const { barangayId } = await params

  const barangay = await prisma.barangay.findUnique({
    where: { id: barangayId },
    select: {
      id: true,
      name: true,
      municipality: { select: { name: true, province: true } },
    },
  })

  if (!barangay) notFound()

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Resident Registration
        </h1>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Fill out the form below to register as a resident of Brgy.{" "}
          {barangay.name}, {barangay.municipality.name},{" "}
          {barangay.municipality.province}. Barangay staff will verify your
          details after submission.
        </p>
      </div>

      <PublicResidentRegistrationForm
        barangayId={barangay.id}
        barangayName={barangay.name}
        municipalityName={barangay.municipality.name}
        province={barangay.municipality.province}
      />
    </div>
  )
}
