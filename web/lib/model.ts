export type Photo = {
  alt: string
  asset?: {_ref: string}
  crop?: {top: number; bottom: number; left: number; right: number}
  hotspot?: {x: number; y: number; width: number; height: number}
}

export type MarqueeItem = {_key: string; title: string; description: string}

export type PropertyCard = {
  id: string
  title: string
  slug: string
  propertyType: string
  specifications?: {
    bedrooms?: number
    bathrooms?: number
    suites?: number
    parking?: number
    area?: number
  } | null
  city: {id: string; name: string} | null
  neighborhood: {id: string; name: string} | null
  summary: string
  attributes: string[] | null
  cover: Photo
  createdAt: string
}

export type Property = PropertyCard & {
  description: string
  gallery: Photo[] | null
  features: string[] | null
  price: number | null
  clip: string | null
  tour: string | null
  clipIsPlaceholder: boolean
  tourIsPlaceholder: boolean
  template: 'editorial' | 'immersive' | 'mosaic'
}

export function locationOf(property: Pick<PropertyCard, 'neighborhood' | 'city'>) {
  return [property.neighborhood?.name, property.city?.name].filter(Boolean).join(', ')
}

export function whatsappLink(phone: string | null, property?: string) {
  if (!phone || !/^[1-9]\d{9,14}$/.test(phone)) return null
  const message = property
    ? 'Olá! Gostaria de saber mais sobre o empreendimento ' + property + '.'
    : 'Olá! Gostaria de conversar sobre os empreendimentos da Pirâmide PRIME.'
  return 'https://wa.me/' + phone + '?text=' + encodeURIComponent(message)
}
