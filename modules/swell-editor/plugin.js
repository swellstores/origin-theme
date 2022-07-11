import Vue from 'vue';
import middleware from './middleware';
import { editor } from './swell-editor-utils';

export default (context, inject) => {
  if (process.browser) {
    // Initialize data sync plugin
    Vue.use(SyncPlugin);

    // Listen for messages and pass to event bus
    window.addEventListener(
      'message',
      (event) => editor.processMessage(event, context),
      false,
    );

    // Tell the editor we exist
    editor.sendMessage({
      type: 'route.changed',
      details: {
        location: window.location.pathname,
      },
    });

    // Listen for unload to tell the editor when we're gone
    window.addEventListener(
      'unload',
      (event) => {
        editor.sendMessage({
          type: 'route.changed',
          details: {
            location: '',
          },
        });
        editor.sendMessage({
          type: 'locale.changed',
          details: {
            locale: '',
          },
        });
      },
      false,
    );

    // Catch unusual vue $destroy undefined error
    Vue.config.errorHandler = (err, vm, info) => {
      if (String(err.message).includes('$destroy')) {
        console.warn('Caught $destroy of undefined error');
        return;
      }
      throw err;
    };

    editor.processMessage({ data: { type: 'settings.loaded' } }, context);
  }

  // Add editor to Nuxt context as $swellEditor
  inject('swellEditor', editor);
};

// Nuxt middleware for updating the editor when the route is changed
middleware.editorFrame = ({ route }) => {
  // Tell editor what route we're on now
  editor.sendMessage({
    type: 'route.changed',
    details: {
      location: route.fullPath,
    },
  });
};

// Vue plugin for watching editor updates and triggering data refetch
const SyncPlugin = {
  install: (Vue) => {
    Vue.mixin({
      mounted() {
        editor.enableFetchListener(this);
      },

      activated() {
        editor.enableFetchListener(this);
      },

      destroyed() {
        editor.disableFetchListener(this);
      },

      deactivated() {
        editor.disableFetchListener(this);
      },
    });
  },
};
