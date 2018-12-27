/* eslint-disable no-console */
const { join, resolve } = require('path')
const { routes } = require('./now.json')
const express = require('express')
const logger = require('morgan')
const https = require('https')
const http = require('http')

// dirty https.request which is used by lambdas internally
// as I don't want to deal with setting up an https server
// for local testing ¯\_(ツ)_/¯
https.request = function(...args) {
  const [url, ...rest] = args
  let newUrl

  if (typeof url === 'string') {
    newUrl = url.replace('https://', 'http://')
  } else {
    newUrl = {
      ...url
    }

    newUrl.protocol = 'http:'
    newUrl.href =
      typeof newUrl.href === 'string' ? newUrl.href.replace('https://', 'http://') : newUrl.href
    newUrl.secureEndpoint = false
  }

  return http.request(newUrl, ...rest)
}

const app = express()

app.use(logger('dev'))
app.use(express.static('./public'))

// headers are ignored
// TODO: Figure out how to support headers
// described in now.json['routes']
routes.forEach(({ src: route, methods: METHODS, dest, status }) => {
  const methods = Array.isArray(METHODS) ? METHODS.map(m => m.toLowerCase()) : ['all']
  // replace new regex capture groups cuz express can't handle it and breaks
  const routeRegexp = new RegExp('^(?:' + route.replace(/\(\?<.*?>(.*?)\)/, '$1') + ')$')

  if (!dest) {
    const handler = function statusHandler(_, res) {
      console.log(`> handle status ${status}`)
      res.sendStatus(status)
    }
    app.use(handler)
  } else {
    // everything out of public is served as a static asset
    if (dest.includes('public/')) {
      return
    }

    let handler = require(resolve('.', join('.', dest)))

    if (typeof handler.default === 'function') {
      handler = handler.default
    }

    methods.forEach(method => {
      app[method](routeRegexp, async function(req, res, next) {
        try {
          console.log('>', handler.name)
          await handler(req, res)
        } catch (e) {
          console.log(`> Error in ${handler.name}`, e)
          next(e)
        }
      })
    })
  }
})

app.listen(3030, _ => console.log('Listening on port 3030'))
