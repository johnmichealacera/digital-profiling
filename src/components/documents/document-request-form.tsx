"use client"

import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import {
  documentRequestSchema,
  type DocumentRequestFormData,
} from "@/lib/validations/document.schema"
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Search } from "lucide-react"
import {
  DOCUMENT_TYPE_LABELS,
  COMMON_PURPOSES,
} from "@/lib/constants"
import { formatResidentName } from "@/lib/utils"

type SearchResult = {
  id: string
  firstName: string
  middleName?: string | null
  lastName: string
  suffix?: string | null
  household?: { purok: { name: string } } | null
}

export function DocumentRequestForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedResident, setSelectedResident] = useState<SearchResult | null>(
    null
  )
  const [showResults, setShowResults] = useState(false)

  const form = useForm<DocumentRequestFormData>({
    resolver: zodResolver(documentRequestSchema) as Resolver<DocumentRequestFormData>,
    defaultValues: {
      residentId: "",
      documentType: "BARANGAY_CLEARANCE",
      purpose: "",
    },
  })

  const documentType = form.watch("documentType")

  // Search residents
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    const timeout = setTimeout(async () => {
      const res = await fetch(
        `/api/residents/search?q=${encodeURIComponent(searchQuery)}`
      )
      if (res.ok) {
        const data = await res.json()
        setSearchResults(data)
        setShowResults(true)
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [searchQuery])

  function selectResident(resident: SearchResult) {
    setSelectedResident(resident)
    form.setValue("residentId", resident.id)
    setSearchQuery(formatResidentName(resident))
    setShowResults(false)
  }

  async function onSubmit(data: DocumentRequestFormData) {
    setIsSubmitting(true)

    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    setIsSubmitting(false)

    if (!res.ok) {
      const err = await res.json()
      toast.error(err.error || "Something went wrong")
      return
    }

    toast.success("Document request created")
    router.push("/documents")
    router.refresh()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Resident Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Resident</CardTitle>
            <CardDescription>Search and select the requesting resident</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="residentId"
              render={() => (
                <FormItem>
                  <FormLabel>Resident *</FormLabel>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Type resident name to search..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        if (selectedResident) {
                          setSelectedResident(null)
                          form.setValue("residentId", "")
                        }
                      }}
                      onFocus={() =>
                        searchResults.length > 0 && setShowResults(true)
                      }
                      className="pl-9"
                    />
                    {showResults && searchResults.length > 0 && (
                      <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover shadow-md">
                        {searchResults.map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            className="flex w-full items-center justify-between px-4 py-2 text-sm hover:bg-accent"
                            onClick={() => selectResident(r)}
                          >
                            <span>{formatResidentName(r)}</span>
                            <span className="text-xs text-muted-foreground">
                              {r.household?.purok.name ?? "No purok"}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {selectedResident && (
                    <p className="text-sm text-emerald-600">
                      Selected: {formatResidentName(selectedResident)} (
                      {selectedResident.household?.purok.name ?? "No purok"})
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Document Details */}
        <Card>
          <CardHeader>
            <CardTitle>Document Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="documentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Type *</FormLabel>
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
                      {Object.entries(DOCUMENT_TYPE_LABELS).map(
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
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purpose *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select purpose" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COMMON_PURPOSES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
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
              name="feeAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fee Amount (PHP)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
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
              name="officialReceipt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Official Receipt No.</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="OR-0001"
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

        {/* Business Permit Fields */}
        {documentType === "BUSINESS_PERMIT" && (
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="businessType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Type</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Sari-sari Store, Carinderia..."
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
                name="businessAddress"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Business Address</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Remarks */}
        <Card>
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional notes..."
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

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Request
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
