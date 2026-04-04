import { v2 as cloudinary } from "cloudinary"

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  )
}

function configure(): void {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

export async function uploadOfficialPhoto(
  buffer: Buffer,
  mimeType: string
): Promise<{ url: string }> {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured")
  }
  configure()
  const base64 = buffer.toString("base64")
  const dataUri = `data:${mimeType};base64,${base64}`
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "digital-profiling/officials",
    resource_type: "image",
    transformation: [{ width: 800, height: 800, crop: "limit" }],
  })
  return { url: result.secure_url }
}
