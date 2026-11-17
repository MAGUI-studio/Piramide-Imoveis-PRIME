import {defineConfig} from 'sanity'
import {defineLocations, presentationTool} from 'sanity/presentation'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './schema'
import {withPublicationFields} from './publish'

const previewUrl = process.env.SANITY_STUDIO_PREVIEW_URL || 'http://localhost:3000'
const singletonTypes = ['primeHome', 'primeMarquee']

export default defineConfig({
  name: 'piramide-prime',
  title: 'Pirâmide PRIME',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'fc83c82x',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter(({schemaType}) => !singletonTypes.includes(schemaType)),
  },
  document: {
    actions: (actions, {schemaType}) => singletonTypes.includes(schemaType)
      ? actions.filter(({action}) => action && ['publish', 'discardChanges', 'restore'].includes(action))
      : schemaType === 'property'
        ? actions.filter(({action}) => action !== 'duplicate').map((action) => action.action === 'publish' ? withPublicationFields(action) : action)
        : actions,
  },
  plugins: [
    structureTool({
      title: 'Conteúdo',
      structure: (S) => S.list().title('Pirâmide PRIME').items([
        S.listItem().title('Home').child(S.document().schemaType('primeHome').documentId('primeHome')),
        S.listItem().title('Faixa informativa do rodapé').child(S.document().schemaType('primeMarquee').documentId('primeMarquee')),
        S.documentTypeListItem('property'),
        S.documentTypeListItem('city'),
        S.documentTypeListItem('neighborhood'),
      ]),
    }),
    presentationTool({
      title: 'Prévia',
      previewUrl: {
        initial: previewUrl,
        previewMode: {enable: '/api/draft-mode/enable', disable: '/api/draft-mode/disable'},
      },
      resolve: {
        mainDocuments: [
          {route: '/', filter: '_id == "primeHome"'},
          {route: '/:slug', filter: '_type == "property" && slug.current == $slug'},
        ],
        locations: {
          primeHome: {locations: [{title: 'Home', href: '/'}]},
          property: defineLocations({
            select: {title: 'title', slug: 'slug.current'},
            resolve: (doc) => ({
              locations: doc?.slug ? [{title: doc.title || 'Empreendimento', href: '/' + doc.slug}] : [],
            }),
          }),
        },
      },
    }),
  ],
})
