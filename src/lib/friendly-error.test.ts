import { CNBFetchError } from '../api/cnb/client'
import { CNBParseError } from '../api/cnb/parser'
import { friendlyMessage } from './friendly-error'

describe('friendlyMessage', () => {
  it('describes a parse error generically', () => {
    expect(friendlyMessage(new CNBParseError('bad header'))).toBe(
      'The CNB response format changed or contained invalid data.',
    )
  })

  it('includes the HTTP status when a fetch error has one', () => {
    expect(friendlyMessage(new CNBFetchError('boom', 503))).toBe(
      'The CNB service returned HTTP 503.',
    )
  })

  it('falls back to a no-response message when status is missing', () => {
    expect(friendlyMessage(new CNBFetchError('network down'))).toBe(
      'The CNB service did not respond.',
    )
  })

  it('returns the message of any other Error', () => {
    expect(friendlyMessage(new Error('something went wrong'))).toBe(
      'something went wrong',
    )
  })

  it('returns the generic fallback for non-Error values', () => {
    const fallback = 'Please check your connection and try again.'
    expect(friendlyMessage('a string')).toBe(fallback)
    expect(friendlyMessage(undefined)).toBe(fallback)
    expect(friendlyMessage(null)).toBe(fallback)
    expect(friendlyMessage({ foo: 'bar' })).toBe(fallback)
  })
})
