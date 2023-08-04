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
                    :key="timezone.text"
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
import { dayjs } from '~/utils/dayjs';

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

      defaultValue: dayjs()
        .add(MIN_HOURS, 'hours')
        .tz(this.detectUserTimezoneId())
        .format('YYYY-MM-DD'),
      /* defaultValue: dayjs()
        .add(MIN_HOURS, 'hours')
        .tz(this.detectUserTimezoneId())
        .valueOf(), */
      /* defaultValue: dayjs()
        .tz(this.detectUserTimezoneId(), true)
        .add(MIN_HOURS, 'hours')
        .valueOf(), */ // default date value at least 48 hours from now
      /* defaultValue: dayjs()
        .add(MIN_HOURS, 'hours')
        .tz(this.detectUserTimezoneId())
        .valueOf(), */ // default date value at least 48 hours from now
      // defaultValue: new Date(Date.now() + MIN_HOURS * 60 * 60 * 1000), // default date value at least 48 hours from now
      // defaultValue: null, // default date value at least 48 hours from now
      date: null, // date
      finalDateStr: '',
    };
  },

  computed: {
    disableDates() {
      const tzId = this.selectedTimezoneInfo.utc;

      // console.log('this.defaultValue in disableDates', this.defaultValue);

      const afterTomorrow = dayjs(this.defaultValue)
        .set('hours', 0)
        .set('minutes', 0)
        .set('millisecond', 0)
        // .subtract(24, 'hour')
        .tz(tzId)
        .valueOf();
      // console.log('tomorrow: ', tomorrow);

      const maxDay = dayjs(this.defaultValue)
        .set('hours', 0)
        .set('minutes', 0)
        .set('millisecond', 0)
        .add(MAX_DAYS, 'day')
        .tz(tzId)
        .valueOf();

      /* const tomorrow = dayjs
        .tz(this.defaultValue)
        .set('hours', 0)
        .set('minutes', 0)
        .set('millisecond', 0)
        .subtract(24, 'hour')
        // .tz(tzId)
        .valueOf();
      // console.log('tomorrow: ', tomorrow);

      const maxDay = dayjs
        .tz(this.defaultValue)
        .set('hours', 0)
        .set('minutes', 0)
        .set('millisecond', 0)
        .add(MAX_DAYS, 'day')
        // .tz(tzId)
        .valueOf(); */

      return (date) => {
        // console.log('maxDay: ', maxDay);

        // console.log('date in Disable dates: ', date);

        return date < afterTomorrow || date > maxDay;
        /* return (
          date < new Date(this.defaultValue.getTime() - 24 * 60 * 60 * 1000) ||
          date >
            new Date(
              this.defaultValue.getTime() + MAX_DAYS * 24 * 60 * 60 * 1000,
            )
        ); */
        //* when date is timestamp
        /* const newTzId = this.selectedTimezoneInfo.utc[0];

        const tomorrow = this.defa */
        /* console.log('recompute disableDates');
        console.log('date: ', date);
        const tomorrow = this.defaultValue - 24 * 60 * 60 * 1000;
        console.log('tomorrow: ', tomorrow);
        const maxDateNotDisabled =
          this.defaultValue + MAX_DAYS * 24 * 60 * 60 * 1000;
        console.log('maxDateNotDisabled: ', maxDateNotDisabled);

        return date < tomorrow || date > maxDateNotDisabled; */
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
      // console.log('foundTz: ', foundTz);

      const [utcStr] = foundTz.text.split(' ');

      const utcOnlyStr = utcStr.slice(1, utcStr.length - 1);

      const abbr = foundTz?.abbr;
      // console.log('abbr: ', abbr);

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
      // console.log('!timeSlots, this.defaultValue: ', this.defaultValue);
      // if (dayjs(this.date).isSame(dayjs(this.defaultValue), 'day')) {
      const dTimeslots = dayjs(this.date).tz(this.selectedTimezoneUtcId);
      console.log('dTimeslots: ', dTimeslots);

      const dDefaultValueTimeslots = dayjs(this.defaultValue).tz(
        this.selectedTimezoneUtcId,
      );
      console.log('dDefaultValueTimeslots: ', dDefaultValueTimeslots);

      if (dTimeslots.isSame(dDefaultValueTimeslots, 'day')) {
        console.log('time slots, same day');

        const d = dayjs().tz(this.selectedTimezoneUtcId);
        // console.log('d: ', d);

        const hours = d.get('hour');
        const minutes = d.get('minute');

        console.log({ hours, minutes });

        // console.log('hours: ', hours);
        // console.log('minutes: ', minutes);

        const minutesPassed = hours * 60 + minutes;
        // console.log('minutesPassed: ', minutesPassed);

        // return this.slotArr.map((s) => s.timeStr);

        const filteredSlots = this.slotArr
          .filter((item) => {
            // console.log({ minutesStart: item.minutesStart, minutesPassed });
            return item.minutesStart > minutesPassed;
          })
          .map((s) => s.timeStr);

        console.log('filteredSlots: ', filteredSlots);

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
      console.log('date', this.date);

      /* if (newVal && newVal !== oldVal) {
        
      } */
    },

    defaultValue(newVal, oldVal) {
      console.log({ oldVal, newVal });
    },

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

    /* setTimeout(() => {
      this.defaultValue = dayjs(this.defaultValue).add(10, 'days').valueOf();
    }, 5000); */
  },

  methods: {
    updateDefaultValue() {
      console.log('update default value');
      const tzId = this.selectedTimezoneInfo.utc;
      const newDefaultValue = dayjs()
        .add(MIN_HOURS, 'hours')
        .tz(tzId)
        .utc(true)
        .format('YYYY-MM-DD');

      this.defaultValue = newDefaultValue;
      this.date = newDefaultValue;

      /* this.defaultValue = dayjs(this.defaultValue)
        .add(MIN_HOURS, 'hours')
        .tz(tzId)
        .valueOf(); */
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
      this.tzId = id;

      const tz = this.findTimezoneOnTzId(id);

      this.selectedTimezone = tz.text;
    },

    /**
     * disable date before 2 days from now and not
     * @param {date} Date
     */
    /* disableDates(date) {
      return (
        date < new Date(this.defaultValue.getTime() - 24 * 60 * 60 * 1000) ||
        date >
          new Date(this.defaultValue.getTime() + MAX_DAYS * 24 * 60 * 60 * 1000)
      );
    }, */

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
      // const [initialUtc] = this.selectedTimezoneInfo.utc;
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
      // return `${h < 10 ? '0' + h : h}:${m < 10 ? '0' + m : m}`;
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
      /* const d = dateTimeFormatter({
        date: new this.date,
        locale: this.locale,
        options: {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: undefined,
          minute: undefined,
        },
      }); */

      const finalStr = `${d}, ${this.selectedTimeslot}, ${this.selectedTimezoneInfo.utcOnlyStr}, ${this.selectedTimezoneInfo.abbr}`;
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

//* watch
/* selectedTimezone(newVal, oldVal) {
      if (newVal && newVal !== oldVal) {
        console.log('selectedTimezone: ', this.selectedTimezone);

        const newTzId = this.selectedTimezoneInfo.utc[0];
        console.log('!!! timezone id', newTzId);

        dayjs.tz.setDefault(newTzId);

        // const dayJsDateAfterTomorrow = dayjs.tz(newTzId).add(MIN_HOURS, 'hour');
        const oldDefaultValue = this.defaultValue;

        const dayJsDateAfterTomorrow = dayjs()
          .add(MIN_HOURS, 'hour')
          .tz(newTzId);
        console.log('dayJsDateAfterTomorrow: ', dayJsDateAfterTomorrow);

        const newDefaultValue = dayJsDateAfterTomorrow.valueOf();

        console.log({ oldDefaultValue, newDefaultValue });

        // this.defaultValue = dayJsDateAfterTomorrow.valueOf();
        this.defaultValue = dayjs()
          .add(MIN_HOURS, 'hour')
          .tz(newTzId)
          .valueOf();
        console.log('this.defaultValue: ', this.defaultValue);

        // this.date = dayjs.tz(this.date).valueOf();
        this.date = dayjs(this.date).tz().valueOf();
        console.log('this.date: ', this.date);
        // this.defaultValue = dayJsDateAfterTomorrow.toDate();
        // console.log('this.date: ', this.date);

      //   const [utcSelected] = this.selectedTimezoneInfo.utc;
      // const formattedInDisableDates = dayjs(this.defaultValue).tz(utcSelected);
      // console.log('formattedInDisableDates: ', formattedInDisableDates);
      } 
    }, */
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
