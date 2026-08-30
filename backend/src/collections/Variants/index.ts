import type { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'
import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { normalizeLexicalInlineFormats } from '@/utilities/normalizeLexicalInlineFormats'

const variantRichTextHooks = {
  beforeChange: [({ value }: { value: unknown }) => normalizeLexicalInlineFormats(value)],
}

const variantShortTextEditor = lexicalEditor({
  features: ({ rootFeatures }) => [
    ...rootFeatures,
    FixedToolbarFeature(),
    InlineToolbarFeature(),
  ],
})

export const VariantsCollection: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  fields: [
    ...defaultCollection.fields,
    {
      type: 'collapsible',
      label: 'Contenido para storefront',
      admin: {
        initCollapsed: false,
      },
      fields: [
        {
          name: 'shortDescription',
          type: 'richText',
          label: 'Descripción corta',
          admin: {
            description:
              'Opcional. Si se deja vacío, se usará la descripción corta del producto base.',
          },
          editor: variantShortTextEditor,
          hooks: variantRichTextHooks,
        },
        {
          name: 'description',
          type: 'richText',
          label: 'Descripción larga',
          admin: {
            description:
              'Opcional. Si se deja vacío, se usará la descripción larga del producto base.',
          },
          editor: lexicalEditor({
            features: ({ rootFeatures }) => [
              ...rootFeatures,
              HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
              FixedToolbarFeature(),
              InlineToolbarFeature(),
            ],
          }),
          hooks: variantRichTextHooks,
        },
        {
          name: 'image',
          type: 'upload',
          label: 'Imagen',
          relationTo: 'media',
          admin: {
            description:
              'Opcional. Si no se sube imagen, se usará la galería del producto base.',
          },
        },
      ],
    },
  ],
})
