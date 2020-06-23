<template>
  <transition name="nav" :duration="500" appear>
    <div class="z-1- fixed inset-0">
      <div
        class="absolute w-full h-screen flex flex-col left-0 bg-primary-lightest overflow-y-scroll"
      >
        <!-- Navigation Links -->
        <div class="flex flex-grow flex-row justify-center items-center">
          <transition-group
            name="nav-link"
            tag="ul"
            appear
            class="text-center text-4xl font-semibold"
            :style="{ '--length': items.length }"
          >
            <li
              v-for="(item, index) in items"
              :key="`mobile-nav-item-${index}`"
              :style="{ '--i': index }"
            >
              {{ item }}
            </li>
          </transition-group>
        </div>

        <!-- Misc. Links -->
        <div
          ref="miscLinks"
          class="bottom-0 w-full flex flex-wrap border-b border-primary-light md:px-10 md:pb-6 md:border-b-0 md:justify-center"
        >
          <a class="nav-button" href="#">
            <BaseIcon icon="uil:search" size="sm" /><span class="ml-3">Search</span>
          </a>
          <NuxtLink to="/account" class="nav-button">
            <BaseIcon icon="uil:user" size="sm" /><span class="ml-3">Account</span>
          </NuxtLink>
          <a class="nav-button" href="#">{{ formatMoney() }} {{ $store.state.currency }}</a>
          <a class="nav-button" href="#">
            <BaseIcon icon="uil:comment-alt-lines" size="sm" /><span class="ml-3">English</span>
          </a>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'TheMobileNav',

  props: {
    menu: {
      type: Object,
      default: () => ({})
    }
  },

  created() {
    // Set nav menu
    this.menu = this.$swell.settings.menus('header')
  }
}
</script>

<style lang="postcss" scoped>
.nav-button {
  @apply w-1/2 h-14 flex flex-row justify-center items-center border-primary-light rounded-none;

  &:nth-child(odd) {
    @apply border-r border-t;
  }

  &:nth-child(even) {
    @apply border-t;
  }

  @screen md {
    @apply w-40 border rounded m-1;
  }
}

.nav-enter-active {
  @apply transition-all duration-500 ease-in-out;
}

.nav-leave-active {
  @apply transition-all duration-500 ease-in-out;
}

.nav-enter,
.nav-leave-to {
  @apply opacity-0;
}

.nav-enter-to,
.nav-leave {
  @apply opacity-100;
}

.nav-link-enter-active,
.nav-link-leave-active {
  @apply transition-all duration-500 ease-in-out;
}

.nav-link-enter,
.nav-link-leave-to {
  @apply opacity-0 transform translate-y-4;
}

.nav-link-enter-to,
.nav-link-leave {
  @apply opacity-100 transform translate-y-0;
  transition-delay: calc(50ms * var(--i));
}
</style>
