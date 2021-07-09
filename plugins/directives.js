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
