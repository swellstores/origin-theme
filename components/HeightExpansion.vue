<script>
const beforeEnterTransition = {
  opacity: 0,
  transition: 'all 0.4s cubic-bezier(0.6, 0.2, 0, 1)',
}

const enterTransition = {
  transition:
    'height 0.4s cubic-bezier(0.6, 0.2, 0, 1), opacity 0.4s 0.2s linear',
  position: 'absolute',
  visibility: 'hidden',
}

const afterEnterTransition = {
  height: 'auto',
}

const leaveTransition = {
  transition:
    'height 0.4s 0.1s cubic-bezier(0.6, 0.2, 0, 1), opacity 0.1s linear',
  opacity: 0,
}

export default {
  name: 'HeightExpansion',
  functional: true,

  render(createElement, context) {
    const data = {
      props: {
        name: 'expand',
      },
      on: {
        beforeEnter(element) {
          for (const [key, value] of Object.entries(beforeEnterTransition)) {
            element.style[key] = value
          }
        },
        enter(element) {
          const height = getComputedStyle(element).height

          for (const [key, value] of Object.entries(enterTransition)) {
            element.style[key] = value
          }

          element.style.position = null
          element.style.visibility = null
          element.style.height = 0

          // Force repaint to make sure the
          // animation is triggered correctly.
          // eslint-disable-next-line
          getComputedStyle(element).height

          setTimeout(() => {
            element.style.height = height
            element.style.opacity = 1
          })
        },
        afterEnter(element) {
          for (const [key, value] of Object.entries(afterEnterTransition)) {
            element.style[key] = value
          }
        },
        leave(element) {
          const height = getComputedStyle(element).height

          element.style.height = height

          for (const [key, value] of Object.entries(leaveTransition)) {
            element.style[key] = value
          }

          // Force repaint to make sure the
          // animation is triggered correctly.
          // eslint-disable-next-line
          getComputedStyle(element).height

          setTimeout(() => {
            element.style.height = 0
          })
        },
      },
    }
    return createElement('transition', data, context.children)
  },
}
</script>
