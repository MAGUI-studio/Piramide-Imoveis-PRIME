import type {Organization} from './siteSettings'
import type {Metadata} from 'next'
import {picture} from './image'
import {cardAreaOf, type Photo, type Property, type Seo} from './model'
import {getSiteSettings, isPreview, siteUrl} from './sanity'

export const siteName = 'Pirâmide Imóveis Prime'
export const homeTitle = 'Imóveis de alto padrão'
export const homeDescription = 'Conheça casas, apartamentos, coberturas e terrenos de alto padrão. Encontre seu próximo imóvel com a curadoria e o atendimento da Pirâmide Imóveis Prime.'
export const catalogTitle = 'Imóveis de alto padrão'
export const catalogDescription = 'Explore imóveis de alto padrão e compare opções por cidade, bairro, tipo e número de suítes no catálogo da Pirâmide Imóveis Prime.'
export const catalogPath = '/empreendimentos'

export function canonicalUrl(path: string) {
  return new URL(path, siteUrl).href
}

export async function pageMetadata({path, title, description, seo, photo, noIndex = false, titleSuffix = ''}: {
  path: string
  title: string
  description: string
  seo?: Seo | null
  photo?: Photo | null
  noIndex?: boolean
  titleSuffix?: string
}): Promise<Metadata> {
  const pageTitle = (seo?.title?.trim() || title) + titleSuffix + ' | ' + siteName
  const pageDescription = seo?.description?.trim() || description
  const settings = await getSiteSettings(await isPreview())
  const source = seo?.socialImage?.asset ? seo.socialImage : photo?.asset ? photo : settings.homeCta?.image
  const image = source?.asset ? picture(source, 1200 / 630, 1200) : null
  const socialImage = image?.src
    ? {url: image.src, width: 1200, height: 630, alt: image.alt || pageTitle}
    : {url: canonicalUrl('/logos/piramide/icon.png'), alt: siteName}
  const url = canonicalUrl(path)
  return {
    title: {absolute: pageTitle},
    description: pageDescription,
    alternates: {canonical: url},
    robots: noIndex || process.env.VERCEL_ENV === 'preview'
      ? {index: false, follow: true}
      : {index: true, follow: true, 'max-image-preview': 'large'},
    openGraph: {type: 'website', locale: 'pt_BR', siteName, url, title: pageTitle, description: pageDescription, images: [socialImage]},
    twitter: {card: 'summary_large_image', title: pageTitle, description: pageDescription, images: [socialImage]},
  }
}

export function propertySearchCopy(property: Property) {
  const city = property.city?.name
  const location = [property.neighborhood?.name, city].filter(Boolean).join(', ')
  const title = city && !property.title.toLocaleLowerCase('pt-BR').includes(city.toLocaleLowerCase('pt-BR'))
    ? property.title + ' em ' + city
    : property.title
  const summary = property.summary?.trim().replace(/\s+/g, ' ')
  const details = [location, cardAreaOf(property)].filter(Boolean).join(' · ')
  const introduction = [property.title, details].filter(Boolean).join(' — ')
  const description = summary
    ? (introduction.length + summary.length <= 158 ? introduction + '. ' + summary : summary)
    : introduction + '. Veja fotos, ficha técnica e condições do imóvel.'
  return {title, description}
}

export function breadcrumbs(items: {name: string; path: string}[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(({name, path}, i) => ({
      '@type': 'ListItem', position: i + 1, name, item: canonicalUrl(path),
    })),
  }
}

export function homeStructuredData(organization: Organization = {}) {
  const organizationId = canonicalUrl('/#organizacao')
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite', '@id': canonicalUrl('/#site'), url: canonicalUrl('/'),
        name: siteName, inLanguage: 'pt-BR', publisher: {'@id': organizationId},
      },
      {
        '@type': 'Organization', '@id': organizationId, name: organization.name, legalName: organization.legalName,
        url: canonicalUrl('/'), logo: canonicalUrl('/logos/piramide/icon.png'),
        address: {
          '@type': 'PostalAddress', streetAddress: organization.streetAddress,
          addressLocality: organization.city, addressRegion: organization.state, postalCode: organization.postalCode, addressCountry: organization.country,
        },
      },
    ],
  }
}
