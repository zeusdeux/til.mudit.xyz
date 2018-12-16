import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { getTils } from '../contentful'
;(async function run() {
  const currentTilId = Number.parseInt(location.pathname.substr(1), 10)
  const [total, tils] = await getTils(currentTilId)

  ReactDOM.hydrate(
    <App total={total} tils={tils} currentTilId={currentTilId} />,
    document.querySelector('main')
  )
})()
