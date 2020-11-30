<template>
  <transition name="editPanel" :duration="700" appear>
    <div class="z-40 fixed inset-0">
      <!-- Overlay -->
      <div class="overlay" @click="$emit('click-close')"></div>

      <!-- Panel -->
      <div class="panel">
        <div class="container py-2">
          <div class="flex py-4">
            <h3>Edit profile</h3>
            <button class="ml-auto" @click.prevent="$emit('click-close')">
              <BaseIcon icon="uil:multiply" size="sm" />
            </button>
          </div>

          <!-- Fields -->
          <div class="pt-6">
            <InputText class="mb-6" label="First Name" v-model="firstName" />
            <InputText class="mb-6" label="Last Name" v-model="lastName" />
            <InputText class="mb-6" label="Email Address" type="email" v-model="email" />
            <InputText class="mb-6" label="Change password" type="password" v-model="password" />

            <div class="checkbox mb-6">
              <input type="checkbox" id="set-default" v-model="optInEmail" />

              <label class="w-full" for="set-default">
                <p>Subscribe to newsletter</p>
                <div class="indicator ml-auto text-primary-lighter">
                  <BaseIcon icon="uil:check" size="sm" />
                </div>
              </label>
            </div>
          </div>

          <div class="w-full sticky left-0 bottom-0 bg-primary-lighter pb-4">
            <ButtonLoading
              class="w-full dark"
              @click.native="updateProfile()"
              label="Save changes"
              loadingLabel="Saving"
              :isLoading="isUpdating"
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
  data() {
    return {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      optInEmail: false,
      isUpdating: false
    }
  },

  computed: {
    ...mapState(['customer'])
  },

  methods: {
    async updateProfile() {
      try {
        this.isUpdating = true

        const res = await this.$swell.account.update({
          email: this.email,
          first_name: this.firstName,
          last_name: this.lastName,
          email_optin: this.optInEmail,
          password: this.password
        })

        if (res) {
          // Re-initialize the customer to reflect updated data
          this.isUpdating = false
          this.$store.dispatch('initializeCustomer')
          this.$store.dispatch('showNotification', { message: 'Profile updated.' })
          this.$emit('click-close')
        }
      } catch (err) {
        console.log(err)
      }
    }
  },

  created() {
    // Prefill form data for updating existing data
    if (!this.customer) return

    this.firstName = this.customer.firstName
    this.lastName = this.customer.lastName
    this.email = this.customer.email
    this.optInEmail = this.customer.optInEmail
  }
}
</script>

<style lang="postcss" scoped>
.overlay {
  @apply opacity-50 absolute w-full h-full bg-primary-darker;
}

.panel {
  @apply absolute bottom-0 left-0 w-full rounded-t bg-primary-lighter overflow-scroll;
  height: calc(100vh - 2rem);

  @screen md {
    @apply relative w-128 h-auto rounded left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2;
    max-height: 80vh;
  }
}

.checkbox {
  @apply flex pb-1;

  & input {
    @apply p-0 m-0 border-0 appearance-none w-0 h-0 invisible;
  }

  & input:checked + label {
    & .indicator {
      @apply bg-primary-darkest border-primary-darkest;
    }
  }

  & label {
    @apply relative flex items-center appearance-none;

    & .indicator {
      @apply flex justify-center items-center cursor-pointer w-6 h-6 border border-primary-med rounded;
      transition: all 0.2s ease;
    }

    & p {
      @apply ml-0 font-semibold;
    }
  }

  & .check {
    &:hover {
      opacity: 1;
    }
  }
}

.editPanel-enter-active .overlay,
.editPanel-leave-active .overlay {
  @apply transition-all duration-500 ease-in-out;
}

.editPanel-enter .overlay,
.editPanel-leave-to .overlay {
  @apply opacity-0;
}

.editPanel-enter-to .overlay,
.editPanel-leave .overlay {
  @apply opacity-50;
}

.editPanel-enter-active .panel,
.editPanel-leave-active .panel {
  @apply transition-all duration-700;
  transition-timing-function: cubic-bezier(0.6, 0.2, 0, 1);
}

.editPanel-enter .panel,
.editPanel-leave-to .panel {
  @apply transform translate-y-full;

  @screen md {
    transform: translate(-50%, calc(-50% + 5rem));
    opacity: 0;
  }
}

.editPanel-enter-to .panel,
.editPanel-leave .overlay {
  @apply transform translate-y-0;

  @screen md {
    transform: translate(-50%, -50%);
    opacity: 1;
  }
}
</style>
