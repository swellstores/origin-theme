// Pull content from test-theme account
require('dotenv').config()

const _ = require('lodash')
const swell = require('swell-node')
const algoliasearch = require('algoliasearch')

const algoliaClient = algoliasearch('0C58WC1CWD', '2d6e76bf15269bfcc442ae962c5aeb5b')

const {
  SWELL_STORE_ID,
  SWELL_API_KEY,
  SWELL_API_HOST,
  SWELL_API_PORT,
  SWELL_TEST_THEME_API_KEY
} = process.env

if (!SWELL_TEST_THEME_API_KEY) {
  throw new Error('Missing SWELL_TEST_THEME_API_KEY from .env')
}

swell.init('test-theme', SWELL_TEST_THEME_API_KEY)
;(async () => {
  console.log(`Fetching demo data...`)
  try {
    const result = await swell.get('/categories', {
      limit: null,
      expand: 'products:1000, products.product'
    })
    const itemsToSync = []
    for (const category of result.results) {
      const data = {
        ...category,
        products: category.products.results.map(cp => cp)
      }
      itemsToSync.push(data.products)
    }
    const syncResult = await syncItems('products', itemsToSync.flat(), [
      'name',
      'sku',
      'description',
      'price',
      ['images.0.file.url', 'imageUrl']
    ])
    console.log('Done.')
  } catch (err) {
    console.error(err)
  }
  process.exit()
})()

const syncItems = async (indexName, items, itemFields) => {
  const index = algoliaClient.initIndex(indexName)
  let result

  // Set attributes
  const objects = items.map(({ product: data }) => {
    return itemFields.reduce(
      (obj, field) => {
        if (Array.isArray(field)) {
          const fieldPath = field[0]
          const fieldName = field[1]
          const fieldValue = _.get(data, fieldPath)
          if (fieldValue) obj[fieldName] = fieldValue
          return obj
        } else {
          const fieldValue = _.get(data, field)
          if (fieldValue) obj[field] = fieldValue
          return obj
        }
      },
      {
        objectID: data.id // Algolia object ID
      }
    )
  })
  console.log(objects)
  console.log('Generated objects.')
  // Do the sync
  try {
    result = await index.saveObjects(objects)
    console.log(result)
  } catch (err) {
    console.log(err)
  }

  return result
}
