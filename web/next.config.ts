import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  agentRules: false,
  devIndicators: false,
  async redirects() {
    return [{source: '/empreendimentos/:path*', destination: '/imoveis/:path*', permanent: true}]
  },
}

export default nextConfig
