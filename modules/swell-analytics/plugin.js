import Vue from 'vue'

export default async (ctx, inject) => {
  let ga
  let fbq
  let sgm

  // Google Analytics module
  if (ctx.googleAnalytics && ctx.googleAnalytics.id) {
    const { GA } = await import('./swell-analytics-ga')
    ga = new GA(ctx.googleAnalytics)
  }

  // Facebook Pixel module
  if (ctx.facebookPixel && ctx.facebookPixel.id) {
    const { FBQ } = await import('./swell-analytics-pixel')
    fbq = new FBQ(ctx.facebookPixel)
  }

  // Segment module
  if (ctx.segment && ctx.segment.id) {
    const { SGM } = await import('./swell-analytics-segment')
    sgm = new SGM(ctx.segment)
  }

  const swellAnalytics = new Vue({
    data() {
      return {
        ga,
        fbq,
        sgm,
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
      },
    },
  })

  ctx.$swellAnalytics = swellAnalytics
  inject('swellAnalytics', swellAnalytics)
}
