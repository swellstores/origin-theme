import path from 'path'

export default function(moduleOptions) {
  const options = { ...this.options.router, ...this.options.swell, ...moduleOptions }

  // Register storefront app plugin to inject $swell into nuxt context
  this.addPlugin({
    src: path.resolve(__dirname, './plugin.js'),
    fileName: 'swell-plugin.js',
    options
  })

  // Register mixin with global helpers and components
  this.addPlugin({
    src: path.resolve(__dirname, './mixin.js'),
    fileName: 'swell-mixin.js',
    options
  })
}

// Required for Nuxt to avoid double imports
// TODO uncomment below when publishing on NPM
// module.exports.meta = require('./package.json')
