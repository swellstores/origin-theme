import path from 'path'
import fs from 'fs'
import consola from 'consola'
import Vue from 'vue'
import _ from 'lodash'
import { generateCssVariableStylesheet } from './utils.js'

const logger = consola.withScope('swell-editor')

export default async function(moduleOptions) {
  const options = { ...this.options.swellEditor, ...moduleOptions }
  const stylesheetPath = path.resolve(this.options.rootDir, './assets/css/variables.css')
  const settingsPath = path.resolve(this.options.rootDir, './config/settings.json')
  const settings = await import(settingsPath)

  if (process.env.NODE_ENV === 'production') {
    // Generate CSS variables and values based on static settings file
    const stylesheet = generateCssVariableStylesheet(settings)
    // Write stylesheet to assets folder
    fs.writeFileSync(stylesheetPath, stylesheet)
    logger.success('Generated CSS variables')
    // Add stylesheet path to Nuxt global CSS array
    this.options.css.push(stylesheetPath)
  } else {
    // Add plugin for editor communication and message processing
    this.addPlugin({
      src: path.resolve(__dirname, './plugin.js'),
      fileName: 'swell-editor-plugin.js',
      options
    })

    // Add plugin for editor/dev utils
    this.addPlugin({
      src: path.resolve(__dirname, './utils.js'),
      fileName: 'swell-editor-utils.js',
      options
    })

    // Add middleware for editor iframe helpers
    this.options.router.middleware.push('editorFrame')
  }
}
