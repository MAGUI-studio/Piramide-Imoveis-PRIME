import {validatePreviewUrl} from '@sanity/preview-url-secret'
import {draftMode} from 'next/headers'
import {NextResponse} from 'next/server'
import {client} from '../../../../lib/sanity'

export async function GET(request: Request) {
  if (!client || !process.env.SANITY_API_READ_TOKEN) {
    return new Response('Prévia indisponível.', {status: 503})
  }
  const {isValid, redirectTo} = await validatePreviewUrl(client, request.url)
  if (!isValid) return new Response('Prévia inválida ou expirada.', {status: 401})
  const origin = new URL(request.url).origin
  const target = new URL(redirectTo || '/', origin)
  if (target.origin !== origin) return new Response('Destino inválido.', {status: 400})
  const response = NextResponse.redirect(target)
  ;(await draftMode()).enable()
  return response
}
