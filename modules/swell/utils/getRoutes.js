import pMap from 'p-map'
import { getLocales } from '../lang/utils'

export default async function getRoutes(swell) {
  const { defaultLocale, locales } = await getLocales(swell)
  const secondaryLocales = locales.filter(({ code }) => code !== defaultLocale)

  const pages = (await paginateThrough(swell, 'content', 'pages')).reduce(
    (acc, page) => [
      ...acc,
      `/${page.slug}`,
      ...localizedRoutesFor(`/${page.slug}`, secondaryLocales),
    ],
    []
  )

  const categories = (await paginateThrough(swell, 'categories')).reduce(
    (acc, category) => [
      ...acc,
      `/categories/${category.slug}`,
      ...localizedRoutesFor(`/categories/${category.slug}`, secondaryLocales),
    ],
    []
  )

  const products = (
    await paginateThrough(swell, 'products', {
      limit: 100,
    })
  ).reduce(
    (acc, product) => [
      ...acc,
      `/products/${product.slug}`,
      ...localizedRoutesFor(`/products/${product.slug}`, secondaryLocales),
    ],
    []
  )

  return [...pages, ...categories, ...products]
}

// arguments reference for different arity:
// paginateThrough(swell, model, query)
// or
// paginateThrough(swell, module, model, query)
// module is generally needed for content models
async function paginateThrough(swell, module, model, query) {
  const initialParams = {
    page: 1,
    window: false,
    fields: 'slug',
    limit: 100,
    ...(query || typeof model === 'object' ? model : {}),
  }

  const initialFetch = await fetchList(swell, module, model, initialParams)

  const { results, pages } = initialFetch

  if (!pages) {
    return results
  }

  const pagesResults = (
    await pMap(
      Object.keys(pages),
      (pageNumber) => {
        const fetchParams = {
          ...(query || typeof model === 'object' ? model : {}),
          page: pageNumber,
        }

        return fetchList(swell, module, model, fetchParams)
      },
      {
        concurrency: 4,
      }
    )
  ).reduce((acc, { results }) => [...acc, ...results], [])

  return [...results, ...pagesResults]
}

function fetchList(swell, module, model, params) {
  return swell[module].list.apply(
    swell[module],
    typeof model === 'string' ? [model, params] : [params]
  )
}

function localizedRoutesFor(path, locales) {
  return locales.map(({ code }) => `/${code}${path}`)
}
