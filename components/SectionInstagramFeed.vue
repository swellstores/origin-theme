<script>
// Helpers
import get from 'lodash/get'

export default {
  name: 'SectionInstagramFeed',
  functional: true,

  props: {
    heading: {
      type: String,
      default: '',
    },
    username: {
      type: String,
      default: '',
    },
    posts: {
      type: Array,
      default: () => [],
    },
    imageFrame: {
      type: String,
      default: 'md',
    },
    outerSpacingX: {
      type: String,
      default: 'lg',
    },
    outerSpacingY: {
      type: String,
      default: 'lg',
    },
  },

  render(h, context) {
    const { heading, username, posts, imageFrame } = context.props
    const frameSpacing = {
      none: 'p-0',
      sm: 'p-1 lg:p-2',
      md: 'p-2 lg:p-4',
    }
    const postFrameClass = frameSpacing[imageFrame]

    return (
      <section class="relative">
        <ul class={`flex flex-wrap ${postFrameClass}`}>
          <li class="m-0 w-1/2 md:w-1/4">
            <a href="" class="flex h-full flex-col justify-between p-4">
              <div>
                <svg class="mb-4 h-6 w-6">
                  <use xlinkHref="#icon-instagram" />
                </svg>
                <p class="text-lg font-semibold md:text-xl">{heading}</p>
              </div>
              <p class="text-sm" v-if="username">
                @{username}
              </p>
            </a>
          </li>
          {posts.map((post) => (
            <li class={`m-0 w-1/2 md:w-1/4 ${postFrameClass}`}>
              <VisualMedia source={get(post, 'media.url')} />
            </li>
          ))}
        </ul>
      </section>
    )
  },
}
</script>
