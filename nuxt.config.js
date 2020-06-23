export default {
  target: 'static',

  components: true,

  /*
   ** Set the progress-bar color
   */
  loading: { color: 'var(--colors-accent)', continuous: true },

  /*
   ** Global CSS (tailwind.css is loaded by @nuxtjs/tailwindcss module)
   */
  css: [],

  /*
   ** Vue plugins to load before mounting the App
   */
  plugins: [
    { src: '~/plugins/vue-slider-component', mode: 'client' },
    { src: '~/plugins/reporting/ga', mode: 'client' },
    '~/plugins/directives.js'
  ],

  /*
   ** Nuxt.js modules
   */
  modules: ['@nuxtjs/sentry', 'vue-balance-text/nuxt/module'],
  buildModules: ['@nuxtjs/tailwindcss', '~/modules/swell-editor', '~/modules/swell'],

  /*
   ** Sentry module configuration
   *
   *  You can use ENV vars to set Sentry options, or put them in here.
   *  https://www.npmjs.com/package/@nuxtjs/sentry
   */
  sentry: {
    // dsn: '',
    // config: {}
  },

  /*
   ** Swell module configuration
   *
   *  If you've cloned this repository from your store dashboard,
   *  these settings will already be configured in config/settings.json.
   *  You can optionally override them here or using ENV vars.
   *  https://github.com/swellstores/swell-theme-origin#configuration
   */
  swell: {
    storeId: process.env.SWELL_STORE_ID,
    publicKey: process.env.SWELL_PUBLIC_KEY,
    storeUrl: process.env.SWELL_STORE_URL // TODO remove when publishing on github
  },

  swellEditor: {
    // cssVariableGroups: []
  },

  /*
   ** Build configuration
   */
  build: {
    /*
     ** PostCSS setup
     */
    postcss: {
      // Add plugin names as key and arguments as value
      // Disable a plugin by passing false as value
    },
    /*
+    ** Extract CSS
+    */
    // extractCSS: true,
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {
      // Fix for eslint error due to swell-js being linked
      // https://github.com/vuejs/vue-cli/issues/2948
      config.resolve.symlinks = false // TODO remove

      // Run ESLint on save
      /* until nuxt/no-this-in-fetch-data is fixed
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      } */
    }
  },

  /*
   ** Extend default Nuxt routes to add page aliases
   */
  router: {
    trailingSlash: true,
    extendRoutes(routes, resolve) {
      // Rewrite to use the pages/_slug.vue component for home page, since the
      // content type is the same. If you want to have a unique template,
      // create a pages/index.vue and remove this route definition.
      routes.push({
        name: 'index',
        path: '/',
        component: resolve(__dirname, 'pages/_slug.vue')
      })
    }
  },

  /*
   ** Extend default Nuxt server options
   */
  server: {
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 3000
  }
}
