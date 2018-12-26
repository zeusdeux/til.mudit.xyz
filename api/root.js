import { basename } from 'path'
import { init } from '../helpers/sentry'
import getErrorSender from '../helpers/getErrorResponder'
import { get } from '../helpers/request'

export default async function(req, res) {
  const Sentry = init({
    host: req.headers.host,
    method: req.method,
    lambda: basename(__filename),
    deployment: req.headers['x-now-deplyment-url']
  })
  const respondWithError = getErrorSender(res)

  try {
    const url = encodeURI(`https://${req.headers.host}/getTils?count=1&extra=0`)
    const [total] = await get(url)
    res.writeHead(303, {
      location: `/${total}`
    })
    res.end()
  } catch (err) {
    Sentry.captureException(err)
    return respondWithError('Something went wrong', 500)
  }
}
