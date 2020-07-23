/**
 * @class SGM
 */
export class SGM {
  constructor(options) {
    this.sgm = sgmScript()
    this.options = options
  }

  /**
   * @method enable
   */
  enable() {
    window.analytics.load(this.options.id)
    window.analytics.page()
  }

  /**
   * @method disable
   */
  disable() {
    window.analytics.off()
  }

  /**
   * @method query
   * @param {string} cmd
   * @param {object} option
   * @param {object} parameters
   */
  query(method, parameters = null) {
    if (!parameters) {
      window.analytics[method]()
    } else {
      window.analytics[method](parameters)
    }
  }
}

const sgmScript = () => {
  let _sgm

  /* eslint-disable */
  if (typeof window !== 'undefined') {
    /* eslint-disable */
    !(function() {
      var analytics = (window.analytics = window.analytics || [])
      if (!analytics.initialize)
        if (analytics.invoked)
          window.console && console.error && console.error('Segment snippet included twice.')
        else {
          analytics.invoked = !0
          analytics.methods = [
            'trackSubmit',
            'trackClick',
            'trackLink',
            'trackForm',
            'pageview',
            'identify',
            'reset',
            'group',
            'track',
            'ready',
            'alias',
            'debug',
            'page',
            'once',
            'off',
            'on',
            'addSourceMiddleware',
            'addIntegrationMiddleware',
            'setAnonymousId',
            'addDestinationMiddleware'
          ]
          analytics.factory = function(t) {
            return function() {
              var e = Array.prototype.slice.call(arguments)
              e.unshift(t)
              analytics.push(e)
              return analytics
            }
          }
          for (var t = 0; t < analytics.methods.length; t++) {
            var e = analytics.methods[t]
            analytics[e] = analytics.factory(e)
          }
          analytics.load = function(t, e) {
            var n = document.createElement('script')
            n.type = 'text/javascript'
            n.async = !0
            n.src = 'https://cdn.segment.com/analytics.js/v1/' + t + '/analytics.min.js'
            var a = document.getElementsByTagName('script')[0]
            a.parentNode.insertBefore(n, a)
            analytics._loadOptions = e
          }
          analytics.SNIPPET_VERSION = '4.1.0'
          _sgm = window.analytics
        }
    })()
  }

  return _sgm
}
