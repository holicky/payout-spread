import { CNBFetchError } from '../api/cnb/client'
import { CNBParseError } from '../api/cnb/parser'

export function friendlyMessage(error: unknown): string {
  if (error instanceof CNBParseError) {
    return 'The CNB response format changed or contained invalid data.'
  }

  if (error instanceof CNBFetchError) {
    return error.status
      ? `The CNB service returned HTTP ${error.status}.`
      : 'The CNB service did not respond.'
  }

  if (error instanceof Error) return error.message
  return 'Please check your connection and try again.'
}
