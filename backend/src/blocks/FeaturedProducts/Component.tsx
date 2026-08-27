import type { FeaturedProductsBlock as FeaturedProductsBlockProps, Media, Product } from '@/payload-types'
import { GridTileImage } from '@/components/Grid/tile'
import Link from 'next/link'
import React from 'react'
import type { DefaultDocumentIDType } from 'payload'

const resolveGalleryMedia = (product: Product) => {
  const image = product.gallery?.[0]?.image
  return typeof image === 'object' ? (image as Media) : undefined
}

export const FeaturedProductsBlock: React.FC<
  FeaturedProductsBlockProps & {
    id?: DefaultDocumentIDType
    className?: string
  }
> = ({ products, title }) => {
  const items = (products ?? []).filter(
    (product): product is Product => typeof product === 'object' && product !== null,
  )

  if (items.length === 0) return null

  return (
    <section className="container mt-16 border-t border-border pt-12">
      <h2 className="mb-8 text-2xl font-semibold tracking-tight text-foreground">
        {title || 'Completa el look'}
      </h2>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {items.map((product) => {
          const media = resolveGalleryMedia(product)

          return (
            <Link
              key={product.id}
              className="group block"
              href={`/products/${product.slug}`}
            >
              <div className="relative mb-4 aspect-[3/4] overflow-hidden rounded-lg bg-muted transition-shadow duration-300 group-hover:shadow-lg">
                {media ? <GridTileImage media={media} /> : null}
              </div>
              <h3 className="text-base font-medium text-foreground">{product.title}</h3>
              {typeof product.priceInUSD === 'number' && (
                <p className="text-base text-muted-foreground">
                  ${(product.priceInUSD / 100).toFixed(0)}
                </p>
              )}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
