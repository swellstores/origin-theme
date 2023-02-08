import path from 'path';
import swell from 'swell-js';
import 'cross-fetch/polyfill';

import { getGoogleFontConfig } from '../swell-editor/utils';
import { generateLangFiles } from './lang/generateLangFiles';
import { getLangSettings } from './lang/utils';
import getRoutes from './utils/getRoutes';

const isProduction = process.env.NODE_ENV === 'production';

export default async function (moduleOptions) {
  const options = {
    ...this.options.swell,
    ...moduleOptions,
  };

  const { storeId, publicKey, storeUrl, vaultUrl, editorMode } = options;

  swell.init(storeId, publicKey, {
    useCamelCase: true,
    url: storeUrl,
    previewContent: editorMode,
    vaultUrl,
  });

  await swell.settings.load();

  const currentSettings = await swell.settings.get();
  options.currentSettings = currentSettings;
  this.options.swell.currentSettings = currentSettings;

  this.options.loading.color = await swell.settings.get('colors.accent');

  this.options.googleFonts = getGoogleFontConfig(
    this.options.swell.currentSettings,
  );

  this.options.gtm.id = await swell.settings.get('analytics.gtmId');
  this.options.gtm.enabled = this.options.gtm.id || isProduction;

  this.options.sitemap.hostname =
    (await swell.settings.get('store.url')) || storeUrl;

  this.options.pwa.meta = await swell.settings.get('store.name');

  this.options.i18n = await getLangSettings(swell);
  const locales = await swell.settings.get('store.locales');
  const defaultLocale = await swell.settings.get('store.locale');
  await generateLangFiles(
    swell,
    locales.length ? locales : [{ code: defaultLocale }],
  );

  const extendPluginsFn = this.options.extendPlugins;
  this.options.extendPlugins = (plugins) => {
    const [nuxtComponentsPlugin] = plugins.splice(0, 1);

    const swellPluginIndex = plugins.findIndex((plugin) =>
      plugin.src.match('swell-plugin'),
    );
    const [swellPlugin] = plugins.splice(swellPluginIndex, 1);

    const swellMixinIndex = plugins.findIndex((plugin) =>
      plugin.src.match('swell-mixin'),
    );
    const [swellMixin] = plugins.splice(swellMixinIndex, 1);

    plugins.unshift(swellMixin);
    plugins.unshift(swellPlugin);
    plugins.unshift(nuxtComponentsPlugin);

    return extendPluginsFn ? extendPluginsFn(plugins) : plugins;
  };

  this.options.generate.routes = () => getRoutes(swell);

  this.nuxt.hook('generate:done', (context) => {
    const { locales } = context.options.i18n;
    const localesRegex = new RegExp(
      locales.map(({ code }) => `^/${code}`).join('|'),
    );

    const sitemapRoutes = [...context.generatedRoutes].reduce((acc, path) => {
      const match = path.match(localesRegex);
      const basePath = match ? path.replace(match[0], '') : path;

      const link = {
        url: path,
        lang: match ? match[0].replace('/', '') : 'x-default',
      };

      const route = acc[basePath]
        ? {
            ...acc[basePath],
            links: [...acc[basePath].links, link],
          }
        : {
            url: basePath,
            links: [link],
          };

      return { ...acc, [basePath]: route };
    }, {});

    this.nuxt.options.sitemap.routes = Object.values(sitemapRoutes);
  });

  // Register storefront app plugin to inject $swell into nuxt context
  this.addPlugin({
    src: path.resolve(__dirname, './plugin.js'),
    fileName: 'swell-plugin.js',
    options,
  });

  // Register mixin with global helpers and components
  this.addPlugin({
    src: path.resolve(__dirname, './mixin.js'),
    fileName: 'swell-mixin.js',
    options,
  });
}

// Required for Nuxt to avoid double imports
// TODO uncomment below when publishing on NPM
// module.exports.meta = require('./package.json')
