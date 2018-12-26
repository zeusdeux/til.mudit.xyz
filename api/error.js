import { basename } from 'path'
import { init } from '../helpers/sentry'
import getErrorSender from '../helpers/getErrorResponder'

export default async function(req, res) {
  const Sentry = init({
    host: req.headers.host,
    method: req.method,
    lambda: basename(__filename),
    deployment: req.headers['x-now-deplyment-url']
  })
  const respondWithError = getErrorSender(res)

  try {
    throw new Error('Something went wrong lads!')
  } catch (err) {
    Sentry.captureException(err)
    return respondWithError('Something went wrong', 500)
  }
}
