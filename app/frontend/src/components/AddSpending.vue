<template>
  <div class="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
    <div class="divide-y divide-gray-300 divide-double">
      <!-- Top Section: Bitcoin Price (Card Layout) -->
      <div class="flex-[3] flex flex-col items-center justify-center p-8">
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
      <div class="flex-[2] flex items-center justify-center gap-4 p-8 mx-auto">
        <div class="flex items-center">
          <input
            type="number"
            class="border border-gray-300 rounded-md p-2 w-64 dark:bg-gray-700 dark:text-gray-100"
            placeholder="Enter spending amount"
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

      <!-- Bottom Section: Spending History -->
      <div class="flex-[4] flex flex-col p-4">
        <div class="flex justify-between items-center w-full">
          <h2 class="text-xl font-semibold mb-4 dark:text-gray-300">
            Spending History
          </h2>
          <p class="dark:text-gray-300">
            Total: ${{ totalSpending }}
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
        <div v-if="spendingHistory.length > 0" class="w-full max-w-md mx-auto">
          <table class="w-full text-left dark:text-gray-300">
            <thead class="border-b border-transparent">
              <tr>
                <th class="py-2">Amount</th>
                <th class="py-2">BTC Amount</th>
                <th class="py-2">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in spendingHistory"
                :key="index"
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
        <p v-else class="dark:text-gray-300">No spending history yet.</p>
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
    };
  },
  computed: {
    totalSpending() {
      return this.spendingHistory.reduce((sum, item) => sum + item.amount, 0).toFixed(2);
    },
    totalBtcSpending() {
      return this.spendingHistory.reduce((sum, item) => sum + parseFloat(item.crypto_amount), 0).toFixed(8);
    },
  },
  async mounted() {
    this.fetchPrice();
    this.intervalId = setInterval(this.fetchPrice, 30000);
    await this.loadSpendingHistory();
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
        const currentTimestamp = DateTime.now().toISO();
        const cryptoAmount = Number(amount / this.price).toFixed(8);
        const entry = {
          currency_type: 'usd',
          amount: amount,
          crypto_type: 'btc',
          crypto_amount: cryptoAmount,
          crypto_price: this.price,
          timestamp: currentTimestamp,
        };
        await addSpendingEntry(entry);
        this.spendingHistory.push(entry);
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
        const entries = await getAllSpendingEntries();
        this.spendingHistory = entries;
      } catch (error) {
        console.error('Error loading spending history:', error);
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
</style>
