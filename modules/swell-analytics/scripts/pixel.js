/**
 * @class Fb
 */
export class FBQ {
  constructor (options) {
    this.fbq = pixelScript()
    this.options = options
  }

  /**
   * @method enable
   */
  enable () {
    this.init()
    this.track()
  }

  /**
   * @method disable
   */
  disable () {
    this.query('consent', 'revoke')
  }

  /**
   * @method init
   */
  init () {
    this.query('init', this.options.id)
  }

  /**
   * @method track
   */
  track (event = null, parameters = null) {
    if (!event) {
      event = 'PageView'
    }

    this.query('track', event, parameters)
  }

  /**
   * @method query
   * @param {string} cmd
   * @param {object} option
   * @param {object} parameters
   */
  query (cmd, option, parameters = null) {
    if (!parameters) {
      this.fbq(cmd, option)
    } else {
      this.fbq(cmd, option, parameters)
    }
  }
}

const pixelScript = () => {
  let _fbq

  /* eslint-disable */
  if (typeof window !== 'undefined') {
    ((f, b, e, v, n, t, s) => {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ?
          n.callMethod.apply(n, arguments) : n.queue.push(arguments)
      };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '<%= options.version %>';
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.defer = true;
      t.src = v;
      s = b.getElementsByTagName('body')[0];
      s.parentNode.appendChild(t, s);

      _fbq = fbq;
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  }

  return _fbq
}
