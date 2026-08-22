import type { Block } from 'payload'

export const ThreeCardGrid: Block = {
  slug: 'threeCardGrid',
  interfaceName: 'ThreeCardGridBlock',
  labels: {
    plural: 'Three Card Grids',
    singular: 'Three Card Grid',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
    },
    {
      name: 'items',
      type: 'array',
      label: 'Cards',
      minRows: 3,
      maxRows: 3,
      labels: {
        singular: 'Card',
        plural: 'Cards',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Title',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Description',
          required: true,
        },
        {
          name: 'svg',
          type: 'upload',
          label: 'Icono SVG',
          relationTo: 'media',
          admin: {
            description: 'Sube un archivo SVG desde Media.',
          },
        },
      ],
    },
  ],
}
