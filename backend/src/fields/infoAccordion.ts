import {
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { Field } from 'payload'

import { normalizeLexicalInlineFormats } from '@/utilities/normalizeLexicalInlineFormats'

const infoAccordionRichTextHooks = {
  beforeChange: [({ value }: { value: unknown }) => normalizeLexicalInlineFormats(value)],
}

const infoAccordionContentEditor = lexicalEditor({
  features: ({ rootFeatures }) => [
    ...rootFeatures,
    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
    FixedToolbarFeature(),
    InlineToolbarFeature(),
    HorizontalRuleFeature(),
  ],
})

export const infoAccordionField: Field = {
  name: 'infoAccordion',
  type: 'array',
  label: 'Acordeón de información',
  admin: {
    description:
      'Secciones desplegables en la ficha de producto (envíos, devoluciones, garantía, etc.).',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Título',
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Contenido',
      editor: infoAccordionContentEditor,
      hooks: infoAccordionRichTextHooks,
      required: true,
    },
  ],
}
