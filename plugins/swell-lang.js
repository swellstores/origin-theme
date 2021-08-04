export default function ({ app, $swell, $swellEditor, i18n }) {
  // beforeLanguageSwitch called right before setting a new locale
  app.i18n.beforeLanguageSwitch = async (_oldLocale, newLocale) => {
    await $swell.locale.select(newLocale)

    $swellEditor?.sendMessage({
      type: 'locale.changed',
      details: {
        locale: newLocale,
      },
    })
  }

  app.i18n.onLanguageSwitched = () => {
    if (i18n?.localeProperties?.file) {
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
