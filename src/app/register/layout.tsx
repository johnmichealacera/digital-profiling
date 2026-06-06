import Image from "next/image"
import Link from "next/link"

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-muted/30 min-h-screen">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <Image
            src="/socorro_logo.png"
            alt="Socorro logo"
            width={40}
            height={40}
            className="rounded-md object-contain"
          />
          <div>
            <p className="text-sm font-semibold">Digital Profiling System</p>
            <p className="text-muted-foreground text-xs">
              Barangay Resident Registration
            </p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
      <footer className="text-muted-foreground border-t py-6 text-center text-xs">
        <p>
          Need help? Visit your barangay hall or{" "}
          <Link href="/login" className="text-primary underline-offset-4 hover:underline">
            staff login
          </Link>
          .
        </p>
      </footer>
    </div>
  )
}
