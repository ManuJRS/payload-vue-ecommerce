import type { Category, Media, Product, VariantOption, VariantType } from '@/payload-types'
import { RequiredDataFromCollectionSlug } from 'payload'

type ProductArgs = {
  galleryImages: NonNullable<Product['gallery']>
  metaImage: Media
  contentImage: Media
  variantTypes: VariantType[]
  categories: Category[]
  relatedProducts: Product[]
}

export const productTshirtData: (
  args: ProductArgs,
) => RequiredDataFromCollectionSlug<'products'> = ({
  galleryImages,
  relatedProducts,
  metaImage,
  contentImage,
  variantTypes,
  categories,
}) => {
  return {
    enableVariants: true,
    variantTypes: variantTypes,
    inventory: 0,
    meta: {
      title: 'Tshirt | Payload Ecommerce Template',
      image: metaImage,
      description:
        'Top off your look with our classic Tshirt, crafted for style and comfort. Made with breathable, high-quality materials and an adjustable strap for the perfect fit.',
    },
    _status: 'published',
    layout: [
      {
        blockType: 'mediaBlock',
        tag: 'Details',
        title: 'Crafted for everyday wear',
        description: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Soft cotton construction with a clean silhouette designed for comfort and longevity.',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                textFormat: 0,
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
        button: {
          type: 'custom',
          label: 'Shop collection',
          url: '/shop',
          newTab: false,
        },
        media: contentImage,
        imagePosition: 'left',
      },
      {
        blockType: 'content',
        title: 'Classic unisex tee',
        description: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'This is a 100% cotton unisex fitted tee with a screen printed design. Breathable, high-quality materials made for everyday wear.',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                textFormat: 0,
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
      },
    ],
    categories: categories,
    description: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Top off your look with our classic hat, crafted for style and comfort. Made with breathable, high-quality materials and an adjustable strap for the perfect fit, it’s ideal for everyday wear or outdoor adventures. Available in a range of colors to match any outfit.',
                type: 'text',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'paragraph',
            version: 1,
            textFormat: 0,
            textStyle: '',
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    },
    gallery: galleryImages,
    title: 'Tshirt',
    slug: 'tshirt',
    priceInUSDEnabled: true,
    priceInUSD: 4999,
    relatedProducts: relatedProducts,
  }
}

type ProductVariantArgs = {
  product: Product
  variantOptions: VariantOption[]
  inventory?: number
  priceInUSD?: number
}

export const productTshirtVariant: (
  args: ProductVariantArgs,
) => RequiredDataFromCollectionSlug<'variants'> = ({
  product,
  variantOptions,
  inventory = 492,
  priceInUSD = 4999,
}) => {
  return {
    product: product,
    options: variantOptions,
    inventory,
    priceInUSDEnabled: true,
    priceInUSD,
    _status: 'published',
  }
}
