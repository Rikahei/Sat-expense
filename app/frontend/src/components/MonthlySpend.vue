<template>
    <div class="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <h1>Monthly Spending</h1>
        <FullCalendar ref="fullCalendar" :options="calendarOptions" />
    </div>
</template>

<script>
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { getSpendingByMonth } from '../utils/db';

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

    let calendarApi = this.$refs.fullCalendar.getApi()
    console.log(calendarApi.getDate());
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
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;

        const data = await getSpendingByMonth(currentMonth, currentYear);
        this.spendingData = data;
      } catch (error) {
        console.error('Error fetching spending data:', error);
      }
    },
    formatEventsForCalendar(spendingData) {
      // Group spending entries by day
      const dailySpending = {};
      spendingData.forEach(entry => {
        const dateString = entry.timestamp.toISOString().slice(0, 10); // Get YYYY-MM-DD
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
