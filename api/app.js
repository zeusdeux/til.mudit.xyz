import { parse } from 'url'
import { init } from '../helpers/sentry'
import getErrorSender from '../helpers/getErrorResponder'
import { get } from '../helpers/request'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import PropTypes from 'prop-types'
import App from '../client/App'
import A from '../helpers/A.component'

export default async function app(req, res) {
  const Sentry = init({
    host: req.headers.host,
    method: req.method,
    lambda: parse(req.url).pathname,
    deployment: req.headers['x-now-deployment-url']
  })
  const respondWithError = getErrorSender(res)

  try {
    const { pathname } = parse(req.url)
    const tilId = Number.parseInt(pathname.slice(1), 10) // first character is a / in pathname

    if (Number.isNaN(tilId)) {
      throw new Error(`Expected tilId to be a number but received -> ${tilId}`)
    }

    const [total] = await get(encodeURI(`https://${req.headers.host}/getTils?count=1&extra=0`))

    if (tilId > total) {
      res.writeHead(303, {
        location: `/${total}`
      })
      res.end()
    } else {
      const [, tils] = await get(encodeURI(`https://${req.headers.host}/getTils?count=${tilId}`))

      const markup =
        '<!doctype html>\n' +
        ReactDOMServer.renderToString(
          <Index
            title="Mudit's TILs"
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
    await Sentry.captureException(err)
    return respondWithError('Something went wrong', 500)
  }
}

function Index({ title, ...appProps }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="author" content="Mudit" />
        <meta name="description" content="Things I've learnt" />
        <meta
          name="keywords"
          content="programming, javascript, web development, today I learned, TIL, lambda, serverless"
        />

        <link href="/favicon.ico" rel="icon" type="image/ico" />

        <title>{title}</title>

        <link rel="preload" as="style" href="/app.css" />
        <link rel="preload" as="script" href="/app.js" />

        <link rel="stylesheet" href="/app.css" />
        <script defer src="/app.js" />
      </head>
      <body>
        <nav>
          <A href="https://mudit.xyz">Homepage</A>
          <A href="https://blog.mudit.xyz">Blog</A>
          <A href="https://github.com/zeusdeux/til.mudit.xyz">View on GitHub</A>
        </nav>
        <main>
          <App {...appProps} />
        </main>
        {/* Global site tag (gtag.js) - Google Analytics --> */}
        <script defer src="https://www.googletagmanager.com/gtag/js?id=UA-59474035-3" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

          gtag('config', 'UA-59474035-3');`
          }}
        />
      </body>
    </html>
  )
}

Index.propTypes = {
  title: PropTypes.string.isRequired,
  total: PropTypes.number.isRequired,
  tils: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.object, PropTypes.number]))
  ).isRequired,
  currentTilId: PropTypes.number.isRequired
}
