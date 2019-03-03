import { parse } from 'url'
import { init } from '../helpers/sentry'
import getErrorSender from '../helpers/getErrorResponder'
import { get } from '../helpers/request'

export default async function root(req, res) {
  const Sentry = init({
    host: req.headers.host,
    method: req.method,
    lambda: parse(req.url).pathname,
    deployment: req.headers['x-now-deployment-url']
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
    await Sentry.captureException(err)
    return respondWithError('Something went wrong', 500)
  }
}
