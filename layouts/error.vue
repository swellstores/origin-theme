<template>
  <div class="flex flex-grow bg-primary-darkest text-center x-padding py-24">
    <div class="container mx-auto md:px-40 my-16 content-center">
      <span
        v-if="error.statusCode"
        class="
          mx-auto
          text-center
          uppercase
          label-xs-bold-faded
          leading-none
          max-w-128
        "
      >
        {{ $t('errors.errorCode', { code: error.statusCode }) }}
      </span>
      <template v-if="error.statusCode < 500">
        <h1 class="text-6xl text-primary-lightest">
          {{ $t('errors.pageNotFound.title') || error.heading }}
        </h1>
        <p class="mt-4 text-primary-lightest">
          {{ $t('errors.pageNotFound.message') || error.message }}
        </p>
        <div class="inline-block">
          <BaseButton
            class="block mt-6"
            fit="auto"
            :label="$t('errors.returnHome')"
            :link="{ url: localePath('/'), title: 'Home' }"
          />
        </div>
      </template>

      <template v-else>
        <h1 class="text-6xl px-10 leading-none">
          {{ $t('errors.internal.title') }}
        </h1>
        <p class="mt-4 mx-auto max-w-80 text-primary-lightest">
          {{ $t('errors.internal.message') }}
        </p>

        <div class="inline-block">
          <a
            href="#"
            title="Reload"
            class="
              w-full
              inline-block
              mt-6
              px-6
              py-3
              uppercase
              tracking-wide
              bg-primary-lighter
            "
            @click.prevent="reload()"
            >{{ $t('errors.internal.reload') }}</a
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
        heading: '',
        message: '',
      }),
    },
  },

  head() {
    return {
      script: [
        // Iconify API script for loading SVG icons on demand
        {
          type: 'text/javascript',
          src: 'https://code.iconify.design/1/1.0.1/iconify.min.js',
          async: true,
          body: true,
        },
      ],
      link: [
        {
          rel: 'preconnect',
          href: process.env.cdnHost,
          crossorigin: true,
        },
      ],
    }
  },

  methods: {
    reload() {
      window.location.reload()
    },
  },
}
</script>
