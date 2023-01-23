import pMap from 'p-map';
import { getLocales } from '../lang/utils';

export default async function getRoutes(swell) {
  const { defaultLocale, locales } = await getLocales(swell);
  const secondaryLocales = locales.filter(({ code }) => code !== defaultLocale);

  const pages = generateRoutesFor(
    await paginateThrough(swell, 'content', 'pages'),
    {
      defaultLocale,
      secondaryLocales,
    },
  );

  const categories = generateRoutesFor(
    await paginateThrough(swell, 'categories'),
    {
      defaultLocale,
      secondaryLocales,
      path: '/categories/',
    },
  );

  const products = generateRoutesFor(
    await paginateThrough(swell, 'products', {
      limit: 100,
    }),
    {
      defaultLocale,
      secondaryLocales,
      path: '/products/',
    },
  );

  /**
   * Attempts to get from the object the array under the key, and returns an empty array as a fallback.
   */
  const safeArray = (obj, key) => (Array.isArray(obj?.[key]) ? obj[key] : []);

  return [defaultLocale, ...secondaryLocales.map(({ code }) => code)]
    .map((locale) => [
      ...safeArray(pages, locale),
      ...safeArray(categories, locale),
      ...safeArray(products, locale),
    ])
    .reduce((acc, el) => [...acc, ...el], []);
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
  };

  const initialFetch = await fetchList(swell, module, model, initialParams);

  const { results, pages } = initialFetch;

  if (!pages) {
    return results;
  }

  const pagesResults = (
    await pMap(
      Object.keys(pages),
      (pageNumber) => {
        const fetchParams = {
          ...(query || typeof model === 'object' ? model : {}),
          page: pageNumber,
        };

        return fetchList(swell, module, model, fetchParams);
      },
      {
        concurrency: 4,
      },
    )
  ).reduce((acc, { results }) => [...acc, ...results], []);

  return [...results, ...pagesResults];
}

function fetchList(swell, module, model, params) {
  return swell[module].list.apply(
    swell[module],
    typeof model === 'string' ? [model, params] : [params],
  );
}

function generateRoutesFor(
  records,
  { defaultLocale, secondaryLocales, path = '/', pathField = 'slug' },
) {
  return records.reduce(
    (acc, page) => ({
      ...localizedRoutesFor(`${path}${page[pathField]}`, acc, secondaryLocales),
      [defaultLocale]: [
        ...(acc[defaultLocale] || []),
        `${path}${page[pathField]}`,
      ],
    }),
    {},
  );
}

function localizedRoutesFor(path, currentRoutes, locales) {
  return locales.reduce(
    (acc, { code }) => ({
      ...acc,
      [code]: [...(acc[code] || []), `/${code}${path}`],
    }),
    currentRoutes,
  );
}
