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
    captureException(...args)

    // sentry buffers errors and this causes the lambda to
    // wait at most 2seconds while the buffer is flushed
    // to sentry's servers
    // without this, errors never reach Sentry as the lambda
    // is killed before the buffer is emptied
    return Sentry.getCurrentHub()
      .getClient()
      .close(2000)
  }

  return Sentry
}
