import React from 'react'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'
import Markdown from '../helpers/Markdown'

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      tils: props.tils,
      total: props.total,
      currentTilId: props.currentTilId,
      loading: false
    }
    this.popstateHandler = this.popstateHandler.bind(this)
    this.loadMore = this.loadMore.bind(this)
    this.makeCurrent = this.makeCurrent.bind(this)
    this.tilRef = React.createRef()
  }
  popstateHandler(e) {
    // e.state can obviously be null if pressing the
    // back button takes the user somewhere away from our app
    // let the browser do it's thing if that happens
    if (!e.state) {
      return
    }

    // this check ensures that by pressing back, we don't lose
    // the already loaded TILs. If we are going back to a much earlier
    // TIL that the one we are one, we just change the currentTilId and
    // retain this.state.tils and this.state.total as they are the latest
    // state.
    // The tils length can only increase by clicking load more so this
    // logic preserves the state updated by clicking load more button
    if (this.state.tils.length >= e.state.tils.length) {
      this.setState({
        currentTilId: e.state.currentTilId
      })
    } else {
      this.setState({
        ...e.state
      })
    }
  }
  componentDidMount() {
    // push the current state when the app mounts
    // this is needed for popstate to work properly
    // as e.state stands for current state - 1 index
    // in the history stack which means e.state is
    // not the top of history stack in popstate but one
    // below the top.
    // More here:
    // https://stackoverflow.com/questions/11092736/window-onpopstate-event-state-null
    history.replaceState(this.state, '', this.state.currentTilId)
    window.addEventListener('popstate', this.popstateHandler)
    window.requestAnimationFrame(() => {
      const { tils, currentTilId } = this.state
      if (tils.length !== currentTilId) {
        this.tilRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    })
  }
  componentWillUnmount() {
    window.removeEventListener('popstate', this.popstateHandler)
  }
  async loadMore(_) {
    this.setState({
      loading: true
    })
    const [total, tils] = await fetch(encodeURI(`/getTils?count=${this.state.tils.length}`)).then(
      res => res.json()
    )
    // convert til.fields.learnt from md to html
    this.setState({
      total,
      tils,
      loading: false
    })
  }
  makeCurrent(tilId) {
    if (this.state.currentTilId === tilId) {
      return
    }
    // the pushState call is in the setState callback
    // and not componentDidUpdate as if it was in cDU,
    // then that would break browser nav functionality.
    // why? Picture this, you're on /1 on page load.
    // Then you click on /2. cDU kicks in and pushes
    // 2 (which is currentTilId) onto the history.
    // Now pressing back can only take us back to /2
    // which we are already on. And everytime we press
    // back in the browser, cDU kicks in and pushes 2 again
    // on top of history thus making navigation useless
    // Putting it in the setState callback here ensures
    // that it is pushed onto history ONLY when this
    // function is called and that is when the user
    // clicks on a TIL
    this.setState(
      {
        currentTilId: tilId
      },
      _ => {
        history.pushState(this.state, '', this.state.currentTilId)
      }
    )
  }
  render() {
    const { total, tils, currentTilId, loading } = this.state

    const tilNodes = tils.map(([til, tilId]) => {
      const { heading, learnt, url, tags = [] } = til.fields
      const createdAt = new Date(til.sys.createdAt).toString()
      const isCurrTil = currentTilId === tilId
      const extraPropsForCurrentTil = isCurrTil
        ? {
            ref: this.tilRef
          }
        : {}

      return (
        <section
          key={tilId}
          onClick={_ => this.makeCurrent(tilId)}
          className={`til ${isCurrTil ? 'selected' : ''}`}
          id={`til-${tilId}`}
          {...extraPropsForCurrentTil}
        >
          {isCurrTil ? (
            <Helmet>
              <title>{`Mudit's TILs — ${heading}`}</title>
            </Helmet>
          ) : null}
          <h2 className="heading">{heading}</h2>
          <Tags tags={tags} />
          <Markdown className="til-content" source={learnt} />
          <p>
            Read more:{' '}
            <a href={url} target="_blank" rel="noopener noreferrer">
              {url}
            </a>
          </p>
          <p>Created at: {createdAt}</p>
        </section>
      )
    })

    // const tilNodes = tils.map()
    return (
      <>
        {total > tilNodes.length ? (
          <button onClick={this.loadMore}>{loading ? 'Loading...' : 'Load more'}</button>
        ) : null}
        {tilNodes}
      </>
    )
  }
}

function Tags({ tags }) {
  return (
    <>
      {tags.map((tag, idx) => (
        <i key={tag} className="tag">
          {tag}
          {idx === tags.length - 1 ? '' : ','}
        </i>
      ))}
    </>
  )
}

Tags.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string).isRequired
}

App.propTypes = {
  tils: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.object, PropTypes.number]))
  ).isRequired,
  total: PropTypes.number,
  currentTilId: PropTypes.number
}
