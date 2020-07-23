<template>
  <div class="bg-primary-darkest text-center x-padding py-24">
    <div class="container mx-auto md:px-40 my-16 content-center text-primary-lightest">
      <span
        v-if="error.statusCode"
        class="mx-auto text-center uppercase label-xs-bold-faded leading-none max-w-128"
      >
        {{ error.statusCode }} error
      </span>
      <template v-if="error.statusCode < 500">
        <h1 class="text-6xl text-primary-lightest">
          {{ error.heading ? error.heading : error.message }}
        </h1>
        <p v-if="error.heading && error.message" class="mt-4 text-primary-lightest ">
          {{ error.message }}
        </p>
        <div class="inline-block">
          <div class="relative mt-6">
            <input
              type="text"
              class="text-input transition-all duration-200"
              placeholder="Search"
            />
            <div class="absolute top-3 right-3 text-primary-dark transition-all duration-200">
              <BaseIcon icon="uil:search" size="sm" />
            </div>
          </div>

          <NuxtLink
            to="/"
            title="Home"
            class="w-full inline-block mt-6 px-6 py-3 uppercase tracking-wide bg-primary-lighter"
            >Return Home</NuxtLink
          >
        </div>
      </template>

      <template v-else>
        <h1 class="text-6xl px-10 leading-none">Internal server error</h1>
        <p class="mt-4 mx-auto max-w-80 text-primary-lightest">
          Something went wrong, but the issue has been logged and we’ll look into it.
        </p>

        <div class="inline-block">
          <a
            href="#"
            title="Reload"
            class="w-full inline-block mt-6 px-6 py-3 uppercase tracking-wide bg-primary-lighter"
            @click.prevent="reload()"
            >Reload page</a
          >
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    error: {
      type: Object,
      default: () => ({
        statusCode: null,
        heading: 'Page not found',
        message: 'The link you clicked may have changed or the URL is incorrect. Try searching?'
      })
    }
  },

  methods: {
    reload() {
      window.location.reload(true)
    }
  }
}
</script>

<style lang="postcss" scoped>
.text-input {
  @apply rounded pl-4 pr-8 py-2 border border-primary-dark bg-transparent shadow-none;

  &::placeholder {
    @apply text-primary-med;
  }

  &:focus {
    @apply border-primary-lightest;

    & + div {
      @apply text-primary-lightest;
    }
  }
}
</style>
