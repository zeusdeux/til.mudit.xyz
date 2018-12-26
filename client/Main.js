import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { tilsToMd } from '../helpers/mdToHtml'
;(async function run() {
  const currentTilId = Number.parseInt(location.pathname.substr(1), 10)
  const [total, rawTils] = await fetch(encodeURI(`/getTils?count=${currentTilId}`)).then(res =>
    res.json()
  )
  // convert til.fields.learnt from md to html
  const tils = await tilsToMd(rawTils)

  ReactDOM.hydrate(
    <App total={total} tils={tils} currentTilId={currentTilId} />,
    document.querySelector('main')
  )
})()
