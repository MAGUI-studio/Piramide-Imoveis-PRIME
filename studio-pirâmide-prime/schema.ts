import {defineArrayMember, defineField, defineType, type CustomValidator, type DocumentDefinition, type SlugValidationContext} from 'sanity'

const apiVersion = '2026-02-01'
const templates = [
  {title: 'Editorial · reportagem', value: 'editorial'},
  {title: 'Imersivo · cinema', value: 'immersive'},
  {title: 'Mosaico · galeria', value: 'mosaic'},
]
const types = ['Casa/Mansão', 'Apartamento/Cobertura', 'Condomínio', 'Loteamento', 'Terreno']
const reservedSlugs = new Set(['api', 'studio', 'demo', 'robots', 'sitemap', 'favicon'])

type AssetValue = {asset?: {_ref?: string}}
function validateAsset(maxMb: number, formats: string[]): CustomValidator<AssetValue> {
  return async (value, {getClient}) => {
    const id = value?.asset?._ref
    if (!id) return 'Selecione um arquivo.'
    const asset = await getClient({apiVersion}).fetch<{size: number; mimeType: string} | null>(
      '*[_id == $id][0]{size, mimeType}', {id},
    )
    if (!asset) return 'Arquivo indisponível. Selecione novamente.'
    if (!formats.includes(asset.mimeType)) return 'Formato de arquivo incompatível.'
    return asset.size <= maxMb * 1024 * 1024 || 'O arquivo excede o limite de ' + maxMb + ' MB.'
  }
}

const imageFormats = ['image/jpeg', 'image/png', 'image/webp']
const photo = defineType({
  name: 'primePhoto',
  title: 'Foto',
  type: 'image',
  description: 'JPEG, PNG ou WebP com até 2 MB.',
  options: {hotspot: true, accept: imageFormats.join(',')},
  fields: [
    defineField({
      name: 'alt', title: 'Descrição da imagem', type: 'string',
      validation: (rule) => rule.required().min(3).max(160),
    }),
  ],
  validation: (rule) => rule.custom((value, context) => value ? validateAsset(2, imageFormats)(value, context) : true),
})

function video(name: string, title: string, maxMb: number) {
  return defineField({
    name, title, type: 'file',
    description: 'MP4 com até ' + maxMb + ' MB. Exporte em H.264.',
    options: {accept: 'video/mp4'},
    validation: (rule) => rule.custom((value, context) => value ? validateAsset(maxMb, ['video/mp4'])(value, context) : true),
  })
}

function ids(id: string | undefined) {
  const published = (id || '').replace(/^drafts\./, '')
  return [published, 'drafts.' + published]
}

function uniqueName(type: string, byCity = false): CustomValidator<string | undefined> {
  return async (name, {document, getClient}) => {
    if (!name) return true
    const city = (document?.city as {_ref?: string} | undefined)?._ref
    if (byCity && !city) return true
    const query = '*[_type == $type && !(_id in $ids) && lower(name) == $name' +
      (byCity ? ' && city._ref in $city' : '') + '][0]._id'
    const duplicate = await getClient({apiVersion}).withConfig({perspective: 'raw'}).fetch(query, {
      type, ids: ids(document?._id), name: name.trim().toLowerCase(), city: ids(city),
    })
    return !duplicate || 'Já existe um cadastro com este nome nesta lista.'
  }
}

const city = defineType({
  name: 'city', title: 'Cidades', type: 'document',
  fields: [defineField({
    name: 'name', title: 'Nome', type: 'string',
    validation: (rule) => rule.required().min(2).custom((value) => !value || value === value.trim() || 'Remova os espaços nas extremidades.').custom(uniqueName('city')),
  })],
  preview: {select: {title: 'name'}},
} satisfies DocumentDefinition)

const neighborhood = defineType({
  name: 'neighborhood', title: 'Bairros', type: 'document',
  fields: [
    defineField({
      name: 'name', title: 'Nome', type: 'string',
      validation: (rule) => rule.required().min(2).custom((value) => !value || value === value.trim() || 'Remova os espaços nas extremidades.').custom(uniqueName('neighborhood', true)),
    }),
    defineField({name: 'city', title: 'Cidade', type: 'reference', to: [{type: 'city'}], validation: (rule) => rule.required()}),
  ],
  preview: {
    select: {name: 'name', city: 'city.name'},
    prepare: ({name, city}) => ({title: [name, city].filter(Boolean).join(', ') || 'Bairro sem nome'}),
  },
})

async function isUnique(slug: string, {document, getClient}: SlugValidationContext) {
  const match = await getClient({apiVersion}).withConfig({perspective: 'raw'}).fetch(
    '*[_type == "property" && slug.current == $slug && !(_id in $ids)][0]._id',
    {slug, ids: ids(document?._id)},
  )
  return !match
}

const property = defineType({
  name: 'property', title: 'Empreendimentos', type: 'document',
  groups: [
    {name: 'details', title: 'Informações', default: true},
    {name: 'media', title: 'Fotos e vídeos'},
    {name: 'design', title: 'Página'},
  ],
  fields: [
    defineField({name: 'firstPublishedSlug', type: 'string', hidden: true, readOnly: true}),
    defineField({name: 'firstPublishedAt', type: 'datetime', hidden: true, readOnly: true}),
    defineField({name: 'title', title: 'Nome', type: 'string', group: 'details', validation: (rule) => rule.required().max(100)}),
    defineField({
      name: 'slug', title: 'Endereço da ficha', type: 'slug', group: 'design',
      readOnly: ({document}) => !!document?.firstPublishedSlug,
      description: 'Gere com base no nome. O endereço fica protegido depois da primeira publicação.',
      options: {source: 'title', maxLength: 96, isUnique},
      validation: (rule) => rule.required().custom(async (value, {document, getClient}) => {
        if (!value?.current) return true
        const slug = value.current
        if (slug.length > 96 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || reservedSlugs.has(slug)) {
          return 'Use letras minúsculas, números e hífens em um endereço disponível.'
        }
        const existing = document?.firstPublishedSlug || await getClient({apiVersion}).withConfig({perspective: 'published'}).fetch(
          '*[_id == $id][0].slug.current', {id: ids(document?._id)[0]},
        )
        return !existing || existing === slug || 'O endereço da ficha já publicada deve permanecer /' + existing + '.'
      }),
    }),
    defineField({name: 'propertyType', title: 'Tipo de imóvel', type: 'string', group: 'details', options: {list: types}, validation: (rule) => rule.required().custom((value) => !value || types.includes(value) || 'Selecione um tipo de imóvel.')}),
    defineField({
      name: 'specifications', title: 'Dados do imóvel', type: 'object', group: 'details',
      fields: [
        defineField({name: 'bedrooms', title: 'Dormitórios', type: 'number', validation: (rule) => rule.integer().min(0)}),
        defineField({name: 'bathrooms', title: 'Banheiros', type: 'number', validation: (rule) => rule.integer().min(0)}),
        defineField({name: 'suites', title: 'Suítes', type: 'number', validation: (rule) => rule.integer().min(0)}),
        defineField({name: 'parking', title: 'Vagas', type: 'number', validation: (rule) => rule.integer().min(0)}),
        defineField({name: 'area', title: 'Área (m²)', type: 'number', validation: (rule) => rule.greaterThan(0)}),
      ],
    }),
    defineField({name: 'neighborhood', title: 'Bairro', type: 'reference', group: 'details', to: [{type: 'neighborhood'}], validation: (rule) => rule.required()}),
    defineField({name: 'summary', title: 'Resumo do card', type: 'text', rows: 2, group: 'details', validation: (rule) => rule.required().max(175)}),
    defineField({name: 'description', title: 'Descrição da ficha', type: 'text', rows: 8, group: 'details', validation: (rule) => rule.required()}),
    defineField({
      name: 'attributes', title: 'Atributos do card', type: 'array', group: 'details',
      description: 'Exemplos: 420 m², 4 suítes, vista para a serra.',
      of: [defineArrayMember({type: 'string', validation: (rule) => rule.required().max(45)})],
      validation: (rule) => rule.max(3).unique(),
    }),
    defineField({
      name: 'features', title: 'Diferenciais', type: 'array', group: 'details',
      of: [defineArrayMember({type: 'string', validation: (rule) => rule.required().max(100)})],
    }),
    defineField({name: 'price', title: 'Preço em reais', type: 'number', group: 'details', validation: (rule) => rule.greaterThan(0).precision(2)}),
    defineField({name: 'cover', title: 'Foto de capa', type: 'primePhoto', group: 'media', validation: (rule) => rule.required()}),
    defineField({name: 'gallery', title: 'Galeria', type: 'array', group: 'media', of: [defineArrayMember({type: 'primePhoto'})], validation: (rule) => rule.required().min(1)}),
    {...video('clip', 'Clipe de abertura', 12), group: 'media'},
    {...video('tour', 'Vídeo do tour', 40), group: 'media'},
    defineField({name: 'template', title: 'Design da ficha', type: 'string', group: 'design', options: {list: templates, layout: 'radio'}, validation: (rule) => rule.required().custom((value) => !value || templates.some((template) => template.value === value) || 'Selecione um dos três designs.')}),
  ],
  preview: {
    select: {title: 'title', template: 'template', media: 'cover'},
    prepare: ({title, template, media}) => ({title, media, subtitle: templates.find(({value}) => value === template)?.title || 'Escolha um design'}),
  },
})

const home = defineType({
  name: 'primeHome', title: 'Home', type: 'document',
  fields: [
    defineField({name: 'hero', title: 'Empreendimento de abertura', type: 'reference', weak: true, to: [{type: 'property'}]}),
    defineField({
      name: 'featured', title: 'Destaques em ordem de exibição', type: 'array',
      of: [defineArrayMember({type: 'reference', weak: true, to: [{type: 'property'}]})],
      validation: (rule) => rule.unique().custom((items) => {
        const refs = (items || []).map((item) => (item as {_ref?: string})._ref)
        return new Set(refs).size === refs.length || 'Selecione cada empreendimento uma única vez.'
      }),
    }),
    defineField({
      name: 'whatsapp', title: 'WhatsApp comercial', type: 'string',
      description: 'Use código do país, DDD e número, somente dígitos. Exemplo de formato: 5512999999999.',
      validation: (rule) => rule.required().regex(/^[1-9]\d{9,14}$/),
    }),
  ],
  preview: {prepare: () => ({title: 'Home'})},
})

export const schemaTypes = [photo, city, neighborhood, property, home]
