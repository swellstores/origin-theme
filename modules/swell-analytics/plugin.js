import Vue from 'vue'

export default async (ctx, inject) => {
  const options = <%= serialize(options) %>

  let ga
  let fbq
  let sgm

  // Google Analytics module
  if (options.googleAnalytics && options.googleAnalytics.id) {
    const { GA } = await import('./swell-analytics-ga')
    ga = new GA(options.googleAnalytics)
  }

  // Facebook Pixel module
  if (options.facebookPixel && options.facebookPixel.id) {
    const { FBQ } = await import('./swell-analytics-pixel')
    fbq = new FBQ(options.facebookPixel)
  }

  // Segment module
  if (options.segment && options.segment.id) {
    const { SGM } = await import('./swell-analytics-segment')
    sgm = new SGM(options.segment)
  }

  const swellAnalytics = new Vue({
    data() {
      return {
        ga: ga,
        fbq: fbq,
        sgm: sgm
      }
    },
    methods: {
      enable() {
        if (this.ga) this.ga.enable()
        if (this.fbq) this.fbq.enable()
        if (this.sgm) this.sgm.enable()
      },
      trackPage(path) {
        if (this.ga) this.ga.track('pageview', path)
        if (this.fbq) this.fbq.track('PageView')
        if (this.sgm) this.sgm.query('page')
      },
      disable() {
        if (this.ga) this.ga.disable()
        if (this.fbq) this.fbq.disable()
        if (this.sgm) this.sgm.disable()
      }
    }
  })

  ctx.$swellAnalytics = swellAnalytics
  inject('swellAnalytics', swellAnalytics)
}
