import React from 'react'
import type { DefaultDocumentIDType } from 'payload'
import type { ContentBlock as ContentBlockProps } from '@/payload-types'
import { RichText } from '@/components/RichText'

export const ContentBlock: React.FC<
  ContentBlockProps & {
    id?: DefaultDocumentIDType
    className?: string
  }
> = ({ className, description, title }) => {
  if (!title && !description) return null

  return (
    <section className={className ?? 'container my-16 text-center'}>
      <div className="mx-auto max-w-3xl">
        {title && <h2 className="mb-6 text-3xl font-semibold tracking-tight">{title}</h2>}
        {description && (
          <RichText
            className="text-lg text-muted-foreground"
            data={description}
            enableGutter={false}
          />
        )}
      </div>
    </section>
  )
}
