export default function ({ app, $swell, $swellEditor, store }) {
  // onBeforeLanguageSwitch called right before setting a new locale
  app.i18n.onBeforeLanguageSwitch = async (_oldLocale, newLocale) => {
    $swell.options.locale = newLocale
    await $swell.settings.refresh()
    await $swell.locale.select(newLocale)
    await $swell.settings.load()

    $swellEditor?.sendMessage({
      type: 'locale.changed',
      details: {
        locale: newLocale,
      },
    })
  }

  app.i18n.onLanguageSwitched = (_oldLocale, newLocale) => {
    store.commit('setState', { key: 'locale', value: newLocale })

    if ($swellEditor) {
      window?.location.reload()
    }
  }

  app.nuxt.defaultTransition.beforeEnter = () => {
    app.i18n.finalizePendingLocaleChange()
  }

  // Optional: wait for locale before scrolling for a smoother transition
  app.router.options.scrollBehavior = async (to, from, savedPosition) => {
    // Make sure the route has changed
    if (to.name !== from.name) {
      await app.i18n.waitForPendingLocaleChange()
    }
    return savedPosition || { x: 0, y: 0 }
  }
}
