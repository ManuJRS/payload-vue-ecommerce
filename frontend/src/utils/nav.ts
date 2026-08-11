export type NavLink = {
  type?: ('reference' | 'custom') | null
  newTab?: boolean | null
  url?: string | null
  label: string
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
}

export type NavItem = {
  id?: string | null
  link: NavLink
}

const normalizePath = (path: string) => {
  if (!path) return '/'
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('mailto:')) {
    return path
  }

  return path.startsWith('/') ? path : `/${path}`
}

/** Resuelve un link de Payload (reference/custom) a una ruta usable en Vue Router. */
export const resolveNavHref = (link?: NavLink | null) => {
  if (!link) return '/'

  if (link.type === 'custom' && link.url) {
    return normalizePath(link.url)
  }

  const value = link.reference?.value
  if (value && typeof value === 'object' && value.slug) {
    return value.slug === 'home' ? '/' : normalizePath(value.slug)
  }

  if (link.url) {
    return normalizePath(link.url)
  }

  return '/'
}

export const isExternalHref = (href: string) =>
  href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')
