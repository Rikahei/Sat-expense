<!-- /Users/hei/sat-expense/app/frontend/src/components/AddSpending.vue -->
<template>
  <div class="h-full bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
    <div class="flex flex-col divide-y divide-gray-300 divide-double">
      <!-- Top Section: Bitcoin Price (Card Layout) -->
      <div class="flex flex-col items-center justify-center p-8">
        <CryptoPriceCard :price="price" :error="error" />
      </div>

      <!-- Middle Section: Input and Button on Same Line -->
      <div class="flex items-center justify-center p-4">
        <div class="mt-2 w-full max-w-lg">
          <div class="flex flex-row rounded-md bg-white">
            <select v-model="selectedCategory" class="flex-none w-28 rounded-l-lg bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
              <option value="food_drink">{{ $t('category.food_drink') }}</option>
              <option value="groceries">{{ $t('category.groceries') }}</option>
              <option value="transport">{{ $t('category.transport') }}</option>
              <option value="shopping">{{ $t('category.shopping') }}</option>
              <option value="entertainment">{{ $t('category.entertainment') }}</option>
              <option value="utilities">{{ $t('category.utilities') }}</option>
              <option value="health_fitness">{{ $t('category.health_fitness') }}</option>
              <option value="home">{{ $t('category.home') }}</option>
            </select>
            <input
              type="number"
              class="flex-auto w-36 bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100"
              :placeholder="$t('expenseAmountPlaceholder')"
              v-model="spendingAmount"
            />
            <button
              class="flex-auto w-12 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1.5 px-2 rounded-r-md"
              @click="addSpending"
            >
              {{ $t('addSpendingButton') }}
            </button>
          </div>
        </div>
      </div>
      <div class="flex items-center justify-center px-4 py-6 bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <ExpenseHistory :spendingHistory="spendingHistory" @month-changed="handleMonthChanged" class="w-full max-w-lg" />  <!-- Added class for width control -->
      </div>
    </div>
  </div>
</template>

<script>
import { DateTime } from 'luxon';
import axios from 'axios';
import { addSpendingEntry, getSpendingByMonth } from '../utils/db';
import { useI18n } from 'vue-i18n';
import ExpenseHistory from './ExpenseHistory.vue'
import CryptoPriceCard from './CryptoPriceCard.vue';

export default {
  name: 'AddSpending',
  components: {
    ExpenseHistory,
    CryptoPriceCard,
  },
  setup() {
    const { t } = useI18n();
    return { t };
  },
  data() {
    return {
      price: null,
      error: null,
      intervalId: null,
      spendingAmount: '',
      spendingHistory: [],
      selectedMonth: null,
      months: [],
      selectedCategory: 'food_drink',
    };
  },
  watch: {
    selectedMonth(newVal, oldVal) {
      this.loadSpendingHistory(newVal.year, newVal.month);
    }
  },
  computed: {
    totalExpense() {
      return this.spendingHistory.reduce((sum, item) => sum + item.amount, 0).toFixed(2);
    },
    totalBtcSpending() {
      return this.spendingHistory.reduce((sum, item) => sum + parseFloat(item.crypto_amount), 0).toFixed(8);
    },
    reversedSpendingHistory() {
      return [...this.spendingHistory].reverse();
    }
  },
  async mounted() {
    this.fetchPrice();
    this.intervalId = setInterval(this.fetchPrice, 30000);
    this.loadSpendingHistory(DateTime.now().year, DateTime.now().month);
  },
  unmounted() {
    clearInterval(this.intervalId);
  },
  methods: {
    async fetchPrice() {
      try {
        const response = await axios.get('/api/ticker/price', {
          params: {
            symbol: 'BTCUSDT',
          },        
        });
        const currentPrice = parseFloat(response.data.price).toFixed(2);

        this.price = currentPrice;
      } catch (err) {
        this.error = err.message;
        if (err.response) {
          this.error = `${err.message}: ${err.response.status} - ${err.response.statusText}`;
        } else if (err.request) {
          this.error = `No response: ${err.message}`;
        } else {
          this.error = `Error: ${err.message}`;
        }
      }
    },
    async addSpending() {
      if (this.spendingAmount && !isNaN(Number(this.spendingAmount)) && Number(this.spendingAmount) > 0) {
        const amount = Number(this.spendingAmount);
        const currentTimestamp = DateTime.now();
        const timestampMillis = currentTimestamp.toMillis();
        const cryptoAmount = Number(amount / this.price).toFixed(8);
        const entry = {
          id: timestampMillis,
          spending_category: this.selectedCategory,
          title: '',
          currency_type: 'usd',
          amount: amount,
          crypto_type: 'btc',
          crypto_amount: cryptoAmount,
          crypto_price: this.price,
          timestamp: currentTimestamp.toISO(),
        };
        try {
          await addSpendingEntry(entry);
          this.spendingHistory.push(entry);
          await this.loadSpendingHistory(this.selectedMonth.year, this.selectedMonth.month);
        } catch (error) {
          console.error('Error adding spending entry:', error);
          alert(this.$t('errorAddingEntry')); //Improved error handling
        }
        this.spendingAmount = '';
      } else {
        alert(this.$t('invalidAmount'));
      }
    },
    formatTimestamp(timestamp) {
      const dt = DateTime.fromISO(timestamp);
      return dt.toFormat('yy/MM/dd, HH:mm');
    },
    async loadSpendingHistory(year, month) {
      try {
        this.spendingHistory = await getSpendingByMonth(year, month);
      } catch (error) {
        console.error('Error loading expense history:', error);
        alert(this.$t('errorLoadingHistory')); //Improved error handling
      }
    },
    handleMonthChanged(newDate) {
      this.selectedMonth = newDate;
      this.loadSpendingHistory(newDate.year, newDate.month);
    },
  },
};
</script>

<style scoped>
.home {
  text-align: center;
  margin-top: 0px;
}

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
