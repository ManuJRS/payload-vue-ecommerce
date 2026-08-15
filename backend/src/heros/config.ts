import type { Field } from 'payload'

const heroButtonFields: Field[] = [
  {
    name: 'label',
    type: 'text',
    label: 'Texto',
  },
  {
    name: 'url',
    type: 'text',
    label: 'Enlace',
  },
  {
    name: 'newTab',
    type: 'checkbox',
    label: 'Abrir en nueva pestaña',
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
