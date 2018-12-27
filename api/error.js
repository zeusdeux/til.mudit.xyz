import { parse } from 'url'
import { init } from '../helpers/sentry'
import getErrorSender from '../helpers/getErrorResponder'

export default async function error(req, res) {
  const Sentry = init({
    host: req.headers.host,
    method: req.method,
    lambda: parse(req.url).pathname,
    deployment: req.headers['x-now-deplyment-url']
  })
  const respondWithError = getErrorSender(res)

  try {
    throw new Error('Something went wrong lads!')
  } catch (err) {
    await Sentry.captureException(err)
    return respondWithError('Something went wrong', 500)
  }
}
