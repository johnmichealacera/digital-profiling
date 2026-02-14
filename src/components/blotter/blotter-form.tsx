"use client"

import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { blotterSchema, type BlotterFormData } from "@/lib/validations/blotter.schema"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Search } from "lucide-react"
import { BLOTTER_NATURE_LABELS } from "@/lib/constants"
import { formatResidentName } from "@/lib/utils"

type SearchResult = {
  id: string
  firstName: string
  middleName?: string | null
  lastName: string
  suffix?: string | null
  household?: { purok: { name: string } } | null
}

function ResidentSearchField({
  label,
  onSelect,
  nameValue,
  onNameChange,
}: {
  label: string
  onSelect: (id: string) => void
  nameValue: string
  onNameChange: (name: string) => void
}) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [selected, setSelected] = useState<SearchResult | null>(null)

  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/residents/search?q=${encodeURIComponent(query)}`)
      if (res.ok) {
        setResults(await res.json())
        setShowResults(true)
      }
    }, 300)
    return () => clearTimeout(timeout)
  }, [query])

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label} (Resident)</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search resident..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (selected) { setSelected(null); onSelect("") }
          }}
          onFocus={() => results.length > 0 && setShowResults(true)}
          className="pl-9"
        />
        {showResults && results.length > 0 && (
          <div className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border bg-popover shadow-md">
            {results.map((r) => (
              <button
                key={r.id}
                type="button"
                className="flex w-full items-center justify-between px-4 py-2 text-sm hover:bg-accent"
                onClick={() => {
                  setSelected(r)
                  onSelect(r.id)
                  setQuery(formatResidentName(r))
                  setShowResults(false)
                }}
              >
                <span>{formatResidentName(r)}</span>
                <span className="text-xs text-muted-foreground">
                  {r.household?.purok.name ?? ""}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      {selected && (
        <p className="text-xs text-emerald-600">Selected: {formatResidentName(selected)}</p>
      )}
      <div>
        <label className="text-sm font-medium">{label} (Non-resident name)</label>
        <Input
          placeholder="If not in system, type name here"
          value={nameValue}
          onChange={(e) => onNameChange(e.target.value)}
        />
      </div>
    </div>
  )
}

export function BlotterForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<BlotterFormData>({
    resolver: zodResolver(blotterSchema) as Resolver<BlotterFormData>,
    defaultValues: {
      incidentDate: "",
      incidentPlace: "",
      nature: "OTHER",
      narrative: "",
      witnesses: [],
    },
  })

  async function onSubmit(data: BlotterFormData) {
    setIsSubmitting(true)
    const res = await fetch("/api/blotter", {
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
    toast.success("Blotter case filed successfully")
    router.push("/blotter")
    router.refresh()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Incident Details */}
        <Card>
          <CardHeader>
            <CardTitle>Incident Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField control={form.control} name="incidentDate" render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Incident *</FormLabel>
                <FormControl><Input type="datetime-local" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="incidentPlace" render={({ field }) => (
              <FormItem>
                <FormLabel>Place of Incident *</FormLabel>
                <FormControl><Input placeholder="Purok 1, near Barangay Hall" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="nature" render={({ field }) => (
              <FormItem>
                <FormLabel>Nature of Complaint *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {Object.entries(BLOTTER_NATURE_LABELS).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="natureDetails" render={({ field }) => (
              <FormItem>
                <FormLabel>Nature Details</FormLabel>
                <FormControl><Input placeholder="Additional details" {...field} value={field.value ?? ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        {/* Parties */}
        <Card>
          <CardHeader><CardTitle>Parties Involved</CardTitle></CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <ResidentSearchField
              label="Complainant"
              onSelect={(id) => form.setValue("complainantId", id)}
              nameValue={form.watch("complainantName") ?? ""}
              onNameChange={(name) => form.setValue("complainantName", name)}
            />
            <ResidentSearchField
              label="Respondent"
              onSelect={(id) => form.setValue("respondentId", id)}
              nameValue={form.watch("respondentName") ?? ""}
              onNameChange={(name) => form.setValue("respondentName", name)}
            />
          </CardContent>
        </Card>

        {/* Narrative */}
        <Card>
          <CardHeader><CardTitle>Incident Narrative</CardTitle></CardHeader>
          <CardContent>
            <FormField control={form.control} name="narrative" render={({ field }) => (
              <FormItem>
                <FormLabel>Narrative / Statement *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the incident in detail..."
                    className="min-h-[150px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            File Complaint
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
