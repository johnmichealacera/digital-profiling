import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ResidentProfile } from "@/components/residents/resident-profile"

interface Props {
  params: Promise<{ id: string }>
}

export default async function ResidentDetailPage({ params }: Props) {
  const { id } = await params

  const resident = await prisma.resident.findUnique({
    where: { id },
    include: {
      household: { include: { purok: true } },
      documentRequests: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      healthRecords: {
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!resident) notFound()

  return <ResidentProfile resident={resident} />
}
