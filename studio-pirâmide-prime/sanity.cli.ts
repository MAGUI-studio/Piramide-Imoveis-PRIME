import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  studioHost: 'piramide-prime',
  deployment: {
    appId: 't8f1e45nc49p5afqp44id8pk',
  },
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'fc83c82x',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
})
