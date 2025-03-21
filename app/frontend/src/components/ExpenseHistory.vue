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
      <select
        v-model="selectedMonth"
        class="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
      >
        <option v-for="month in months" :key="month.value" :value="month.value">
          {{ $t(`months.${month.label}`) }}
        </option>
      </select>
    </div>
    <div class="h-screen-40 overflow-y-auto">
      <ul role="list" class="divide-y divide-gray-200 dark:divide-gray-700">
        <li v-for="(item, index) in reversedSpendingHistory" :key="item.id" class="py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="shrink-0">
              <Icon
                v-if="item.crypto_type === 'btc'"
                icon="bitcoin-icons:bitcoin-circle-outline"
                class="w-6 h-6 text-yellow-500"
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

export default {
  name: 'ExpenseHistory',
  components: {
    Icon,
  },
  props: {
    spendingHistory: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  setup() {
    const { t } = useI18n();
    return { t };
  },
  data() {
    return {
      selectedMonth: null,
      months: [],
    };
  },
  watch: {
    selectedMonth(newVal) {
      this.$emit('month-changed', newVal);
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
  async mounted() {
    this.generateMonths();
    this.selectedMonth = this.months[(DateTime.now().month - 1)].value;
    this.$emit('month-changed', this.selectedMonth);
  },
  methods: {
    formatTimestamp(timestamp) {
      const dt = DateTime.fromISO(timestamp);
      return dt.toFormat('yy/MM/dd, HH:mm');
    },
    generateMonths() {
      const now = DateTime.now();
      const currentYear = now.year;
      for (let i = 0; i < 12; i++) {
        const dt = DateTime.fromObject({ year: currentYear, month: i + 1 });
        this.months.push({
          value: dt.month,
          label: dt.month,
        });
      }
    },
  },
};
</script>
