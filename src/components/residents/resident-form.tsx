"use client"

import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useEffect, useMemo, useState } from "react"
import {
  residentSchema,
  type ResidentFormData,
} from "@/lib/validations/resident.schema"
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
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"
import type { Purok, Household } from "@/generated/prisma/client"
import {
  CIVIL_STATUS_LABELS,
  EDUCATION_LABELS,
  EMPLOYMENT_LABELS,
  BLOOD_TYPES,
  RELIGIONS,
  PWD_TYPES,
  RELATIONSHIPS_TO_HEAD,
} from "@/lib/constants"

export type ResidentFormBarangayOption = {
  id: string
  name: string
  municipalityName: string
  province: string
}

function initialBarangayContextId(
  barangays: ResidentFormBarangayOption[],
  households: (Household & { purok: Purok })[],
  defaultHouseholdId?: string | null
): string {
  if (defaultHouseholdId) {
    const hh = households.find((h) => h.id === defaultHouseholdId)
    if (hh) return hh.barangayId
  }
  if (barangays.length === 1) return barangays[0]!.id
  return ""
}

function initialPurokFilterId(
  isEditing: boolean,
  households: (Household & { purok: Purok })[],
  defaultHouseholdId?: string | null
): string {
  if (!isEditing || !defaultHouseholdId) return "__all__"
  const hh = households.find((h) => h.id === defaultHouseholdId)
  return hh?.purokId ?? "__all__"
}

interface Props {
  /** Barangays the signed-in account may use (tenant scope). */
  barangays: ResidentFormBarangayOption[]
  puroks: Purok[]
  households: (Household & { purok: Purok })[]
  /** Shown under the assignment card (e.g. barangay + municipality). */
  scopeDescription?: string
  defaultValues?: Partial<ResidentFormData>
  residentId?: string
}

export function ResidentForm({
  barangays,
  puroks,
  households,
  scopeDescription,
  defaultValues,
  residentId,
}: Props) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!residentId

  const [barangayContextId, setBarangayContextId] = useState(() =>
    initialBarangayContextId(
      barangays,
      households,
      defaultValues?.householdId
    )
  )
  const [purokFilterId, setPurokFilterId] = useState(() =>
    initialPurokFilterId(isEditing, households, defaultValues?.householdId)
  )

  const form = useForm<ResidentFormData>({
    resolver: zodResolver(residentSchema) as Resolver<ResidentFormData>,
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      suffix: "",
      sex: "MALE",
      dateOfBirth: "",
      civilStatus: "SINGLE",
      citizenship: "Filipino",
      voterStatus: false,
      isSeniorCitizen: false,
      isPwd: false,
      isSoloParent: false,
      is4PsBeneficiary: false,
      isOFW: false,
      isIndigenousPeople: false,
      isSkMember: false,
      isHouseholdHead: false,
      ...defaultValues,
    },
  })

  const puroksForBarangay = useMemo(
    () => puroks.filter((p) => p.barangayId === barangayContextId),
    [puroks, barangayContextId]
  )

  const filteredHouseholds = useMemo(() => {
    let list = households.filter((h) => h.barangayId === barangayContextId)
    if (purokFilterId && purokFilterId !== "__all__") {
      list = list.filter((h) => h.purokId === purokFilterId)
    }
    return list
  }, [households, barangayContextId, purokFilterId])

  const watchedHouseholdId = form.watch("householdId")
  useEffect(() => {
    if (!watchedHouseholdId) return
    if (!filteredHouseholds.some((h) => h.id === watchedHouseholdId)) {
      form.setValue("householdId", null)
    }
  }, [filteredHouseholds, watchedHouseholdId, form])

  function handleBarangayContextChange(id: string) {
    setBarangayContextId(id)
    setPurokFilterId("__all__")
  }

  async function onSubmit(data: ResidentFormData) {
    setIsSubmitting(true)

    const url = isEditing ? `/api/residents/${residentId}` : "/api/residents"
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

    toast.success(isEditing ? "Resident updated" : "Resident created")
    router.push("/residents")
    router.refresh()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Basic personal details of the resident
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Juan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="middleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Middle Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Bautista"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Dela Cruz" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="suffix"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Suffix</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Jr., Sr., III"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sex *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="placeOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Place of Birth</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Socorro, Surigao del Norte"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="civilStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Civil Status *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(CIVIL_STATUS_LABELS).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="citizenship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Citizenship</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="religion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Religion</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value ?? ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select religion" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {RELIGIONS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bloodType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Blood Type</FormLabel>
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
                      {BLOOD_TYPES.map((bt) => (
                        <SelectItem key={bt} value={bt}>
                          {bt}
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

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="contactNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="09171234567"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="emailAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="juan@email.com"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Household Assignment */}
        <Card>
          <CardHeader>
            <CardTitle>Barangay, purok & household</CardTitle>
            <CardDescription>
              {scopeDescription
                ? `Scope: ${scopeDescription}. `
                : null}
              Households and puroks are limited to your account&apos;s access.
              Pick a barangay when you cover more than one, optionally narrow by
              purok, then choose the household.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {barangays.length > 1 ? (
              <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                <label className="text-sm font-medium">Barangay *</label>
                <Select
                  value={barangayContextId || undefined}
                  onValueChange={handleBarangayContextChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select barangay" />
                  </SelectTrigger>
                  <SelectContent>
                    {barangays.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        Brgy. {b.name} — {b.municipalityName}, {b.province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!barangayContextId ? (
                  <p className="text-muted-foreground text-xs">
                    Select a barangay to load puroks and households for that
                    jurisdiction.
                  </p>
                ) : null}
              </div>
            ) : barangays.length === 1 ? (
              <div className="text-muted-foreground text-sm sm:col-span-2 lg:col-span-3">
                <span className="font-medium text-foreground">Barangay: </span>
                Brgy. {barangays[0]!.name} — {barangays[0]!.municipalityName},{" "}
                {barangays[0]!.province}
              </div>
            ) : (
              <p className="text-destructive text-sm sm:col-span-2 lg:col-span-3">
                No barangay is assigned to your account. You cannot assign a
                household until an administrator links you to a barangay.
              </p>
            )}

            {barangayContextId ? (
              <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                <label className="text-sm font-medium">
                  Purok (optional filter)
                </label>
                <Select
                  value={purokFilterId}
                  onValueChange={setPurokFilterId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All puroks" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All puroks</SelectItem>
                    {puroksForBarangay.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground text-xs">
                  Restrict the household list to one purok, or leave as all
                  puroks.
                </p>
              </div>
            ) : null}

            <FormField
              control={form.control}
              name="householdId"
              render={({ field }) => (
                <FormItem className="sm:col-span-2 lg:col-span-3">
                  <FormLabel>Household</FormLabel>
                  <Select
                    value={field.value ?? "__none__"}
                    onValueChange={(v) =>
                      field.onChange(v === "__none__" ? null : v)
                    }
                    disabled={!barangayContextId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select household (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__none__">No household</SelectItem>
                      {filteredHouseholds.map((hh) => (
                        <SelectItem key={hh.id} value={hh.id}>
                          #{hh.houseNo ?? "N/A"} — {hh.purok.name}
                          {hh.streetSitio ? ` (${hh.streetSitio})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {barangayContextId && filteredHouseholds.length === 0 ? (
                    <p className="text-muted-foreground text-xs">
                      No households match this barangay
                      {purokFilterId !== "__all__" ? " and purok" : ""}. Add a
                      household or change the purok filter.
                    </p>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isHouseholdHead"
              render={({ field }) => (
                <FormItem className="flex items-end gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Head of Household</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="relationshipToHead"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relationship to Head</FormLabel>
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
                      {RELATIONSHIPS_TO_HEAD.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
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

        {/* Education & Employment */}
        <Card>
          <CardHeader>
            <CardTitle>Education & Employment</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FormField
              control={form.control}
              name="educationalAttainment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Educational Attainment</FormLabel>
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
                      {Object.entries(EDUCATION_LABELS).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="employmentStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employment Status</FormLabel>
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
                      {Object.entries(EMPLOYMENT_LABELS).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="occupation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Occupation</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Farmer, Fisher, Teacher..."
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="monthlyIncome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Income (PHP)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Classifications */}
        <Card>
          <CardHeader>
            <CardTitle>Special Classifications</CardTitle>
            <CardDescription>
              Check all that apply to this resident
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(
                [
                  { name: "voterStatus", label: "Registered Voter" },
                  { name: "isSeniorCitizen", label: "Senior Citizen (60+)" },
                  { name: "isPwd", label: "Person with Disability" },
                  { name: "isSoloParent", label: "Solo Parent" },
                  { name: "is4PsBeneficiary", label: "4Ps Beneficiary" },
                  { name: "isOFW", label: "OFW" },
                  { name: "isIndigenousPeople", label: "Indigenous People" },
                  { name: "isSkMember", label: "SK Member (15-30)" },
                ] as const
              ).map((item) => (
                <FormField
                  key={item.name}
                  control={form.control}
                  name={item.name}
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">{item.label}</FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </div>

            {form.watch("isPwd") && (
              <FormField
                control={form.control}
                name="pwdType"
                render={({ field }) => (
                  <FormItem className="max-w-xs">
                    <FormLabel>PWD Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select PWD type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PWD_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        {/* Government IDs */}
        <Card>
          <CardHeader>
            <CardTitle>Government IDs</CardTitle>
            <CardDescription>Optional government identification numbers</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(
              [
                { name: "nationalIdNo", label: "PhilSys National ID" },
                { name: "philhealthNo", label: "PhilHealth No." },
                { name: "sssNo", label: "SSS No." },
                { name: "pagibigNo", label: "Pag-IBIG No." },
                { name: "tinNo", label: "TIN" },
                { name: "voterIdNo", label: "Voter's ID No." },
              ] as const
            ).map((item) => (
              <FormField
                key={item.name}
                control={form.control}
                name={item.name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{item.label}</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </CardContent>
        </Card>

        {/* Residency */}
        <Card>
          <CardHeader>
            <CardTitle>Residency Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="yearsInBarangay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Years in Barangay</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="previousAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Previous Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="If transferred from another area"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Update Resident" : "Add Resident"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
