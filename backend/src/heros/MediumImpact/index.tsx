import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { RichText } from '@/components/RichText'

export const MediumImpactHero: React.FC<Page['hero']> = ({
  description,
  media,
  primaryButton,
  secondaryButton,
  tag,
  title,
}) => {
  const buttons = [primaryButton, secondaryButton].filter(
    (button) => button?.label && (button?.url || button?.reference),
  )

  return (
    <div className="">
      <div className="container mb-8">
        {tag && <p className="mb-2 text-sm uppercase tracking-widest">{tag}</p>}
        {title && <h1 className="mb-4 text-4xl font-semibold">{title}</h1>}
        {description && <p className="mb-6">{description}</p>}

        {buttons.length > 0 && (
          <ul className="flex gap-4">
            {buttons.map((button, i) => (
              <li key={i}>
                <CMSLink {...button} />
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="container ">
        {media && typeof media === 'object' && (
          <div>
            <Media
              className="-mx-4 md:-mx-8 2xl:-mx-16"
              imgClassName=""
              priority
              resource={media}
            />
            {media?.caption && (
              <div className="mt-3">
                <RichText data={media.caption} enableGutter={false} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
