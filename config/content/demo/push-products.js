// Pull content from test-theme account
require('dotenv').config()

const swell = require('swell-node')

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

const targetClient = swell.createClient(SWELL_STORE_ID, SWELL_API_KEY, {
  host: SWELL_API_HOST,
  port: SWELL_API_PORT
})

console.log(SWELL_STORE_ID, SWELL_API_KEY, {
  host: SWELL_API_HOST,
  port: SWELL_API_PORT
})
;(async () => {
  console.log(`Fetching demo data...`)
  try {
    const result = await swell.get('/categories', {
      limit: null,
      expand: 'products:1000, products.product, products.product.variants'
    })
    for (let category of result.results) {
      console.log(category && category.products)
      const data = {
        ...category,
        products: category.products.results.map(cp => ({
          ...cp,
          product: {
            ...cp.product,
            variants: cp.product.variants.results.map(variant => variant)
          }
        }))
      }
      const categoryResult = await targetClient.put('/categories/{id}', {
        id: data.id,
        $replace: data
      })
      console.log(categoryResult)
    }
    console.log('Done.')
  } catch (err) {
    console.error(err)
  }
  process.exit()
})()
