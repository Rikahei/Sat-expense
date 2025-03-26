<template>
  <div class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-8 dark:bg-gray-800 dark:border-gray-700">
    <div class="flex items-center justify-between mb-4">
      <div class="flex flex-col">
        <p class="text-sm text-left leading-none text-gray-900 dark:text-white truncate">
          {{ $t('totalExpense') }}: ${{ totalExpense }}
        </p>
        <p class="text-sm text-left leading-none text-gray-900 dark:text-white truncate">
          {{ $t('totalBtcSpending') }}: {{ totalBtcSpending }}
        </p>
      </div>
      <DatePicker
        v-model="selectedMonth"
        :month-picker="true"
        :enable-time-picker="false"
        :auto-apply="true"
        :hide-actions="true"
        :clearable="false"
        :locale="locale"
        :format="'MM/yyyy'"
        class="w-40 text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
      />
    </div>
    <div class="h-screen-40 overflow-y-auto">
      <ul role="list" class="divide-y divide-gray-200 dark:divide-gray-700">
        <li v-for="(item, index) in reversedSpendingHistory" :key="item.id" class="py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="shrink-0">
              <Icon
                v-if="item.spending_category === 'food_drink'"
                icon="mdi:food-fork-drink"
                class="size-6"
              />
              <Icon
                v-else-if="item.spending_category === 'groceries'"
                icon="mdi:baguette"
                class="size-6"
              />
              <Icon
                v-else-if="item.spending_category === 'transport'"
                icon="mdi:bus"
                class="size-6"
              />
              <Icon
                v-else-if="item.spending_category === 'shopping'"
                icon="mdi:gift-outline"
                class="size-6"
              />
              <Icon
                v-else-if="item.spending_category === 'entertainment'"
                icon="mdi:controller"
                class="size-6"
              />
              <Icon
                v-else-if="item.spending_category === 'utilities'"
                icon="mdi:lightning-bolt"
                class="size-6"
              />
              <Icon
                v-else-if="item.spending_category === 'health_fitness'"
                icon="mdi:heart-pulse"
                class="size-6"
              />
              <Icon
                v-else-if="item.spending_category === 'home'"
                icon="mdi:home"
                class="size-6"
              />
              <span v-else class="text-gray-500">
                <!-- Add a default icon or nothing if not BTC -->
              </span>
            </div>
            <div class="flex-1 text-center">
              <div class="text-lg inline-flex items-center font-semibold text-gray-900 dark:text-white">
                {{ item.crypto_amount }} BTC
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium text-gray-900 truncate dark:text-white">
                ${{ item.amount }} {{ item.currency_type }}
              </p>
              <p class="text-xs text-gray-500 truncate dark:text-gray-400">
                {{ formatTimestamp(item.timestamp) }}
              </p>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { DateTime } from 'luxon';
import { Icon } from '@iconify/vue';
import { useI18n } from 'vue-i18n';
import DatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

export default {
  name: 'ExpenseHistory',
  components: {
    Icon,
    DatePicker,
  },
  props: {
    spendingHistory: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  setup() {
    const { t, locale } = useI18n();
    return { t, locale };
  },
  data() {
    return {
      selectedMonth: null,
    };
  },
  watch: {
    selectedMonth(newVal) {
      this.$emit('month-changed', this.handleJsDate(newVal));
    },
  },
  computed: {
    totalExpense() {
      return this.spendingHistory
        .reduce((sum, item) => sum + item.amount, 0)
        .toFixed(2);
    },
    totalBtcSpending() {
      return this.spendingHistory
        .reduce((sum, item) => sum + parseFloat(item.crypto_amount), 0)
        .toFixed(8);
    },
    reversedSpendingHistory() {
      return [...this.spendingHistory].reverse();
    },
  },
  mounted() {
    const jsDate = DateTime.now().toJSDate();
    this.selectedMonth = {
      year: jsDate.getFullYear(),
      month: jsDate.getMonth() //Month is 0-indexed in JS Date
    };
  },
  methods: {
    formatTimestamp(timestamp) {
      const dt = DateTime.fromISO(timestamp);
      return dt.toFormat('yy/MM/dd, HH:mm');
    },
    handleJsDate(jsDate){
      return {year:jsDate.year, month:jsDate.month + 1};
    }
  },
};
</script>
