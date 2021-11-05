export default function (_moduleOptions) {
  this.nuxt.hook('generate:done', (context) => {
    const { locales } = context.options.i18n
    const localesRegex = new RegExp(
      locales.map(({ code }) => `^/${code}`).join('|')
    )

    const sitemapRoutes = [...context.generatedRoutes].reduce((acc, path) => {
      const match = path.match(localesRegex)
      const basePath = match ? path.replace(match[0], '') : path

      const link = {
        url: path,
        lang: match ? match[0].replace('/', '') : 'x-default',
      }

      const route = acc[basePath]
        ? {
            ...acc[basePath],
            links: [...acc[basePath].links, link],
          }
        : {
            url: basePath,
            links: [link],
          }

      return { ...acc, [basePath]: route }
    }, {})

    this.nuxt.options.sitemap.routes = Object.values(sitemapRoutes)
  })
}
