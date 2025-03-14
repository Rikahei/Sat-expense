<template>
  <div class="flex flex-col p-4">
    <div class="flex justify-between items-center w-full mb-4">
      <div class="relative">
        <select
          v-model="selectedMonth"
          class="border border-gray-300 rounded-md p-2 w-48 dark:bg-gray-700 dark:text-gray-100"
        >
          <option v-for="month in months" :key="month.value" :value="month.value">
            {{ $t(`months.${month.label}`) }}
          </option>
        </select>
      </div>
      <p class="dark:text-gray-300">
        {{ $t('totalExpenseLabel') }}: ${{ totalExpense }}
        <span class="flex items-center text-xl">
          <Icon
            icon="bitcoin-icons:bitcoin-circle-filled"
            class="w-4 h-4 mr-1 text-yellow-500"
          />
          {{ totalBtcSpending }}
        </span>
      </p>
    </div>
    <div
      v-if="reversedSpendingHistory.length > 0"
      class="w-full max-w-md mx-auto overflow-auto custom-scrollbar"
    >
      <table class="w-full text-left dark:text-gray-300">
        <thead>
          <tr>
            <th class="py-2">{{ $t('amountColumn') }}</th>
            <th class="py-2">{{ $t('btcAmountColumn') }}</th>
            <th class="py-2">{{ $t('timestampColumn') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in reversedSpendingHistory"
            :key="item.id"
            class="border-b border-transparent"
          >
            <td class="py-2">${{ item.amount }} {{ item.currency_type }}</td>
            <td class="py-2 flex items-center">
              <Icon
                v-if="item.crypto_type === 'btc'"
                icon="bitcoin-icons:bitcoin-circle-outline"
                class="w-4 h-4 mr-1 text-yellow-500"
              />
              {{ item.crypto_amount }}
            </td>
            <td class="py-2">{{ formatTimestamp(item.timestamp) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else class="dark:text-gray-300">{{ $t('noExpenseHistory') }}</p>
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

  }
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px; /* Width of the entire scrollbar */
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1; /* Color of the tracking area */
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #888; /* Color of the thumb */
  border-radius: 4px; /* Roundness of the thumb */
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #555; /* Color of the thumb on hover */
}

.custom-scrollbar {
  max-height: 22rem; /* Adjust as needed */
}
</style>
