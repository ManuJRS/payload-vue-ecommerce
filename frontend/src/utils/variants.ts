import type {
  ProductVariant,
  ProductVariantsField,
  VariantOption,
  VariantTypeGroup,
  VariantTypeRef,
} from '@/types/variants'
import type { Product } from '@/services/payloadService'

type ProductWithVariants = Product & ProductVariantsField

const isVariantOption = (value: unknown): value is VariantOption =>
  typeof value === 'object' &&
  value !== null &&
  'id' in value &&
  'label' in value &&
  typeof (value as VariantOption).label === 'string'

const isProductVariant = (value: unknown): value is ProductVariant =>
  typeof value === 'object' && value !== null && 'id' in value

export const normalizeProductVariants = (product?: ProductWithVariants | null): ProductVariant[] => {
  const docs = product?.variants?.docs ?? []
  return docs.filter(isProductVariant)
}

const getVariantTypeFromOption = (option: VariantOption) => {
  const variantType = option.variantType
  if (typeof variantType === 'object' && variantType !== null) {
    return {
      id: variantType.id,
      label: variantType.label,
      name: variantType.name,
    }
  }

  return {
    id: variantType ?? option.id,
    label: 'Opción',
    name: 'option',
  }
}

const addOptionToGroup = (groups: Map<string, VariantTypeGroup>, option: VariantOption) => {
  const type = getVariantTypeFromOption(option)
  const key = String(type.id)

  if (!groups.has(key)) {
    groups.set(key, {
      id: type.id,
      label: type.label,
      name: type.name,
      options: [],
    })
  }

  const group = groups.get(key)!
  if (!group.options.some((entry) => String(entry.id) === String(option.id))) {
    group.options.push(option)
  }
}

const buildGroupsFromVariantTypes = (product: ProductWithVariants): VariantTypeGroup[] => {
  const types = product.variantTypes ?? []
  const variants = normalizeProductVariants(product)
  const groups = new Map<string, VariantTypeGroup>()

  for (const typeEntry of types) {
    if (typeof typeEntry !== 'object' || typeEntry === null) continue

    const type = typeEntry as VariantTypeRef
    groups.set(String(type.id), {
      id: type.id,
      label: type.label,
      name: type.name,
      options: [],
    })
  }

  for (const variant of variants) {
    for (const optionEntry of variant.options ?? []) {
      if (!isVariantOption(optionEntry)) continue
      addOptionToGroup(groups, optionEntry)
    }
  }

  return Array.from(groups.values()).filter((group) => group.options.length > 0)
}

const buildGroupsFromVariants = (product: ProductWithVariants): VariantTypeGroup[] => {
  const groups = new Map<string, VariantTypeGroup>()

  for (const variant of normalizeProductVariants(product)) {
    for (const optionEntry of variant.options ?? []) {
      if (!isVariantOption(optionEntry)) continue
      addOptionToGroup(groups, optionEntry)
    }
  }

  return Array.from(groups.values())
}

export const getVariantTypeGroups = (product?: ProductWithVariants | null): VariantTypeGroup[] => {
  if (!product) return []

  const fromTypes = buildGroupsFromVariantTypes(product)
  if (fromTypes.length > 0) return fromTypes

  return buildGroupsFromVariants(product)
}

export const productHasVariants = (product?: ProductWithVariants | null) =>
  normalizeProductVariants(product).length > 0

export const getOptionIds = (variant: ProductVariant) =>
  (variant.options ?? [])
    .map((option) => (isVariantOption(option) ? option.id : option))
    .filter((id): id is number | string => id != null)

export const findVariantBySelectedOptions = (
  variants: ProductVariant[],
  selectedOptions: Record<string, number | string>,
) => {
  const selectedIds = Object.values(selectedOptions).map(String)
  if (selectedIds.length === 0) return null

  return (
    variants.find((variant) => {
      const optionIds = getOptionIds(variant).map(String)
      return (
        selectedIds.every((id) => optionIds.includes(id)) &&
        optionIds.length === selectedIds.length
      )
    }) ?? null
  )
}

export const getInitialSelectedOptions = (groups: VariantTypeGroup[]) => {
  const initial: Record<string, number | string> = {}
  for (const group of groups) {
    const first = group.options[0]
    if (first) initial[String(group.id)] = first.id
  }
  return initial
}

export const getVariantOptionLabel = (variant?: ProductVariant | null) => {
  if (!variant) return null
  const labels = (variant.options ?? [])
    .filter(isVariantOption)
    .map((option) => option.label)
    .filter(Boolean)

  return labels.length > 0 ? labels.join(' / ') : variant.title ?? null
}

export const isColorVariantType = (group: VariantTypeGroup) =>
  group.name.toLowerCase().includes('color') || group.label.toLowerCase().includes('color')

const colorMap: Record<string, string> = {
  rojo: '#dc2626',
  red: '#dc2626',
  azul: '#1e3a8a',
  blue: '#1e3a8a',
  amarillo: '#eab308',
  yellow: '#eab308',
  negro: '#111111',
  black: '#111111',
  blanco: '#ffffff',
  white: '#ffffff',
  verde: '#064e3b',
  green: '#064e3b',
  gris: '#78716c',
  grey: '#78716c',
  gray: '#78716c',
}

export const getOptionSwatchColor = (option: VariantOption) =>
  colorMap[option.value.toLowerCase()] ?? colorMap[option.label.toLowerCase()] ?? '#94a3b8'

export const variantHasStock = (variant?: ProductVariant | null) =>
  typeof variant?.inventory === 'number' ? variant.inventory > 0 : true
