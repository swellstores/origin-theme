import Vue from 'vue'
import middleware from './middleware'
import { editor, enableFetchListener, disableFetchListener } from './swell-editor-utils'

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
  }

  // Add editor to Nuxt context as $swellEditor
  inject('swellEditor', editor)
}

// Nuxt middleware for updating the editor when the route is changed
middleware.editorFrame = ({ route }) => {
  // Tell editor what route we're on now
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
        enableFetchListener(this)
      },

      activated() {
        enableFetchListener(this)
      },

      destroyed() {
        disableFetchListener(this)
      },

      deactivated() {
        disableFetchListener(this)
      }
    })
  }
}
