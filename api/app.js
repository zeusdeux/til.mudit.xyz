import { parse } from 'url'
import { basename } from 'path'
import { init } from '../helpers/sentry'
import getErrorSender from '../helpers/getErrorResponder'
import { get } from '../helpers/request'
import { tilsToMd } from '../helpers/mdToHtml'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import PropTypes from 'prop-types'
import App from '../client/App'

export default async function(req, res) {
  const Sentry = init({
    host: req.headers.host,
    method: req.method,
    lambda: basename(__filename),
    deployment: req.headers['x-now-deplyment-url'] || req.headers['x-now-deployment-url']
  })
  const respondWithError = getErrorSender(res)

  try {
    const { pathname } = parse(req.url)
    const tilId = Number.parseInt(pathname.slice(1), 10) // first character is a / in pathname

    if (Number.isNaN(tilId)) {
      throw new Error(`Expected tilId to be a number but received -> ${tilId}`)
    }

    const [total, rawTils] = await get(
      encodeURI(`https://${req.headers.host}/getTils?count=${tilId}`)
    )
    // convert til.fields.learnt from md to html
    const tils = await tilsToMd(rawTils)

    if (tilId > total) {
      res.writeHead(303, {
        location: `/${total}`
      })
      res.end()
    } else {
      const markup = ReactDOMServer.renderToString(
        <Index
          title="TILs"
          total={total}
          tils={tils}
          currentTilId={tilId > total ? total : tilId}
        />
      )
      res.writeHead(200, {
        'content-type': 'text/html',
        'content-length': Buffer.byteLength(markup, 'utf8')
      })
      res.end(markup)
    }
  } catch (err) {
    Sentry.captureException(err)
    return respondWithError('Something went wrong', 500)
  }
}

function Index({ title, ...appProps }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <link rel="preload" as="style" href="/app.css" />
        <link rel="preload" as="script" href="/app.js" />

        <link rel="stylesheet" href="/app.css" />
        <script defer src="/app.js" />
      </head>
      <body>
        <main>
          <App {...appProps} />
        </main>
      </body>
    </html>
  )
}

Index.propTypes = {
  title: PropTypes.string.isRequired,
  total: PropTypes.number.isRequired,
  tils: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number, PropTypes.object)).isRequired,
  currentTilId: PropTypes.number.isRequired
}
