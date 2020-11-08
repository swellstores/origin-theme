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
        <template v-if="address.state">
          {{ address.state }}
        </template>
      </p>
      <p v-if="address.zip">{{ address.zip }}</p>
      <p v-if="address.country">{{ address.country }}</p>
    </div>

    <div class="flex flex-col items-end ml-auto">
      <div v-if="address.active" class="label-xs-bold bg-primary-light rounded p-2">
        Default
      </div>
      <div class="mt-auto">
        <button v-if="!address.active" class="px-2 mr-2">Remove</button>
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
    }
  }
}
</script>

<style lang="scss" scoped></style>
