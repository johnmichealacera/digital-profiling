import { DocumentRequestForm } from "@/components/documents/document-request-form"

export default function NewDocumentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          New Document Request
        </h1>
        <p className="text-muted-foreground">
          Create a new certificate or document request
        </p>
      </div>
      <DocumentRequestForm />
    </div>
  )
}
