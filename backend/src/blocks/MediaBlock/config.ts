import type { Block, Field } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { normalizeLexicalInlineFormats } from '@/utilities/normalizeLexicalInlineFormats'

const buttonFields: Field[] = [
  {
    type: 'row',
    fields: [
      {
        name: 'type',
        type: 'radio',
        admin: {
          layout: 'horizontal',
          width: '50%',
        },
        defaultValue: 'custom',
        options: [
          {
            label: 'Enlace interno',
            value: 'reference',
          },
          {
            label: 'URL personalizada',
            value: 'custom',
          },
        ],
      },
      {
        name: 'newTab',
        type: 'checkbox',
        admin: {
          style: {
            alignSelf: 'flex-end',
          },
          width: '50%',
        },
        label: 'Abrir en nueva pestaña',
      },
    ],
  },
  {
    type: 'row',
    fields: [
      {
        name: 'reference',
        type: 'relationship',
        admin: {
          condition: (_, siblingData) => siblingData?.type === 'reference',
          width: '50%',
        },
        label: 'Página o producto',
        maxDepth: 1,
        relationTo: ['pages', 'products'],
      },
      {
        name: 'url',
        type: 'text',
        admin: {
          condition: (_, siblingData) => siblingData?.type === 'custom',
          width: '50%',
        },
        label: 'URL',
      },
      {
        name: 'label',
        type: 'text',
        admin: {
          width: '50%',
        },
        label: 'Texto',
      },
    ],
  },
]

export const MediaBlock: Block = {
  slug: 'mediaBlock',
  interfaceName: 'MediaBlock',
  fields: [
    {
      name: 'tag',
      type: 'text',
      label: 'Tag',
    },
    {
      name: 'title',
      type: 'text',
      label: 'Title',
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Description',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
      hooks: {
        beforeChange: [({ value }) => normalizeLexicalInlineFormats(value)],
      },
    },
    {
      name: 'button',
      type: 'group',
      label: 'Botón',
      fields: buttonFields,
    },
    {
      name: 'media',
      type: 'upload',
      label: 'Imagen',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'imagePosition',
      type: 'select',
      label: 'Posición de la imagen',
      defaultValue: 'left',
      options: [
        {
          label: 'Izquierda',
          value: 'left',
        },
        {
          label: 'Derecha',
          value: 'right',
        },
      ],
      required: true,
    },
  ],
}
