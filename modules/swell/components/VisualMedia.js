import get from 'lodash/get';

// Add transformation parameters to image file URL
// for creating responsive images with srcset (For images on Swell CDN only)

const generateResponsiveImageData = (url, options) => {
  if (!url) return {};

  const { widths, format, quality } = options;
  // let dpr = 1
  let q = quality;
  const fm = format || 'jpg';
  const srcWidth = 1000;

  if (process.client) {
    // dpr = window.devicePixelRatio
    q = Math.round(q); // TODO lower value for higher pixel density screens - not needed with uploadcare
  }

  const srcsetArray = (widths || []).map((size) => {
    const width = size; // disabled tbd: Math.round(size * dpr)
    const sizeUrl = `${url}?width=${width}&fm=${fm}&q=${q}`;
    return `${sizeUrl} ${width}w`;
  });

  return {
    src: `${url}?width=${srcWidth}&fm=${fm}&q=${q}`,
    srcset: srcsetArray.join(),
  };
};

export default {
  name: 'VisualMedia',
  functional: true,

  props: {
    // Media object returned by the API, or URL of the file
    source: {
      type: [Object, String],
      default:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    },
    // Alternative text for screen readers
    alt: {
      type: String,
      default: '',
    },
    // Aspect ratio (width to height) of the image container
    aspectRatio: {
      type: String,
      default: '1:1',
    },
    // Visual quality level expressed as a percentage (0–100)
    // Higher value = less compression, better quality, larger file size
    quality: {
      type: Number,
      default: 80,
    },
    // Image widths to generate source urls for
    widths: {
      type: Array,
      default: () => [375, 640, 750, 1080, 1440, 2048, 2560, 3000, 3840],
    },
    // Media conditions that determine how wide the image will be displayed
    sizes: {
      type: String,
      default: '100vw',
    },
    // Additional classes added to the img element
    imgClass: {
      type: String,
      default: '',
    },
    // Flag for making the whole component display like
    // a background cover image with no set aspect ratio
    isBackground: {
      type: Boolean,
      default: false,
    },
    // Flag for using image's native dimensions and
    // making aspect ratio fixed at all times
    isFixed: {
      type: Boolean,
      default: false,
    },
    // Determines if media should be lazy-loaded
    lazyLoad: {
      type: Boolean,
      default: true,
    },
  },

  render(h, context) {
    const {
      source,
      alt,
      aspectRatio,
      quality,
      widths,
      sizes,
      imgClass,
      isBackground,
      isFixed,
      lazyLoad,
    } = context.props;

    const [x, y] = aspectRatio.split(':');
    const ratioPadding = `${(y / x) * 100}%`;

    // Set image object
    const image = {
      src: source,
      srcset: '',
      sizes,
      alt,
    };

    if (source && typeof source === 'object') {
      const file = get(source, 'file', source);
      const imageData = generateResponsiveImageData(file.url, {
        widths,
        quality,
      });
      image.src = imageData.src;
      image.srcset = imageData.srcset;
      image.width = file.width;
      image.height = file.height;
    }

    // Set lazy-load attributes
    if (lazyLoad) {
      image.loading = 'lazy';
    }

    const wrapperClass = isBackground
      ? 'h-full overflow-hidden'
      : isFixed
      ? 'w-full relative'
      : 'relative bg-primary-lighter w-full pb-full overflow-hidden';

    const imageClass = isBackground
      ? 'absolute top-0 left-0 w-full h-full object-cover'
      : isFixed
      ? 'relative'
      : 'absolute inset-0 w-full h-full object-cover';

    return h(
      'div',
      {
        class: [context.data.class, context.data.staticClass, wrapperClass],
        style:
          isBackground || isFixed ? null : `padding-bottom: ${ratioPadding}`,
      },
      [
        h('img', {
          attrs: image,
          style: !isFixed ? 'object-fit: cover;' : '',
          class: [imageClass, imgClass],
        }),
      ],
    );
  },
};
