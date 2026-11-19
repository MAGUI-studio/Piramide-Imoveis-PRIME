export const cookieConsentEvent = 'cookie-consent-accepted'

export function hasCookieConsent() {
  if (document.cookie.split(';').some((cookie) => cookie.trim() === 'cookie-consent=accepted')) return true
  try {
    return localStorage.getItem('cookie_consent') === 'accepted'
  } catch {
    return false
  }
}
