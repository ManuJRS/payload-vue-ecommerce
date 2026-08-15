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

export type HeroButton = {
  label?: string | null
  url?: string | null
  newTab?: boolean | null
  link?: {
    type?: ('reference' | 'custom') | null
    newTab?: boolean | null
    url?: string | null
    label?: string | null
    reference?: {
      relationTo?: 'pages' | string
      value?:
        | number
        | string
        | {
            id?: number | string
            slug?: string | null
            title?: string | null
          }
        | null
    } | null
  } | null
}

export type PageHero = {
  type?: 'none' | 'highImpact' | 'mediumImpact' | 'medium' | 'lowImpact' | string | null
  tag?: string | null
  title?: string | null
  description?: string | null
  media?: number | MediaRef
  primaryButton?: HeroButton | null
  secondaryButton?: HeroButton | null
  richText?: LexicalRichText
  links?: Array<{ id?: string | null; link?: HeroButton['link'] }> | null
  heading?: string | null
  subheading?: string | null
}
