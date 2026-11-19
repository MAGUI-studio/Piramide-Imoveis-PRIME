import type {PropertyCard} from './model'

export function similarPropertiesOf(current: PropertyCard, candidates: PropertyCard[]): PropertyCard[] {
  const unique = new Map<string, PropertyCard>()
  for (const item of candidates) {
    if (item.slug && item.slug !== current.slug && item.id.replace(/^drafts\./, '') !== current.id.replace(/^drafts\./, '') && item.cover?.asset?._ref && item.availability !== 'sold' && !unique.has(item.slug)) unique.set(item.slug, item)
  }
  return [...unique.values()].map((item) => {
    const type = !!current.propertyType && item.propertyType === current.propertyType
    const condo = !!current.condominium?.id && item.condominium?.id === current.condominium.id
    const neighborhood = !!current.neighborhood?.id && item.neighborhood?.id === current.neighborhood.id
    const city = !!current.city?.id && item.city?.id === current.city.id
    let score = (type ? 100 : 0) + (condo ? 70 : 0) + (neighborhood ? 30 : 0) + (city ? 15 : 0)
    if (current.price && current.price > 0 && item.price && item.price > 0) score += 12 * Math.min(current.price, item.price) / Math.max(current.price, item.price)
    if (item.availability !== 'reserved') score += 2
    return {item, score, related: type || condo || neighborhood || city}
  }).filter(({related}) => related).sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title, 'pt-BR') || a.item.id.localeCompare(b.item.id)).slice(0, 3).map(({item}) => item)
}
