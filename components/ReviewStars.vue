<script>
export default {
  name: 'ReviewStars',
  functional: true,

  props: {
    score: {
      type: Number,
      default: 0
    },
    size: {
      type: String,
      default: 'md'
    }
  },

  render(h, { props }) {
    const wholeStars = [...Array(Math.floor(props.score)).keys()]
    const halfStar = props.score % 1
    const starSizeClass = props.size === 'md' ? 'w-4 h-4 mr-2' : 'w-3 h-3 mr-1'

    return (
      <div class="inline-flex" aria-label={`${props.score} of 5 stars`}>
        {wholeStars.map(star => (
          <svg
            viewBox="0 0 20 20"
            class={`${starSizeClass} relative top-px text-accent fill-current last:mr-0`}
          >
            <path d="M10 15.95l-5.88 3.09 1.12-6.55L.49 7.86l6.57-.95L10 .95l2.94 5.95 6.57.95-4.76 4.64 1.12 6.55L10 15.95z" />
          </svg>
        ))}

        {halfStar > 0 && (
          <div>
            <figure class={`${starSizeClass} relative`}>
              <meter
                class="absolute w-full h-full"
                min="0"
                max="1"
                optimum="1"
                high="1"
                value={halfStar}
              ></meter>
            </figure>

            <svg class="w-0 h-0">
              <clipPath id="path" clipPathUnits="objectBoundingBox">
                <path d="M0.526,0.882 l-0.309,0.171,0.059,-0.362 L0.026,0.434 l0.345,-0.053 L0.526,0.053 l0.155,0.329,0.345,0.053,-0.25,0.256,0.059,0.362 L0.526,0.882" />
              </clipPath>
            </svg>
          </div>
        )}
      </div>
    )
  }
}
</script>

<style scoped>
meter {
  -webkit-clip-path: url(#path);
  clip-path: url(#path);
  @apply text-primary-lightest;
  background: currentColor;
}
::-webkit-meter-bar {
  @apply text-primary-lightest;
  background: currentColor;
}

::-webkit-meter-optimum-value,
::-webkit-meter-suboptimum-value,
::-webkit-meter-even-less-good-value {
  @apply text-accent;
  background: currentColor;
}
::-moz-meter-bar {
  @apply text-accent;
  background: currentColor;
}
</style>
