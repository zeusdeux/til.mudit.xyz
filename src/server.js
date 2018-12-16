import { resolve } from 'path'
import bodyParser from 'body-parser'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import PropTypes from 'prop-types'
import { StaticRouter } from 'react-router-dom'
import App from './client/App'

import express from 'express'
import logger from 'morgan'

const app = express()

app.use(express.static(resolve('./public')))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', (_, res) => res.redirect('/1'))

app.get('*', (req, res) => {
  const ctx = {}
  const markup = ReactDOMServer.renderToString(
    <StaticRouter location={req.url} context={ctx}>
      <App />
    </StaticRouter>
  )

  // skipping ctx.url check for redirects
  // as I gurantee the code has no <Redirect> usage
  res.send(ReactDOMServer.renderToString(<Index title="TILs" app={markup} />))
})

function Index({ title, app }) {
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
        <main dangerouslySetInnerHTML={{ __html: app }} />
      </body>
    </html>
  )
}

Index.propTypes = {
  title: PropTypes.string.isRequired,
  app: PropTypes.string.isRequired
}

// eslint-disable-next-line no-console
app.listen(3030, () => console.log(`Listening on port 3030`))
