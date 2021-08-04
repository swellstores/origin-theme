<template>
  <a href="#" @click="handleShare()">
    <slot />
  </a>
</template>

<script>
const networkUrls = {
  email: 'mailto:%20?subject=@t&body=@u%0D%0A@d',
  facebook:
    'https://www.facebook.com/sharer/sharer.php?u=@u&title=@t&description=@d',
  pinterest:
    'https://pinterest.com/pin/create/button/?url=@u&media=@m&description=@t',
  twitter: 'https://twitter.com/intent/tweet?text=@t&url=@u',
}

const $window = typeof window !== 'undefined' ? window : null

export default {
  name: 'SocialShare',

  props: {
    network: {
      type: String,
      default: 'facebook',
    },

    url: {
      type: String,
      default: null,
    },

    title: {
      type: String,
      default: null,
    },

    description: {
      type: String,
      default: null,
    },

    media: {
      type: String,
      default: null,
    },
  },

  data() {
    return {
      popup: {
        width: 620,
        height: 420,
      },
      popupTop: 0,
      popupLeft: 0,
      popupWindow: undefined,
      popupInterval: null,
    }
  },

  computed: {
    /**
     * Network sharing raw sharing link.
     */
    rawLink() {
      const ua = navigator.userAgent.toLowerCase()
      const network = this.network.toLowerCase()

      /**
       * On IOS, SMS sharing link need a special formatting
       * Source: https://weblog.west-wind.com/posts/2013/Oct/09/Prefilling-an-SMS-on-Mobile-Devices-with-the-sms-Uri-Scheme#Body-only
       */
      if (ua.includes('ipad') > -1) {
        return networkUrls[network].replace(':?', ':&')
      }

      return networkUrls[network]
    },

    shareLink() {
      const link = this.rawLink

      if (!link) return

      return link
        .replace(/@u/g, encodeURIComponent(this.url))
        .replace(/@t/g, encodeURIComponent(this.title))
        .replace(/@d/g, encodeURIComponent(this.description))
        .replace(/@m/g, encodeURIComponent(this.media))
    },
  },

  methods: {
    handleShare() {
      if (this.rawLink.substring(0, 4) === 'http') {
        this.openSharePopup()
      } else {
        this.share()
      }
    },

    /**
     * Center the popup on multi-screens
     * http://stackoverflow.com/questions/4068373/center-a-popup-window-on-screen/32261263
     */
    resizePopup() {
      const width =
        $window.innerWidth ||
        document.documentElement.clientWidth ||
        $window.screenX
      const height =
        $window.innerHeight ||
        document.documentElement.clientHeight ||
        $window.screenY
      const systemZoom = width / $window.screen.availWidth

      this.popupLeft =
        (width - this.popup.width) / 2 / systemZoom +
        ($window.screenLeft !== undefined
          ? $window.screenLeft
          : $window.screenX)
      this.popupTop =
        (height - this.popup.height) / 2 / systemZoom +
        ($window.screenTop !== undefined ? $window.screenTop : $window.screenY)
    },

    /**
     * Shares URL in specified network.
     */
    openSharePopup() {
      this.resizePopup()

      // If a popup window already exist, we close it and trigger a change event.
      if (this.popupWindow && this.popupInterval) {
        clearInterval(this.popupInterval)

        // Force close (for Facebook)
        this.popupWindow.close()
      }

      this.popupWindow = $window.open(
        this.shareLink,
        'sharer-' + this.network,
        ',height=' +
          this.popup.height +
          ',width=' +
          this.popup.width +
          ',left=' +
          this.popupLeft +
          ',top=' +
          this.popupTop +
          ',screenX=' +
          this.popupLeft +
          ',screenY=' +
          this.popupTop
      )

      // If popup are prevented (AdBlocker, Mobile App context..), popup.window stays undefined and we can't display it
      if (!this.popupWindow) return

      this.popupWindow.focus()

      // Create an interval to detect popup closing event
      this.popupInterval = setInterval(() => {
        if (!this.popupWindow || this.popupWindow.closed) {
          clearInterval(this.popupInterval)

          this.popupWindow = null
        }
      }, 500)
    },

    share() {
      window.open(this.shareLink, '_blank')
    },
  },
}
</script>
