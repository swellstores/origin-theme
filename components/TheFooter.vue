<template>
  <footer class="bg-primary-darkest pt-16">
    <div class="max-w-48 flex flex-col items-center m-auto text-center">
      <div class="w-16 md:w-24 h-auto pb-14">
        <StoreLogo color="light" />
      </div>

      <!-- Contact -->
      <p class="label-sm-faded pb-4">Contact us</p>
      <p>
        <span v-if="store.supportPhone" class="block">{{ store.supportPhone }}</span
        ><span v-if="store.supportEmail" class="block">{{ store.supportEmail }}</span>
      </p>

      <!-- Social links-->
      <ul class="flex items-center pt-4">
        <li v-for="link in socialLinks" :key="link.icon" class="px-2 mb-0">
          <a :href="link.url" target="_blank" :title="`Join us on ${link.platform}`">
            <BaseIcon :icon="link.icon" />
          </a>
        </li>
      </ul>

      <!-- Nav links -->
      <ul v-if="footerNav" class="py-18">
        <li v-for="item in footerNav.items" :key="item.name">
          <NuxtLink class="text-4xl" :to="resolveUrl(item)">{{ item.name }}</NuxtLink>
        </li>
      </ul>

      <!-- Small links -->
      <ul v-if="secondaryNav" class="pb-18 text-sm uppercase">
        <li v-for="item in secondaryNav.items" :key="item.name">
          <NuxtLink :to="resolveUrl(item)">{{ item.name }}</NuxtLink>
        </li>
      </ul>
    </div>

    <!-- Copyright & Settings -->
    <div class="flex items-center p-6 border-primary-darker border-t border-b md:border-b-0">
      <p class="label-sm-faded">
        <span class="block">©{{ currentYear }} {{ store.name }}</span>
        <a
          id="powered-by-swell"
          href="https://www.swell.is/"
          title="Headless ecommerce platform for brands"
          class="text-primary-dark"
          >Powered by Swell</a
        >
      </p>
    </div>

    <!-- Payment methods TODO -->
    <ul class="flex flex-wrap justify-center py-10 px-10">
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
    </ul>
  </footer>
</template>

<script>
export default {
  name: 'TheFooter',

  data() {
    return {
      footerNav: null,
      secondaryNav: null,
      store: {},
      socialLinks: null,
      currentYear: new Date().getFullYear(),
    }
  },

  async fetch() {
    const { $swell } = this
    // Set menus
    this.footerNav = await $swell.settings.menus('footer')
    this.secondaryNav = await $swell.settings.menus('footer-secondary')

    // Set content
    this.store = await $swell.settings.get('store')
    this.socialLinks = await $swell.settings.get('socialLinks')
  }
}
</script>

<style lang="postcss" scoped>
footer,
button,
a:not(#powered-by-swell) {
  @apply text-primary-lightest;
}
</style>
