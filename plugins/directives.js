import Vue from 'vue'

/*
 ** Event listener: 'Enter' keypress
 */
let enterKeyPress

Vue.directive('enter-key', {
  bind: function(el, binding) {
    enterKeyPress = e => {
      if (e.keyCode === 13) binding.value()
    }

    el.addEventListener('keypress', enterKeyPress)
  },
  unbind(el) {
    el.removeEventListener('keypress', enterKeyPress)
  }
})
