import type {ComponentProps} from 'react'
import type {CinemaIcon} from '../components/cinemaIcon'
import type {Property} from './model'

export type TechnicalFact = {key?: string; label: string; value?: string; icon: ComponentProps<typeof CinemaIcon>['name']}
const number = new Intl.NumberFormat('pt-BR')

export function technicalFactsOf(property: Property): TechnicalFact[] {
  const specs = property.specifications
  const isLand = property.propertyType === 'Terreno' || property.propertyType === 'Loteamento'
  const isPrivateUnit = property.propertyType === 'Apartamento/Cobertura' || property.propertyType === 'Comercial'
  const areaLabel = isLand && !specs?.landArea ? 'Área do terreno' : isPrivateUnit ? 'Área privativa' : 'Área construída'

  const items: TechnicalFact[] = []
  if (specs?.totalArea && specs.totalArea > 0) items.push({label: 'Área total', value: number.format(specs.totalArea) + ' m²', icon: 'area'})
  if (specs?.area && specs.area > 0) items.push({label: areaLabel, value: number.format(specs.area) + ' m²', icon: 'area'})
  if (specs?.landArea && specs.landArea > 0) items.push({label: 'Área do terreno', value: number.format(specs.landArea) + ' m²', icon: 'area'})
  if (specs?.bedrooms && specs.bedrooms > 0) items.push({label: 'Dormitórios', value: String(specs.bedrooms), icon: 'bedroom'})
  if (specs?.suites && specs.suites > 0) items.push({label: 'Suítes', value: String(specs.suites), icon: 'suite'})
  if (specs?.bathrooms && specs.bathrooms > 0) items.push({label: 'Banheiros', value: String(specs.bathrooms), icon: 'bath'})
  if (specs?.parking && specs.parking > 0) {
    const covered = specs.coveredParking && specs.coveredParking > 0
      ? ` (${specs.coveredParking} ${specs.coveredParking === 1 ? 'coberta' : 'cobertas'})`
      : ''
    items.push({label: 'Vagas de garagem', value: specs.parking + covered, icon: 'parking'})
  }
  if (specs?.floorProfile) items.push({label: 'Perfil / pavimento', value: specs.floorProfile, icon: 'floors'})
  if (specs?.sunOrientation) items.push({label: 'Posição solar', value: specs.sunOrientation, icon: 'sun'})
  if (property.condominiumName) items.push({label: 'Condomínio / edifício', value: property.condominiumName, icon: 'building'})
  if (property.architect) items.push({label: 'Projeto arquitetônico', value: property.architect, icon: 'plan'})
  if (property.refCode) items.push({label: 'Código do imóvel', value: property.refCode, icon: 'reference'})

  if (specs?.hasOffice) items.push({label: 'Escritório / Home office', icon: 'office'})
  if (specs?.hasHobbyBox) items.push({label: 'Hobby box / Depósito privativo', icon: 'storage'})
  if (specs?.hasEvCharger) items.push({label: 'Ponto para carro elétrico', icon: 'charging'})

  for (const [index, fact] of (property.customFacts || []).entries()) {
    const label = fact.label?.trim()
    const value = fact.value?.trim()
    if (label && value) items.push({label, value, icon: 'check', key: 'custom-' + (fact._key || index)})
  }
  return items
}
