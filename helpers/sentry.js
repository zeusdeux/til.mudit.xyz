import * as Sentry from '@sentry/node'

export function init({ host, method, lambda, deployment }) {
  const environment = host === process.env.PRODUCTION_URL ? 'production' : host

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment
  })

  Sentry.configureScope(scope => {
    scope.setTag('deployment', deployment)
    scope.setTag('lambda', lambda)
    scope.setTag('method', method)
  })
  const captureException = Sentry.captureException.bind(Sentry)
  Sentry.captureException = (...args) => {
    // eslint-disable-next-line
    console.log('Error:', ...args)
    return captureException(...args)
  }

  return Sentry
}
