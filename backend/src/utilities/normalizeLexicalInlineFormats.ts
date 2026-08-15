const TAG_FORMAT: Record<string, number> = {
  strong: 1,
  b: 1,
  em: 2,
  i: 2,
  u: 8,
  s: 4,
  strike: 4,
  code: 16,
}

type LexicalLike = {
  type?: string
  text?: string
  format?: number
  children?: LexicalLike[]
  [key: string]: unknown
}

const unwrapHtmlInText = (node: LexicalLike): LexicalLike => {
  const text = node.text
  if (node.type !== 'text' || typeof text !== 'string' || !text.includes('<')) {
    return node
  }

  const wrapped = text.match(/^<(\/?)(strong|b|em|i|u|s|strike|code)>([\s\S]*)<\/\2>$/i)
  if (wrapped) {
    const tag = wrapped[2].toLowerCase()
    const inner = wrapped[3]
    const formatBit = TAG_FORMAT[tag] ?? 0
    return {
      ...node,
      text: inner.replace(/<[^>]+>/g, ''),
      format: (typeof node.format === 'number' ? node.format : 0) | formatBit,
    }
  }

  return {
    ...node,
    text: text.replace(/<[^>]+>/g, ''),
  }
}

const walk = (node: LexicalLike): LexicalLike => {
  const current = unwrapHtmlInText(node)
  if (!Array.isArray(current.children)) return current

  return {
    ...current,
    children: current.children.map(walk),
  }
}

/** Convierte `<strong>` pegado como string plano a nodos Lexical con `format`. */
export const normalizeLexicalInlineFormats = (value: unknown) => {
  if (!value || typeof value !== 'object') return value

  const document = value as { root?: LexicalLike }
  if (!document.root) return value

  return {
    ...document,
    root: walk(document.root),
  }
}
