import React from 'react'
import type { DefaultDocumentIDType } from 'payload'
import type { Media, ThreeCardGridBlock as ThreeCardGridBlockProps } from '@/payload-types'
import { Media as MediaComponent } from '@/components/Media'

export const ThreeCardGridBlock: React.FC<
  ThreeCardGridBlockProps & {
    id?: DefaultDocumentIDType
    className?: string
  }
> = ({ className, items, title }) => {
  if (!items?.length) return null

  return (
    <section className={className ?? 'w-full bg-slate-100 py-16'}>
      <div className="container">
        {title && (
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
          </div>
        )}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {items.map((item, index) => {
            const icon = typeof item.svg === 'object' ? (item.svg as Media) : null

            return (
              <article
                key={item.id || index}
                className="flex flex-col items-start rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
              >
                {icon && (
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-900">
                    <MediaComponent
                      resource={icon}
                      imgClassName="h-6 w-6 object-contain"
                      className="flex h-6 w-6 items-center justify-center"
                    />
                  </div>
                )}
                {item.title && (
                  <h3 className="mb-3 text-[20px] font-semibold leading-tight">{item.title}</h3>
                )}
                {item.description && (
                  <p className="text-base text-muted-foreground">{item.description}</p>
                )}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
