import {useEffect, useState, type ChangeEvent} from 'react'
import {set, unset, useClient, type StringInputProps} from 'sanity'
import {watermarkVersion} from './watermark'

const apiVersion = '2026-02-01'
export const defaultPropertyTypes = [
  'Casa/Mansão',
  'Apartamento/Cobertura',
  'Condomínio',
  'Loteamento',
  'Terreno',
  'Comercial',
]

let seedPromise: Promise<void> | null = null

export function ensureDefaultPropertyTypes(client: ReturnType<typeof useClient>) {
  if (seedPromise) return seedPromise
  seedPromise = (async () => {
    try {
      const existing = await client.withConfig({perspective: 'raw'}).fetch<{name: string}[]>(
        '*[_type == "propertyTypeOption" && defined(name)]{name}',
      )
      const existingNames = new Set(existing.map((item) => item.name.trim().toLowerCase()))
      const samples = await client.withConfig({perspective: 'raw'}).fetch<{
        propertyType?: string
        cover?: {alt?: string; asset?: {_ref?: string}}
        originalFilename?: string
      }[]>(
        '*[_type == "property" && defined(propertyType) && defined(cover.asset)]{propertyType, cover, "originalFilename": cover.asset->originalFilename}',
      )

      for (const name of defaultPropertyTypes) {
        if (existingNames.has(name.toLowerCase())) continue
        const slug = name
          .normalize('NFD')
          .replace(/\p{Diacritic}/gu, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
        const docId = 'property-type-' + slug
        const sample = samples.find((item) => item.propertyType?.toLowerCase() === name.toLowerCase())
        const suffix = '-' + watermarkVersion + '.jpg'
        const unwatermarkedRef = sample?.originalFilename?.endsWith(suffix)
          ? sample.originalFilename.slice(0, -suffix.length)
          : sample?.cover?.asset?._ref

        await client.createIfNotExists({
          _id: docId,
          _type: 'propertyTypeOption',
          name,
          ...(unwatermarkedRef
            ? {
                image: {
                  _type: 'primePhoto',
                  alt: sample?.cover?.alt || name,
                  asset: {_type: 'reference', _ref: unwatermarkedRef},
                },
              }
            : {}),
        })
      }
    } catch {
      // Ignore if current user lacks write permissions.
    }
  })()
  return seedPromise
}

export function PropertyTypeInput(props: StringInputProps) {
  const client = useClient({apiVersion})
  const [options, setOptions] = useState<string[]>(defaultPropertyTypes)

  useEffect(() => {
    let cancelled = false
    async function load() {
      await ensureDefaultPropertyTypes(client)
      const rows = await client.fetch<{name: string}[]>(
        '*[_type == "propertyTypeOption" && defined(name)] | order(name asc){name}',
      )
      if (cancelled) return
      const merged = Array.from(new Set([...rows.map((row) => row.name.trim()).filter(Boolean), ...defaultPropertyTypes]))
      setOptions(merged)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [client])

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const next = event.currentTarget.value
    props.onChange(next ? set(next) : unset())
  }

  const current = props.value || ''
  const allOptions = current && !options.includes(current) ? [current, ...options] : options

  return (
    <select
      value={current}
      disabled={props.readOnly}
      onChange={handleChange}
      style={{
        width: '100%',
        padding: '0.6rem 0.75rem',
        borderRadius: '0.25rem',
        border: '1px solid var(--card-border-color, #3a3d45)',
        background: 'var(--card-bg-color, transparent)',
        color: 'inherit',
        fontSize: '0.9375rem',
      }}
    >
      <option value="">Selecione um tipo de imóvel…</option>
      {allOptions.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}
