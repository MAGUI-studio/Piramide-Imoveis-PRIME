export type Photo = {
  alt: string
  asset?: {_ref: string}
  crop?: {top: number; bottom: number; left: number; right: number}
  hotspot?: {x: number; y: number; width: number; height: number}
}

export type MarqueeItem = {_key: string; title: string; description: string}

export type Availability = 'available' | 'reserved' | 'sold'

export type Specifications = {
  area?: number
  landArea?: number
  bedrooms?: number
  suites?: number
  bathrooms?: number
  lavabos?: number
  parking?: number
  coveredParking?: number
  floorProfile?: string
  sunOrientation?: string
  hasOffice?: boolean
  hasHobbyBox?: boolean
  hasEvCharger?: boolean
}

export type PropertyConditions = {
  exclusive?: boolean
  furnished?: boolean
  acceptsTrade?: boolean
  acceptsFinancing?: boolean
}

export type PropertyCard = {
  id: string
  title: string
  refCode?: string | null
  slug: string
  propertyType: string
  condominiumName?: string | null
  availability?: Availability | null
  price?: number | null
  conditions?: PropertyConditions | null
  specifications?: Specifications | null
  city: {id: string; name: string} | null
  neighborhood: {id: string; name: string} | null
  summary: string
  attributes: string[] | null
  cover: Photo
  createdAt: string
}

export type Property = PropertyCard & {
  architect?: string | null
  description: string
  gallery: Photo[] | null
  features: string[] | null
  condoFeatures?: string[] | null
  condoFee?: number | null
  iptu?: number | null
  externalListingUrl?: string | null
  clip: string | null
  tour: string | null
  externalVideoUrl?: string | null
  virtualTourUrl?: string | null
  template: 'editorial' | 'immersive' | 'mosaic'
}

const numberFormat = new Intl.NumberFormat('pt-BR')

export function locationOf(
  property: Pick<PropertyCard, 'neighborhood' | 'city'> & {condominiumName?: string | null; title?: string},
) {
  const place = [property.neighborhood?.name, property.city?.name].filter(Boolean).join(', ')
  const condo = property.condominiumName?.trim()
  if (condo && condo.toLowerCase() !== property.title?.trim().toLowerCase()) {
    return [condo, place].filter(Boolean).join(' · ')
  }
  return place
}

export function cardAttributesOf(property: Pick<PropertyCard, 'attributes' | 'specifications'>): string[] {
  if (property.attributes?.length) return property.attributes
  const specs = property.specifications
  if (!specs) return []
  const items: string[] = []
  if (specs.area && specs.area > 0) items.push(numberFormat.format(specs.area) + ' m²')
  else if (specs.landArea && specs.landArea > 0) items.push(numberFormat.format(specs.landArea) + ' m²')
  if (specs.suites && specs.suites > 0) items.push(specs.suites + (specs.suites === 1 ? ' suíte' : ' suítes'))
  else if (specs.bedrooms && specs.bedrooms > 0) items.push(specs.bedrooms + (specs.bedrooms === 1 ? ' dormitório' : ' dormitórios'))
  if (specs.parking && specs.parking > 0) items.push(specs.parking + (specs.parking === 1 ? ' vaga' : ' vagas'))
  else if (specs.floorProfile) items.push(specs.floorProfile)
  return items.slice(0, 3)
}

export function availabilityLabel(availability?: Availability | null) {
  if (availability === 'sold') return 'Vendido'
  if (availability === 'reserved') return 'Reservado'
  return null
}

export function whatsappLink(phone: string | null, property?: string, refCode?: string | null) {
  if (!phone || !/^[1-9]\d{9,14}$/.test(phone)) return null
  const code = refCode?.trim() ? ' (Cód. ' + refCode.trim() + ')' : ''
  const message = property
    ? 'Olá! Gostaria de saber mais sobre o imóvel ' + property + code + '.'
    : 'Olá! Gostaria de conversar sobre os imóveis da Pirâmide PRIME.'
  return 'https://wa.me/' + phone + '?text=' + encodeURIComponent(message)
}
