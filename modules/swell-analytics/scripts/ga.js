/**
 * @class GA
 */
export class GA {
  constructor(options) {
    this.ga = gaScript()
    this.options = options
  }

  /**
   * @method enable
   */
  enable() {
    this.init()
    this.track()
  }

  /**
   * @method disable
   */
  disable() {
    window[`ga-disable-${this.options.id}`] = true
  }

  /**
   * @method init
   */
  init() {
    if (typeof window.ga === 'undefined') return 
    this.ga = window.ga
    this.ga('create', this.options.id, 'auto')
  }

  /**
   * @method track
   */
  track(event = null, parameters = null) {
    if (!event) event = 'pageview'
    if (!parameters) parameters = '/'
    

    this.query('send', event, parameters)
  }

  /**
   * @method query
   * @param {string} cmd
   * @param {object} option
   * @param {object} parameters
   */
  query(cmd, option, parameters = null) {
    if (!parameters) {
      this.ga(cmd, option)
    } else {
      this.ga(cmd, option, parameters)
    }
  }
}

const gaScript = () => {
  let _ga

  /* eslint-disable */
  if (typeof window !== 'undefined') {
    /* eslint-disable */
    ;((i, s, o, g, r, a, m) => {
      i['GoogleAnalyticsObject'] = r
      ;(i[r] =
        i[r] ||
        function() {
          ;(i[r].q = i[r].q || []).push(arguments)
        }),
        (i[r].l = 1 * new Date())
      ;(a = s.createElement(o)), (m = s.getElementsByTagName(o)[0])
      a.async = 1
      a.src = g
      m.parentNode.insertBefore(a, m)
      _ga = ga
    })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga')
  }

  return _ga
}