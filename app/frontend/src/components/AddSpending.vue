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
                  Bitcoin Price (USD):
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
                <p>Error fetching Bitcoin price: {{ error }}</p>
              </div>
              <div v-else class="loading-section">
                <p>Loading Bitcoin price...</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Middle Section: Input and Button on Same Line -->
      <div class="flex-[1] flex items-center justify-center gap-4 p-4">
        <div class="flex items-center">
          <input
            type="number"
            class="border border-gray-300 rounded-md p-2 w-64 dark:bg-gray-700 dark:text-gray-100"
            placeholder="Enter expense amount"
            v-model="spendingAmount"
          />
          <button
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2"
            @click="addSpending"
          >
            Add
          </button>
        </div>
      </div>

      <!-- Bottom Section: expense History -->
      <div class="flex-[6] flex flex-col p-4">
        <div class="flex justify-between items-center w-full mb-4">
          <div class="relative">
            <select v-model="selectedMonth" class="border border-gray-300 rounded-md p-2 w-48 dark:bg-gray-700 dark:text-gray-100">
              <option v-for="month in months" :key="month.value" :value="month.value">
                {{ $t( `months.${month.label}` ) }}
              </option>
            </select>
          </div>
          <p class="dark:text-gray-300">
            Total: ${{ totalExpense }}
            <span class="flex items-center text-xl" v-if="price">
              <Icon
                icon="bitcoin-icons:bitcoin-circle-filled"
                class="w-4 h-4 mr-1 text-yellow-500"
              />
              {{ totalBtcSpending }}
            </span>
            <span v-else>Loading Total</span>
          </p>
        </div>
        <div v-if="filteredSpendingHistory.length > 0" class="w-full max-w-md mx-auto overflow-auto custom-scrollbar">
          <table class="w-full text-left dark:text-gray-300">
            <thead>
              <tr>
                <th class="py-2">Amount</th>
                <th class="py-2">BTC Amount</th>
                <th class="py-2">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in reversedFilteredSpendingHistory"
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
        <p v-else class="dark:text-gray-300">No expense history for selected month.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { DateTime } from 'luxon';
import axios from 'axios';
import { Icon } from '@iconify/vue';
import { addSpendingEntry, getAllSpendingEntries } from '../utils/db';

export default {
  name: 'AddSpending',
  components: {
    Icon,
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
      selectedMonth: null, // Added: Selected month
      months: [], // Added: Array of months
    };
  },
  computed: {
    totalExpense() {
      return this.filteredSpendingHistory.reduce((sum, item) => sum + item.amount, 0).toFixed(2);
    },
    totalBtcSpending() {
      return this.filteredSpendingHistory.reduce((sum, item) => sum + parseFloat(item.crypto_amount), 0).toFixed(8);
    },
    reversedFilteredSpendingHistory() {
      return [...this.filteredSpendingHistory].reverse();
    },
    filteredSpendingHistory() {
      if (!this.selectedMonth) return this.spendingHistory; // Show all if no month selected

      const selectedDateTime = DateTime.fromMillis(parseInt(this.selectedMonth));
      const startOfMonth = selectedDateTime.startOf('month');
      const endOfMonth = selectedDateTime.endOf('month');

      return this.spendingHistory.filter(item => {
        const itemDateTime = DateTime.fromMillis(parseInt(item.id));
        return itemDateTime >= startOfMonth && itemDateTime <= endOfMonth;
      });
    },
  },
  async mounted() {
    this.fetchPrice();
    this.intervalId = setInterval(this.fetchPrice, 30000);
    await this.loadSpendingHistory();
    this.generateMonths(); // Generate months after loading history
    this.selectedMonth = this.months[(DateTime.now().month - 1)].value; // Set the first month as the default
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
        const currentTimestamp = DateTime.now(); // Get DateTime object
        const timestampMillis = currentTimestamp.toMillis(); // Convert to milliseconds (integer)
        const cryptoAmount = Number(amount / this.price).toFixed(8);
        const entry = {
          id: timestampMillis, // Use timestampMillis as the ID
          spending_category: '',
          title: '',
          currency_type: 'usd',
          amount: amount,
          crypto_type: 'btc',
          crypto_amount: cryptoAmount,
          crypto_price: this.price,
          timestamp: currentTimestamp.toISO(), // Keep ISO string for display
        };
        try {
          await addSpendingEntry(entry);
          this.spendingHistory.push(entry); // Add the entry to the history *after* successful DB insertion
          await this.loadSpendingHistory();
        } catch (error) {
          console.error('Error adding spending entry:', error);
          // Consider adding user-friendly error handling here (e.g., alert)
        }
        this.spendingAmount = '';
      } else {
        alert('Please enter a valid amount greater than zero.');
      }
    },
    formatTimestamp(timestamp) {
      const dt = DateTime.fromISO(timestamp);
      return dt.toFormat('yy/MM/dd, HH:mm');
    },
    async loadSpendingHistory() {
      try {
        this.spendingHistory = await getAllSpendingEntries();
      } catch (error) {
        console.error('Error loading expense history:', error);
      }
    },
    generateMonths() {
      const now = DateTime.now();
      const currentYear = now.year;
      for (let i = 0; i < 12; i++) {
        const dt = DateTime.fromObject({ year: currentYear, month: i + 1 });
        this.months.push({
          value: dt.toMillis(),
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
