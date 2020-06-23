
import Cookies from 'js-cookie'

const gaKey = process.env.GOOGLE_ANALYTICS_KEY

export default ({ app }) => {
  /*
  ** Only run if it's not prevented by user
  */
  if (!Cookies.get('cookiesAccepted') || !process.env.GOOGLE_ANALYTICS_KEY) return
  /*
  ** Include Google Analytics Script
  */
 (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
  /*
  ** Set the current page
  */
  ga('create', gaKey, 'auto')
  /*
  ** Every time the route changes (fired on initialization too)
  */
  app.router.afterEach((to, from) => {
    ga('set', 'page', to.fullPath)
    ga('send', 'pageview')
  })
}
