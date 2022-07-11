import path from 'path';
import fs from 'fs';
import consola from 'consola';
import { generateCssVariables } from './utils/generateCssVariables';

const logger = consola.withScope('swell-editor');

export default function (moduleOptions) {
  const options = {
    ...this.options.swell,
    ...this.options.swellEditor,
    ...moduleOptions,
  };
  const { currentSettings, editorMode } = options;

  const stylesheetPath = path.resolve(
    this.options.rootDir,
    './assets/css/variables.css',
  );
  // Generate CSS variables and values based on static settings file
  const stylesheet = generateCssVariables(currentSettings);

  // Write stylesheet to assets folder
  fs.writeFileSync(stylesheetPath, stylesheet);
  logger.success('Generated CSS variables from style settings.');

  // Load editor plugin and message bus
  if (editorMode) {
    logger.info('Swell Editor enabled');

    this.options.i18n = {
      ...this.options.i18n,
      locales: this.options.i18n.locales.map((localeOptions) => ({
        ...localeOptions,
        file: 'index.js',
      })),
      langDir: '~/modules/swell-editor/lang',
      lazy: {
        skipNuxtState: true,
      },
    };

    // Add plugin for editor communication and message processing
    this.addPlugin({
      src: path.resolve(__dirname, './plugin.js'),
      fileName: 'swell-editor-plugin.js',
      options,
    });

    // Add plugin for editor/dev utils
    this.addPlugin({
      src: path.resolve(__dirname, './utils.js'),
      fileName: 'swell-editor-utils.js',
      options,
      mode: 'client',
    });

    // Add middleware for editor iframe helpers
    this.options.router.middleware.push('editorFrame');
  }
}
