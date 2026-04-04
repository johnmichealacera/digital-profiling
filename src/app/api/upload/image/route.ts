import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import {
  isCloudinaryConfigured,
  uploadOfficialPhoto,
} from "@/lib/cloudinary-server"

export const runtime = "nodejs"

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
])

/** Authenticated users can upload images (e.g. official portraits). */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      {
        error:
          "Server image upload is not configured. Either set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET, or use NEXT_PUBLIC_CLOUDINARY_URL + NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET for unsigned uploads from the officials form.",
      },
      { status: 503 }
    )
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 })
  }

  const file = formData.get("file")
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 })
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File too large (max 5 MB)" },
      { status: 400 }
    )
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP, or GIF images are allowed" },
      { status: 400 }
    )
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const { url } = await uploadOfficialPhoto(buffer, file.type)
    return NextResponse.json({ url })
  } catch (e) {
    console.error("Cloudinary upload failed", e)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
