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
                <p>{{ $t('errorFetchingPrice', { error: error }) }}</p> </div>
              <div v-else class="loading-section">
                <p>{{ $t('loadingBitcoinPrice') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Middle Section: Input and Button on Same Line -->
      <div class="flex-[1] flex items-center justify-center gap-4 p-4">
        <div class="flex items-center">
          <div class="relative w-40">
            <select v-model="selectedCategory" class="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 dark:bg-gray-700 dark:text-gray-100">
              <option value="food_drink">{{ $t('category.food_drink') }}</option>
              <option value="groceries">{{ $t('category.groceries') }}</option>
              <option value="transport">{{ $t('category.transport') }}</option>
              <option value="shopping">{{ $t('category.shopping') }}</option>
              <option value="entertainment">{{ $t('category.entertainment') }}</option>
              <option value="utilities">{{ $t('category.utilities') }}</option>
              <option value="health_fitness">{{ $t('category.health_fitness') }}</option>
              <option value="home">{{ $t('category.home') }}</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg class="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
              </svg>
            </div>
          </div>
          <input
            type="number"
            class="border border-gray-300 rounded-md p-2 w-64 dark:bg-gray-700 dark:text-gray-100 ml-2"
            :placeholder="$t('expenseAmountPlaceholder')"
            v-model="spendingAmount"
          />
          <button
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2"
            @click="addSpending"
          >
            {{ $t('addSpendingButton') }}
          </button>
        </div>
      </div>

      <!-- Bottom Section: expense History -->
      <div class="flex-[6] flex flex-col p-4">
        <div class="flex justify-between items-center w-full mb-4">
          <div class="relative">
            <select v-model="selectedMonth" class="border border-gray-300 rounded-md p-2 w-48 dark:bg-gray-700 dark:text-gray-100">
              <option v-for="month in months" :key="month.value" :value="month.value">
                {{ $t(`months.${month.label}`) }}
              </option>
            </select>
          </div>
          <p class="dark:text-gray-300">
            {{ $t('totalExpenseLabel') }}: ${{ totalExpense }}
            <span class="flex items-center text-xl" v-if="price">
              <Icon
                icon="bitcoin-icons:bitcoin-circle-filled"
                class="w-4 h-4 mr-1 text-yellow-500"
              />
              {{ totalBtcSpending }}
            </span>
            <span v-else>{{ $t('loadingTotal') }}</span>
          </p>
        </div>
        <div v-if="reversedSpendingHistory.length > 0" class="w-full max-w-md mx-auto overflow-auto custom-scrollbar">
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
    </div>
  </div>
</template>

<script>
import { DateTime } from 'luxon';
import axios from 'axios';
import { Icon } from '@iconify/vue';
import { addSpendingEntry, getSpendingByMonth } from '../utils/db';
import { useI18n } from 'vue-i18n';

export default {
  name: 'AddSpending',
  components: {
    Icon,
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
