import React from 'react'
import PropTypes from 'prop-types'

export default function TIL({ match }) {
  return <h1>til number {match.params.tilId}</h1>
}

TIL.propTypes = {
  match: PropTypes.object
}
