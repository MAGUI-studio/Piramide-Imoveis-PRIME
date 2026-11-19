export function bannerHref(value: string): string | null {
  const href = value.trim()
  if (/^\/(?![\/\\])/.test(href) && !/[\\\s]/.test(href)) return href
  try {
    const url = new URL(href)
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null
  } catch {
    return null
  }
}
