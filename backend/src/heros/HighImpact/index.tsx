'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'

export const HighImpactHero: React.FC<Page['hero']> = ({
  description,
  media,
  primaryButton,
  secondaryButton,
  tag,
  title,
}) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('dark')
  })

  const buttons = [primaryButton, secondaryButton].filter(
    (button) => button?.label && (button?.url || button?.reference),
  )

  return (
    <div
      className="relative -mt-[10.4rem] flex items-center justify-center text-white"
      data-theme="dark"
    >
      <div className="container mb-8 z-10 relative flex items-center justify-center">
        <div className="max-w-146 md:text-center">
          {tag && <p className="mb-2 text-sm uppercase tracking-widest">{tag}</p>}
          {title && <h1 className="mb-4 text-4xl font-semibold">{title}</h1>}
          {description && <p className="mb-6">{description}</p>}
          {buttons.length > 0 && (
            <ul className="flex md:justify-center gap-4">
              {buttons.map((button, i) => (
                <li key={i}>
                  <CMSLink {...button} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="min-h-[80vh] select-none">
        {media && typeof media === 'object' && (
          <Media fill imgClassName="-z-10 object-cover" priority resource={media} />
        )}
      </div>
    </div>
  )
}
