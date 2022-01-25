<template>
  <div class="x-padding flex flex-grow bg-primary-darkest py-24 text-center">
    <div class="container mx-auto my-16 content-center md:px-40">
      <span
        v-if="error.statusCode"
        class="label-xs-bold-faded mx-auto max-w-128 text-center uppercase leading-none"
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
            class="mt-6 block"
            fit="auto"
            :label="$t('errors.returnHome')"
            :link="{ url: localePath('/'), title: 'Home' }"
          />
        </div>
      </template>

      <template v-else>
        <h1 class="px-10 text-6xl leading-none">
          {{ $t('errors.internal.title') }}
        </h1>
        <p class="mx-auto mt-4 max-w-80 text-primary-lightest">
          {{ $t('errors.internal.message') }}
        </p>

        <div class="inline-block">
          <a
            href="#"
            title="Reload"
            class="mt-6 inline-block w-full bg-primary-lighter px-6 py-3 uppercase tracking-wide"
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
