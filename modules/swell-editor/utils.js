import mitt from 'mitt';
import get from 'lodash/get';
import set from 'lodash/set';
import camelCase from 'lodash/camelCase';
import isObject from 'lodash/isObject';
import map from 'lodash/map';
import compose from 'lodash/fp/compose';
import flatMap from 'lodash/fp/flatMap';
import fromPairs from 'lodash/fp/fromPairs';
import kebabCase from 'lodash/kebabCase';
import range from 'lodash/range';
import round from 'lodash/round';
import cloneDeep from 'lodash/fp/cloneDeep';

import buildUrl from '@googlicius/build-url';

import swell from 'swell-js';
const { toCamel } = swell.utils;

const settingPaths = {
  headingFont: 'typography.headingFont',
  bodyFontNormal: 'typography.bodyFontNormal',
  bodyFontBold: 'typography.bodyFontBold',
  ratio: 'typography.scaleRatio',
  baseSize: 'typography.scaleBaseSize',
};

export const editor = {
  context: null,

  // Event bus for interacting with admin editor
  events: mitt(),

  // If we're done loading
  isLoaded: false,

  // If we're currently processing a message
  isReceiving: false,

  // Buffer to make sure messages are received in strict order
  messages: [],

  // Index of fetch handler currently being processed
  fetchCounter: 0,

  // Send a message to the parent window of the iframe
  sendMessage(msg) {
    try {
      if (process.browser && window.parent) {
        const targetOrigin = '*';
        window.parent.postMessage(msg, targetOrigin);
      }
    } catch (err) {
      console.error(err);
    }
  },

  // Handle incoming message from the parent window of the iframe
  async processMessage(event, context) {
    const { type, details } = event.data;
    const { app, $swell, i18n } = context;

    if (this.isReceiving) {
      this.messages.push(event);
      return;
    }

    this.isReceiving = true;

    switch (type) {
      case 'content.selected':
        // Show content being edited
        selectContent(details.path);
        break;

      case 'content.updated':
        // Set cache and trigger refetch if component has dynamic data
        $swell.cache.set(details);
        this.events.emit('refetch', details);
        break;

      case 'settings.updated':
        // Patch settings data cache
        $swell.settings.set(details);

        if (isCssVariable(details.path)) {
          // Regenerate variables if setting is a CSS variable group
          const settings = await $swell.settings.get();
          setCssVariables(settings);

          if (isFontVariable(details.path)) {
            updateGoogleFontsLink(settings);
          }
        } else if (details.path && details.path.includes('lang')) {
          const locale = details.path.includes(i18n.locale)
            ? i18n.locale
            : i18n.defaultLocale;

          const path = details.path
            .replace('.$locale', '')
            .replace(`.${locale}`, '')
            .split('.')
            .slice(1);
          const message = set({}, path, details.value);

          i18n.mergeLocaleMessage(locale, toCamel(message));
        } else {
          if (details.model === 'menus') {
            await $swell.settings.refresh();
          }

          // Trigger refetch if component has dynamic data
          this.events.emit('refetch');
        }
        break;

      case 'settings.loaded':
        if (!this.isLoaded) {
          this.context = context;
          this.isLoaded = true;

          // Set CSS variables on document root during initial editor connection
          const settings = await $swell.settings.get();
          setCssVariables(settings);
          updateGoogleFontsLink(settings);

          // Tell them of our selected locale
          const locale = $swell.locale.selected();
          if (locale) {
            editor.sendMessage({
              type: 'locale.changed',
              details: {
                locale,
              },
            });
          }
        }
        break;

      case 'browser':
        // Emulate browser actions
        switch (details.action) {
          case 'back':
            app.router.back();
            break;
          case 'forward':
            app.router.forward();
            break;
          case 'navigate':
            app.router.push(details.value);
            break;
        }
        break;
    }

    if (this.fetchCounter === 0) {
      this.isReceiving = false;
      this.processNextMessage();
    }
  },

  processNextMessage() {
    if (this.messages.length > 0) {
      const event = this.messages.shift();
      this.processMessage(event, this.context);
    }
  },

  // Attach refetch listener to a component
  enableFetchListener(vm) {
    // If component has a fetch method defined on it
    const hasFetch =
      vm.$options &&
      typeof vm.$options.fetch === 'function' &&
      !vm.$options.fetch.length;

    if (!vm._swellEditorFetchHandler && this.isLoaded && hasFetch) {
      // Set fetch delay to zero to avoid flash while fetch is pending
      vm._fetchDelay = 0;

      // Add fetch controller
      vm._swellEditorFetchHandler = async () => {
        try {
          this.fetchCounter++;
          await vm.$fetch();
        } catch (err) {
          // Noop
        }
        this.fetchCounter--;
        if (this.fetchCounter === 0) {
          this.isReceiving = false;
          this.processNextMessage();
        }
      };

      // Start listening for editor updates
      this.events.on('refetch', vm._swellEditorFetchHandler);
    }
  },

  // Remove refetch listener from a component
  disableFetchListener(vm) {
    if (vm._swellEditorFetchHandler) {
      // Stop listening for editor updates
      this.events.off('refetch', vm._swellEditorFetchHandler);
      // Remove fetch controller
      delete vm._swellEditorFetchHandler;
    }
  },
};

// Scroll to a section/element on the page
function selectContent(path) {
  setTimeout(() => {
    const elements = Array.from(document.querySelectorAll('[data-sw-path]'));
    const element = elements.find((el) => el.dataset.swPath === path);

    if (!element) return;

    if (element.dataset.swClick === 'true') {
      element.click();
      return;
    }

    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, 500);
}

export function getGoogleFontConfig(settings) {
  // we clone the `settings` object so we do not mutate it
  const normalizedSettings = toCamel(cloneDeep(settings));

  // Extract font config objects
  const fonts = [
    get(normalizedSettings, settingPaths.headingFont, {}),
    get(normalizedSettings, settingPaths.bodyFontNormal, {}),
    get(normalizedSettings, settingPaths.bodyFontBold, {}),
  ];

  // Generate families object
  const families = fonts.reduce(
    (families, { provider, name: rawName, weight }) => {
      if (provider !== 'Google') return families;
      const name = rawName.replace(/\s/g, '+');

      // Avoid duplicate family + weight declarations
      const nameExists = Object.keys(families).includes(name);
      const weightExists = nameExists ? families[name].includes(weight) : false;

      if (nameExists && !weightExists) {
        // Family has been defined but we need to add another weight
        families[name].push(weight);
      } else if (!weightExists) {
        families[name] = [weight];
      }

      // Order weights because Google with return a 400 otherwise
      families[name] = families[name].sort();

      return families;
    },
    {},
  );

  return {
    families,
    display: 'swap',
  };
}

function getGoogleFontsUrl(options) {
  const { families, display, subsets } = options;
  const family = convertFamiliesToArray(families);
  const isValidDisplay = (display) =>
    ['auto', 'block', 'swap', 'fallback', 'optional'].includes(display);

  if (family.length < 1) {
    return false;
  }

  const query = {
    family,
  };

  if (display && isValidDisplay(display)) {
    query.display = display;
  }

  const subset = (Array.isArray(subsets) ? subsets : [subsets]).filter(Boolean);

  if (subset.length > 0) {
    query.subset = subset.join(',');
  }

  return decodeURIComponent(
    buildUrl('https://fonts.googleapis.com', {
      path: 'css2',
      queryParams: query,
      disableCSV: true,
    }),
  );
}

function convertFamiliesToArray(families) {
  const result = [];

  Object.entries(families).forEach(([name, values]) => {
    if (!name) return;

    if (Array.isArray(values) && values.length > 0) {
      result.push(`${name}:wght@${values.join(';')}`);
      return;
    }

    if (Object.keys(values).length > 0) {
      const styles = [];
      const weights = [];

      Object.entries(values).forEach(([style, weight], index) => {
        styles.push(style);
        (Array.isArray(weight) ? weight : [weight]).forEach((value) => {
          if (Object.keys(values).length === 1 && style === 'wght') {
            weights.push(value);
          } else {
            weights.push(`${index},${value}`);
          }
        });
      });

      result.push(`${name}:${styles.join(',')}@${weights.join(';')}`);
      return;
    }

    if (values) {
      result.push(name);
    }
  });

  return result;
}

// Update Google Fonts stylesheet link
function updateGoogleFontsLink(settings) {
  const url = getGoogleFontsUrl(getGoogleFontConfig(settings));

  if (url && process.browser) {
    const links = document.getElementsByTagName('link');

    for (const link of links) {
      if (link.href.includes('https://fonts.googleapis.com/css')) {
        link.href = url;
      }
    }
  }
}

// Returns true if settings group key from the provided path
// is typography
function isFontVariable(path = '') {
  const groupKey = path.split('.')[0];
  return groupKey === 'typography';
}

// Generate array of CSS variables with values
export function getCssVariables(settings) {
  const toVarName = (path) => '--' + kebabCase(path);
  const isRatioSetting = (varName) => varName === toVarName(settingPaths.ratio);
  const isFontSetting = (varName) =>
    [
      toVarName(settingPaths.headingFont),
      toVarName(settingPaths.bodyFontNormal),
      toVarName(settingPaths.bodyFontBold),
    ].includes(varName);

  return getVariableGroups().reduce((variables, groupName) => {
    // Convert nested properties into flattened kebab case object
    const properties = flattenGroup(settings[groupName], groupName);

    // Turn each property into a CSS variable name with value
    for (const [key, value] of Object.entries(properties)) {
      if (!value) return variables;

      // Transform property group + key to CSS variable name
      const varName = `--${groupName}-${kebabCase(key)}`;

      if (isRatioSetting(varName)) {
        // Generate modular type scale variables
        const base = parseInt(get(settings, settingPaths.baseSize)) || 16;
        const ratio = parseFloat(value) || 1.125;
        const steps = range(-6, 17); // Generate a reasonable range for the scale
        steps.forEach((step) => {
          const typeSizeValue = round(ratio ** step * (base / 16), 3) + 'rem';
          variables.push(`--type-scale-${step}: ${typeSizeValue};`);
        });
      } else if (isFontSetting(varName)) {
        // Generate font family variable
        const { provider, name, fallback } = value;
        let fontStack = fallback;

        if (provider !== 'System') {
          fontStack = `'${name}', ${fontStack}`;
        }

        variables.push(`${varName}: ${fontStack};`);
      } else {
        // Add arbitrary variable to list
        variables.push(`${varName}: ${value};`);
      }
    }

    return variables;
  }, []);
}

// Returns array of settings object keys configured for CSS variable generation
function getVariableGroups() {
  const defaultGroups = ['colors', 'typography'];
  const optionsGroups = '<%= options.cssVariableGroups %>';
  const customGroups = optionsGroups ? optionsGroups.split(',') : [];
  const mergedGroups = new Set([...defaultGroups, ...customGroups]);

  return Array.from(mergedGroups);
}

// Returns flattened object with kebab-case keys
// (based on https://github.com/tailwindcss/tailwindcss/blob/master/src/util/flattenColorPalette.js)
function flattenGroup(groupValue, groupName) {
  const isFontSetting = (name) =>
    [
      settingPaths.headingFont,
      settingPaths.bodyFontNormal,
      settingPaths.bodyFontBold,
    ].includes(`${groupName}.${camelCase(name)}`);

  const flatMapFP = flatMap.convert({ cap: false });

  const result = compose(
    fromPairs,
    flatMapFP((item, name) => {
      if (!isObject(item) || isFontSetting(name)) {
        return [[name, item]];
      }

      return map(item, (value, key) => {
        const suffix = key === 'default' ? '' : `-${key}`;
        return [`${name}${suffix}`, value];
      });
    }),
  )(groupValue);

  return result;
}

function setCssVariables(settings) {
  const variables = getCssVariables(settings);

  if (process.browser) {
    // Set variables on document root
    variables.forEach((cssVar) => {
      const [name, value] = cssVar.split(':');
      const rawValue = value.slice(0, -1); // Remove the semicolon otherwise the value gets ignored
      document.documentElement.style.setProperty(name, rawValue);
    });
  }
}

// Returns true if settings group key from the provided path
// is configured used for CSS variable generation
function isCssVariable(path = '') {
  const groupKey = path.split('.')[0];
  const variableGroups = getVariableGroups();
  return variableGroups.includes(groupKey);
}
