<script lang="ts">
import { computed, defineComponent, h, type PropType, type VNode } from 'vue'
import type { LexicalNode, LexicalRichText } from '@/types/blocks'

const FORMAT_BOLD = 1
const FORMAT_ITALIC = 2
const FORMAT_STRIKETHROUGH = 4
const FORMAT_UNDERLINE = 8
const FORMAT_CODE = 16

const unwrapHtmlFormat = (text: string, format: number) => {
  const wrapped = text.match(/^<(strong|b|em|i|u|s|strike|code)>([\s\S]*)<\/\1>$/i)
  if (!wrapped) {
    return { text: text.replace(/<[^>]+>/g, ''), format }
  }

  const tag = wrapped[1].toLowerCase()
  const bits: Record<string, number> = {
    strong: FORMAT_BOLD,
    b: FORMAT_BOLD,
    em: FORMAT_ITALIC,
    i: FORMAT_ITALIC,
    u: FORMAT_UNDERLINE,
    s: FORMAT_STRIKETHROUGH,
    strike: FORMAT_STRIKETHROUGH,
    code: FORMAT_CODE,
  }

  return { text: wrapped[2].replace(/<[^>]+>/g, ''), format: format | (bits[tag] ?? 0) }
}

const renderText = (node: LexicalNode): VNode | string => {
  const rawFormat = typeof node.format === 'number' ? node.format : 0
  const unwrapped = unwrapHtmlFormat(node.text ?? '', rawFormat)
  let vnode: VNode | string = unwrapped.text
  const format = unwrapped.format

  if (format & FORMAT_CODE) vnode = h('code', {}, vnode)
  if (format & FORMAT_BOLD) vnode = h('strong', {}, vnode)
  if (format & FORMAT_ITALIC) vnode = h('em', {}, vnode)
  if (format & FORMAT_UNDERLINE) vnode = h('u', {}, vnode)
  if (format & FORMAT_STRIKETHROUGH) vnode = h('s', {}, vnode)

  return vnode
}

const renderNodes = (nodes: LexicalNode[] = []): Array<VNode | string> =>
  nodes.map((node, index) => renderNode(node, index))

const renderNode = (node: LexicalNode, index = 0): VNode | string => {
  switch (node.type) {
    case 'text':
      return renderText(node)
    case 'linebreak':
      return h('br')
    case 'link':
    case 'autolink':
      return h(
        'a',
        { key: index, href: String(node.url ?? '#'), rel: 'noopener noreferrer' },
        renderNodes(node.children),
      )
    case 'paragraph':
      return h('p', { key: index }, renderNodes(node.children))
    case 'heading': {
      const tag = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(String(node.tag))
        ? String(node.tag)
        : 'h2'
      return h(tag, { key: index }, renderNodes(node.children))
    }
    case 'list': {
      const tag = node.listType === 'number' ? 'ol' : 'ul'
      return h(tag, { key: index }, renderNodes(node.children))
    }
    case 'listitem':
      return h('li', { key: index }, renderNodes(node.children))
    case 'quote':
      return h('blockquote', { key: index }, renderNodes(node.children))
    default:
      return h('span', { key: index }, renderNodes(node.children))
  }
}

export default defineComponent({
  name: 'RichText',
  props: {
    data: {
      type: [Object, String] as PropType<LexicalRichText | string | null>,
      default: null,
    },
  },
  setup(props) {
    const children = computed(() => {
      if (!props.data) return []
      if (typeof props.data === 'string') return [props.data]
      return renderNodes(props.data.root?.children ?? [])
    })

    return () => children.value
  },
})
</script>
