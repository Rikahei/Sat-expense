<template>
  <div class="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
    <div class="divide-y divide-gray-300 divide-double flex flex-col h-screen">
      <!-- Top Section: Bitcoin Price (Card Layout) -->
      <div class="flex-[2] flex flex-col items-center justify-center p-8">
        <div class="w-full max-w-md bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
          <div class="flex items-center">
            <div class="w-3/10">
              <Icon
                icon="bitcoin-icons:bitcoin-circle-filled"
                class="w-20 h-20 mx-auto text-yellow-500"
              />
            </div>
            <div class="w-7/10 text-right">
              <div v-if="price" class="price-section">
                <h2 class="text-xl font-semibold mb-2 dark:text-gray-300">
                  {{ $t('bitcoinPriceLabel') }}
                </h2>
                <p
                  class="price"
                  :class="{ up: priceChange === 'up', down: priceChange === 'down' }"
                >
                  <span v-if="priceChange === 'up'" class="arrow">↑</span>
                  <span v-else-if="priceChange === 'down'" class="arrow">↓</span>
                  ${{ price }}
                </p>
              </div>
              <div v-else-if="error" class="error-section">
                <p>Error!!!</p> </div>
              <div v-else class="loading-section">
                <p>loading...</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Middle Section: Input and Button on Same Line -->
      <div class="flex-[1] flex items-center justify-center p-4">
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
    <ExpenseHistory :spendingHistory="spendingHistory" @month-changed="handleMonthChanged" class="flex-[6] flex flex-col items-center justify-center p-4" ExpenseHistory/>
    </div>
  </div>
</template>

<script>
import { DateTime } from 'luxon';
import axios from 'axios';
import { Icon } from '@iconify/vue';
import { addSpendingEntry, getSpendingByMonth } from '../utils/db';
import { useI18n } from 'vue-i18n';
import ExpenseHistory from './ExpenseHistory.vue'
 
export default {
  name: 'AddSpending',
  components: {
    Icon,
    ExpenseHistory,
  },
  setup() {
    const { t } = useI18n();
    return { t };
  },
  data() {
    return {
      price: null,
      error: null,
      priceChange: null,
      previousPrice: null,
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
      this.loadSpendingHistory(DateTime.now().year, newVal);
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
    this.generateMonths();
    this.selectedMonth = this.months[(DateTime.now().month - 1)].value;
    this.loadSpendingHistory(DateTime.now().year, DateTime.now().month);
  },
  unmounted() {
    clearInterval(this.intervalId);
  },
  methods: {
    async fetchPrice() {
      try {
        const response = await axios.get('/api/ticker/btcusd/');
        const currentPrice = parseFloat(response.data.last).toFixed(2);

        if (this.previousPrice !== null) {
          if (currentPrice > this.previousPrice) {
            this.priceChange = 'up';
          } else if (currentPrice < this.previousPrice) {
            this.priceChange = 'down';
          } else {
            this.priceChange = null;
          }
        }

        this.price = currentPrice;
        this.previousPrice = currentPrice;
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
          await this.loadSpendingHistory();
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
    handleMonthChanged(newMonth) {
      this.selectedMonth = newMonth;
      this.loadSpendingHistory(DateTime.now().year, this.selectedMonth);
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

<style scoped>
.home {
  text-align: center;
  margin-top: 0px;
}

.price-section {
  margin-top: 20px;
}

.price {
  font-size: 2rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.price.up {
  color: green;
}

.price.down {
  color: red;
}

.arrow {
  margin-right: 5px;
  font-size: 1.5rem;
}

.error-section {
  color: red;
  margin-top: 20px;
}

.loading-section {
  color: blue;
  margin-top: 20px;
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
