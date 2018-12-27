import { parse } from 'url'
import { createClient } from 'contentful'
import { init } from '../helpers/sentry'
import getErrorSender from '../helpers/getErrorResponder'

export default async function getTils(req, res) {
  const Sentry = init({
    host: req.headers.host,
    method: req.method,
    lambda: parse(req.url).pathname,
    deployment: req.headers['x-now-deplyment-url']
  })
  const respondWithError = getErrorSender(res)

  try {
    const {
      query: { count, extra } // no of tils to fetch and no of extra to fetch past count
    } = parse(req.url, true)

    // no of TILs to fetch
    const noOfTils = Number.parseInt(count, 10)

    if (Number.isNaN(noOfTils)) {
      return respondWithError('"count" query parameter should be an integer', 422)
    }

    // grow the number of TILs to fetch by this number
    const noOfExtraTils = getNoOfExtraTILs(extra)

    if (Number.isNaN(noOfExtraTils)) {
      return respondWithError('"extra" query parameter should be an integer', 422)
    }

    const contentfulClient = createClient({
      space: process.env.TIL_SPACE_ID,
      accessToken: process.env.TIL_CTFL_ACCESS_TOKEN,
      insecure: process.env.NODE_ENV !== 'production' ? true : false,
      environment: process.env.NODE_ENV !== 'production' ? 'dev' : 'master'
    })

    // Get how many TILs we have in total as we use this to calculate
    // value for `skip` param
    const { total: totalEntriesCount } = await contentfulClient.getEntries({
      content_type: 'learning',
      limit: 1
    })

    // The code below figures out how many TILs to fetch from contentful.
    // Say we have 5 TILs in total. count of 1 stands for the OLDEST TIL.
    // Say we request count 2 and no of extra tils is 1. In this case, we
    // only want to return TILs 1, 2 and 3 (the third one is due to extra TILs being 1).
    // Given that we get TILs sorted in descending order of createdAt data of TILs,
    // this means we have to skip the first 2 TILs (namely TIL 5 and TIL 4) and fetch
    // the last 3. To do this, we use the `skip` parameter.
    // To understand this quicker, ignore noOfExtraTils and see what the code tells you.
    const windowSize = noOfTils + noOfExtraTils
    const { total, _limit, items: rawTils } = await contentfulClient.getEntries({
      skip: windowSize >= totalEntriesCount ? 0 : totalEntriesCount - windowSize,
      limit: windowSize,
      content_type: 'learning',
      select: 'sys.createdAt,fields.heading,fields.learnt,fields.url,fields.tag',
      order: '-sys.createdAt'
    })

    // til and tilId pairs
    // we subtract as rawTils are ordered by latest createdAt first
    // So, the latest TIL will be at 0th index but it's id should actually
    // be the highest. Hence the subtraction
    const result = [total, rawTils.map((til, i) => [til, rawTils.length - i])]

    res.writeHead(200, {
      'content-type': 'application/json'
    })

    res.end(JSON.stringify(result, null, 2))
  } catch (err) {
    await Sentry.captureException(err)
    return respondWithError('Something went wrong', 500)
  }
}

function getNoOfExtraTILs(noOfExtraTils = process.env.TIL_PRELOAD_WINDOW) {
  return Number.parseInt(noOfExtraTils, 10)
}
