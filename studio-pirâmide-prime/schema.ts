import {defineArrayMember, defineField, defineType, type CustomValidator, type DocumentDefinition, type SlugValidationContext} from 'sanity'

const apiVersion = '2026-02-01'
const templates = [
  {title: 'Fotos', value: 'editorial'},
  {title: 'Videos', value: 'immersive'},
  {title: 'Padrão', value: 'mosaic'},
]
const availabilities = [
  {title: 'Disponível', value: 'available'},
  {title: 'Reservado', value: 'reserved'},
  {title: 'Vendido', value: 'sold'},
]
const types = ['Casa/Mansão', 'Apartamento/Cobertura', 'Condomínio', 'Loteamento', 'Terreno', 'Comercial']
const floorProfiles = ['Térrea', 'Sobrado', 'Triplex', 'Andar alto', '1 por andar', 'Duplex', 'Cobertura']
const sunOrientations = ['Sol da manhã', 'Sol da tarde', 'Face norte', 'Sol o dia todo']
const reservedSlugs = new Set(['api', 'studio', 'demo', 'robots', 'sitemap', 'favicon', 'empreendimentos'])

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
    defineField({
      name: 'caption', title: 'Legenda para o ensaio', type: 'string',
      description: 'Opcional. Aparece junto da foto no template Fotos.',
      validation: (rule) => rule.max(120),
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
    {name: 'commercial', title: 'Comercial'},
    {name: 'media', title: 'Fotos e vídeos'},
    {name: 'design', title: 'Página'},
  ],
  fields: [
    defineField({name: 'firstPublishedSlug', type: 'string', hidden: true, readOnly: true}),
    defineField({name: 'firstPublishedAt', type: 'datetime', hidden: true, readOnly: true}),
    defineField({name: 'title', title: 'Nome', type: 'string', group: 'details', validation: (rule) => rule.required().max(100)}),
    defineField({
      name: 'refCode', title: 'Código de referência', type: 'string', group: 'details',
      description: 'Opcional. Código interno do imóvel no CRM da Pirâmide (ex.: PR-1042).',
      validation: (rule) => rule.max(30).custom(async (value, {document, getClient}) => {
        if (!value) return true
        if (value !== value.trim()) return 'Remova os espaços nas extremidades.'
        const duplicate = await getClient({apiVersion}).withConfig({perspective: 'raw'}).fetch(
          '*[_type == "property" && !(_id in $ids) && lower(refCode) == $code][0]._id',
          {ids: ids(document?._id), code: value.trim().toLowerCase()},
        )
        return !duplicate || 'Já existe outro imóvel cadastrado com este código.'
      }),
    }),
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
    defineField({name: 'neighborhood', title: 'Bairro', type: 'reference', group: 'details', to: [{type: 'neighborhood'}], validation: (rule) => rule.required()}),
    defineField({
      name: 'condominiumName', title: 'Condomínio ou edifício', type: 'string', group: 'details',
      description: 'Opcional. Ex.: Reserva do Paratehy, Alphaville, Jardim do Golfe.',
      validation: (rule) => rule.max(100),
    }),
    defineField({
      name: 'architect', title: 'Projeto arquitetônico', type: 'string', group: 'details',
      description: 'Opcional. Arquiteto ou escritório responsável pelo projeto.',
      validation: (rule) => rule.max(100),
    }),
    defineField({
      name: 'specifications', title: 'Ficha técnica e metragens', type: 'object', group: 'details',
      options: {columns: 2},
      fields: [
        defineField({name: 'area', title: 'Área construída / privativa (m²)', type: 'number', validation: (rule) => rule.greaterThan(0)}),
        defineField({name: 'landArea', title: 'Área do terreno / lote (m²)', type: 'number', validation: (rule) => rule.greaterThan(0)}),
        defineField({name: 'bedrooms', title: 'Dormitórios', type: 'number', validation: (rule) => rule.integer().min(0)}),
        defineField({name: 'suites', title: 'Suítes', type: 'number', validation: (rule) => rule.integer().min(0)}),
        defineField({name: 'bathrooms', title: 'Banheiros', type: 'number', validation: (rule) => rule.integer().min(0)}),
        defineField({name: 'lavabos', title: 'Lavabos', type: 'number', validation: (rule) => rule.integer().min(0)}),
        defineField({name: 'parking', title: 'Vagas de garagem', type: 'number', validation: (rule) => rule.integer().min(0)}),
        defineField({
          name: 'coveredParking', title: 'Vagas cobertas', type: 'number',
          validation: (rule) => rule.integer().min(0).custom((covered, {parent}) => {
            const total = (parent as {parking?: number} | undefined)?.parking
            return covered == null || total == null || covered <= total || 'Não pode exceder o total de vagas.'
          }),
        }),
        defineField({name: 'floorProfile', title: 'Perfil / pavimento', type: 'string', options: {list: floorProfiles}, validation: (rule) => rule.custom((value) => !value || floorProfiles.includes(value) || 'Selecione uma opção válida.')}),
        defineField({name: 'sunOrientation', title: 'Posição solar', type: 'string', options: {list: sunOrientations}, validation: (rule) => rule.custom((value) => !value || sunOrientations.includes(value) || 'Selecione uma opção válida.')}),
        defineField({name: 'hasOffice', title: 'Escritório / Home office', type: 'boolean', initialValue: false}),
        defineField({name: 'hasHobbyBox', title: 'Hobby box / Depósito privativo', type: 'boolean', initialValue: false}),
        defineField({name: 'hasEvCharger', title: 'Ponto para carro elétrico', type: 'boolean', initialValue: false}),
      ],
    }),
    defineField({name: 'summary', title: 'Resumo do card', type: 'text', rows: 2, group: 'details', validation: (rule) => rule.required().max(175)}),
    defineField({name: 'description', title: 'Descrição da ficha', type: 'text', rows: 8, group: 'details', validation: (rule) => rule.required()}),
    defineField({
      name: 'attributes', title: 'Atributos do card (opcional)', type: 'array', group: 'details',
      description: 'Até 3 destaques curtos. Se ficar vazio, o card exibe automaticamente metragem, suítes e vagas.',
      of: [defineArrayMember({type: 'string', validation: (rule) => rule.required().max(45)})],
      validation: (rule) => rule.max(3).unique(),
    }),
    defineField({
      name: 'features', title: 'Diferenciais do imóvel', type: 'array', group: 'details',
      description: 'Exemplos: Piscina aquecida, espaço gourmet, automação, marcenaria planejada, energia solar.',
      of: [defineArrayMember({type: 'string', validation: (rule) => rule.required().max(100)})],
    }),
    defineField({
      name: 'condoFeatures', title: 'Infraestrutura e lazer do condomínio', type: 'array', group: 'details',
      description: 'Opcional. Exemplos: Portaria 24h, quadra de tênis, academia, piscina coberta, salão de festas.',
      of: [defineArrayMember({type: 'string', validation: (rule) => rule.required().max(100)})],
    }),
    defineField({
      name: 'availability', title: 'Disponibilidade', type: 'string', group: 'commercial',
      initialValue: 'available',
      options: {list: availabilities, layout: 'radio'},
      validation: (rule) => rule.custom((value) => !value || availabilities.some((item) => item.value === value) || 'Selecione a disponibilidade.'),
    }),
    defineField({
      name: 'externalListingUrl', title: 'Link do imóvel no site da Pirâmide', type: 'url', group: 'commercial',
      description: 'Link direto para a página oficial de venda deste imóvel no site principal da Pirâmide Imóveis.',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'price', title: 'Preço de venda (R$)', type: 'number', group: 'commercial',
      description: 'Deixe em branco para exibir "Valor sob consulta".',
      validation: (rule) => rule.greaterThan(0).precision(2),
    }),
    defineField({name: 'condoFee', title: 'Condomínio mensal (R$)', type: 'number', group: 'commercial', validation: (rule) => rule.min(0).precision(2)}),
    defineField({name: 'iptu', title: 'IPTU anual (R$)', type: 'number', group: 'commercial', validation: (rule) => rule.min(0).precision(2)}),
    defineField({
      name: 'conditions', title: 'Condições e destaques de negociação', type: 'object', group: 'commercial',
      options: {columns: 2},
      fields: [
        defineField({name: 'exclusive', title: 'Exclusividade Pirâmide PRIME', type: 'boolean', initialValue: false}),
        defineField({name: 'furnished', title: 'Mobiliado / Porteira fechada', type: 'boolean', initialValue: false}),
        defineField({name: 'acceptsTrade', title: 'Analisa permuta', type: 'boolean', initialValue: false}),
        defineField({name: 'acceptsFinancing', title: 'Aceita financiamento', type: 'boolean', initialValue: false}),
      ],
    }),
    defineField({name: 'cover', title: 'Foto de capa', type: 'primePhoto', group: 'media', validation: (rule) => rule.required()}),
    defineField({
      name: 'gallery', title: 'Galeria de fotos', type: 'array', group: 'media',
      description: 'No template Fotos, organize o ensaio na ordem em que deve ser visto.',
      of: [defineArrayMember({type: 'primePhoto'})],
      validation: (rule) => rule.custom((value, {document}) =>
        document?.template === 'immersive' || (value as AssetValue[] | undefined)?.some((image) => image.asset?._ref) || 'Adicione pelo menos uma foto à galeria.',
      ),
    }),
    defineField({
      name: 'videoGallery', title: 'Galeria de vídeos', type: 'array', group: 'media',
      description: 'Organize os vídeos na ordem da visita. Em Videos, marque o vídeo de abertura ou deixe o primeiro da lista abrir a página.',
      of: [defineArrayMember({
        name: 'propertyVideo', title: 'Vídeo', type: 'object',
        fields: [
          defineField({name: 'title', title: 'Título', type: 'string', validation: (rule) => rule.required().max(80)}),
          {...video('file', 'Arquivo MP4', 40), validation: (rule) => rule.required().custom(validateAsset(40, ['video/mp4']))},
          defineField({name: 'poster', title: 'Imagem de capa do vídeo', type: 'primePhoto'}),
          defineField({name: 'opening', title: 'Usar na abertura de Videos', type: 'boolean'}),
        ],
        preview: {select: {title: 'title', media: 'poster', opening: 'opening'}, prepare: ({title, media, opening}) =>
          ({title, media, subtitle: opening ? 'Vídeo de abertura' : undefined})},
      })],
      validation: (rule) => rule.max(12).custom((entries) => {
        if (!entries) return true
        const videos = entries as {opening?: boolean; file?: AssetValue}[]
        if (videos.filter((entry) => entry.opening).length > 1) return 'Selecione somente um vídeo de abertura.'
        const assets = videos.flatMap((entry) => entry.file?.asset?._ref ? [entry.file.asset._ref] : [])
        return assets.length === new Set(assets).size || 'Cada vídeo deve aparecer apenas uma vez na galeria.'
      }),
    }),
    {...video('clip', 'Clipe de abertura (upload MP4)', 12), group: 'media'},
    {...video('tour', 'Vídeo do tour (upload MP4)', 40), group: 'media'},
    defineField({
      name: 'externalVideoUrl', title: 'Vídeo externo (YouTube ou Vimeo)', type: 'url', group: 'media',
      description: 'Opcional. Use quando o vídeo completo estiver no YouTube ou Vimeo (sem limite de tamanho).',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'virtualTourUrl', title: 'Tour Virtual 360°', type: 'url', group: 'media',
      description: 'Opcional. Link externo para Matterport ou tour virtual 360°.',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'sectionPhoto', title: 'Imagem de Sobre o imóvel / Por dentro do imóvel', type: 'primePhoto', group: 'design',
      description: 'Define a foto da apresentação do imóvel neste template. Se ficar vazia, usa uma foto da galeria ou a capa.',
    }),
    defineField({
      name: 'detailsPhoto', title: 'Imagens de Detalhes em foco', type: 'array', group: 'design',
      hidden: ({document}) => document?.template !== 'editorial',
      description: 'Até 2 fotos para a seção Detalhes em foco em Fotos (a primeira fica à esquerda e a segunda à direita).',
      of: [defineArrayMember({type: 'primePhoto'})],
      validation: (rule) => rule.max(2),
    }),
    defineField({
      name: 'mediaPhoto', title: 'Imagem do acesso à galeria em Fotos e tour', type: 'primePhoto', group: 'design',
      hidden: ({document}) => document?.template !== 'mosaic',
      description: 'Foto que fica ao lado do vídeo principal no template Padrão.',
    }),
    defineField({
      name: 'mediaVideoPhoto', title: 'Imagem do vídeo em Fotos e tour', type: 'primePhoto', group: 'design',
      hidden: ({document}) => document?.template !== 'mosaic',
      description: 'Opcional. Substitui a imagem de capa do vídeo exibido ao lado da galeria no template Padrão.',
    }),
    defineField({
      name: 'videoTourPhoto', title: 'Imagem principal de Visita em vídeo', type: 'primePhoto', group: 'design',
      hidden: ({document}) => document?.template !== 'immersive',
      description: 'Define a imagem do primeiro vídeo nesta seção. As imagens dos capítulos são escolhidas dentro de cada vídeo na aba Fotos e vídeos.',
    }),
    defineField({
      name: 'faq', title: 'Perguntas frequentes', type: 'array', group: 'design',
      description: 'Opcional. A seção aparece na ficha quando houver perguntas cadastradas.',
      of: [defineArrayMember({
        name: 'propertyQuestion', title: 'Pergunta', type: 'object',
        fields: [
          defineField({name: 'question', title: 'Pergunta', type: 'string', validation: (rule) => rule.required().max(140)}),
          defineField({name: 'answer', title: 'Resposta', type: 'text', rows: 3, validation: (rule) => rule.required().max(600)}),
        ],
        preview: {select: {title: 'question'}},
      })],
      validation: (rule) => rule.max(10),
    }),
    defineField({
      name: 'template', title: 'Design da ficha', type: 'string', group: 'design', options: {list: templates, layout: 'radio'},
      description: 'Fotos prioriza o ensaio fotográfico, Videos prioriza a visita em vídeo e Padrão equilibra as mídias e os dados do imóvel.',
      validation: (rule) => rule.required().custom((value, {document}) => {
        if (!value) return true
        if (!templates.some((template) => template.value === value)) return 'Selecione um dos três designs.'
        if (value !== 'immersive') return true
        const videos = document?.videoGallery as {file?: AssetValue}[] | undefined
        const clip = document?.clip as AssetValue | undefined
        const tour = document?.tour as AssetValue | undefined
        return !!(videos?.some((entry) => entry.file?.asset?._ref) || clip?.asset?._ref || tour?.asset?._ref)
          || 'Adicione pelo menos um vídeo MP4 na aba Fotos e vídeos.'
      }),
    }),
  ],
  preview: {
    select: {title: 'title', refCode: 'refCode', availability: 'availability', template: 'template', media: 'cover'},
    prepare: ({title, refCode, availability, template, media}) => {
      const status = availability === 'sold' ? 'Vendido' : availability === 'reserved' ? 'Reservado' : null
      const design = templates.find(({value}) => value === template)?.title || 'Escolha um design'
      return {title, media, subtitle: [refCode, status, design].filter(Boolean).join(' · ')}
    },
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

const marquee = defineType({
  name: 'primeMarquee', title: 'Faixa informativa do rodapé', type: 'document',
  fields: [defineField({
    name: 'items', title: 'Mensagens', type: 'array',
    description: 'Mensagens exibidas na faixa animada da Home, na ordem desta lista.',
    of: [defineArrayMember({
      name: 'marqueeItem', title: 'Mensagem', type: 'object',
      fields: [
        defineField({name: 'title', title: 'Título', type: 'string', validation: (rule) => rule.required().max(60)}),
        defineField({name: 'description', title: 'Descrição', type: 'string', validation: (rule) => rule.required().max(120)}),
      ],
      preview: {select: {title: 'title', subtitle: 'description'}},
    })],
    validation: (rule) => rule.max(4),
  })],
  preview: {prepare: () => ({title: 'Faixa informativa do rodapé'})},
})

export const schemaTypes = [photo, city, neighborhood, property, home, marquee]
