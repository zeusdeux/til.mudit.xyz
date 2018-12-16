import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { getTils } from '../contentful'
import { tilsToMd } from '../mdToHtml'
;(async function run() {
  const currentTilId = Number.parseInt(location.pathname.substr(1), 10)
  const [total, rawTils] = await getTils(currentTilId)
  // convert til.fields.learnt from md to html
  const tils = await tilsToMd(rawTils)

  ReactDOM.hydrate(
    <App total={total} tils={tils} currentTilId={currentTilId} />,
    document.querySelector('main')
  )
})()
