import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
;(async function run() {
  const currentTilId = Number.parseInt(location.pathname.substr(1), 10)
  const [total, tils] = await fetch(encodeURI(`/getTils?count=${currentTilId}`)).then(res =>
    res.json()
  )

  ReactDOM.hydrate(
    <App total={total} tils={tils} currentTilId={currentTilId} />,
    document.querySelector('main')
  )
})()
