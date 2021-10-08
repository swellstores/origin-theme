import path from 'path'
import fs from 'fs'
import consola from 'consola'
import { generateCssVariables } from './utils.js'

const logger = consola.withScope('swell-editor')

export default function (moduleOptions) {
  const options = { ...this.options.swellEditor, ...moduleOptions }
  const { useEditorSettings, settings } = options

  const stylesheetPath = path.resolve(
    this.options.rootDir,
    './assets/css/variables.css'
  )
  // Generate CSS variables and values based on static settings file
  const stylesheet = generateCssVariables(settings)

  // Write stylesheet to assets folder
  fs.writeFileSync(stylesheetPath, stylesheet)
  logger.success('Generated CSS variables from style settings.')

  // Load editor plugin and message bus
  if (useEditorSettings) {
    logger.info('Swell Editor enabled')

    // Add plugin for editor communication and message processing
    this.addPlugin({
      src: path.resolve(__dirname, './plugin.js'),
      fileName: 'swell-editor-plugin.js',
      options,
    })

    // Add plugin for editor/dev utils
    this.addPlugin({
      src: path.resolve(__dirname, './utils.js'),
      fileName: 'swell-editor-utils.js',
      options,
    })

    // Add middleware for editor iframe helpers
    this.options.router.middleware.push('editorFrame')
  }
}
