import type {Photo} from './model'

export type ContentIntro = {eyebrow?: string; title?: string; description?: string}
export type ContactCta = ContentIntro & {buttonLabel?: string; secondaryLabel?: string; image?: Photo | null}
export type Organization = {
  name?: string; legalName?: string; description?: string; creci?: string; commercialPhone?: string; portalUrl?: string; officeTitle?: string
  streetAddress?: string; city?: string; state?: string; postalCode?: string; country?: string; openingHours?: string; copyright?: string
  socialLinks?: {_key: string; label: string; href: string; icon?: string}[]
  branches?: {_key: string; label: string; href: string}[]
}
export type PrivacySettings = {
  title?: string; subtitle?: string; controllerIntroduction?: string
  sections?: {_key: string; title: string; body: string}[]
  contactPhone?: string; contactMessage?: string; contactLabel?: string; cookieNotice?: string
}
export type SiteSettings = {
  organization?: Organization | null
  privacy?: PrivacySettings | null
  differentiators?: (ContentIntro & {items?: {_key: string; title: string; text: string}[]}) | null
  statsIntro?: ContentIntro | null
  homeCta?: ContactCta | null
  catalogCta?: ContactCta | null
  propertyCta?: ContactCta | null
}

export function organizationAddress(organization: Organization) {
  return [organization.streetAddress, [organization.city, organization.state].filter(Boolean).join(', '), organization.postalCode].filter(Boolean).join(' · ')
}

// Settings are editable content: empty fields stay empty, including cleared lists.
export function privacyController(organization: Organization, privacy: PrivacySettings) {
  return [privacy.controllerIntroduction, organization.legalName || organization.name,
    organization.creci && 'CRECI ' + organization.creci, organizationAddress(organization)].filter(Boolean).join(' · ')
}

export function safeExternalUrl(value?: string | null) {
  if (!value) return null
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null
  } catch {
    return null
  }
}
