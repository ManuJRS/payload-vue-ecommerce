import React from 'react'

import type { Page } from '@/payload-types'

type LowImpactHeroType =
  | {
      children?: React.ReactNode
      description?: never
      title?: never
    }
  | (Page['hero'] & {
      children?: never
    })

export const LowImpactHero: React.FC<LowImpactHeroType> = ({ children, description, tag, title }) => {
  return (
    <div className="container mt-16">
      <div className="max-w-3xl">
        {children || (
          <>
            {tag && <p className="mb-2 text-sm uppercase tracking-widest">{tag}</p>}
            {title && <h1 className="mb-4 text-4xl font-semibold">{title}</h1>}
            {description && <p>{description}</p>}
          </>
        )}
      </div>
    </div>
  )
}
