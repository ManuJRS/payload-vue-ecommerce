import crypto from 'crypto'
import fs from 'fs/promises'
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import type { Adapter, GeneratedAdapter } from '@payloadcms/plugin-cloud-storage/types'
import { v2 as cloudinary } from 'cloudinary'
import type { Plugin } from 'payload'

type CloudinaryCredentials = {
  api_key: string
  api_secret: string
  cloud_name: string
}

const parseCloudinaryUrl = (value?: string): CloudinaryCredentials | null => {
  if (!value) return null

  const match = value.trim().match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/)
  if (!match) return null

  return {
    api_key: decodeURIComponent(match[1]),
    api_secret: decodeURIComponent(match[2]),
    cloud_name: match[3].trim(),
  }
}

const getCloudinaryCredentials = (): CloudinaryCredentials | null => {
  const fromUrl = parseCloudinaryUrl(process.env.CLOUDINARY_URL)
  if (fromUrl) return fromUrl

  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME?.trim()
  const api_key = process.env.CLOUDINARY_API_KEY?.trim()
  const api_secret = process.env.CLOUDINARY_API_SECRET?.trim()

  if (cloud_name && api_key && api_secret) {
    return { api_key, api_secret, cloud_name }
  }

  return null
}

const ensureCloudinaryConfig = () => {
  const credentials = getCloudinaryCredentials()

  if (!credentials) {
    throw new Error('Cloudinary credentials are missing')
  }

  cloudinary.config({
    ...credentials,
    secure: true,
  })

  return credentials
}

const toPublicId = (filename: string, folder?: string) => {
  const name = filename.replace(/\.[^/.]+$/, '')
  return folder ? `${folder}/${name}` : name
}

const signParams = (params: Record<string, string>, apiSecret: string) => {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&')

  return crypto.createHash('sha1').update(`${toSign}${apiSecret}`).digest('hex')
}

const getFileBuffer = async (file: { buffer?: Buffer; mimeType?: string; tempFilePath?: string }) => {
  if (file.buffer && file.buffer.length > 0) {
    return file.buffer
  }

  if (file.tempFilePath) {
    return fs.readFile(file.tempFilePath)
  }

  return null
}

const uploadImage = async ({
  buffer,
  filename,
  folder,
  mimeType,
}: {
  buffer: Buffer
  filename: string
  folder: string
  mimeType?: string
}) => {
  const credentials = ensureCloudinaryConfig()
  const timestamp = Math.round(Date.now() / 1000).toString()
  const publicId = filename.replace(/\.[^/.]+$/, '')
  const signedParams = {
    folder,
    overwrite: 'true',
    public_id: publicId,
    timestamp,
  }

  const form = new FormData()
  form.set(
    'file',
    new Blob([new Uint8Array(buffer)], { type: mimeType || 'application/octet-stream' }),
    filename,
  )
  form.set('api_key', credentials.api_key)
  form.set('signature', signParams(signedParams, credentials.api_secret))

  for (const [key, value] of Object.entries(signedParams)) {
    form.set(key, value)
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${credentials.cloud_name}/image/upload`,
    {
      body: form,
      method: 'POST',
    },
  )

  const payload = (await response.json().catch(() => null)) as {
    error?: { message?: string }
    secure_url?: string
  } | null

  if (!response.ok) {
    throw new Error(
      payload?.error?.message ||
        response.headers.get('x-cld-error') ||
        `Cloudinary upload failed (${response.status})`,
    )
  }

  return payload
}

const createCloudinaryAdapter = (folder = 'media'): Adapter => {
  return ({ prefix }): GeneratedAdapter => {
    const effectiveFolder = [folder, prefix].filter(Boolean).join('/')

    return {
      name: 'cloudinary',
      generateURL: ({ filename }) => {
        ensureCloudinaryConfig()

        return cloudinary.url(toPublicId(filename, effectiveFolder), {
          resource_type: 'image',
          secure: true,
        })
      },
      handleDelete: async ({ filename }) => {
        ensureCloudinaryConfig()

        await cloudinary.uploader.destroy(toPublicId(filename, effectiveFolder), {
          resource_type: 'image',
        })
      },
      handleUpload: async ({ file }) => {
        const buffer = await getFileBuffer(file)
        if (!buffer) {
          throw new Error('No file data provided for Cloudinary upload')
        }

        await uploadImage({
          buffer,
          filename: file.filename,
          folder: effectiveFolder,
          mimeType: file.mimeType,
        })
      },
      staticHandler: async (_req, { params: { filename } }) => {
        ensureCloudinaryConfig()

        const url = cloudinary.url(toPublicId(filename, effectiveFolder), {
          resource_type: 'image',
          secure: true,
        })

        return new Response(null, {
          headers: { Location: url },
          status: 302,
        })
      },
    }
  }
}

export const cloudinaryStorage = (): Plugin => {
  if (!getCloudinaryCredentials()) {
    console.warn('Cloudinary credentials missing; media uploads will use local storage.')
    return (config) => config
  }

  return cloudStoragePlugin({
    collections: {
      media: {
        adapter: createCloudinaryAdapter(process.env.CLOUDINARY_FOLDER || 'media'),
        disableLocalStorage: true,
        disablePayloadAccessControl: true,
      },
    },
  })
}
