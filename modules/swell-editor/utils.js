import _ from 'lodash'
import mitt from 'mitt'

const systemFontStack = {
  sans:
    '-apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, Ubuntu, roboto, noto, segoe ui, arial, sans-serif',
  serif:
    'Iowan Old Style, Apple Garamond, Baskerville, Times New Roman, Droid Serif, Times, Source Serif Pro, serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol',
  mono: 'Menlo, Consolas, Monaco, Liberation Mono, Lucida Console, monospace'
}
const typographyVarPaths = {
  headingFamily: 'typography.headingFamily',
  bodyFamily: 'typography.bodyFamily',
  labelFamily: 'typography.labelFamily',
  ratio: 'typography.scaleRatio',
  baseSize: 'typography.scaleBaseSize'
}

export const editor = {
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

  // Send a message to the parent window of the iframe
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

  // Handle incoming message from the parent window of the iframe
  async processMessage(event, context) {
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
      this.processNextMessage()
    }
  },

  processNextMessage() {
    if (this.messages.length > 0) {
      const event = this.messages.shift()
      this.processMessage(event, this.context)
    }
  },

  // Attach refetch listener to a component
  enableFetchListener(vm) {
    // If component has a fetch method defined on it
    const hasFetch =
      vm.$options && typeof vm.$options.fetch === 'function' && !vm.$options.fetch.length

    if (!vm._swellEditorFetchHandler && this.isConnected && hasFetch) {
      // Set fetch delay to zero to avoid flash while fetch is pending
      vm._fetchDelay = 0

      // Add fetch controller
      vm._swellEditorFetchHandler = async () => {
        try {
          this.fetchCounter++
          await vm.$fetch()
        } catch (err) {
          // Noop
        }
        this.fetchCounter--
        if (this.fetchCounter === 0) {
          this.isReceiving = false
          this.processNextMessage()
        }
      }

      // Start listening for editor updates
      this.events.on('refetch', vm._swellEditorFetchHandler)
    }
  },

  // Remove refetch listener from a component
  disableFetchListener(vm) {
    if (vm._swellEditorFetchHandler) {
      // Stop listening for editor updates
      this.events.off('refetch', vm._swellEditorFetchHandler)
      // Remove fetch controller
      delete vm._swellEditorFetchHandler
    }
  }
}

// Returns string of CSS variables to inject as a stylesheet
// TODO split into two functions
export function generateCssVariables(storeSettings) {
  const keyNames = getVariableGroups()
  const variables = generateVariableList(storeSettings, keyNames)

  if (process.browser) {
    // Set variables on document root
    variables.map(cssVar => {
      const [name, value] = cssVar.split(':')
      const rawValue = value.slice(0, -1) // Remove the semicolon otherwise the value gets ignored
      document.documentElement.style.setProperty(name, rawValue)
    })
  } else {
    // Return variables as CSS stylesheet string
    return (
      '/*\n' +
      '!!! AUTOGENERATED FILE !!!\n' +
      `These variables were set by the swell-editor module during server build.\n` +
      '*/\n' +
      `:root {\n${variables.join('\n')}\n}`
    )
  }
}

// Returns array of stylesheet link objects for using with Nuxt's head function
export function getFontLinks(families) {
  return families
    .map(family => {
      const font = getFontInfo(family)
      if (font.provider === 'Google') {
        const fontFamilyDef = `family=${font.family}:ital,wght@0,${font.weight};1,${font.weight}`

        return {
          rel: 'stylesheet',
          href: `https://fonts.googleapis.com/css2?${fontFamilyDef}&display=swap`
        }
      }
    })
    .filter(family => family || false)
}

// Scroll to a section/element on the page
function selectContent(path) {
  setTimeout(() => {
    const elements = Array.from(document.querySelectorAll('[data-sw-path]'))
    const element = elements.find(el => el.dataset.swPath === path)

    if (!element) return

    if (element.dataset.swClick === "true") {
      element.click()
      return
    }

    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    })
  }, 500);
}

// Returns true if settings group key from the provided path
// is configured used for CSS variable generation
function isCssVariableGroup(path = '') {
  const groupKey = path.split('.')[0]
  const variableGroups = getVariableGroups()
  return variableGroups.includes(groupKey)
}

// Returns array of settings object keys configured for CSS variable generation
function getVariableGroups() {
  const defaultGroups = ['colors', 'typography']
  const optionsGroups = '<%= options.cssVariableGroups %>'
  const customGroups = optionsGroups ? optionsGroups.split(',') : []
  const mergedGroups = new Set([...defaultGroups, ...customGroups])

  return Array.from(mergedGroups)
}

// Generate array of CSS variables with values
function generateVariableList(settings, keyNames) {
  const typeScaleBase = parseInt(_.get(settings, typographyVarPaths.baseSize, 16))
  const variables = []

  keyNames.map(group => {
    // Convert nested properties into flattened kebab case object
    const palette = flattenColorPalette(settings[group])

    // Turn each property into a CSS variable name with value
    for (const [key, value] of Object.entries(palette)) {
      const varName = `--${group}-${_.kebabCase(key)}`
      const convertPathToVarName = path => '--' + _.kebabCase(path)
      const isRatioSetting = varName === convertPathToVarName(typographyVarPaths.ratio)
      const isFontFamilySetting = [
        convertPathToVarName(typographyVarPaths.headingFamily),
        convertPathToVarName(typographyVarPaths.bodyFamily),
        convertPathToVarName(typographyVarPaths.labelFamily)
      ].includes(varName)

      if (isRatioSetting) {
        // Generate modular type scale variables
        const ratio = parseFloat(value) || 1.125
        const steps = _.range(-6, 17) // Generate a reasonable range for the scale
        steps.map(step => {
          const typeSizeValue = _.round(ratio ** step * (typeScaleBase / 16), 3) + 'rem'
          variables.push(`--type-scale-${step}: ${typeSizeValue};`)
        })
      } else if (isFontFamilySetting) {
        // Generate font family variable
        const { provider, family, fallback = 'sans' } = getFontInfo(value)
        let fontStack = systemFontStack[fallback]

        if (provider === 'Google') {
          fontStack = `${family.replace(/[+]/g, ' ')}, ${fontStack}`
        } else if (family) {
          fontStack = `${family}, ${fontStack}`
        } else {
          fontStack = value
        }
        variables.push(`${varName}: ${fontStack};`)
      } else {
        // Add arbitrary variable to list
        variables.push(`${varName}: ${value};`)
      }
    }
  })

  return variables
}

function getFontInfo(fontFamily) {
  if (typeof fontFamily !== 'string' || !fontFamily) return {}
  const [provider, family, weight, fallback] = fontFamily.split('_')
  return { provider, family, weight, fallback }
}

// Tailwind utility for transforming object into kebab-case string
// https://github.com/tailwindcss/tailwindcss/blob/master/src/util/flattenColorPalette.js
function flattenColorPalette(colors) {
  const result = _(colors)
    .flatMap((color, name) => {
      if (!_.isObject(color)) {
        return [[name, color]]
      }

      return _.map(color, (value, key) => {
        const suffix = key === 'default' ? '' : `-${key}`
        return [`${name}${suffix}`, value]
      })
    })
    .fromPairs()
    .value()

  return result
}
