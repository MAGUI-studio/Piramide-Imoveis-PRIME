import assert from 'node:assert/strict'
import {test} from 'node:test'
import {hasCookieConsent} from '../lib/cookieConsent.ts'

test('recognizes saved consent and remains disabled when storage is unavailable', () => {
  const documentDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'document')
  const storageDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  try {
    Object.defineProperty(globalThis, 'document', {configurable: true, value: {cookie: 'other=1;cookie-consent=accepted'}})
    Object.defineProperty(globalThis, 'localStorage', {configurable: true, get() {throw new Error('Storage unavailable')}})
    assert.equal(hasCookieConsent(), true)
    document.cookie = 'cookie-consent=rejected'
    assert.equal(hasCookieConsent(), false)
    Object.defineProperty(globalThis, 'localStorage', {configurable: true, value: {getItem: () => 'accepted'}})
    assert.equal(hasCookieConsent(), true)
    Object.defineProperty(globalThis, 'localStorage', {configurable: true, value: {getItem: () => null}})
    assert.equal(hasCookieConsent(), false)
  } finally {
    if (documentDescriptor) Object.defineProperty(globalThis, 'document', documentDescriptor)
    else delete globalThis.document
    if (storageDescriptor) Object.defineProperty(globalThis, 'localStorage', storageDescriptor)
    else delete globalThis.localStorage
  }
})
