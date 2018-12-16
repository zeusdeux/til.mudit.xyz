import { resolve } from 'path'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import PropTypes from 'prop-types'
// import { StaticRouter } from 'react-router-dom'
import App from './client/App'

import express from 'express'
import bodyParser from 'body-parser'
import logger from 'morgan'
import * as Sentry from '@sentry/node'

import { getTils } from './contentful'

const app = express()

// TODO: Setup uploading sourcemaps
// https://docs.sentry.io/platforms/node/sourcemaps/
Sentry.init({ dsn: process.env.SENTRY_DSN })

process.on('uncaughtException', err => {
  Sentry.captureException(err)
})

process.on('unhandledRejection', reason => {
  Sentry.captureException(reason)
})

app.use(Sentry.Handlers.requestHandler())

if (process.env.DEV_MODE === 'true') {
  app.use(express.static(resolve('./public')))
}

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', async (_, res) => {
  const [total] = await getTils(1, 0)
  res.redirect(`/${total}`)
})

app.get('/error', () => {
  throw new Error('Broke something lads!')
})

app.get('/:tilId', async (req, res, next) => {
  const tilId = Number.parseInt(req.params.tilId, 10)

  if (Number.isNaN(tilId)) {
    next()
  }

  const [total, tils] = await getTils(tilId)

  if (tilId > total) {
    res.redirect(`/${total}`)
  } else {
    const markup = ReactDOMServer.renderToString(
      <Index
        title="TILs"
        total={total}
        tils={tils}
        currentTilId={tilId > total ? total : tilId}
      />
    )
    res.send(markup)
  }
})

app.get('*', (req, res) => {
  res.status(404).send(`<h3>Unknown route ${req.url}</h3><a href="/">Go home</a>`)
})

app.use(Sentry.Handlers.errorHandler())
app.use(function onError(_err, _req, res, _next) {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  res.statusCode = 500
  res.send(res.sentry + '\n')
})

function Index({ title, ...appProps }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
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
  tils: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number, PropTypes.object))
    .isRequired,
  currentTilId: PropTypes.number.isRequired
}

// eslint-disable-next-line no-console
app.listen(3030, () => console.log(`Listening on port 3030`))
