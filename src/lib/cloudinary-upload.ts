/**
 * Browser upload to Cloudinary via @jmacera/cloudinary-image-upload
 * (sends `api_key` + `upload_preset` + `file` — required for your Cloudinary setup).
 *
 * Env: NEXT_PUBLIC_CLOUDINARY_URL, NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
 * NEXT_PUBLIC_CLOUDINARY_API_KEY
 */
import { handleFileChange } from "@jmacera/cloudinary-image-upload"

export interface CloudinaryUploadOptions {
  cloudinaryUrl: string
  uploadPreset: string
  apiKey: string
}

export interface CloudinaryUploadResult {
  url: string
  originalFile: File
}

export function isCloudinaryBrowserUploadConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_URL?.trim() &&
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim() &&
      process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY?.trim()
  )
}

export async function uploadToCloudinary(
  file: File,
  options: CloudinaryUploadOptions
): Promise<CloudinaryUploadResult> {
  const { cloudinaryUrl, uploadPreset, apiKey } = options
  if (!cloudinaryUrl || !uploadPreset || !apiKey) {
    throw new Error("Cloudinary configuration is missing")
  }

  const uploadedUrl = await handleFileChange(
    cloudinaryUrl,
    uploadPreset,
    apiKey,
    file
  )

  if (!uploadedUrl || uploadedUrl.trim() === "") {
    throw new Error(
      "Failed to upload image to Cloudinary — no URL returned (check preset and API key)"
    )
  }

  return {
    url: uploadedUrl,
    originalFile: file,
  }
}
