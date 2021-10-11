<template>
  <transition name="nav-menu" :duration="500" appear>
    <div class="z-30 fixed inset-0">
      <div
        class="
          absolute
          w-full
          h-screen
          flex flex-col
          left-0
          bg-primary-lightest
          overflow-y-scroll
        "
      >
        <!-- Navigation Links -->
        <div
          class="
            container
            flex flex-grow
            pt-28
            md:justify-center md:items-center md:max-w-120
          "
        >
          <transition-group
            name="nav-menu-link"
            tag="ul"
            appear
            class="w-full text-2xl font-semibold"
            :style="{ '--length': menuItems.length }"
          >
            <li
              v-for="(item, index) in menuItems"
              :key="'mobileNavItem' + index"
              class="mb-6 md:text-center"
              :style="{ '--i': index }"
            >
              <a
                v-if="item.type === 'url'"
                class="sw-nav-link"
                rel="noreferrer noopener"
                :href="item.value"
                :target="item.options.target === 'blank' ? '_blank' : '_self'"
                >{{ item.name }}</a
              >
              <NuxtLink
                v-else
                :to="localePath(resolveUrl(item))"
                class="sw-nav-link"
              >
                {{ item.name }}
              </NuxtLink>
            </li>
          </transition-group>
        </div>

        <!-- Misc. Links -->
        <div ref="miscLinks" class="container md:max-w-120">
          <div class="border-t border-primary-light py-12">
            <button
              class="grid-icon-label mb-8"
              @click.prevent="$emit('click-search')"
            >
              <BaseIcon icon="uil:search" size="sm" /><span class="text-left">{{
                $t('navigation.search')
              }}</span>
            </button>
            <NuxtLink
              class="grid-icon-label mb-8"
              :to="
                localePath(
                  customerLoggedIn ? '/account/orders/' : '/account/login/'
                )
              "
            >
              <BaseIcon icon="uil:user" size="sm" /><span>{{
                $t('navigation.account')
              }}</span>
            </NuxtLink>
            <LocaleSelect
              v-if="$i18n.locales.length > 1"
              class="mb-8"
              appearance="popup"
            />
            <CurrencySelect
              v-if="currency"
              :current-currency="currency"
              appearance="popup"
            />
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'TheMobileNav',

  props: {
    menuItems: {
      type: Array,
      default: () => [],
    },
  },

  computed: {
    ...mapState(['customerLoggedIn', 'currency']),
  },

  methods: {
    checkIfLoggedIn() {
      if (this.customerLoggedIn) {
        this.$emit('click-close')
        this.$router.push(this.localePath('/account/'))
      }
    },
  },
}
</script>

<style lang="postcss" scoped>
.sw-nav-link {
  @apply w-full inline-block;

  &:focus,
  &.nuxt-link-active {
    @apply shadow-none text-accent-default border-accent-default;
  }
}

.nav-menu-enter-active {
  @apply transition-all duration-500 ease-in-out;
}

.nav-menu-leave-active {
  @apply transition-all duration-500 ease-in-out;
}

.nav-menu-enter,
.nav-menu-leave-to {
  @apply opacity-0;
}

.nav-menu-enter-to,
.nav-menu-leave {
  @apply opacity-100;
}

.nav-menu-link-enter-active,
.nav-menu-link-leave-active {
  @apply transition-all duration-500 ease-in-out;
}

.nav-menu-link-enter,
.nav-menu-link-leave-to {
  @apply opacity-0 transform translate-y-4;
}

.nav-menu-link-enter-to,
.nav-menu-link-leave {
  @apply opacity-100 transform translate-y-0;
  transition-delay: calc(50ms * var(--i));
}
</style>
