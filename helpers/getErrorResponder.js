import { STATUS_CODES } from 'http'

export default function getErrorResponder(res) {
  return (message, errorCode = 500) => {
    const response = JSON.stringify(
      {
        error: {
          code: STATUS_CODES[errorCode],
          message
        }
      },
      null,
      2
    )

    res.writeHead(errorCode, {
      'content-type': 'application/json',
      'content-length': Buffer.byteLength(response, 'utf8')
    })
    res.end(response)
    return
  }
}
