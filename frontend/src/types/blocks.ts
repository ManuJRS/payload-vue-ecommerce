export type LexicalNode = {
  type?: string
  tag?: string
  text?: string
  format?: number
  url?: string
  children?: LexicalNode[]
  [key: string]: unknown
}

export type LexicalRichText = {
  root?: LexicalNode
  [key: string]: unknown
} | null

export type MediaRef = {
  id?: number | string
  url?: string | null
  alt?: string | null
  filename?: string | null
  mimeType?: string | null
  width?: number | null
  height?: number | null
  cloudinary?: {
    secure_url?: string | null
  } | null
} | null

export type PayloadBlock = {
  id?: string | null
  blockName?: string | null
  blockType: string
  [key: string]: unknown
}

export type PageHero = {
  type?: 'none' | 'highImpact' | 'mediumImpact' | 'lowImpact' | string | null
  richText?: LexicalRichText
  media?: number | MediaRef
  links?: unknown
  heading?: string | null
  subheading?: string | null
  title?: string | null
}
