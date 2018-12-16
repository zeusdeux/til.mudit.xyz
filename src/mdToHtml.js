import * as remark from 'remark'
import * as html from 'remark-html'

const r = remark().use(html)

function mdToHtml(md) {
  return new Promise((res, rej) => {
    r.process(md, (err, html) => {
      if (err) {
        rej(err)
      } else {
        res(String(html))
      }
    })
  })
}

export function tilsToMd(rawTils) {
  return Promise.all(
    rawTils.map(async ([til, tilId]) => {
      til.fields.learntHtml = await mdToHtml(til.fields.learnt)
      return [til, tilId]
    })
  )
}
