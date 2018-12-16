import * as Contentful from 'contentful'

const contentfulClient = Contentful.createClient({
  space: 'pe315guv55pz',
  accessToken: 'cb56064cbb388ff129210206ccffcbb5d3fe1dc71ddd527b73f5c940ef6e3a34'
})

export async function getTils(
  tilId,
  noOfExtraTils = Number.parseInt(process.env.TIL_PRELOAD_WINDOW, 10) || 1
) {
  const { total, _limit, items: rawTils } = await contentfulClient.getEntries({
    limit: tilId + noOfExtraTils,
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
