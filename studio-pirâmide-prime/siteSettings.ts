import {defineArrayMember, defineField, defineType} from 'sanity'

const text = (name: string, title: string, multiline = false) => defineField({
  name, title, type: multiline ? 'text' : 'string', ...(multiline ? {rows: 3} : {}),
})
const url = (name: string, title: string) => defineField({
  name, title, type: 'url', validation: (rule) => rule.uri({scheme: ['https', 'http']}),
})
const phone = (name: string, title: string) => defineField({
  name, title, type: 'string', description: 'Código do país, DDD e número, somente dígitos.',
  validation: (rule) => rule.regex(/^[1-9]\d{9,14}$/),
})
const introFields = [text('eyebrow', 'Chamada curta'), text('title', 'Título'), text('description', 'Descrição', true)]
const cta = (name: string, title: string) => defineField({
  name, title, type: 'object', group: 'commercial',
  description: 'Sem título, a chamada não aparece. Sem imagem, usa somente o fundo da seção.',
  fields: [...introFields, text('buttonLabel', 'Texto do botão de contato'),
    ...(name === 'catalogCta' ? [] : [text('secondaryLabel', 'Texto do botão secundário')]),
    defineField({name: 'image', title: 'Imagem de fundo', type: 'primePhoto'})],
})

export const siteSettings = defineType({
  name: 'primeSiteSettings', title: 'Configurações do site', type: 'document',
  groups: [
    {name: 'organization', title: 'Institucional', default: true},
    {name: 'privacy', title: 'Privacidade e cookies'},
    {name: 'commercial', title: 'Conteúdo e chamadas'},
  ],
  fields: [
    defineField({name: 'organization', title: 'Empresa e rodapé', type: 'object', group: 'organization', fields: [
      text('name', 'Nome público da empresa'), text('legalName', 'Razão social'), text('description', 'Apresentação do rodapé', true),
      text('creci', 'CRECI'), phone('commercialPhone', 'WhatsApp comercial'), url('portalUrl', 'Portal oficial'), text('officeTitle', 'Título da sede'),
      text('streetAddress', 'Logradouro, número e bairro'), text('city', 'Cidade'), text('state', 'Estado / UF'),
      text('postalCode', 'CEP'), text('country', 'País (sigla)'),
      text('openingHours', 'Horários de atendimento (uma linha por período)', true), text('copyright', 'Texto de direitos autorais'),
      defineField({name: 'socialLinks', title: 'Redes sociais e links', type: 'array', of: [defineArrayMember({
        name: 'socialLink', type: 'object', fields: [
          {...text('label', 'Nome'), validation: (rule) => rule.required()},
          {...url('href', 'Endereço'), validation: (rule) => rule.required().uri({scheme: ['https', 'http']})},
          defineField({name: 'icon', title: 'Ícone', type: 'string', options: {list: [
            {title: 'Instagram', value: 'instagram'}, {title: 'YouTube', value: 'youtube'},
            {title: 'LinkedIn', value: 'linkedin'}, {title: 'Facebook', value: 'facebook'}, {title: 'Site', value: 'globe'},
          ]}}),
        ], preview: {select: {title: 'label', subtitle: 'href'}},
      })]}),
      defineField({name: 'branches', title: 'Outras unidades', type: 'array', of: [defineArrayMember({
        name: 'branchLink', type: 'object', fields: [
          {...text('label', 'Nome da unidade'), validation: (rule) => rule.required()},
          {...url('href', 'Link do endereço'), validation: (rule) => rule.required().uri({scheme: ['https', 'http']})},
        ], preview: {select: {title: 'label', subtitle: 'href'}},
      })]}),
    ]}),
    defineField({name: 'privacy', title: 'Política de privacidade', type: 'object', group: 'privacy', fields: [
      text('title', 'Título da política'), text('subtitle', 'Apresentação', true),
      text('controllerIntroduction', 'Apresentação do controlador', true),
      defineField({name: 'sections', title: 'Seções da política', type: 'array', of: [defineArrayMember({
        name: 'privacySection', type: 'object', fields: [
          {...text('title', 'Título'), validation: (rule) => rule.required()},
          {...text('body', 'Texto', true), validation: (rule) => rule.required()},
        ], preview: {select: {title: 'title'}},
      })]}),
      phone('contactPhone', 'WhatsApp para privacidade'), text('contactMessage', 'Mensagem inicial do atendimento', true),
      text('contactLabel', 'Texto do botão de atendimento'),
      text('cookieNotice', 'Texto do aviso de cookies', true),
    ]}),
    defineField({name: 'differentiators', title: 'Diferenciais da empresa', type: 'object', group: 'commercial', fields: [
      ...introFields,
      defineField({name: 'items', title: 'Diferenciais', type: 'array', of: [defineArrayMember({name: 'pillar', type: 'object', fields: [
        {...text('title', 'Título'), validation: (rule) => rule.required()},
        {...text('text', 'Descrição', true), validation: (rule) => rule.required()},
      ], preview: {select: {title: 'title'}}})]}),
    ]}),
    defineField({name: 'statsIntro', title: 'Apresentação dos indicadores', type: 'object', group: 'commercial',
      description: 'Os valores e rótulos dos indicadores continuam na Home. Sem indicadores, a seção não aparece.', fields: introFields}),
    cta('homeCta', 'Chamada final da Home'), cta('catalogCta', 'Chamada final do catálogo'), cta('propertyCta', 'Chamada final das fichas'),
  ],
  preview: {prepare: () => ({title: 'Configurações do site'})},
})
