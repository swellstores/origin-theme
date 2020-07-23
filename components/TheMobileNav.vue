<template functional>
  <transition name="nav-menu" :duration="500" appear>
    <div class="z-30 fixed inset-0">
      <div
        class="absolute w-full h-screen flex flex-col left-0 bg-primary-lightest overflow-y-scroll"
      >
        <!-- Navigation Links -->
        <div class="flex flex-grow flex-row justify-center items-center">
          <transition-group
            name="nav-menu-link"
            tag="ul"
            appear
            class="text-center text-4xl font-semibold"
            :style="{ '--length': props.menuItems.length }"
          >
            <li
              v-for="(item, index) in props.menuItems"
              :key="'mobileNavItem' + index"
              :style="{ '--i': index }"
            >
              <NuxtLink :to="parent.resolveUrl(item)" class="sw-nav-link">{{ item.name }}</NuxtLink>
            </li>
          </transition-group>
        </div>

        <!-- Misc. Links -->
        <!--TODO
        <div
          ref="miscLinks"
          class="bottom-0 w-full flex flex-wrap border-b border-primary-light md:px-10 md:pb-6 md:border-b-0 md:justify-center"
        >
          <a class="sw-nav-button" href="#">
            <BaseIcon icon="uil:search" size="sm" /><span class="ml-3">Search</span>
          </a>
          <NuxtLink to="/account" class="sw-nav-button">
            <BaseIcon icon="uil:user" size="sm" /><span class="ml-3">Account</span>
          </NuxtLink>
          <a class="sw-nav-button" href="#">{{ formatMoney() }} {{ $store.state.currency }}</a>
          <a class="sw-nav-button" href="#">
            <BaseIcon icon="uil:comment-alt-lines" size="sm" /><span class="ml-3">English</span>
          </a>
        </div>
        -->
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'TheMobileNav',

  props: {
    menuItems: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style lang="postcss" scoped>
.sw-nav-button {
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

.sw-nav-link {
  &:focus,
  &.nuxt-link-active {
    @apply shadow-none text-accent border-accent;
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
