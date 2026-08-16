import type { StaticImageData } from 'next/image'

import { cn } from '@/utilities/cn'
import React from 'react'
import { RichText } from '@/components/RichText'
import { CMSLink } from '@/components/Link'
import type { MediaBlock as MediaBlockProps } from '@/payload-types'

import { Media } from '../../components/Media'

export const MediaBlock: React.FC<
  MediaBlockProps & {
    id?: string | number
    breakout?: boolean
    captionClassName?: string
    className?: string
    enableGutter?: boolean
    imgClassName?: string
    staticImage?: StaticImageData
    disableInnerContainer?: boolean
  }
> = (props) => {
  const {
    button,
    captionClassName,
    className,
    description,
    enableGutter = true,
    imagePosition = 'left',
    imgClassName,
    media,
    staticImage,
    tag,
    title,
  } = props

  const hasButton = Boolean(button?.label && (button?.url || button?.reference))
  const imageOnRight = imagePosition === 'right'

  const image = (
    <div className="aspect-square overflow-hidden rounded-xl md:aspect-[4/5]">
      <Media
        imgClassName={cn('h-full w-full object-cover', imgClassName)}
        resource={media}
        src={staticImage}
      />
    </div>
  )

  const content = (
    <div className="flex flex-col justify-center">
      {tag && (
        <span className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
          {tag}
        </span>
      )}
      {title && <h2 className="mb-6 text-3xl font-semibold tracking-tight">{title}</h2>}
      {description && (
        <RichText className={cn('mb-8 text-lg text-muted-foreground', captionClassName)} data={description} enableGutter={false} />
      )}
      {hasButton && button && (
        <CMSLink
          className="inline-flex items-center font-medium hover:opacity-80"
          appearance="inline"
          label={button.label}
          newTab={button.newTab}
          reference={button.reference}
          type={button.type}
          url={button.url}
        />
      )}
    </div>
  )

  return (
    <section
      className={cn(
        'w-full py-16',
        {
          container: enableGutter,
        },
        className,
      )}
    >
      <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
        {imageOnRight ? (
          <>
            {content}
            {image}
          </>
        ) : (
          <>
            {image}
            {content}
          </>
        )}
      </div>
    </section>
  )
}
