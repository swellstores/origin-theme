import Vue from 'vue'
import balanceText from 'balance-text'

function balanceTarget(el, isChildrenDirective) {
  return isChildrenDirective ? Array.from(el.children) : el
}

Vue.directive('balance-text', {
  bind(el, { modifiers: { children } }) {
    const target = balanceTarget(el, children)
    Vue.nextTick(() => {
      balanceText(target, { watch: true })
    })
  },
  componentUpdated(el, { modifiers: { children } }) {
    const target = balanceTarget(el, children)
    balanceText(target)
  },
  unbind(el, { modifiers: { children } }) {
    const target = balanceTarget(el, children)
    balanceText(target, { watch: false })
  },
})

Vue.directive('click-outside', {
  bind(el, binding, vNode) {
    // Provided expression must evaluate to a function.
    if (typeof binding.value !== 'function') {
      const compName = vNode.context.name
      let warn = `[Vue-click-outside:] provided expression '${binding.expression}' is not a function, but has to be`
      if (compName) {
        warn += `Found in component '${compName}'`
      }

      console.warn(warn)
    }
    // Define Handler and cache it on the element
    const bubble = binding.modifiers.bubble
    const handler = (e) => {
      if (bubble || (!el.contains(e.target) && el !== e.target)) {
        binding.value(e)
      }
    }
    el.__vueClickOutside__ = handler

    // add Event Listeners
    document.addEventListener('click', handler)
  },

  unbind(el, binding) {
    // Remove Event Listeners
    document.removeEventListener('click', el.__vueClickOutside__)
    el.__vueClickOutside__ = null
  },
})
