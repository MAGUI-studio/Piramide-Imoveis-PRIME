import type {PropertyCard} from './model'

/** Preserve editorial order, skip missing/unpublished references and enforce the slot limit. */
export function selectHomeProperties(items: (PropertyCard | null)[], limit: number) {
  const selected = new Map<string, PropertyCard>()
  for (const item of items) {
    if (item?.id && item.slug && item.cover?.asset?._ref && !selected.has(item.id)) selected.set(item.id, item)
    if (selected.size === limit) break
  }
  return [...selected.values()]
}
