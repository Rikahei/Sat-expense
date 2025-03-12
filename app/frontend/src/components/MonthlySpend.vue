<template>
    <div class="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <h1 class="text-2xl font-bold mb-4">Monthly Spending</h1>
        <FullCalendar ref="fullCalendar" :options="calendarOptions" />
    </div>
</template>

<script>
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { getSpendingByMonth } from '../utils/db';
import { DateTime } from 'luxon';

export default {
  name: 'MonthlySpend',
  components: {
    FullCalendar
  },
  data() {
    return {
      calendarOptions: {
        plugins: [dayGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        dateClick: this.handleDateClick,
        events: [],
        eventContent: (arg) => {
          return {
            html: `<div class="fc-event-title">${arg.event.extendedProps.totalSpend}</div>`
          }
        }
      },
      spendingData: [],
    }
  },
  async mounted() {
    await this.fetchSpendingData();
    this.calendarOptions.events = this.formatEventsForCalendar(this.spendingData);
  },
  watch:{
    calendarDate: {
      handler(newVal){
          this.currentDate = newVal;
      },
      immediate: true
  }
  },
  computed: {
    calendarDate() {
      if (this.$refs.calendar && this.$refs.calendar.getApi) {
        const calendarApi = this.$refs.calendar.getApi();
        return calendarApi.getDate();
      }
      return null;
    }
  },

  watch:{
    calendarDate: {
      handler(newVal){
          this.currentDate = newVal;
      },
      immediate: true
  }
  },
  methods: {
    handleDateClick: function(arg) {
      console.log('date click! ' + arg.dateStr);
    },
    async fetchSpendingData() {
      try {
        const today = DateTime.now(); // Use Luxon's DateTime.now()
        const currentYear = today.year;
        const currentMonth = today.month;

        const data = await getSpendingByMonth(currentYear, currentMonth);
        this.spendingData = data;
      } catch (error) {
        console.error('Error fetching spending data:', error);
      }
    },
    formatEventsForCalendar(spendingData) {
      // Group spending entries by day
      const dailySpending = {};
      spendingData.forEach(entry => {
        const dateString = DateTime.fromISO(entry.timestamp).toISODate(); // Get YYYY-MM-DD
        if (!dailySpending[dateString]) {
          dailySpending[dateString] = [];
        }
        dailySpending[dateString].push(entry);
      });
      // Create calendar events with daily totals
      const events = Object.entries(dailySpending).map(([dateString, entries]) => {
        let totalSpend = 0;
        entries.forEach(entry => totalSpend += parseFloat(entry.crypto_amount)); //Sum USD amount

        return {
          title: '',
          start: dateString,
          extendedProps: { totalSpend }
        };
      });

      return events;
    }
  }
}
</script>
