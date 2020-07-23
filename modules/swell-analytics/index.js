import path from 'path'

export default function(moduleOptions) {
  const options = {
    dev: true,
    ...this.options.swellAnalytics,
    ...moduleOptions
  }

  this.addPlugin({
    src: path.resolve(__dirname, './plugin.js'),
    ssr: false,
    fileName: 'swell-analytics-plugin.js',
    options
  })

  if (options.googleAnalytics) {
    this.addPlugin({
      src: path.resolve(__dirname, './scripts/ga.js'),
      ssr: false,
      fileName: 'swell-analytics-ga.js',
      options
    })
  }

  if (options.facebookPixel) {
    this.addPlugin({
      src: path.resolve(__dirname, './scripts/pixel.js'),
      ssr: false,
      fileName: 'swell-analytics-pixel.js',
      options
    })
  }

  if (options.segment) {
    this.addPlugin({
      src: path.resolve(__dirname, './scripts/segment.js'),
      ssr: false,
      fileName: 'swell-analytics-segment.js',
      options
    })
  }
}
