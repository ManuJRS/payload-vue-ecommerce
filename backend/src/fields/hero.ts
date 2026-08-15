import type { Field } from 'payload'

const heroButtonFields: Field[] = [
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

export const hero: Field = {
  name: 'hero',
  type: 'group',
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'lowImpact',
      label: 'Type',
      options: [
        {
          label: 'None',
          value: 'none',
        },
        {
          label: 'High Impact',
          value: 'highImpact',
        },
        {
          label: 'Medium Impact',
          value: 'mediumImpact',
        },
        {
          label: 'Medium',
          value: 'medium',
        },
        {
          label: 'Low Impact',
          value: 'lowImpact',
        },
      ],
      required: true,
    },
    {
      name: 'media',
      type: 'upload',
      label: 'Imagen',
      relationTo: 'media',
      required: false,
    },
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
      type: 'textarea',
      label: 'Description',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'primaryButton',
          type: 'group',
          label: 'Botón 1',
          admin: {
            width: '50%',
          },
          fields: heroButtonFields,
        },
        {
          name: 'secondaryButton',
          type: 'group',
          label: 'Botón 2',
          admin: {
            width: '50%',
          },
          fields: heroButtonFields,
        },
      ],
    },
  ],
  label: false,
}
