import type { LexicalNode, LexicalRichText } from '@/types/blocks'

const FORMAT_BOLD = 1
const FORMAT_ITALIC = 2
const FORMAT_STRIKETHROUGH = 4
const FORMAT_UNDERLINE = 8
const FORMAT_CODE = 16

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const renderText = (node: LexicalNode) => {
  let html = escapeHtml(node.text ?? '')
  const format = node.format ?? 0

  if (format & FORMAT_CODE) html = `<code>${html}</code>`
  if (format & FORMAT_BOLD) html = `<strong>${html}</strong>`
  if (format & FORMAT_ITALIC) html = `<em>${html}</em>`
  if (format & FORMAT_UNDERLINE) html = `<u>${html}</u>`
  if (format & FORMAT_STRIKETHROUGH) html = `<s>${html}</s>`

  return html
}

const renderChildren = (nodes: LexicalNode[] = []) => nodes.map(renderNode).join('')

const renderNode = (node: LexicalNode): string => {
  switch (node.type) {
    case 'text':
      return renderText(node)
    case 'linebreak':
      return '<br />'
    case 'link':
    case 'autolink': {
      const href = escapeHtml(String(node.url ?? '#'))
      return `<a href="${href}" rel="noopener noreferrer">${renderChildren(node.children)}</a>`
    }
    case 'paragraph':
      return `<p>${renderChildren(node.children)}</p>`
    case 'heading': {
      const tag = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(String(node.tag))
        ? String(node.tag)
        : 'h2'
      return `<${tag}>${renderChildren(node.children)}</${tag}>`
    }
    case 'list': {
      const tag = node.listType === 'number' ? 'ol' : 'ul'
      return `<${tag}>${renderChildren(node.children)}</${tag}>`
    }
    case 'listitem':
      return `<li>${renderChildren(node.children)}</li>`
    case 'quote':
      return `<blockquote>${renderChildren(node.children)}</blockquote>`
    case 'upload':
    case 'block':
    case 'horizontalrule':
      return ''
    default:
      return renderChildren(node.children)
  }
}

/** Convierte Lexical JSON de Payload a HTML escapado y seguro para v-html. */
export const lexicalToHtml = (richText?: LexicalRichText | string | null) => {
  if (!richText) return ''
  if (typeof richText === 'string') return escapeHtml(richText)
  if (!richText.root) return ''

  return renderChildren(richText.root.children ?? [])
}

/** Extrae el primer texto plano útil de un rich text Lexical. */
export const lexicalToPlainText = (richText?: LexicalRichText | string | null) => {
  if (!richText) return ''
  if (typeof richText === 'string') return richText

  const walk = (nodes: LexicalNode[] = []): string =>
    nodes
      .map((node) => {
        if (node.type === 'text') return node.text ?? ''
        return walk(node.children)
      })
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()

  return walk(richText.root?.children)
}
