/** Cookie consent storage — same key/format as the previous CookieConsent component. */
export const CONSENT_KEY = 'operava_cookie_consent'
const VERSION = '1'

export type ConsentChoice = 'accepted' | 'essential' | null

export function readConsent(): ConsentChoice {
  try {
    const raw = localStorage.getItem(CONSENT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { choice?: string; version?: string }
    if (parsed?.version !== VERSION) return null
    return parsed.choice === 'accepted' || parsed.choice === 'essential' ? parsed.choice : null
  } catch {
    return null
  }
}

export function writeConsent(choice: 'accepted' | 'essential') {
  const payload = { choice, version: VERSION, at: new Date().toISOString() }
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(payload))
  } catch {
    /* storage unavailable — keep the choice for this page view only */
  }
  window.dispatchEvent(new CustomEvent('operava:consent', { detail: payload }))
}

export function clearConsent() {
  try {
    localStorage.removeItem(CONSENT_KEY)
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent('operava:consent', { detail: null }))
}
