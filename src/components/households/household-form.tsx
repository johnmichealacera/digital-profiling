"use client"

import dynamic from "next/dynamic"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import {
  householdSchema,
  type HouseholdFormData,
} from "@/lib/validations/household.schema"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { Purok } from "@/generated/prisma/client"
import {
  HOUSING_TYPES,
  ROOF_MATERIALS,
  WALL_MATERIALS,
  TOILET_FACILITIES,
  WATER_SOURCES,
} from "@/lib/constants"
import { tenantAreaPhraseFromSessionUser } from "@/lib/tenant-area-phrase"

const HouseholdLocationPicker = dynamic(
  () =>
    import("@/components/map/household-location-picker").then((m) => ({
      default: m.HouseholdLocationPicker,
    })),
  {
    ssr: false,
    loading: () => (
      <Skeleton className="h-[320px] w-full rounded-md border" />
    ),
  }
)

interface Props {
  puroks: Purok[]
  defaultValues?: Partial<HouseholdFormData>
  householdId?: string
}

export function HouseholdForm({ puroks, defaultValues, householdId }: Props) {
  const router = useRouter()
  const { data: session } = useSession()
  const area = tenantAreaPhraseFromSessionUser(session?.user ?? {})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!householdId

  const form = useForm<HouseholdFormData>({
    resolver: zodResolver(householdSchema) as Resolver<HouseholdFormData>,
    defaultValues: {
      houseNo: "",
      streetSitio: "",
      purokId: "",
      is4PsBeneficiary: false,
      latitude: undefined,
      longitude: undefined,
      ...defaultValues,
    },
  })

  useEffect(() => {
    form.register("latitude")
    form.register("longitude")
  }, [form])

  async function onSubmit(data: HouseholdFormData) {
    setIsSubmitting(true)

    const url = isEditing
      ? `/api/households/${householdId}`
      : "/api/households"
    const method = isEditing ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    setIsSubmitting(false)

    if (!res.ok) {
      const err = await res.json()
      toast.error(err.error || "Something went wrong")
      return
    }

    toast.success(isEditing ? "Household updated" : "Household created")
    router.push("/households")
    router.refresh()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
            <CardDescription>Address and purok assignment</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FormField
              control={form.control}
              name="houseNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>House No.</FormLabel>
                  <FormControl>
                    <Input placeholder="001" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="streetSitio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street / Sitio</FormLabel>
                  <FormControl>
                    <Input placeholder="Main Road" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="purokId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purok *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select purok" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {puroks.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* GPS — pick on map */}
        <Card>
          <CardHeader>
            <CardTitle>Location on map</CardTitle>
            <CardDescription>
              Click the map to set GPS coordinates for this household ({area}).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <HouseholdLocationPicker
              mapInstanceKey={householdId ?? "new"}
              latitude={form.watch("latitude")}
              longitude={form.watch("longitude")}
              onChange={(lat, lng) => {
                form.setValue("latitude", lat, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
                form.setValue("longitude", lng, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }}
              onClear={() => {
                form.setValue("latitude", null, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
                form.setValue("longitude", null, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }}
            />
            {(form.formState.errors.latitude ||
              form.formState.errors.longitude) && (
              <p className="text-sm text-destructive">
                {form.formState.errors.latitude?.message ??
                  form.formState.errors.longitude?.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Housing Classification */}
        <Card>
          <CardHeader>
            <CardTitle>Housing Classification</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "housingType" as const, label: "Housing Type", options: HOUSING_TYPES },
              { name: "roofMaterial" as const, label: "Roof Material", options: ROOF_MATERIALS },
              { name: "wallMaterial" as const, label: "Wall Material", options: WALL_MATERIALS },
              { name: "toiletFacility" as const, label: "Toilet Facility", options: TOILET_FACILITIES },
              { name: "waterSource" as const, label: "Water Source", options: WATER_SOURCES },
            ].map((item) => (
              <FormField
                key={item.name}
                control={form.control}
                name={item.name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{item.label}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {item.options.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </CardContent>
        </Card>

        {/* 4Ps */}
        <Card>
          <CardHeader>
            <CardTitle>4Ps / Pantawid</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="is4PsBeneficiary"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">
                    4Ps Beneficiary Household
                  </FormLabel>
                </FormItem>
              )}
            />
            {form.watch("is4PsBeneficiary") && (
              <FormField
                control={form.control}
                name="fourPsHouseholdId"
                render={({ field }) => (
                  <FormItem className="max-w-xs">
                    <FormLabel>4Ps Household ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="4PS-2023-00123"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Update Household" : "Add Household"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
