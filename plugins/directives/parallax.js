// @flow
if (typeof window === 'undefined') {
  global.window = null
}

if (typeof document === 'undefined') {
  global.document = null
}

const ParallaxJS = function(os) {
  this.os = os

  this.container = null

  this._bindContainer = () => {
    this.container = document.querySelector(this.os.container)
  }
}

ParallaxJS.prototype = {
  items: [],
  active: true,

  tProp:
    (window && window.transformProp) ||
    (function() {
      const testEl = document ? document.createElement('div') : null
      if (testEl && testEl.style.transform == null) {
        const vs = ['Webkit', 'Moz', 'ms']
        const t = 'Transform'
        for (const v of vs) {
          if (testEl.style[v + t] !== undefined) {
            return v + t
          }
        }
      }
      return 'transform'
    })(),

  remove(el, binding) {
    for (const item of this.items) {
      if (item.el === el) {
        this.items.splice(this.items.indexOf(el), 1)
      }
    }
  },

  add(el, binding) {
    if (!window) return
    const value = binding.value
    const arg = binding.arg
    const style = el.currentStyle || window.getComputedStyle(el)
    const mod = binding.modifiers

    if (style.display === 'none') return

    const height = mod.absY ? window.innerHeight : el.clientHeight || el.scrollHeight

    const cl = this.os.className
    if (typeof cl === 'string') {
      el.className = `${el.className} ${cl}`.trim()
    }

    this.items.push({
      el,
      iOT: el.offsetTop - parseInt(style.marginTop),
      style,
      value: value.speed || value,
      arg,
      mod,
      height,
      count: 0,
      minW: value.minW || this.os.minWidth || 0
    })
  },
  update() {
    if (!window) return
    this.items.forEach(function(item) {
      const t = item.el
      const n = t.currentStyle || window.getComputedStyle(t)

      item.height = item.mod.absY ? window.innerHeight : t.clientHeight || t.scrollHeight
      if (t.offsetParent !== null)
        item.iOT = t.offsetTop + t.offsetParent.offsetTop - parseInt(n.marginTop)
    })
  },
  move() {
    if (!window) return
    if (!this.active) return
    if (window.innerWidth < this.os.minWidth || 0) {
      this.items.forEach(item => {
        item.el.style[this.tProp] = ``
      })
      return
    }

    this.items.forEach((item, i) => {
      if (window.innerWidth < item.minW) return

      if (typeof IntersectionObserver !== 'undefined') {
        const rootMargin = `0px 0px 0px 0px`
        const observer = new IntersectionObserver(
          entries => {
            entries.forEach(entry => {
              if (entry.isIntersecting) this.parallax(item)
            })
          },
          {
            rootMargin
          }
        )
        observer.observe(item.el)
        return () => observer.unobserve(item.el)
      } else {
        this.parallax(item)
      }
    })
  },

  parallax(item) {
    const pos = item.el.getBoundingClientRect().top / item.value

    window.requestAnimationFrame(() => {
      const cx = item.mod.centerX ? '-50%' : '0px'
      const props = `translate3d(${cx},${pos.toFixed(3)}px,0px)`
      item.el.style[this.tProp] = props
    })
  }
}

export default {
  install(Vue, os = {}) {
    if (!window) return
    const p = new ParallaxJS(os)

    window.addEventListener(
      'scroll',
      () => {
        p.update()
        p.move(p)
      },
      { passive: true }
    )

    window.addEventListener(
      'resize',
      () => {
        p.update()
        p.move(p)
      },
      { passive: true }
    )

    Vue.prototype.$parallaxjs = p
    window.$parallaxjs = p
    Vue.directive('parallax', {
      bind(el, binding) {},
      inserted(el, binding) {
        if (!binding.value.enabled) return
        p.add(el, binding)
        p.move(p)
      },
      unbind(el, binding) {
        p.remove(el, binding)
      }
    })
  }
}
