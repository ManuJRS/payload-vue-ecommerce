import type { Block } from 'payload'

export const FeaturedProducts: Block = {
  slug: 'featuredProducts',
  interfaceName: 'FeaturedProductsBlock',
  labels: {
    singular: 'Featured Products',
    plural: 'Featured Products',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      defaultValue: 'Completa el look',
    },
    {
      name: 'products',
      type: 'relationship',
      admin: {
        isSortable: true,
      },
      filterOptions: ({ id }) => {
        if (id) {
          return {
            id: {
              not_in: [id],
            },
          }
        }

        return {
          id: {
            exists: true,
          },
        }
      },
      hasMany: true,
      label: 'Productos relacionados',
      relationTo: 'products',
    },
  ],
}
