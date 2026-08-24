import type { BannerBlock as BannerBlockProps } from '@/payload-types'
import { cn } from '@/utilities/cn'
import React from 'react'
import { CMSLink } from '@/components/Link'

export const BannerBlock: React.FC<
  BannerBlockProps & {
    id?: string | number
    className?: string
  }
> = ({ button, className, description, title }) => {
  const hasButton = Boolean(button?.label && (button?.url || button?.reference))

  return (
    <section className={cn('my-8 w-full bg-slate-900 py-8 text-white', className)}>
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="text-center md:text-left">
          {title && (
            <h3 className="text-xl font-bold tracking-tight text-white sm:text-2xl">{title}</h3>
          )}
          {description && <p className="mt-1 text-base text-white/80">{description}</p>}
        </div>

        {hasButton && button && (
          <CMSLink
            appearance="inline"
            className="inline-flex h-10 items-center justify-center rounded bg-white px-6 text-sm font-medium text-slate-900 transition-colors duration-200 hover:bg-slate-100"
            label={button.label}
            newTab={button.newTab}
            reference={button.reference}
            type={button.type}
            url={button.url}
          />
        )}
      </div>
    </section>
  )
}
