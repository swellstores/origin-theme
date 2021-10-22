<template>
  <div
    class="w-full bg-primary-lightest shadow-md border-primary-light border-t"
  >
    <div class="container">
      <div class="flex flex-wrap items-stretch pt-6 -mx-4">
        <!-- Columns -->
        <ul
          v-for="(column, index) in items"
          :key="'megaNavCol' + index"
          class="flex-initial px-4 mb-6 w-1/4 min-w-48"
        >
          <li
            v-for="(item, i) in column.items"
            :key="'megaNavItem' + i"
            class="mb-0"
          >
            <!-- Product preview -->
            <NuxtLink
              v-if="item.type === 'product' && typeof item.value === 'object'"
              :to="localePath(resolveUrl(item))"
              class="block mt-1"
              @click.native="$emit('click')"
            >
              <VisualMedia
                v-if="item.value.images"
                :source="item.value.images[0]"
                sizes="300px"
                class="rounded"
              />
              <div class="pt-4">
                <h4>{{ item.name }}</h4>
                <p v-if="item.value.price" class="text-primary-darker">
                  {{ formatMoney(item.value.price, currency) }}
                </p>
              </div>
            </NuxtLink>
            <!-- Heading -->
            <p
              v-else-if="item.type === 'heading'"
              :class="{ 'mt-4': i > 0 }"
              class="label-sm-faded mb-2"
            >
              {{ item.name }}
            </p>
            <!-- Callout -->
            <p
              v-else-if="item.type === 'callout'"
              :class="{ 'mt-4': i > 0 }"
              class="btn"
            >
              {{ item.name }}
            </p>
            <!-- URL link -->
            <a
              v-else-if="item.type === 'url'"
              rel="noreferrer noopener"
              :href="item.value"
              :target="item.options.target === 'blank' ? '_blank' : '_self'"
              class="block -mx-1 p-1 leading-tight"
            >
              {{ item.name }}
            </a>
            <!-- Standard internal link -->
            <NuxtLink
              v-else
              :to="localePath(resolveUrl(item))"
              class="block -mx-1 p-1 leading-tight"
              @click.native="$emit('click')"
            >
              {{ item.name }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'MegaNav',

  props: {
    items: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    ...mapState(['currency']),
  },
}
</script>
