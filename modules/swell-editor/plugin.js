import Vue from 'vue'
import mitt from 'mitt'
import middleware from './middleware'
import {
  isPageChild,
  hasFetch,
  isCssVariableGroup,
  generateCssVariables,
  selectContent
} from './swell-editor-utils'

export default async (context, inject) => {
  const useEditorSettings = '<%= options.useEditorSettings %>' === 'true'

  if (window && useEditorSettings) {
    // Initialize data sync plugin
    Vue.use(SyncPlugin)

    // Flag editor connected immediately
    editor.handleIncomingMessage({ data: { type: 'editor.connected' } }, context)

    // Listen for messages and pass to event bus
    window.addEventListener('message', event => editor.handleIncomingMessage(event, context), false)

    // Tell the editor we exist
    editor.sendMessage({
      type: 'route.changed',
      details: {
        location: window.location.pathname
      }
    })

    // Listen for unload to tell the editor when we're gone
    window.addEventListener(
      'unload',
      event =>
        editor.sendMessage({
          type: 'route.changed',
          details: {
            location: ''
          }
        }),
      false
    )
  }

  // Add editor to Nuxt context as $swellEditor
  inject('swellEditor', editor)
}

const editor = {
  context: null,

  // Event bus for interacting with admin editor
  events: mitt(),

  // If we're currently connected to the admin editor
  isConnected: false,

  // If we're currently processing a message
  isReceiving: false,

  // Buffer to make sure messages are received in strict order
  messages: [],

  // Index of fetch handler currently being processed
  fetchCounter: 0,

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
    const { app, $swell } = context

    if (this.isReceiving) {
      this.messages.push(event)
      return
    }

    this.isReceiving = true

    switch (type) {
      case 'content.selected':
        // Show content being edited
        selectContent(details.path)
        break

      case 'content.updated':
        // Set cache and trigger refetch if component has dynamic data
        $swell.cache.set(details)
        this.events.emit('refetch', details)
        break

      case 'settings.updated':
        // Patch settings data cache
        $swell.settings.set(details)

        if (isCssVariableGroup(details.path)) {
          // Regenerate variables if setting is a CSS variable group
          generateCssVariables($swell.settings.get())
          this.events.emit('load-webfonts', details)
        } else {
          // Trigger refetch if component has dynamic data
          this.events.emit('refetch', details)
        }
        break

      case 'browser':
        // Emulate browser actions
        switch (details.action) {
          case 'back':
            app.router.back()
            break
          case 'forward':
            app.router.forward()
            break
          case 'navigate':
            app.router.push(details.value)
            break
        }
        break

      case 'editor.connected':
        if (!this.isConnected) {
          this.context = context
          this.isConnected = true
          // Set CSS variables on document root during initial editor connection
          const settings = $swell.settings.get()
          generateCssVariables(settings)
        }
        break
    }

    if (this.fetchCounter === 0) {
      this.isReceiving = false
      this.handleNextMessage()
    }
  },

  handleNextMessage() {
    if (this.messages.length > 0) {
      const event = this.messages.shift()
      this.handleIncomingMessage(event, this.context)
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
    editor.events.on('refetch', async () => {
      // console.log('FETCHING', vm._name, vm._uid)
      try {
        editor.fetchCounter++
        await vm.$fetch()
      } catch (err) {
        // noop
      }
      editor.fetchCounter--
      if (editor.fetchCounter === 0) {
        editor.isReceiving = false
        editor.handleNextMessage()
      }
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
