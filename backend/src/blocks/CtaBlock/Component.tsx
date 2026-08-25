import React from 'react'

import type { CtaBlock as CtaBlockProps } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/cn'

export const CtaBlockComponent: React.FC<
  CtaBlockProps & {
    id?: string | number
    className?: string
  }
> = ({ button, className, description, title }) => {
  const hasButton = Boolean(button?.label && (button?.url || button?.reference))

  return (
    <section className={cn('relative w-full overflow-hidden bg-slate-50 py-16 sm:py-24', className)}>
      <div className="pointer-events-none absolute inset-y-0 right-0 z-0 w-1/2 bg-gradient-to-l from-slate-200/80 to-transparent opacity-50" />
      <div className="container relative z-10 text-center">
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm sm:p-12">
          {title && (
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {title}
            </h2>
          )}
          {description && (
            <p className="mb-8 text-base leading-relaxed text-slate-600 sm:text-lg">{description}</p>
          )}
          {hasButton && button && (
            <CMSLink
              appearance="inline"
              className="inline-flex h-14 w-full items-center justify-center rounded-md bg-slate-900 px-10 text-sm font-medium text-white transition-colors duration-200 hover:bg-slate-800 sm:w-auto"
              label={button.label}
              newTab={button.newTab}
              reference={button.reference}
              type={button.type}
              url={button.url}
            />
          )}
        </div>
      </div>
    </section>
  )
}
