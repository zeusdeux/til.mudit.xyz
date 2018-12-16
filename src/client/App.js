import React from 'react'
import { Link, Route } from 'react-router-dom'
import TIL from './TIL'

export default function App() {
  return (
    <>
      <nav>
        <Link to="/1">1</Link>
        <Link to="/2">2</Link>
      </nav>
      <Route path="/:tilId" component={TIL} />
    </>
  )
}
