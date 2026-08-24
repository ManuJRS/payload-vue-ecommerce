import type { Block, Field } from 'payload'

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

export const Banner: Block = {
  slug: 'banner',
  interfaceName: 'BannerBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      required: true,
    },
    {
      name: 'description',
      type: 'text',
      label: 'Description',
    },
    {
      name: 'button',
      type: 'group',
      label: 'Botón',
      fields: buttonFields,
    },
  ],
}
