export default function (_moduleOptions) {
  this.nuxt.hook('generate:done', (context) => {
    this.nuxt.options.sitemap.routes = [...context.generatedRoutes]
  })
}
