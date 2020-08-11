import get from 'lodash/get'

// Add transformation parameters to image file URL
// for creating responsive images with srcset (For images on Swell CDN only)

const generateResponsiveImageData = (url, options) => {
  if (!url) return {}

  const { widths, format, quality } = options
  let dpr = 1
  let q = quality
  const fm = format || 'jpg'
  const srcWidth = 1000

  if (process.client) {
    dpr = window.devicePixelRatio
    q = Math.round(q) // TODO lower value for higher pixel density screens - not needed with uploadcare
  }

  const srcsetArray = widths.map(size => {
    const width = Math.round(size * dpr)
    const sizeUrl = `${url}?width=${width}&fm=${fm}&q=${q}`
    return `${sizeUrl} ${width}w`
  })

  return {
    src: `${url}?width=${srcWidth}&fm=${fm}&q=${q}`,
    srcset: srcsetArray.join()
  }
}

export default {
  name: 'VisualMedia',
  functional: true,

  props: {
    // Media object returned by the API, or URL of the file
    source: {
      type: [Object, String],
      default: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E`
    },
    // Alternative text for screen readers
    alt: {
      type: String,
      default: ''
    },
    // Aspect ratio (width to height) of the image container
    aspectRatio: {
      type: String,
      default: '1:1'
    },
    // Visual quality level expressed as a percentage (0–100)
    // Higher value = less compression, better quality, larger file size
    quality: {
      type: Number,
      default: 80
    },
    // Image widths to generate source urls for
    widths: {
      type: Array,
      default: () => [375, 640, 750, 1080, 1440, 2048, 2560, 3000, 3840]
    },
    // Media conditions that determine how wide the image will be displayed
    sizes: {
      type: String,
      default: '100vw'
    },
    // Flag for making the whole component display like
    // a background cover image with no set aspect ratio
    isBackground: {
      type: Boolean,
      default: false
    },
    // Determines if media should be lazy-loaded
    lazyLoad: {
      type: Boolean,
      default: true
    },
    // Whether browser supports lazy-loading (set by plugin)
    browserCanLazyLoad: {
      type: Boolean,
      default: false
    }
  },

  render(h, context) {
    const {
      source,
      alt,
      aspectRatio,
      quality,
      widths,
      sizes,
      isBackground,
      lazyLoad,
      browserCanLazyLoad
    } = context.props

    const [x, y] = aspectRatio.split(':')
    let dimensions = [x, y]
    const ratioPadding = `${(y / x) * 100}%`
    // Set image object
    const image = {
      alt,
      src: source,
      srcset: '',
      sizes
    }

    if (source && typeof source === 'object') {
      const file = get(source, 'file', source)
      const imageData = generateResponsiveImageData(file.url, {
        widths,
        quality
      })
      image.src = imageData.src
      image.srcset = imageData.srcset
      dimensions = [file.width, file.height]
    }

    // Merge passed class string with staticClass from context
    const mergeClasses = classes => {
      const contextClasses = context.data.staticClass
      return contextClasses ? `${classes} ${contextClasses}` : classes
    }

    // set lazy-load attributes
    if (lazyLoad && browserCanLazyLoad) {
      image.loading = 'lazy'
      image.width = dimensions[0]
      image.height = dimensions[1]
    } else if (lazyLoad) {
      image['data-src'] = image.src
      image['data-srcset'] = image.srcset
      image.srcset = ''
      image.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${dimensions[0]} ${dimensions[1]}'%3E%3C/svg%3E`
    }

    return (
      <div
        class={
          isBackground
            ? mergeClasses('h-full overflow-hidden')
            : mergeClasses('relative bg-primary-lighter w-full pb-full overflow-hidden')
        }
        style={isBackground ? null : `padding-bottom: ${ratioPadding}`}
      >
        <img
          {...{ attrs: image }}
          class={`${
            isBackground
              ? 'absolute top-0 left-0 w-full h-full object-cover'
              : 'absolute inset-0 w-full h-full object-cover'
          } ${lazyLoad && !browserCanLazyLoad ? 'lazyload' : ''}
          `}
        />
      </div>
    )
  }
}
