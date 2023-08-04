<template>
  <div>
    <ProductOptionLabel v-bind="option" />

    <input
      :value="finalDateStr"
      class="text-input bg-primary-lightest font-normal"
      placeholder="Choose your date and time"
      @click="toggleOpenModal"
      @input="emitValue"
    />

    <template v-if="validation">
      <div
        v-if="validation.$dirty && validation.$error"
        class="mt-2 text-error-default"
      >
        <span v-if="!validation.required" class="label-sm text-error-default">{{
          $t('products._slug.options.required')
        }}</span>
      </div>
    </template>

    <transition v-if="isOpenModal" name="popup" :duration="700" appear>
      <div class="fixed inset-0 z-100">
        <div
          class="overlay absolute h-full w-full cursor-pointer bg-primary-darker opacity-50"
          @click.self="toggleOpenModal"
        ></div>

        <div
          class="panel h-vh-gap md:center-xy absolute bottom-0 z-100 w-full overflow-y-auto rounded-t bg-primary-lighter p-3 md:relative md:mt-8 md:h-auto md:max-h-80vh md:w-160 md:rounded md:p-6"
        >
          <button
            class="aspect-square absolute top-4 right-4 inline-flex items-center justify-center rounded p-3 leading-none hover:bg-error-default hover:text-primary-lightest focus:bg-error-default focus:text-primary-lightest"
            @click="toggleOpenModal"
          >
            X
          </button>

          <header class="modal-header">
            <h3 class="mr-8 text-xl font-bold">
              Choose timezone, date, and time for your event
            </h3>

            <div class="my-4 flex flex-wrap items-start justify-between gap-3">
              <div class="w-max">
                <p>
                  <b>Timezone</b>
                </p>

                <select
                  v-model="selectedTimezone"
                  class="timezone-select mt-3 block w-full max-w-[35ch] cursor-pointer rounded-lg border border-primary-dark bg-primary-lighter p-2 text-sm text-primary-darkest focus:border-outline focus:ring-outline"
                  role="listbox"
                >
                  <option
                    v-for="timezone in timezonesList"
                    :key="timezone.text"
                    role="option"
                    class=""
                    :value="timezone.text"
                  >
                    {{ timezone.text }}
                  </option>
                </select>
              </div>
              <div class="w-max">
                <p>
                  <b>Duration</b>
                  <span class="mt-3 block">
                    {{ durationInMinutes }} minutes
                  </span>
                </p>
              </div>
            </div>
          </header>

          <!-- modal-body -->
          <div
            class="modal-body grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] grid-rows-[1fr] gap-4"
          >
            <div class="">
              <DatePicker
                v-model="date"
                type="date"
                :default-value="defaultValue"
                :disabled-date="disableDates"
                inline
                value-type="format"
              ></DatePicker>
              <!-- value-type="timestamp" -->
              <!-- value-type="format" -->
              <!-- :show-second="false" -->
              <!-- type="datetime" -->
              <!-- :time-picker-options="{
                  start: '00:00',
                  step: '00:30',
                  end: '23:30',
                }" -->
            </div>

            <div class="">
              <p class="text-center text-lg font-bold">
                {{ onlyDateFormatted }}
              </p>

              <ul
                class="timeslot-list mt-2 grid max-h-64 gap-2 overflow-y-auto"
              >
                <li
                  v-for="timeslot in timeSlots"
                  :key="timeslot.timeStr"
                  class="pr-2"
                >
                  <button
                    class="border-gray-300 hover:bg-gray-100 focus:bg-gray-100 flex w-full items-center justify-center rounded border py-3 px-6"
                    :class="{
                      'timeslot-active bg-accent-default !text-primary-lightest hover:text-primary-lightest':
                        selectedTimeslot === timeslot,
                    }"
                    @click="selectedTimeslot = timeslot"
                  >
                    <b>{{ timeslot }}</b
                    >,
                    {{ selectedTimezoneInfo.abbr }}
                    <!-- {{
										selectedTimezone.name ? `${selectedTimezone.name},` : ''
									}}
									{{ selectedTimezone.town }} -->
                    <!-- {{ selectedTimezone.text }} -->
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div class="modal-footer mt-6">
            <BaseButton
              appearance="dark"
              :label="'Add date'"
              :disabled="isDisabledAddDate"
              @click.native="handleAddDate"
            />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import DatePicker from 'vue2-datepicker';
// import '~/assets/css/datepicker.css';

import timezonesJSON from '~/utils/timezones.json';
import { dateTimeFormatter } from '~/utils/formatters';
import { dayjs } from '~/utils/dayjs';

const MINUTES_IN_DAY = 24 * 60;
const MIN_HOURS = 48;
const MAX_DAYS = 180;

export default {
  name: 'OptionDateTimePicker',

  components: {
    DatePicker,
  },

  props: {
    option: {
      type: Object,
      default: () => ({}),
    },
    emitOnEnter: {
      type: Boolean,
      default: false,
    },
    validation: {
      type: Object,
      default: null,
    },
    currentValue: {
      type: String,
      default: '',
    },
    durationInMinutes: {
      type: Number,
      default: 60,
    },
    eventsInterval: {
      type: Number,
      default: 30,
    },
  },

  data() {
    return {
      locale: '',

      isOpenModal: false,

      timezonesList: timezonesJSON,
      selectedTimezone: timezonesJSON[0].text,

      slotArr: [], // all timeSlots available
      selectedTimeslot: '', // selected timeslot

      defaultValue: dayjs()
        .add(MIN_HOURS, 'hours')
        .tz(this.detectUserTimezoneId())
        .format('YYYY-MM-DD'), // default date value at least 48 hours from now
      date: null, // date
      finalDateStr: '',
    };
  },

  computed: {
    disableDates() {
      const tzId = this.selectedTimezoneInfo.utc;

      const afterTomorrow = dayjs(this.defaultValue)
        .set('hours', 0)
        .set('minutes', 0)
        .set('millisecond', 0)

        .tz(tzId)
        .valueOf();

      const maxDay = dayjs(this.defaultValue)
        .set('hours', 0)
        .set('minutes', 0)
        .set('millisecond', 0)
        .add(MAX_DAYS, 'day')
        .tz(tzId)
        .valueOf();

      return (date) => {
        return date < afterTomorrow || date > maxDay;
      };
    },

    onlyDateFormatted() {
      if (!this.date || !process.client) return;

      return dateTimeFormatter({
        date: new Date(this.date),
        locale: this.locale,
        options: {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: undefined,
          minute: undefined,
          hour: undefined,
        },
      });
    },

    selectedTimezoneInfo() {
      if (!this.timezonesList || this.timezonesList.length === 0) {
        return;
      }

      const foundTz = this.timezonesList.find(
        (tz) => tz.text === this.selectedTimezone,
      );

      const [utcStr] = foundTz.text.split(' ');

      const utcOnlyStr = utcStr.slice(1, utcStr.length - 1);

      const abbr = foundTz?.abbr;

      return {
        utcOnlyStr,
        abbr,
        utc: foundTz.utc[0],
      };
    },

    selectedTimezoneUtcOnlyStr() {
      return this.selectedTimezoneInfo.utcOnlyStr;
    },

    selectedTimezoneAbbr() {
      return this.selectedTimezoneInfo.abbr;
    },

    selectedTimezoneUtcId() {
      return this.selectedTimezoneInfo.utc;
    },

    timeSlots() {
      //* if selected day is same as default day (2 days from now), then filter slotArr

      const dTimeslots = dayjs(this.date).tz(this.selectedTimezoneUtcId);

      const dDefaultValueTimeslots = dayjs(this.defaultValue).tz(
        this.selectedTimezoneUtcId,
      );

      if (dTimeslots.isSame(dDefaultValueTimeslots, 'day')) {
        const d = dayjs().tz(this.selectedTimezoneUtcId);

        const hours = d.get('hour');
        const minutes = d.get('minute');

        const minutesPassed = hours * 60 + minutes;

        const filteredSlots = this.slotArr
          .filter((item) => {
            return item.minutesStart > minutesPassed;
          })
          .map((s) => s.timeStr);

        return filteredSlots;
      }

      return this.slotArr.map((s) => s.timeStr);
    },

    isDisabledAddDate() {
      return !this.date || !this.selectedTimezone || !this.selectedTimeslot;
    },
  },

  watch: {
    date(newVal, oldVal) {
      if (newVal && newVal !== oldVal) {
        this.resetSelectedTimeslot();
      }
    },

    defaultValue(newVal, oldVal) {},

    isOpenModal(newVal) {
      if (newVal) {
        /* const cells = document.querySelectorAll(
          '.cell:not(.active, .disabled)',
        ); */
        /* this.$nextTick(() => {
          const cells = document.querySelectorAll('.cell');
          console.log('cells: ', cells);

          cells.forEach((cell) => {
            cell.classList.add('disabled');

            cell.removeEventListener('click', () => {}, true);
          });
          // cells.forEach();
        }); */
      }
    },

    selectedTimezone: 'updateDefaultValue',
  },

  mounted() {
    this.handleInitialLocale();
    this.handleInitialTimezone();
    this.handleInitialDatePicker();
    this.handleInitialeTimeslots();
  },

  methods: {
    updateDefaultValue() {
      const tzId = this.selectedTimezoneInfo.utc;
      const newDefaultValue = dayjs()
        .add(MIN_HOURS, 'hours')
        .tz(tzId)
        .utc(true)
        .format('YYYY-MM-DD');

      this.defaultValue = newDefaultValue;
      this.date = newDefaultValue;

      this.resetSelectedTimeslot();
    },

    resetSelectedTimeslot() {
      this.selectedTimeslot = '';
    },

    toggleOpenModal() {
      if (!this.isOpenModal) {
        document.querySelector('body').classList.add('overflow-y-hidden');
      } else {
        document.querySelector('body').classList.remove('overflow-y-hidden');
      }

      this.isOpenModal = !this.isOpenModal;
    },

    detectUserTimezoneId() {
      try {
        const tzid = Intl.DateTimeFormat().resolvedOptions().timeZone;

        return tzid;
      } catch (error) {
        return null;
      }
    },

    /**
     *
     * @param {string} id unique id for timezone
     */
    findTimezoneOnTzId(id) {
      if (!id) return;

      const foundTz = timezonesJSON.find((tz) => tz.utc.includes(id));

      return foundTz;
    },

    handleInitialTimezone() {
      const id = this.detectUserTimezoneId();
      this.tzId = id;

      const tz = this.findTimezoneOnTzId(id);

      this.selectedTimezone = tz.text;
    },

    handleInitialDatePicker() {
      this.date = this.defaultValue;
    },

    handleInitialLocale() {
      this.locale = window.navigator.language;
    },

    handleInitialeTimeslots() {
      this.slotArr = this.generateTimeslots(this.eventsInterval, 0);
    },

    /**
     * @param {number} minutes
     */
    formatMinutes(minutes) {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;

      let hours = '';

      if (h >= 10 && h <= 23) {
        hours = h;
      }

      if (h < 10) {
        hours = `0${h}`;
      }

      if (h > 23) {
        hours = `00`;
      }

      return `${hours}:${m < 10 ? '0' + m : m}`;
    },

    /**
     * @param {string} interval - duration of the event, in minutes.
     * @param {string} bufferTime - time interval between event, in minutes
     * @returns {{minutesStart: number, minutesEnd: number, timeStr: string}[] }
     */
    generateTimeslots(interval, bufferTime) {
      /**
       * @constant
       * @type {{minutesStart: number, minutesEnd: number, timeStr: string}[] | []}
       */
      const slotArray = [];

      const slotsToCreate = Math.floor(
        MINUTES_IN_DAY / (interval + bufferTime),
      );

      for (let i = 0; i < slotsToCreate; i++) {
        const minutesStart = (interval + bufferTime) * i;
        const minutesEnd = minutesStart + this.durationInMinutes;

        const slotObj = {
          minutesStart: 0,
          minutesEnd: 0,
          timeStr: '',
        };

        slotObj.minutesStart = minutesStart;
        slotObj.minutesEnd = minutesEnd;
        slotObj.timeStr = `${this.formatMinutes(
          minutesStart,
        )} - ${this.formatMinutes(minutesEnd)}`;
        slotArray.push(slotObj);
      }
      return slotArray;
    },

    formatFinalDateStr() {
      const d = dateTimeFormatter({
        date: dayjs(this.date).toDate(),
        locale: this.locale,
        options: {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: undefined,
          minute: undefined,
        },
      });

      const finalStr = `${d}, ${this.selectedTimeslot}, ${this.selectedTimezoneInfo.utcOnlyStr}, ${this.selectedTimezoneInfo.abbr}`;

      return finalStr;
    },

    emitValue(event) {
      const { value } = event.target;
      if (this.emitOnEnter) {
        this.internalValue = value;
      } else {
        this.$emit('value-changed', {
          option: this.option.name,
          value,
        });
      }
    },

    handleAddDate() {
      if (this.isDisabledAddDate) {
        return;
      }

      this.finalDateStr = this.formatFinalDateStr();

      this.toggleOpenModal();
    },
  },
};
</script>

<style lang="postcss" scoped>
.text-input {
  @apply w-full rounded border border-primary-med p-4 text-sm;

  &:focus {
    @apply shadow-outline;
  }
}

.panel {
  .mx-datepicker {
    .cell.active {
      @apply !bg-accent-default;
    }

    .mx-btn:hover {
      @apply !border-accent-default !text-accent-default;
    }
  }
}
</style>
