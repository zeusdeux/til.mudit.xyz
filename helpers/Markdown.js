import React from 'react'
import Markdown from 'react-markdown'
import A from './A.component'
import LazyImg from './LazyImg.component'

export default function WrappedMarkdown(props) {
  return <Markdown {...props} escapeHtml={false} renderers={{ link: A, image: LazyImg }} />
}
