// This is a temporary script to deploy demo content before it goes live
require('dotenv').config()

const swell = require('swell-node')
const pages = require('./pages.json')
const menus = require('./menus.json')
const settings = require('./settings.json')
const styles = require('../../styles.json')

const { SWELL_STORE_ID, SWELL_API_KEY, SWELL_API_HOST, SWELL_API_PORT } = process.env

swell.init(SWELL_STORE_ID, SWELL_API_KEY, { host: SWELL_API_HOST, port: SWELL_API_PORT })
;(async () => {
  try {
    // Pages
    for (let page of pages) {
      await putContent(`/content/pages/${page.slug}`, {
        slug: page.slug,
        $replace: {
          published: true,
          ...page
        }
      })
    }
    // Store settings
    await putContent('/settings/store', {
      $set: {
        menus,
        settings: {
          store_id: SWELL_STORE_ID,
          theme_id: 'origin',
          date_updated: Date.now(),
          values: {
            ...settings,
            ...styles[0].settings
          }
        }
      }
    })
    console.log('Success!')
  } catch (err) {
    console.error(err)
  }
  process.exit()
})()

async function putContent(url, ...args) {
  console.log(`Updating ${url}`)
  const result = await swell.put(url, ...args)
  if (result.errors) {
    console.error(JSON.stringify(result.errors))
  } else {
    console.log(JSON.stringify(result, null, 4))
  }
  return result
}
