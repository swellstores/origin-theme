import Vue from 'vue'
import middleware from './middleware'
import { generateCssVariableStylesheet, setCssVariable, selectContent } from './swell-editor-utils'

export default async (context, inject) => {
  const settings = await context.app.$swell.settings.get()

  // Inline CSS variables stylesheet
  context.app.head.style.push({
    type: 'text/css',
    body: true,
    title: 'swell-css-variables',
    cssText: generateCssVariableStylesheet(settings)
  })

  // Initialize data sync plugin
  Vue.use(SyncPlugin)

  // Listen for messages and pass to event bus
  if (window) {
    window.addEventListener('message', editor.handleIncomingMessage, false)

    // Tell the editor we exist
    editor.sendMessage({
      type: 'route.changed',
      details: {
        location: window.location.pathname
      }
    })
  }

  // Add editor to Nuxt context as $swellEditor
  inject('swellEditor', editor)
}

// Vue instance as event bus for interacting with editor
const editor = new Vue({
  methods: {
    // Send a message to the parent window of the iframe, if available
    sendMessage(msg) {
      const targetOrigin = '*'

      try {
        if (window && window.parent) {
          window.parent.postMessage(msg, targetOrigin)
        }
      } catch (err) {
        console.error(err)
        // noop
      }
    },

    handleIncomingMessage(event) {
      const { type, details } = event.data

      console.log('received message', event.data) // TODO remove

      switch (type) {
        case 'content.selected':
          // Show content being edited
          selectContent(details.path)
          break

        case 'content.updated':
          // Refetch component data
          this.$emit('editor-content-update', details)
          break

        case 'settings.updated':
          // Update CSS variables
          setCssVariable(details.path, details.value)
          break

        case 'browser':
          // Trigger router action
          this.$emit('browser-action', details)
          break
      }
    }
  }
})

// Nuxt middleware for updating the editor when the route is changed
middleware.editorFrame = ({ route }) => {
  editor.sendMessage({
    type: 'route.changed',
    details: {
      location: route.fullPath
    }
  })
}

// Vue plugin for watching editor updates and triggering data refetch
const SyncPlugin = {
  install: Vue => {
    Vue.mixin({
      mounted() {
        // Trigger refetch if component has dynamic data
        editor.$on('editor-content-update', async details => {
          if (!this.$fetch) return

          this.$swell.cache.setOnce(details)
          this.$fetch()
        })

        // Trigger router action on Nuxt root component
        editor.$on('browser-action', async details => {
          if (this.$options.name !== 'Nuxt') return

          switch (details.action) {
            case 'back':
              return this.$router.back()
            case 'forward':
              return this.$router.forward()
            case 'navigate':
              return this.$router.push(details.value)
          }
        })
      }
    })
  }
}
