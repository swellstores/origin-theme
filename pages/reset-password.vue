<template>
  <div class="container">
    <div class="mx-auto text-center max-w-112 my-12">
      <h2 class="mb-10 text-3xl sm:text-4xl md:text-5xl lg:text-6xl" style="">
        Change your password
      </h2>

      <p>Please enter your new password</p>

      <div class="w-72 mx-auto my-6">
        <InputText type="password" v-model="newPassword" placeholder="Password" />
      </div>

      <ButtonLoading
        class="dark w-72"
        @click.native="changePassword()"
        label="Change password"
        loadingLabel="Processing…"
        :isLoading="isProcessing"
      />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      key: '',
      newPassword: '',
      isProcessing: false
    }
  },
  methods: {
    async changePassword() {
      this.isProcessing = true

      const res = await this.$swell.account.recover({
        reset_key: this.key,
        password: this.newPassword
      })

      this.isProcessing = false

      if (res.success) {
        this.$store.dispatch('showNotification', {
          message: 'You’ve successfully updated your password.'
        })
        this.$router.push('/')
      }
    }
  },

  created() {
    // Get password reset key query
    this.key = this.$route.query['key']

    // If no key is set, route to homepage.
    if (!this.key) this.$router.push('/')
  }
}
</script>

<style lang="scss" scoped></style>
