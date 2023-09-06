<template>
  <div>
    <ProductOptionLabel v-bind="option" />

    <div class="relative">
      <input
        :value="finalDateStr"
        class="text-input bg-primary-lightest !pl-10 font-normal"
        placeholder="Choose your date and time"
        @click="toggleOpenModal"
        @input="emitValue"
      />

      <BaseIcon
        class="center-y absolute left-3"
        icon="fa-solid:calendar"
        size="w-3 h-4"
      />
    </div>

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
            class="aspect-square group absolute top-2 right-2 inline-flex items-center justify-center rounded p-3 leading-none hover:bg-error-default focus:bg-error-default focus:text-primary-lightest md:top-4 md:right-4"
            @click="toggleOpenModal"
          >
            <BaseIcon
              class="fill-primary-darkest text-primary-darkest group-hover:text-primary-lightest group-focus:text-primary-lightest"
              icon="uil:times"
            />
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
                  class="timezone-select mt-3 block w-full max-w-[35ch] cursor-pointer rounded-lg border border-primary-dark bg-primary-lighter p-2 text-sm text-primary-darkest focus:border-outline focus:ring-outline md:text-base"
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
          <div>
            <div
              class="modal-body mt-3 grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] grid-rows-[1fr] gap-4"
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
              </div>

              <div class="">
                <p class="text-center text-lg font-bold">
                  {{ onlyDateFormatted }}
                </p>

                <ul
                  class="timeslot-list mt-2 grid max-h-68 gap-2 overflow-y-auto"
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
                      <b>{{ timeslot }}</b>
                      &nbsp;({{ selectedTimezoneInfo.abbr }})
                    </button>
                  </li>
                </ul>
              </div>
            </div>
            <div class="checkbox my-4 flex justify-start">
              <input
                id="decide-later"
                v-model="isDecideLater"
                type="checkbox"
              />

              <label class="" for="decide-later">
                <div class="indicator mr-2 text-primary-lighter">
                  <BaseIcon icon="uil:check" size="sm" />
                </div>
                <p class="text-sm">or you can decide the date later</p>
              </label>
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

import timezonesJSON from '~/utils/timezones.json';
import { dateTimeFormatter } from '~/utils/formatters';
import { dayjs } from '~/utils/dayjs';

const MINUTES_IN_DAY = 24 * 60;
const MIN_HOURS = 48;
const MAX_DAYS = 180;
const START_TIME = '9:00 AM';

const DECIDE_LATER_STR = 'TBD';

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

      isDecideLater: false,
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
      // return !this.date || !this.selectedTimezone || !this.selectedTimeslot;
      if (this.isDecideLater) {
        return false;
      }

      return !this.date || !this.selectedTimezone || !this.selectedTimeslot;
    },
  },

  watch: {
    date(newVal, oldVal) {
      if (newVal && newVal !== oldVal) {
        this.resetSelectedTimeslot();
        this.isDecideLater = false;
      }
    },

    finalDateStr(newVal, oldVal) {
      if (newVal && newVal !== oldVal) {
        this.$emit('value-changed', {
          option: this.option.name,
          value: this.finalDateStr,
        });
      }
    },

    isDecideLater: {
      handler(newVal, oldVal) {
        if (newVal && newVal !== oldVal) {
          this.resetSelectedTimeslot();
          this.date = null;
          this.finalDateStr = DECIDE_LATER_STR;
        }
      },
      immediate: true,
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
      this.slotArr = this.generateTimeslots(this.eventsInterval, 0, START_TIME);
    },

    /**
     * @param {number} minutes
     */
    formatMinutesToTime(minutes) {
      const hoursTotal = Math.floor(minutes / 60);
      const m = minutes % 60;

      let h = 0;

      if (hoursTotal < 13) {
        h = hoursTotal;
      } else {
        h = hoursTotal - 12;
      }

      let AMOrPM = '';

      if (hoursTotal < 12 || h === 12) {
        AMOrPM = 'AM';
      } else {
        AMOrPM = 'PM';
      }

      return `${h}:${m < 10 ? '0' : ''}${m} ${AMOrPM}`;
    },

    /**
     * @param {string} timeStr - time string, eg 11:40 PM
     */
    convertTimeToMinutes(timeStr) {
      const [time] = timeStr.split(' ');
      const [hours, minutes] = time.split(':');

      return parseInt(hours) * 60 + parseInt(minutes);
    },

    /**
     * @param {string} interval - duration of the event, in minutes.
     * @param {string} bufferTime - time interval between event, in minutes
     * @param {string} startTime - formatted time string from which time start
     * @returns {{minutesStart: number, minutesEnd: number, timeStr: string}[] }
     */
    generateTimeslots(interval, bufferTime, startTime) {
      /**
       * @constant
       * @type {{minutesStart: number, minutesEnd: number, timeStr: string}[] | []}
       */
      const slotArray = [];

      let startMinutes = 0;

      if (startTime) {
        startMinutes = this.convertTimeToMinutes(startTime);
      }

      const slotsToCreate = Math.floor(
        (MINUTES_IN_DAY - startMinutes) / (interval + bufferTime),
      );

      for (let i = 0; i < slotsToCreate; i++) {
        const minutesStart = startMinutes + (interval + bufferTime) * i;
        const minutesEnd = minutesStart + this.durationInMinutes;

        const slotObj = {
          minutesStart,
          minutesEnd,
          timeStr: `${this.formatMinutesToTime(
            minutesStart,
          )} - ${this.formatMinutesToTime(minutesEnd)}`,
        };

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
          month: 'long',
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

    setDecideLater() {
      this.resetSelectedTimeslot();
      this.date = null;
      this.finalDateStr = DECIDE_LATER_STR;
    },

    handleAddDate() {
      if (this.isDisabledAddDate) {
        return;
      }

      if (this.isDecideLater) {
        this.setDecideLater();
        this.toggleOpenModal();

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
