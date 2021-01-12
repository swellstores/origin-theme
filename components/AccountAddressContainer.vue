<template>
  <div class="flex bg-primary-lightest p-4 rounded shadow-md">
    <div class="max-w-1/2">
      <p v-if="address.name">{{ address.name }}</p>
      <p v-if="address.address1">
        <template v-if="address.address2">{{ address.address2 }}, </template>
        {{ address.address1 }}
      </p>
      <p v-if="address.city">
        {{ address.city }}
        <template v-if="address.zip">
          {{ address.zip }}
        </template>
      </p>
      <p v-if="address.state">
        {{ address.state }}
        <template v-if="address.country">
          {{ getCountryName(address.country) }}
        </template>
      </p>
    </div>

    <div class="flex flex-col items-end ml-auto">
      <div v-if="isDefault" class="label-xs-bold bg-primary-light rounded p-2">
        Default
      </div>

      <button v-else class="normal-case label-sm-bold" @click="$emit('set-default', address.id)">
        Use as default
      </button>

      <div class="mt-auto label-sm">
        <button v-if="!isDefault" class="px-2 mr-2" @click="$emit('delete-address', address.id)">
          Remove
        </button>
        <button class="px-2" @click="$emit('click-open')">Edit</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    address: {
      type: Object,
      default: null
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }
}
</script>
