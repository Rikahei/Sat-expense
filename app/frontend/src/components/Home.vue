<template>
  <div
    class="home min-h-screen flex flex-col divide-y divide-gray-300 divide-dashed bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100"
  >
    <!-- Top Section: Bitcoin Price (Card Layout) -->
    <div class="flex-1 flex flex-col items-center justify-center p-4">
      <div
        class="w-full max-w-md bg-white rounded-lg shadow-md p-6 dark:bg-gray-800"
      >
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

    <!-- Middle Section: Input Field -->
    <div class="flex-1 flex flex-col items-center justify-center p-4">
      <h2 class="text-xl font-semibold mb-4 dark:text-gray-300">
        Enter Spending Amount
      </h2>
      <input
        type="number"
        class="border border-gray-300 rounded-md p-2 w-64 dark:bg-gray-700 dark:text-gray-100"
        placeholder="Enter amount in USD"
        v-model="spendingAmount"
      />
      <button
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
        @click="addSpending"
      >
        Add
      </button>
    </div>

    <!-- Bottom Section: Spending History -->
    <div class="flex-1 flex flex-col items-center justify-center p-4">
      <h2 class="text-xl font-semibold mb-4 dark:text-gray-300">
        Spending History
      </h2>
      <ul v-if="spendingHistory.length > 0" class="w-full max-w-md">
        <li
          v-for="(item, index) in spendingHistory"
          :key="index"
          class="flex justify-between items-center py-2"
        >
          <span>${{ item.amount }}</span>
          <span>{{ item.timestamp }}</span>
        </li>
      </ul>
      <p v-else>No spending history yet.</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { Icon } from '@iconify/vue';

export default {
  name: 'Home',
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
      spendingAmount: "",
      spendingHistory: [],
    };
  },
  mounted() {
    this.fetchPrice(); // Initial fetch
    this.intervalId = setInterval(this.fetchPrice, 30000); // Fetch every 30 seconds
    this.applyDarkMode();
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", this.applyDarkMode);
  },
  unmounted() {
    clearInterval(this.intervalId); // Clear interval when component unmounts
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .removeEventListener("change", this.applyDarkMode);
  },
  methods: {
    applyDarkMode() {
      if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    },
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
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          this.error = `${err.message}: ${err.response.status} - ${err.response.statusText}`;
        } else if (err.request) {
          // The request was made but no response was received
          // `err.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          this.error = `No response: ${err.message}`;
        } else {
          // Something happened in setting up the request that triggered an Error
          this.error = `Error: ${err.message}`;
        }
      }
    },
    addSpending() {
      if (this.spendingAmount) {
        this.spendingHistory.push({
          amount: this.spendingAmount,
          timestamp: new Date().toLocaleString(),
        });
        this.spendingAmount = "";
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
