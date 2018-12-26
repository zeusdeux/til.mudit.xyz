import https from 'https'

export function get(...args) {
  return new Promise((res, rej) => {
    let data = ''
    const request = https.request(...args, response => {
      response.setEncoding('utf8')
      response.on('data', chunk => {
        data += chunk
      })
      response.on('end', () => {
        res(JSON.parse(data))
      })
      response.on('error', rej)
    })

    request.on('error', rej)

    request.end()
  })
}
