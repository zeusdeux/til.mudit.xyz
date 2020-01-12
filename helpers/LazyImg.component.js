import React from 'react'

export default function LazyImage(props) {
  return <img {...props} loading="lazy" />
}
