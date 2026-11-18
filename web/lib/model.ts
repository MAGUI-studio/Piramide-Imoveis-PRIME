export type Photo = {
  alt: string
  caption?: string
  asset?: {_ref: string}
  crop?: {top: number; bottom: number; left: number; right: number}
  hotspot?: {x: number; y: number; width: number; height: number}
}

export type MarqueeItem = {_key: string; title: string; description: string}
export type HomeStat = {_key: string; label: string; value: number; prefix?: string | null; suffix?: string | null}
export type PropertyTypeOption = {id: string; name: string; image?: Photo | null}
export type PropertyQuestion = {_key: string; question: string; answer: string}
export type Seo = {title?: string | null; description?: string | null; socialImage?: Photo | null}
export const catalogPageSize = 10
export type PropertyVideo = {_key: string; title: string; url: string; poster?: Photo | null; opening?: boolean | null}

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

export type PropertyAddress = {
  street?: string | null
  number?: string | null
  complement?: string | null
  state?: string | null
  postalCode?: string | null
  point?: {lat: number; lng: number} | null
  approximate?: boolean | null
}

export type Property = PropertyCard & {
  seo?: Seo | null
  noIndex?: boolean | null
  address?: PropertyAddress | null
  architect?: string | null
  description: string
  gallery: Photo[] | null
  videoGallery?: PropertyVideo[] | null
  sectionPhoto?: Photo | null
  detailsPhoto?: Photo | null
  detailsPhotos?: Photo[] | null
  mediaPhoto?: Photo | null
  mediaVideoPhoto?: Photo | null
  videoTourPhoto?: Photo | null
  faq?: PropertyQuestion[] | null
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
const currencyFormat = new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'})

export function propertyPrice(price?: number | null) {
  return price && price > 0 ? currencyFormat.format(price) : 'Valor sob consulta'
}

export function cardAreaOf({propertyType, specifications}: Pick<PropertyCard, 'propertyType' | 'specifications'>) {
  const area = specifications?.area
  const land = specifications?.landArea
  const isLand = propertyType === 'Terreno' || propertyType === 'Loteamento'
  const value = (isLand ? [land, area] : [area, land]).find((item) => typeof item === 'number' && item > 0)
  return value == null ? '' : numberFormat.format(value) + ' m²'
}

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
  const cleanPhone = phone
  const code = refCode?.trim() ? ' (Cód. ' + refCode.trim() + ')' : ''
  const message = property
    ? 'Olá! Gostaria de saber mais sobre o imóvel ' + property + code + '.'
    : 'Olá! Gostaria de conversar sobre os imóveis da Pirâmide Imóveis Prime.'
  return 'https://wa.me/' + cleanPhone + '?text=' + encodeURIComponent(message)
}
