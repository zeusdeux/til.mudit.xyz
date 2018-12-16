import * as Contentful from 'contentful'

const contentfulClient = Contentful.createClient({
  space: 'pe315guv55pz',
  accessToken: 'cb56064cbb388ff129210206ccffcbb5d3fe1dc71ddd527b73f5c940ef6e3a34'
})

export async function getTils(
  tilId,
  noOfExtraTils = Number.parseInt(process.env.TIL_PRELOAD_WINDOW, 10) || 1
) {
  const { total: totalEntriesCount } = await contentfulClient.getEntries({
    content_type: 'learning'
  })
  const windowSize = tilId + noOfExtraTils
  const { total, _limit, items: rawTils } = await contentfulClient.getEntries({
    // we need the skip since the entries are sorted in reverse order or createdAt
    // and therefore, if we are on /1, then we don't need entries 1 and 2 as they would be
    // the 1st two latest ones but instead the first two from the end and therefore
    // we move the offset using skip
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
  return [total, rawTils.map((til, i) => [til, rawTils.length - i])]
}
