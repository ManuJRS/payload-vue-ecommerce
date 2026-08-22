import type {
  Category,
  Product,
  ArchiveBlock as ArchiveBlockProps,
} from '@/payload-types'

import configPromise from '@payload-config'
import { DefaultDocumentIDType, getPayload } from 'payload'
import React from 'react'

import { CollectionArchive } from '@/components/CollectionArchive'

export const ArchiveBlock: React.FC<
  ArchiveBlockProps & {
    id?: DefaultDocumentIDType
    className?: string
  }
> = async (props) => {
  const {
    id,
    categories,
    limit: limitFromProps,
    populateBy,
    relationTo = 'products',
    selectedDocs,
    title,
  } = props

  const limit = limitFromProps || 3
  const payload = await getPayload({ config: configPromise })

  let products: Product[] = []
  let categoryItems: Category[] = []

  if (populateBy === 'collection' && relationTo === 'categories') {
    const fetchedCategories = await payload.find({
      collection: 'categories',
      depth: 1,
      limit,
    })
    categoryItems = fetchedCategories.docs
  } else if (populateBy === 'collection') {
    const flattenedCategories = categories?.map((category) => {
      if (typeof category === 'object') return category.id
      else return category
    })

    const fetchedProducts = await payload.find({
      collection: 'products',
      depth: 1,
      limit,
      ...(flattenedCategories && flattenedCategories.length > 0
        ? {
            where: {
              categories: {
                in: flattenedCategories,
              },
            },
          }
        : {}),
    })

    products = fetchedProducts.docs
  } else if (selectedDocs?.length) {
    for (const doc of selectedDocs) {
      if (typeof doc.value !== 'object' || !doc.value) continue
      if (doc.relationTo === 'categories') {
        categoryItems.push(doc.value as Category)
      } else {
        products.push(doc.value as Product)
      }
    }
  }

  return (
    <div className="my-16" id={`block-${id}`}>
      {title && (
        <div className="container mb-8 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
        </div>
      )}
      {categoryItems.length > 0 ? (
        <div className="container grid auto-rows-[250px] grid-cols-1 gap-6 md:grid-cols-4">
          {categoryItems.map((category, index) => {
            const image = typeof category.image === 'object' ? category.image : null
            const tileClass =
              index === 0
                ? 'md:col-span-2 md:row-span-2'
                : index === 1
                  ? 'md:col-span-2 md:row-span-1'
                  : 'md:col-span-1 md:row-span-1'

            return (
              <div
                key={category.id}
                className={`relative overflow-hidden rounded-xl ${tileClass}`}
              >
                {image?.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image.url} alt={category.title} className="h-full w-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/20" />
                <div className={`absolute z-10 ${index === 0 ? 'bottom-8 left-8' : 'bottom-6 left-6'}`}>
                  <h3 className={index === 0 ? 'mb-2 text-3xl font-semibold text-white' : 'text-xl font-semibold text-white'}>
                    {category.title}
                  </h3>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <CollectionArchive posts={products} />
      )}
    </div>
  )
}
