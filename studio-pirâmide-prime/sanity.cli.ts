import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  deployment: {
    appId: 'cxu7kfqvhrfd3lf49pugbxka',
  },
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'fc83c82x',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
})
