import Vue from 'vue'
import mitt from 'mitt'
import middleware from './middleware'
import {
  isPageChild,
  hasFetch,
  isCssVariableGroup,
  generateCssVariables,
  setCssVariable,
  selectContent
} from './swell-editor-utils'

export default async (context, inject) => {
  // Initialize data sync plugin
  Vue.use(SyncPlugin)

  if (window) {
    // Listen for messages and pass to event bus
    window.addEventListener('message', event => editor.handleIncomingMessage(event, context), false)

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

const editor = {
  // Event bus for interacting with admin editor
  events: mitt(),

  // If we're currently connected to the admin editor
  isConnected: false,

  // Send a message to the parent window of the iframe, if available
  sendMessage(msg) {
    const targetOrigin = '*'

    try {
      if (window && window.parent) {
        window.parent.postMessage(msg, targetOrigin)
      }
    } catch (err) {
      console.error(err)
    }
  },

  async handleIncomingMessage(event, context) {
    const { type, details } = event.data

    switch (type) {
      case 'content.selected':
        // Show content being edited
        selectContent(details.path)
        break

      case 'content.updated':
        // Set cache and trigger refetch if component has dynamic data
        context.$swell.cache.setOnce(details)
        this.events.emit('editor-update', details)
        break

      case 'settings.updated':
        // Check if we only have to update CSS, and avoid refetch
        if (isCssVariableGroup(details.path)) {
          return setCssVariable(details.path, details.value)
        }

        // Update settings and trigger refetch if component has dynamic data
        context.$swell.settings.set(details.path, details.value)
        this.events.emit('editor-update', details)
        break

      case 'browser':
        // Emulate browser actions
        switch (details.action) {
          case 'back':
            return context.app.router.back()
          case 'forward':
            return context.app.router.forward()
          case 'navigate':
            return context.app.router.push(details.value)
        }
        break

      case 'editor.connected':
        this.isConnected = true
        // Set CSS variables on document root during initial editor handshake
        const settings = await context.$swell.settings.get()
        generateCssVariables(settings)
        break
    }
  }
}

// Nuxt middleware for updating the editor when the route is changed
middleware.editorFrame = ({ route }) => {
  // Stop listening for events to avoid calling methods on stale page components
  editor.events.all.clear()

  // Tell editor what route we're on now
  editor.sendMessage({
    type: 'route.changed',
    details: {
      location: route.fullPath
    }
  })
}

function enableFetchListener(vm) {
  if (editor.isConnected && hasFetch(vm)) {
    // console.log(vm._name, vm._uid, 'fetch listener ON')
    // Set fetch delay to zero to avoid flash while fetch is pending
    vm._fetchDelay = 0

    // Listen for editor updates and trigger component fetch method
    editor.events.on('editor-update', () => {
      vm.$fetch()
      // console.log('FETCHING', vm._name, vm._uid)
    })
  }
}

// Vue plugin for watching editor updates and triggering data refetch
const SyncPlugin = {
  install: Vue => {
    Vue.mixin({
      watch: {
        $route() {
          if (!isPageChild(this)) {
            enableFetchListener(this)
          }
        }
      },

      mounted() {
        enableFetchListener(this)
      },

      activated() {
        enableFetchListener(this)
      }
    })
  }
}
