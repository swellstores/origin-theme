<template>
  <footer
    :class="{
      'border-primary-darker bg-primary-darkest text-primary-lightest':
        background === 'dark',
      'border-primary-med bg-primary-lighter': background === 'light',
    }"
    class="border-t"
    data-sw-path="footer"
  >
    <!-- Main footer -->
    <div class="container py-16 text-center lg:flex lg:flex-row lg:text-left">
      <!-- Store info -->
      <div
        v-if="footer.showContactInfo || footer.showSocial"
        class="lg:w-1/4 lg:pr-6"
      >
        <div v-if="footer.showContactInfo" class="mb-5">
          <p v-if="footer.contactInfoHeading" class="mb-4 text-sm">
            {{ footer.contactInfoHeading }}
          </p>
          <p>
            <a class="block" :href="'tel:' + store.supportPhone">
              {{ store.supportPhone }}
            </a>
            <a class="block" :href="'mailto:' + store.supportEmail">
              {{ store.supportEmail }}
            </a>
          </p>
          <div class="mt-2" v-html="footer.contactInfoText" />
        </div>

        <!-- Social links-->
        <ul
          v-if="footer.showSocial"
          class="mx-auto lg:-ml-2"
          data-sw-path="social"
        >
          <li
            v-for="link of orderedSocialLinks"
            :key="link.id"
            class="mb-0 inline-block"
          >
            <a
              :href="link.url"
              target="_blank"
              :title="`Join us on ${link.id}`"
              class="mx-2 block"
            >
              <BaseIcon :icon="`mdi:${link.id}`" />
            </a>
          </li>
        </ul>
      </div>

      <!-- Nav menu -->
      <template v-if="menu">
        <div
          v-for="(column, index) in menu.items"
          :key="'footerMenuCol' + index"
          class="my-10 lg:my-0 lg:w-1/4"
        >
          <ul v-if="column.items">
            <li v-for="(item, i) in column.items" :key="item.name" class="mb-0">
              <!-- Heading -->
              <p
                v-if="item.type === 'heading'"
                :class="{ 'mt-6': i > 0 }"
                class="mb-3 text-sm text-primary-med"
              >
                {{ item.name }}
              </p>
              <!-- Standard link -->
              <a
                v-else-if="item.type === 'url'"
                class="inline-block py-1 text-xl leading-tight"
                rel="noreferrer noopener"
                :href="item.value"
                :target="item.options.target === 'blank' ? '_blank' : '_self'"
                >{{ item.name }}</a
              >
              <NuxtLink
                v-else
                :to="localePath(resolveUrl(item))"
                class="inline-block py-1 text-xl leading-tight"
              >
                {{ item.name }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </template>

      <!-- Email signup -->
      <template v-if="footer.showEmailSignup">
        <div class="mx-auto max-w-96 lg:w-1/4 lg:flex-shrink-0">
          <!-- Heading + text -->
          <p v-if="footer.emailSignupHeading" class="mb-5 text-sm">
            {{ footer.emailSignupHeading }}
          </p>
          <div v-if="footer.emailSignupText" v-html="footer.emailSignupText" />
          <EmailSignupForm
            :theme="background === 'dark' ? 'dark' : 'light'"
            class="mt-5"
          />
        </div>
      </template>
    </div>
    <!-- END Main footer -->

    <!-- Secondary footer -->
    <div
      :class="{
        'border-primary-darker': background === 'dark',
        'border-primary-med': background === 'light',
      }"
      class="border-t border-primary-darker py-4 text-center text-sm"
    >
      <div class="lg:flex-no-wrap container lg:flex lg:justify-between">
        <!-- Copyright & Settings -->
        <p class="my-3 text-sm">
          <span>©{{ currentYear }} {{ store.name }}.</span> Powered by
          <a
            id="powered-by-swell"
            href="https://www.swell.is/"
            title="Headless ecommerce platform for brands"
            class="text-current"
            >Swell</a
          >
        </p>
        <!-- Secondary nav menu -->
        <ul v-if="footer.showSecondaryMenu && secondaryMenu" class="my-3">
          <li
            v-for="item in secondaryMenu.items"
            :key="item.name"
            class="mx-3 mb-0 inline-block"
          >
            <a
              v-if="item.type === 'url'"
              rel="noreferrer noopener"
              :href="item.value"
              :target="item.options.target === 'blank' ? '_blank' : '_self'"
              >{{ item.name }}</a
            >
            <NuxtLink v-else :to="localePath(resolveUrl(item))">
              {{ item.name }}
            </NuxtLink>
          </li>
        </ul>

        <!-- Payment methods TODO -->
        <ul
          v-if="footer.showPaymentMethods && paymentMethods"
          class="flex flex-wrap justify-center"
        >
          <li />
          <li />
          <li />
          <li />
          <li />
          <li />
          <li />
          <li />
        </ul>
      </div>
    </div>
  </footer>
</template>

<script>
// Helpers
import get from 'lodash/get';

export default {
  name: 'TheFooter',

  data() {
    return {
      footer: {},
      store: {},
      socialLinks: {},
      menu: null,
      secondaryMenu: null,
      paymentMethods: null,
      currentYear: new Date().getFullYear(),
      background: 'dark',
    };
  },

  async fetch() {
    const { $swell } = this;

    // Get menu settings
    const menuId = await $swell.settings.get('footer.menu', 'footer');
    const secondaryMenuId = await $swell.settings.get(
      'footer.secondaryMenu',
      'footer-secondary',
    );

    // Set menus
    this.menu = await $swell.settings.menus(menuId);
    this.secondaryMenu = await $swell.settings.menus(secondaryMenuId);

    // Set component data
    this.store = await $swell.settings.get('store', {});
    this.footer = await $swell.settings.get('footer', {});
    this.socialLinks = await $swell.settings.get('socialLinks', {});
    this.background = await $swell.settings.get('footer.background', 'dark');
  },

  computed: {
    orderedSocialLinks() {
      return [
        'twitter',
        'facebook',
        'pinterest',
        'instagram',
        'youtube',
        'vimeo',
        'whatsapp',
      ]
        .map((id) => ({ id, ...get(this, `socialLinks.${id}`, {}) })) // Get the network's link value from settings
        .filter((link) => link.show && link.url); // Only include if it's switched on and  has a url
    },
  },
};
</script>
