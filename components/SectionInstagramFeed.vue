<script>
// Helpers
import get from 'lodash/get'

export default {
  name: 'SectionInstagramFeed',
  functional: true,

  props: {
    heading: {
      type: String,
      default: ''
    },
    username: {
      type: String,
      default: ''
    },
    posts: {
      type: Array,
      default: () => []
    },
    imageFrame: {
      type: String,
      default: 'md'
    },
    outerSpacingX: {
      type: String,
      default: 'lg'
    },
    outerSpacingY: {
      type: String,
      default: 'lg'
    }
  },

  render(h, context) {
    const { heading, username, posts, imageFrame } = context.props
    const frameSpacing = {
      none: 'p-0',
      sm: 'p-1 lg:p-2',
      md: 'p-2 lg:p-4'
    }
    const postFrameClass = frameSpacing[imageFrame]

    return (
      <section class="relative">
        <ul class={`flex flex-wrap ${postFrameClass}`}>
          <li class="w-1/2 m-0 md:w-1/4">
            <a href="" class="block h-full p-4 flex flex-col justify-between">
              <div>
                <svg class="w-6 h-6 mb-4">
                  <use xlinkHref="#icon-instagram" />
                </svg>
                <p class="text-lg font-semibold md:text-xl">{heading}</p>
              </div>
              <p class="text-sm" v-if="username">
                @{username}
              </p>
            </a>
          </li>
          {posts.map(post => (
            <li class={`w-1/2 m-0 md:w-1/4 ${postFrameClass}`}>
              <VisualMedia source={get(post, 'media.url')} />
            </li>
          ))}
        </ul>
      </section>
    )
  }
}
</script>
