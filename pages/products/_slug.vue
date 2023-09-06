<template>
  <main>
    <!-- Core product content -->
    <section class="relative z-20 mb-12">
      <div class="max-w container md:flex">
        <div class="relative pt-14 md:w-1/2 md:pr-4 lg:pr-0">
          <div class="max-w-160">
            <div v-if="$fetchState.pending" class="h-full bg-primary-lighter" />

            <div v-else class="grid gap-4">
              <div
                v-if="productThumbnail"
                class="cursor-pointer"
                @click="handleTogglePopupSlider"
              >
                <img
                  class="h-auto max-w-full rounded-lg"
                  :src="productThumbnail.file.url"
                  alt="thumbnail image"
                />
              </div>

              <!-- Fallback image -->
              <div
                v-else
                class="relative cursor-pointer rounded bg-primary-lighter pb-full"
                @click="handleTogglePopupSlider"
              >
                <BaseIcon
                  icon="uil:camera-slash"
                  size="lg"
                  class="center-xy absolute text-primary-med"
                />
              </div>

              <div
                :class="`grid grid-flow-col gap-4 overflow-auto grid-cols-${mediaFilesColumns}`"
              >
                <div
                  v-if="productVideo"
                  class="basis-full aspect-video relative cursor-pointer"
                  @click="handleTogglePopupSlider"
                >
                  <img
                    class="h-full w-full rounded-lg object-cover"
                    :src="productVideo.thumbnailUrl"
                    alt="thumbnail video"
                  />
                  <button
                    class="center-xy absolute inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-lightest p-2"
                  >
                    <BaseIcon
                      icon="uil:play"
                      size="md"
                      class="text-primary-dark"
                    />
                  </button>
                </div>

                <template v-if="productImages">
                  <div
                    v-for="(media, i) in productImages"
                    :key="media.id"
                    class="basis-full aspect-video relative cursor-pointer"
                    @click="openSliderWithActiveSlide(i + 1)"
                  >
                    <img
                      class="h-full w-full rounded-lg object-cover"
                      :src="media.file.url"
                      :alt="`image ${i + 1} of product`"
                    />
                  </div>
                </template>
              </div>
            </div>
          </div>

          <div v-if="productMedia">
            <ProductSliderPopup
              :is-open-modal="isPopupSliderOpen"
              :youtube-video="productVideo"
              :thumbnail-image="productThumbnail"
              :active-slide="activeSlide"
              :images="productImages"
              :indicator-color="'dark'"
              @toggle-popup="handleTogglePopupSlider"
            >
              <template #header>
                <h2 class="text-left">{{ product.name }}</h2>
              </template>
            </ProductSliderPopup>
          </div>

          <!-- Store features -->
          <!-- product benefits -->
          <div class="mt-8 hidden md:block">
            <ul class="relative flex flex-wrap gap-x-6">
              <li
                v-for="(benefit, index) in productBenefits"
                :key="'storeProductBenefit' + index"
                class="label-sm my-2 flex cursor-pointer"
              >
                <ProductBenefit :benefit="benefit" />
              </li>
            </ul>
          </div>

          <!-- attributes -->
          <div
            v-for="attribute in product.attributes"
            :key="attribute.id"
            class="mt-5 hidden md:block"
          >
            <template v-if="attribute.visible">
              <component
                :is="getAttributeComponent(attribute.type)"
                :attribute="attribute"
                :currency="currency"
              />
            </template>
          </div>

          <!-- Share product -->
          <div
            v-if="enableSocialSharing"
            class="flex-no-wrap hidden py-3 md:flex"
          >
            <strong class="w-1/4 pr-6 text-primary-darkest">{{
              $t('products._slug.share')
            }}</strong>
            <div class="flex w-3/4 justify-end">
              <SocialShare
                class="mr-2 cursor-pointer"
                network="facebook"
                :url="pageMeta.url"
                :title="pageMeta.title"
                :description="pageMeta.description"
              >
                <BaseIcon icon="mdi:facebook" />
              </SocialShare>

              <SocialShare
                class="mr-2 cursor-pointer"
                network="twitter"
                :url="pageMeta.url"
                :title="pageMeta.title"
                :description="pageMeta.description"
              >
                <BaseIcon icon="mdi:twitter" />
              </SocialShare>

              <SocialShare
                class="mr-2 cursor-pointer"
                network="pinterest"
                :url="pageMeta.url"
                :description="pageMeta.description"
                :media="pageMeta.image"
              >
                <BaseIcon icon="mdi:pinterest" />
              </SocialShare>

              <SocialShare
                class="cursor-pointer"
                network="email"
                :url="pageMeta.url"
                :title="pageMeta.title"
                :description="pageMeta.description"
              >
                <BaseIcon icon="mdi:envelope" />
              </SocialShare>
            </div>
          </div>

          <!-- faq collapseable -->
          <template v-if="product">
            <div v-if="expandableDetailsInOrder" class="my-8 hidden md:block">
              <ProductFaq :details="expandableDetailsInOrder" />
            </div>
          </template>

          <!-- Back button -->
          <a
            href="#"
            class="fixed left-6 bottom-6 flex h-9 w-9 items-center justify-center rounded-full bg-primary-lighter shadow-md"
            @click.prevent="navigateBack"
          >
            <BaseIcon icon="uil:angle-left" class="-ml-px" />
          </a>
        </div>

        <!-- Product overview -->
        <div class="md:w-1/2 lg:px-6 xl:px-12">
          <div
            class="max-w-160 pt-10 transition-all duration-300 ease-in-out md:sticky md:pt-12"
            :class="headerIsVisible ? 'top-20' : 'top-0'"
          >
            <!-- Skeleton loader -->
            <div v-if="$fetchState.pending">
              <div class="loader-el mb-4 h-3 w-32" />
              <div class="loader-el mb-7 h-9 w-2/3" />
              <div class="loader-el mb-4 h-3 w-40" />
              <div class="loader-el mb-12 h-4 w-20" />
              <div
                v-for="index in 7"
                :key="`skeleton-1-${index}`"
                :style="`width: ${100 - Math.random() * 20}%`"
                class="loader-el mb-4 h-2"
              />
              <div class="mt-12 mb-4 flex justify-between">
                <div class="loader-el h-3 w-24" />
                <div class="loader-el h-3 w-48" />
              </div>
              <div class="loader-el mb-10 h-12" />
              <div
                v-for="index in 3"
                :key="`skeleton-2-${index}`"
                class="mb-2 flex items-center"
              >
                <div class="loader-el mr-2 h-5 w-5 rounded-full" />
                <div
                  :style="`width: ${80 - Math.random() * 30}%`"
                  class="loader-el h-2"
                />
              </div>
            </div>

            <!-- Main content -->
            <div v-else>
              <!-- breadcrumbs -->
              <nav class="flex" aria-label="Breadcrumbs">
                <ol
                  class="inline-flex flex-wrap items-center space-x-1 md:space-x-3"
                >
                  <li class="inline-flex items-center">
                    <NuxtLink
                      to="/"
                      class="w-max text-sm font-medium text-primary-dark"
                    >
                      All Events
                    </NuxtLink>
                  </li>
                  <li>
                    <div class="flex items-center">
                      <svg
                        class="fill-grey w-1.5 mx-1 h-3"
                        viewBox="0 0 5 11"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M0.157568 10.4358C-0.0436482 10.2467 -0.0534543 9.93022 0.135666 9.72901L3.92592 5.69633C4.02469 5.59124 4.02469 5.40878 3.92592 5.3037L0.135667 1.27102C-0.0534536 1.0698 -0.0436474 0.753369 0.157569 0.564249C0.358786 0.375128 0.675216 0.384934 0.864336 0.586151L4.65459 4.61883C5.11514 5.10883 5.11514 5.89119 4.65459 6.38119L0.864336 10.4139C0.675215 10.6151 0.358785 10.6249 0.157568 10.4358Z"
                        />
                      </svg>

                      <NuxtLink
                        :to="`/categories/${productCategory.slug}`"
                        class="ml-1 w-max text-sm font-medium text-primary-dark md:ml-2"
                      >
                        {{ productCategory.name }}
                      </NuxtLink>
                    </div>
                  </li>
                  <li aria-current="page">
                    <div class="flex items-center">
                      <svg
                        class="fill-grey w-1.5 mx-1 h-3"
                        viewBox="0 0 5 11"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M0.157568 10.4358C-0.0436482 10.2467 -0.0534543 9.93022 0.135666 9.72901L3.92592 5.69633C4.02469 5.59124 4.02469 5.40878 3.92592 5.3037L0.135667 1.27102C-0.0534536 1.0698 -0.0436474 0.753369 0.157569 0.564249C0.358786 0.375128 0.675216 0.384934 0.864336 0.586151L4.65459 4.61883C5.11514 5.10883 5.11514 5.89119 4.65459 6.38119L0.864336 10.4139C0.675215 10.6151 0.358785 10.6249 0.157568 10.4358Z"
                        />
                      </svg>
                      <span
                        class="ml-1 text-sm font-medium text-primary-dark md:ml-2"
                      >
                        {{ product.name }}
                      </span>
                    </div>
                  </li>
                </ol>
              </nav>

              <!--TODO<div class="mb-2 label-xs-bold text-primary-dark">{{ breadcrumb }}</div>-->
              <h1 class="mt-6 mb-4 leading-tight md:mt-10">
                {{ product.name }}
              </h1>
              <!--TODO awaiting customer reviews feature
            <ReviewStars :score="reviews.averageScore" size="sm" />
            <span class="text-sm">{{ reviews.total }} reviews</span>
            -->
              <div
                class="mt-2 mb-5 flex items-center text-lg font-semibold md:mb-8"
              >
                <!-- <span
                  v-if="
                    variation.price !== null &&
                    variation.price >= 0 &&
                    variationCurrency === currency
                  "
                  >{{ formatMoney(variation.price, currency, false) }}</span
                > -->
                <span
                  v-if="
                    product.pricePerPerson && variationCurrency === currency
                  "
                  class="text-xl"
                  >{{
                    formatMoney(product.pricePerPerson, currency, false)
                  }}
                  per person</span
                >
                <span v-else>{{
                  $t('products._slug.unavailableInCurrency', {
                    currency,
                  })
                }}</span>
                <span v-if="billingInterval" class="lowercase"
                  >&nbsp;{{ billingInterval }}</span
                >
                <span
                  v-if="variation.origPrice"
                  class="ml-3 -mt-2px inline-block h-6 rounded bg-error-faded px-2 text-xs uppercase leading-loose text-error-default"
                >
                  {{ $t('products._slug.save') }}
                  {{
                    formatMoney(
                      variation.origPrice - variation.price,
                      currency,
                      false,
                    )
                  }}
                </span>
              </div>
              <div class="markdown" v-html="product.description" />

              <!-- Bundle items -->
              <template v-if="bundleItems">
                <div
                  class="my-8 border-b border-primary-med"
                  :class="{ 'hidden md:block': bundleItems.length > 3 }"
                >
                  <h2 class="text-xl">
                    {{ $t('products._slug.bundle.title') }}
                  </h2>

                  <ProductBundleItem
                    v-for="(item, index) in bundleItems"
                    ref="bundleItem"
                    :key="'bundleItem' + index"
                    class="border-b border-primary-light last:border-b-0"
                    :item="item"
                    :option-state="bundleItemsOptionState"
                    @check-availability="checkBundleItemAvailability"
                    @value-changed="setBundleItemOptionValue"
                  />
                </div>

                <div v-if="bundleItems.length > 3" class="block md:hidden">
                  <AccordionItem
                    ref="bundleItemAccordion"
                    :heading="$t('products._slug.bundle.title')"
                  >
                    <ProductBundleItem
                      v-for="(item, index) in bundleItems"
                      ref="bundleItem"
                      :key="'bundleItem' + index"
                      class="border-b border-primary-light last:border-b-0"
                      :item="item"
                      :option-state="bundleItemsOptionState"
                      @check-availability="checkBundleItemAvailability"
                      @value-changed="setBundleItemOptionValue"
                    />
                  </AccordionItem>
                </div>
              </template>

              <!-- Product options -->
              <div v-for="input in optionInputs" :key="input.name" class="my-8">
                <component
                  :is="input.component"
                  v-if="
                    optionState[input.option.id] &&
                    optionState[input.option.id].isVisible
                  "
                  :option="input.option"
                  :current-value="optionState[input.option.id].value"
                  :active-dropdown-u-i-d="activeDropdownUID"
                  :validation="$v.selectedOptions[input.option.name]"
                  :duration-in-minutes="
                    Number.parseInt(product.attributes.duration.value)
                  "
                  @value-changed="
                    (args) =>
                      setOptionValue({ ...args, optionId: input.option.id })
                  "
                  @dropdown-active="setActiveDropdownUID($event)"
                />
              </div>

              <!-- Purchase options -->
              <ProductPurchaseOptions
                v-if="product.purchaseOptions && variationCurrency === currency"
                v-model="selectedPurchaseOption"
                :options="product.purchaseOptions"
                :option-state="selectedOptions"
                :product="product"
                :quantity="quantity"
              />

              <!-- Cart button & stock info -->
              <div v-if="variation" class="relative my-8">
                <StockStatus
                  v-if="product.stockTracking && !product.stockPurchasable"
                  :status-value="variation.stockStatus"
                  :bundle-items-available="bundleItemsAvailable"
                  :stock-level="variation.stockLevel"
                  :show-stock-level="showStockLevel"
                />

                <!-- Quantity -->
                <div class="flex">
                  <ProductQuantity
                    v-if="
                      enableQuantity &&
                      selectedPurchaseOption &&
                      selectedPurchaseOption.type === 'standard'
                    "
                    v-model="quantity"
                    :initial-limit="maxQuantity"
                    :stock-tracking="variation.stockTracking"
                    :stock-purchasable="variation.stockPurchasable"
                    :stock-level="variation.stockLevel"
                  />

                  <!-- Add to cart -->
                  <button
                    :class="{
                      loading: cartIsUpdating,
                      disabled: !available,
                    }"
                    type="submit"
                    class="btn btn--lg relative h-auto w-full"
                    :disabled="!available"
                    @click.prevent="addToCart"
                  >
                    <div v-show="!cartIsUpdating">
                      <template
                        v-if="
                          variation.price !== null &&
                          variation.price >= 0 &&
                          variationCurrency === currency
                        "
                      >
                        <span>{{ $t('products._slug.addToCart') }}</span>
                        <span class="hidden sm:inline">
                          <span
                            class="mx-1 mb-1 inline-block w-5 border-b border-primary-lightest"
                          />
                          <span>{{
                            formatMoney(
                              variation.price * quantity,
                              currency,
                              false,
                            )
                          }}</span>
                          <span v-if="billingInterval">{{
                            billingInterval
                          }}</span>
                          <span
                            v-if="
                              variation.origPrice &&
                              !(
                                selectedPurchaseOption &&
                                selectedPurchaseOption.type === 'subscription'
                              )
                            "
                            class="ml-1 text-primary-med line-through"
                          >
                            {{
                              formatMoney(
                                variation.origPrice * quantity,
                                currency,
                                false,
                              )
                            }}
                          </span>
                          <span
                            v-if="
                              selectedPurchaseOption &&
                              selectedPurchaseOption.type === 'subscription'
                            "
                            class="lowercase"
                          >
                            / {{ intervalCount }}{{ subscriptionInterval }}
                          </span>
                        </span>
                      </template>
                      <template v-else>
                        <span>{{
                          $t('products._slug.unavailableInCurrencyAddToCart', {
                            currency,
                          })
                        }}</span>
                      </template>
                    </div>
                    <div v-show="cartIsUpdating">
                      <div class="spinner absolute inset-0 mt-3" />
                      <span>{{ $t('products._slug.updating') }}</span>
                    </div>
                  </button>
                </div>
              </div>
              <!-- END Purchase form -->

              <!-- how can we help -->
              <div class="my-8">
                <div class="mb-3">
                  <!-- todo make $t work -->
                  <ProductOptionLabel :id="'123'" :name="'How can we help?'" />
                  <!-- :name="$t('products._slug.help.label')" -->
                </div>

                <div class="grid gap-3 sm:grid-cols-2 sm:gap-5">
                  <!-- todo make $t work -->
                  <BaseButton
                    id="how-can-we-help"
                    :label="'Ask a question'"
                    :fit="'full'"
                  />
                  <!-- :label="$t('products._slug.askAQuestion')" -->

                  <!-- todo make $t work -->
                  <BaseButton
                    id="book-a-call"
                    :label="'Book a call'"
                    :fit="'full'"
                    @click.native="popupCalendly"
                  />
                  <!-- :label="$t('products._slug.bookACall')" -->
                </div>
              </div>

              <!-- brandDetails -->
              <div
                v-if="brandDetails"
                class="my-8 flex flex-col gap-4 lg:flex-row"
              >
                <!-- for logo -->
                <div class="max-w-24 flex-shrink-0">
                  <a :href="`https://${brandDetails.websiteUrl}`">
                    <img
                      class="block h-full w-full object-contain"
                      :src="brandDetails.logoUrl"
                      :alt="`${brandDetails.name} logo`"
                    />
                  </a>
                </div>

                <p class="text-base/tight md:text-lg/tight text-primary-darker">
                  {{ brandDetails.description }}
                </p>
              </div>

              <!-- Store features -->
              <!-- product benefits -->
              <div class="my-8 md:hidden">
                <ul class="relative flex flex-wrap gap-x-6">
                  <li
                    v-for="(benefit, index) in productBenefits"
                    :key="'storeProductBenefit' + index"
                    class="label-sm my-2 flex cursor-pointer"
                  >
                    <ProductBenefit :benefit="benefit" />
                  </li>
                </ul>
              </div>

              <!-- Details & attributes -->
              <div
                v-for="attribute in product.attributes"
                :key="attribute.id"
                class="md:hidden"
              >
                <template v-if="attribute.visible">
                  <component
                    :is="getAttributeComponent(attribute.type)"
                    :attribute="attribute"
                    :currency="currency"
                  />
                </template>
              </div>

              <!-- Share product -->
              <div
                v-if="enableSocialSharing"
                class="flex-no-wrap flex py-3 md:hidden"
              >
                <strong class="w-1/4 pr-6 text-primary-darkest">{{
                  $t('products._slug.share')
                }}</strong>
                <div class="flex w-3/4 justify-end">
                  <SocialShare
                    class="mr-2 cursor-pointer"
                    network="facebook"
                    :url="pageMeta.url"
                    :title="pageMeta.title"
                    :description="pageMeta.description"
                  >
                    <BaseIcon icon="mdi:facebook" />
                  </SocialShare>

                  <SocialShare
                    class="mr-2 cursor-pointer"
                    network="twitter"
                    :url="pageMeta.url"
                    :title="pageMeta.title"
                    :description="pageMeta.description"
                  >
                    <BaseIcon icon="mdi:twitter" />
                  </SocialShare>

                  <SocialShare
                    class="mr-2 cursor-pointer"
                    network="pinterest"
                    :url="pageMeta.url"
                    :description="pageMeta.description"
                    :media="pageMeta.image"
                  >
                    <BaseIcon icon="mdi:pinterest" />
                  </SocialShare>

                  <SocialShare
                    class="cursor-pointer"
                    network="email"
                    :url="pageMeta.url"
                    :title="pageMeta.title"
                    :description="pageMeta.description"
                  >
                    <BaseIcon icon="mdi:envelope" />
                  </SocialShare>
                </div>
              </div>

              <!-- faq collapseable -->
              <template v-if="product">
                <div
                  v-if="product.content.expandableDetails"
                  class="my-8 md:hidden"
                >
                  <ProductFaq :details="product.content.expandableDetails" />
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="randomPreviousCustomers" class="container my-12">
      <p class="text-center text-sm uppercase text-primary-dark">
        brands that loved this product
      </p>

      <div
        class="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 md:mt-12 md:grid-cols-3 md:gap-x-12 md:gap-y-6 lg:flex lg:items-center lg:gap-x-15"
      >
        <div
          v-for="client in randomPreviousCustomers"
          :key="client.id"
          class="h-12"
        >
          <img
            class="h-full object-contain"
            :src="client.logoUrl"
            :alt="`${client.name} logo`"
          />
        </div>
      </div>
    </section>

    <section v-if="upsellProducts" class="container mb-12">
      <h2 class="mb-12">{{ $t('products._slug.upSell.title') }}</h2>
      <ProductPreviews
        :products="upsellProducts"
        :slider="true"
        :column-count="upsellProductCols"
      />
    </section>

    <section v-if="productReviews" class="container mb-12">
      <ProductReviews
        :reviews="productReviews"
        :slider="true"
        :column-count="3"
      />
    </section>

    <section v-if="randomPreviousCustomers" class="container my-12">
      <div
        class="space-y-4 bg-primary-light p-6 md:grid md:grid-cols-2 md:items-center md:gap-15 md:space-y-0 md:p-12 lg:p-15 xl:gap-18"
      >
        <h2
          class="mb-0 text-3xl font-semibold uppercase text-primary-darkest md:text-4xl lg:text-5xl xl:text-6xl"
        >
          Over <b class="font-black text-accent-default">100 000+</b> managed
          events & <b class="font-black text-accent-default">2.5M+</b> happy
          players!
        </h2>

        <div
          class="grid grid-cols-2 gap-x-4 gap-y-2 md:grid-cols-3 md:gap-x-12 md:gap-y-6 xl:gap-x-15 xl:gap-y-10"
        >
          <div
            v-for="client in randomBrandCustomers"
            :key="client.id"
            class="h-10 md:h-12"
          >
            <img
              class="h-full object-contain"
              :src="client.logoUrl"
              :alt="`${client.name} logo`"
            />
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script>
// Helpers
import { mapState } from 'vuex';
import { validationMixin } from 'vuelidate';
import { required } from 'vuelidate/lib/validators';
import get from 'lodash/get';

import ProductOptionLabel from '~/components/ProductOptionLabel.vue';
import BaseButton from '~/components/BaseButton.vue';
import ProductSliderPopup from '~/components/ProductSliderPopup.vue';
import ProductFaq from '~/components/ProductFaq.vue';

import pageMeta from '~/mixins/pageMeta';
import { listVisibleOptions } from '~/modules/swell/utils/listVisibleOptions';
import { getVariantOptionIds } from '~/modules/swell/utils/getVariantOptionIds';
import refetchCurrencyMixin from '~/modules/swell/mixins/refetchCurrency';
import { getInitialSelection } from '~/utils/purchaseOptions';

export default {
  name: 'ProductDetailPage',
  components: {
    ProductOptionLabel,
    BaseButton,
    ProductSliderPopup,
    ProductFaq,
  },
  mixins: [pageMeta, validationMixin, refetchCurrencyMixin],
  data() {
    return {
      product: {},
      quantity: 1,
      enableQuantity: true,
      maxQuantity: 99,
      relatedProducts: [],
      bundleItemsOptionState: null,
      bundleItemsAvailable: true,
      /**
       * Option state with initial values.
       * @type { { [id: string]: { name: string, value: string, isVisible: boolean } } }
       */
      optionState: {},
      selectedPurchaseOption: undefined,
      productBenefits: [],
      upsellProductCols: 4,
      enableSocialSharing: false,
      showStockLevel: false,
      activeDropdownUID: null,
      videoInfo: null,
      isPopupSliderOpen: false,
      activeSlide: -1,

      brandDetails: null,
      brandCustomers: null,
      previousCustomers: null,
      productReviews: null,
    };
  },
  async fetch() {
    const { $swell, $route } = this;
    // Fetch product
    const product = await $swell.products.get($route.params.slug, {
      expand: ['up_sells.product', 'cross_sells', 'categories'],
    });
    const options = product.purchaseOptions;
    if (options && options.subscription && options.subscription.plans) {
      options.subscription.plans = options.subscription.plans.filter(
        (item) => item && item.price >= 0,
      );
    }
    // Show 404 if product isn't found
    if (!product) {
      return this.$nuxt.error({
        statusCode: 404,
        message: this.$t('errors.productNotFound'),
      });
    }

    if (product.bundle && product.bundleItems?.length) {
      const bundleItemsOptionState = product.bundleItems.map((item) => {
        let optionState = [];
        if (item.options?.length) {
          optionState = item.options.reduce((options, { name, value }) => {
            options.push({ name, value });
            return options;
          }, []);
        } else {
          optionState = item.product.options.reduce(
            (options, { name, values, inputType }) => {
              // Set first available value for select current option
              let defaultValue = null;
              if (!inputType || inputType === 'select') {
                defaultValue = get(values, '0.name');
              }
              options.push({ name, value: defaultValue });
              return options;
            },
            [],
          );
        }
        return {
          id: item.id,
          productId: item.productId,
          options: optionState,
        };
      });
      this.bundleItemsOptionState = bundleItemsOptionState;
    }
    // TODO generate related products
    const relatedProducts = [];
    let maxQuantity = get(product, 'content.maxQuantity');
    maxQuantity = !maxQuantity
      ? 99
      : typeof maxQuantity === 'string'
      ? Number(maxQuantity)
      : 99;
    maxQuantity = !isNaN(maxQuantity) ? maxQuantity : 99;
    this.selectedPurchaseOption = getInitialSelection(product.purchaseOptions);
    // Set component data
    this.product = product;

    this.getInitialOptions(product);
    this.relatedProducts = relatedProducts;
    this.productBenefits = get(product, 'content.productBenefits', []);
    this.enableSocialSharing = get(product, 'content.enableSocialSharing');
    this.showStockLevel = get(product, 'content.showStockLevel');
    this.enableQuantity = get(product, 'content.enableQuantity');
    this.upsellProductCols = get(product, 'content.upSellCols') || 4;
    this.maxQuantity = maxQuantity;

    //* brandDetails

    if (
      this.product.content.brandDetails &&
      this.product.content.brandDetails.length > 0
    ) {
      this.brandDetails = this.product.content.brandDetails[0];
    }

    //* previousCustomer

    if (
      this.product.content.previousCustomers &&
      this.product.content.previousCustomers.length > 0
    ) {
      this.previousCustomers = this.product.content.previousCustomers;
    }

    //* brandCustomers

    if (
      this.product.content.brandCustomers &&
      this.product.content.brandCustomers.length > 0
    ) {
      this.brandCustomers = this.product.content.brandCustomers;
    }

    //* productReviews
    if (
      this.product.content.productReviews &&
      this.product.content.productReviews.length > 0
    ) {
      this.productReviews = this.product.content.productReviews;
    }
  },
  computed: {
    ...mapState(['cartIsUpdating', 'headerIsVisible', 'currency']),
    // Resulting combination of selected product options
    variation() {
      if (!this.product) return {};
      return this.$swell.products.variation(
        this.product,
        this.selectedOptions,
        this.selectedPurchaseOption,
      );
    },
    variationCurrency() {
      if (!this.variation) return this.product.currency;
      const id = this.variation.variantId;
      const activeVariant = this.variation.variants?.results.find(
        (variant) => variant.id === id,
      );
      return (
        (activeVariant && activeVariant.currency) || this.variation.currency
      );
    },
    activeVariantOptionIds() {
      return getVariantOptionIds(this.product?.variants?.results);
    },
    bundleItems() {
      if (!this.product.bundle && !this.product.bundleItems?.length)
        return null;
      return this.product.bundleItems;
    },
    available() {
      const { stockStatus, stockTracking, stockPurchasable } = this.variation;
      if (
        !this.bundleItemsAvailable ||
        this.variation.price < 0 ||
        this.variationCurrency !== this.currency
      )
        return false;
      return (
        (stockStatus && stockStatus !== 'out_of_stock') ||
        !stockTracking ||
        stockPurchasable
      );
    },

    productThumbnail() {
      const thumbnailImage = this.product.images[0];

      if (!thumbnailImage) return null;

      return thumbnailImage;
    },

    productVideo() {
      return this.videoInfo ? this.videoInfo : null;
    },

    productImages() {
      /**
       * @constant
       * @type {{}[] | []}
       */

      if (!this.product.images || this.product.images.length === 0) {
        return null;
      }

      const sliced = this.product.images.slice(1);

      return sliced;
    },

    mediaFilesColumns() {
      return Number(Boolean(this.productVideo)) + this.productImages.length + 1;
    },

    // generate media object with thumbnailImage and otherMedia
    productMedia() {
      if (!this.product?.images?.length && !this.product?.content.youtubeUrl)
        return null;

      const [thumbnailImage, ...otherImages] = this.product.images;

      if (!thumbnailImage) return null;
      const media = {
        thumbnailImage,
        videoInfo: null,
        images: [],
      };

      if (this.videoInfo) {
        media.videoInfo = this.videoInfo;
      }

      media.images.push(...otherImages);
      return media;
    },

    expandableDetailsInOrder() {
      const details = this.product?.content?.expandableDetails;

      if (!details) {
        return null;
      }

      const detailsWithPosition = [];
      const detailsWithoutPosition = [];

      details.forEach((d) => {
        if (d?.position) {
          detailsWithPosition.push(d);
        } else {
          detailsWithoutPosition.push(d);
        }
      });
      detailsWithPosition.sort((a, b) => a.position - b.position);

      return [...detailsWithPosition, ...detailsWithoutPosition];
    },

    productCategory() {
      const categories = this.product?.categories;

      if (!categories || !categories.length) {
        return null;
      }

      const [first] = categories;

      return {
        slug: first.slug,
        name: first.name,
      };
    },

    billingInterval() {
      return get(this, 'selectedOptions.Plan');
    },
    intervalData() {
      if (
        !this.selectedPurchaseOption ||
        this.selectedPurchaseOption.type !== 'subscription'
      ) {
        return;
      }
      // Placeholder until swell-js provides interval data inside variation()
      const currentPlan = this.product.purchaseOptions.subscription.plans.find(
        (plan) => plan.id === this.selectedPurchaseOption.plan,
      );
      const { interval, intervalCount } = currentPlan.billingSchedule;
      return { interval, intervalCount };
    },
    intervalCount() {
      if (!this.intervalData) return;
      const { intervalCount } = this.intervalData;
      return intervalCount > 1 ? intervalCount : '';
    },
    subscriptionInterval() {
      if (!this.intervalData) return;
      return this.$t(
        `products._slug.purchaseOptions.interval.${this.intervalData.interval}.short`,
      );
    },
    /**
     * Formatted optionState in a swell-js-compatible structure
     * @type { { [name: string]: string } }
     */
    selectedOptions() {
      return this.normalizeOptions(this.optionState);
    },
    upsellProducts() {
      if (!this.product?.upSells?.length) return null;
      return this.product.upSells.map((upsell) => upsell.product);
    },
    optionInputs() {
      const options = get(this, 'product.options', []);
      const hasSingleSelectOption =
        options.length === 1 && options[0].inputType === 'select';
      return options.reduce((optionInputs, option) => {
        let componentName;
        switch (option.inputType) {
          case 'short_text':
            if (option.attributeId === 'event_date') {
              componentName = 'DateTimePicker';
            } else {
              componentName = 'Text';
            }
            break;
          case 'long_text':
            componentName = 'Text';
            break;
          case 'toggle':
            componentName = 'Checkbox';
            break;
          default:
            componentName = 'Select';
        }
        // Don't include subscription plan if there's only one option value available
        if (option.subscription && option.values.length < 2)
          return optionInputs;
        // If this is the only singular option, only show values that will result in an active variant
        if (hasSingleSelectOption) {
          const activeValues = option.values.filter((value) =>
            this.activeVariantOptionIds.has(value.id),
          );
          option.values = activeValues;
        }
        optionInputs.push({
          option,
          component: () =>
            import(`../../components/ProductOption${componentName}.vue`),
        });
        return optionInputs;
      }, []);
    },

    // random previous clients
    randomPreviousCustomers() {
      if (!this.previousCustomers || this.previousCustomers.length < 3) {
        return null;
      }

      const customers = this.previousCustomers;

      const uniqueNames = [];

      const unique = customers.filter((customer) => {
        const isDuplicate = uniqueNames.includes(customer.name);

        if (!isDuplicate) {
          uniqueNames.push(customer.name);

          return true;
        }

        return false;
      });

      // random array
      const random = unique.sort(() => 0.5 - Math.random()).slice(0, 6);

      return random;
    },

    // random previous clients
    randomBrandCustomers() {
      if (!this.brandCustomers) {
        return null;
      }

      const customers = this.previousCustomers;

      const uniqueNames = [];

      const unique = customers.filter((customer) => {
        const isDuplicate = uniqueNames.includes(customer.name);

        if (!isDuplicate) {
          uniqueNames.push(customer.name);

          return true;
        }

        return false;
      });

      // random array
      const random = unique.sort(() => 0.5 - Math.random()).slice(0, 6);

      return random;
    },
  },
  watch: {
    currency: '$fetch',
    // Reset quantity on change of purchase option
    selectedPurchaseOption() {
      this.quantity = 1;
    },
    variation(newVariation) {
      this.exposeProduct(newVariation);
    },
    product(newProduct) {
      if (newProduct.content?.youtubeUrl) {
        this.generateVideoInfo();
      }
    },
  },
  mounted() {
    // Check bundle item availability on mount
    this.checkBundleItemAvailability();
  },
  methods: {
    // Select attribute component based on type
    getAttributeComponent(type) {
      switch (type) {
        case 'long_text':
        case 'textarea':
          return 'AttributeLongText';
        case 'file':
          return 'AttributeFile';
        case 'image':
          return 'AttributeImage';
        case 'currency':
          return 'AttributeCurrency';
        // TODO: add components for other supported attribute types
        default:
          return 'AttributeShortText';
      }
    },
    // Set which dropdown is active by UID, so that only one dropdown is active at any time.
    setActiveDropdownUID(uid) {
      this.activeDropdownUID = uid;
    },
    // Add product to cart with selected options
    async addToCart() {
      try {
        // Touch and validate all fields
        this.$v.$touch();
        if (this.$v.$invalid) return; // return if invalid
        // Validate bundle item fields if they exist
        if (this.bundleItems && this.$refs.bundleItem?.length) {
          this.$refs.bundleItem.forEach(({ $v }) => $v.$touch());
          const bundleItemsValid = this.$refs.bundleItem.every(
            ({ $v }) => !$v.$invalid,
          );
          // If on smaller device, expand accordion if validation fails
          const accordion = this.$refs.bundleItemAccordion;
          if (accordion && !accordion.isExpanded) {
            accordion.toggleExpanded();
          }
          if (!bundleItemsValid) return;
          await this.$store.dispatch('addCartItem', {
            productId: this.variation.id,
            quantity: this.quantity || 1,
            options: this.selectedOptions,
            purchaseOption: this.selectedPurchaseOption,
            bundleItems: this.bundleItemsOptionState,
          });
        } else {
          await this.$store.dispatch('addCartItem', {
            productId: this.variation.id,
            quantity: this.quantity || 1,
            options: this.selectedOptions,
            purchaseOption: this.selectedPurchaseOption,
          });
        }
      } catch (err) {
        if (err.message === 'invalid_stock') {
          this.$store.dispatch('showNotification', {
            message: this.$t('cart.exceedsStockLevel'),
            type: 'error',
          });
        }
      }
    },
    // Update an option value based on user input
    setOptionValue({ optionId, option: name, value }) {
      // Get the option from optionState whose value is being updated.
      const option = this.optionState[optionId] || {};
      // Update its properties based on input
      const updatedOption = { ...option, name, value };
      // Create a copy of optionState with this option updated
      const optionState = { ...this.optionState, [optionId]: updatedOption };
      const productOptions = this.product.options || [];
      const visibleOptions = listVisibleOptions(
        productOptions,
        this.normalizeOptions(optionState, false),
      ).map(({ id }) => id);
      // Update optionState with the updated option and recalculated visibility properties
      this.optionState = this.markVisibleOptions(optionState, visibleOptions);
    },
    // Update a bundle item's option value based on user input
    setBundleItemOptionValue({ option, value, productId }) {
      if (!this.bundleItemsOptionState) return null;
      const bundleItemOptionState = [...this.bundleItemsOptionState];
      const itemIndex = bundleItemOptionState.findIndex(
        (item) => item.productId === productId,
      );
      const optionIndex = bundleItemOptionState[itemIndex].options.findIndex(
        (opt) => opt.name === option,
      );
      bundleItemOptionState[itemIndex].options[optionIndex].value = value;
      this.bundleItemsOptionState = bundleItemOptionState;
    },
    checkBundleItemAvailability() {
      if (this.bundleItems && this.$refs.bundleItem) {
        this.bundleItemsAvailable = this.$refs.bundleItem.every(
          (item) => item.available,
        );
        return;
      }
      this.bundleItemsAvailable = true;
    },
    // Go back to previous page
    navigateBack() {
      this.$router.back();
    },
    getInitialOptions(product) {
      if (!product) return;
      const productOptions = product.options || [];
      /**
       * Option state with initial values for selects.
       * @type { { [id: string]: { name: string, value: string, isVisible: boolean } } }
       */
      const optionState = productOptions.reduce(
        (optionsAcc, { id, name, required, values, inputType }) => {
          const option = { name, required, isVisible: false };
          if (!inputType || inputType === 'select') {
            const isSingleSelectOption = productOptions.length === 1;
            // If this is the only select option, only include values that result in an active variant
            if (isSingleSelectOption) {
              const activeValues = values.filter((value) =>
                this.activeVariantOptionIds.has(value.id),
              );
              optionsAcc[id] = { ...option, value: activeValues[0].name };
            } else {
              // Use first available value as the default value for selects
              optionsAcc[id] = { ...option, value: values[0].name };
            }
          } else {
            optionsAcc[id] = option;
          }
          return optionsAcc;
        },
        {},
      );
      /**
       * Normalized optionState in a swell-js-compatible structure
       * @type { { [name: string]: string } }
       */
      const initialSelection = this.normalizeOptions(optionState, false);
      const visibleOptions = listVisibleOptions(
        productOptions,
        initialSelection,
      ).map(({ id }) => id);
      // Mark visible options as such
      this.optionState = this.markVisibleOptions(optionState, visibleOptions);
    },
    normalizeOptions(optionState, checkVisibility = true) {
      return Object.values(optionState).reduce(
        (acc, { name, value, isVisible }) => {
          if (!checkVisibility || (checkVisibility && isVisible)) {
            if (name && value) acc[name] = value;
          }
          return acc;
        },
        {},
      );
    },
    markVisibleOptions(optionState, visibleOptions) {
      Object.keys(optionState).forEach((key) => {
        if (visibleOptions.includes(key)) {
          optionState[key].isVisible = true;
        } else {
          optionState[key].isVisible = false;
        }
      });
      return optionState;
    },
    // Make product data available on the Window object,
    // so that it can be consumed by 3rd party plugins
    exposeProduct(variation) {
      if (!window) return;
      const existingData = window.Swell;
      /**
       * @type {{ version?: string, theme: { page: { product: { id: string, variation: { id: string, stock: { level: number | undefined, purchasable: boolean, status: string | null, tracking: boolean }}}}}}}
       */
      const swellData = {
        ...existingData,
        theme: {
          ...existingData?.theme,
          page: {
            ...existingData?.theme?.page,
            product: {
              id: this.product.id,
              variation: {
                id: this.variation.variantId || this.variation.id,
                stock: {
                  status: this.variation.stockStatus,
                  purchasable: this.variation.stockPurchasable,
                  tracking: this.variation.stockTracking,
                  level: this.variation.stockLevel,
                },
              },
            },
          },
        },
      };
      window.Swell = swellData;
      const event = new CustomEvent('variation-change', { detail: variation });
      window.dispatchEvent(event);
    },
    // is given image is thumbnail
    isThumbnail(img) {
      return img?.file?.url.toLowerCase().includes('thumbnail');
    },
    generateVideoInfo() {
      const youtubeUrl = this?.product?.content?.youtubeUrl;
      if (!youtubeUrl) {
        return;
      }
      const videoInfo = {
        id: 'youtube_url',
        videoUrl: youtubeUrl,
        videoId: '',
        thumbnailUrl: '',
        isVideo: true,
      };

      const youtubeVideoId = youtubeUrl.split('/').pop();
      if (youtubeVideoId) {
        videoInfo.thumbnailUrl = `//img.youtube.com/vi/${youtubeVideoId}/0.jpg`;
        videoInfo.videoId = youtubeVideoId;
      }
      this.videoInfo = videoInfo;
    },
    /**
     *
     * @param {number} num active slide number, -1 - first slide
     */
    openSliderWithActiveSlide(num) {
      this.activeSlide = num;
      this.handleTogglePopupSlider();
    },

    handleTogglePopupSlider() {
      if (!this.isPopupSliderOpen) {
        document.querySelector('body').classList.add('overflow-y-hidden');
      } else {
        document.querySelector('body').classList.remove('overflow-y-hidden');
      }
      this.isPopupSliderOpen = !this.isPopupSliderOpen;
    },
    popupCalendly() {
      // eslint-disable-next-line no-undef
      Calendly.initPopupWidget({
        url: 'https://calendly.com/cirqus/20min',
      });
    },
  },
  validations() {
    const fields = Object.values(this.optionState).reduce((acc, option) => {
      if (option.isVisible && option.required) {
        acc[option.name] = { required };
      }
      return acc;
    }, {});
    return {
      selectedOptions: fields,
    };
  },
};
</script>
