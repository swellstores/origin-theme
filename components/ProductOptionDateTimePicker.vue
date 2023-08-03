<template>
  <div>
    <ProductOptionLabel v-bind="option" />

    <input
      v-model="finalDateStr"
      class="text-input bg-primary-lightest font-normal"
      placeholder="Choose your date and time"
      @click="toggleOpenModal"
    />

    <!-- </button> -->

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

            <div class="my-4 flex items-start justify-between">
              <div>
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
                    :key="
                      timezone.text +
                      timezone.value +
                      timezone.abbr +
                      timezone.offset
                    "
                    role="option"
                    class=""
                    :value="timezone.text"
                  >
                    {{ timezone.text }}
                  </option>
                </select>
              </div>
              <div>
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
              ></DatePicker>
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
                      'bg-accent-default !text-primary-lightest hover:text-primary-lightest':
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
// console.log('timezonesJSON: ', timezonesJSON);
const MINUTES_IN_DAY = 24 * 60;
const MIN_HOURS = 48;
const MAX_DAYS = 180;
// const timezonesList = timezonesJSON.map((tz) => tz.text)

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
      // MINUTES_IN_DAY: 24 * 60,
      // MAX_DAYS: 180,

      locale: '',

      isOpenModal: false,

      timezonesList: timezonesJSON,
      selectedTimezone: timezonesJSON[0].text,

      slotArr: [], // all timeSlots available
      selectedTimeslot: '', // selected timeslot

      defaultValue: new Date(Date.now() + MIN_HOURS * 60 * 60 * 1000), // default date value at least 48 hours from now
      date: null, // date
      finalDateStr: '',
    };
  },

  computed: {
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
      // console.log('foundTz: ', foundTz);

      const [utc] = foundTz.text.split(' ');

      const utcOnly = utc.slice(1, utc.length - 1);

      const abbr = foundTz?.abbr;
      // console.log('abbr: ', abbr);

      return {
        utcOnly,
        abbr,
      };
    },

    timeSlots() {
      return this.slotArr.map((s) => s.timeStr);
    },

    isDisabledAddDate() {
      return !this.date || !this.selectedTimezone || !this.selectedTimeslot;
    },
  },

  watch: {
    date() {
      console.log('date', this.date);
    },

    selectedTimezone() {
      console.log('selectedTimezone: ', this.selectedTimezone);
    },
  },

  mounted() {
    this.handleInitialeTimeslots();
    this.handleInitialLocale();
    this.handleInitialTimezone();
    this.handleInitialDatePicker();
  },

  methods: {
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
        // console.log('tzid: ', tzid);
        // console.log(tzid);

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

      const tz = this.findTimezoneOnTzId(id);

      this.selectedTimezone = tz.text;
    },

    /**
     * disable date before 2 days from now and not
     * @param {date} Date
     */
    disableDates(date) {
      return (
        date < new Date(this.defaultValue.getTime() - 24 * 60 * 60 * 1000) ||
        date >
          new Date(this.defaultValue.getTime() + MAX_DAYS * 24 * 60 * 60 * 1000)
      );
    },

    handleInitialDatePicker() {
      /**
       * @constant
       * @type Date
       */
      /*
       this.date = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
      ).getTime(); */
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

      return `${h < 10 ? '0' + h : h}:${m < 10 ? '0' + m : m}`;
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
        // slotObj[minutes] = formatMinutes(minutes);
        slotObj.minutes = minutesStart;
        slotObj.timeStr = `${this.formatMinutes(
          minutesStart,
        )} - ${this.formatMinutes(minutesEnd)}`;
        slotArray.push(slotObj);
      }
      return slotArray;
    },

    formatFinalDateStr() {
      const d = dateTimeFormatter({
        date: this.date,
        locale: this.locale,
        options: {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: undefined,
          minute: undefined,
        },
      });

      const finalStr = `${d}, ${this.selectedTimeslot}, ${this.selectedTimezoneInfo.utcOnly}, ${this.selectedTimezoneInfo.abbr}`;
      // console.log('finalStr: ', finalStr);

      return finalStr;
    },

    handleAddDate() {
      console.log('click add date');
      if (this.isDisabledAddDate) {
        console.log('disabled');
        return;
      }

      this.finalDateStr = this.formatFinalDateStr();

      this.toggleOpenModal();
      // console.log('close modal');
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
