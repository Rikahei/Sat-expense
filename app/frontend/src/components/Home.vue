<template>
  <div class="home">
    <h1>Hello Bitcoin</h1>
    <p>
      Track your daily spending and see how much Bitcoin you've spent!
    </p>
    <p>
      (Feature Coming Soon: Convert USD to BTC)
    </p>
    <div v-if="price" class="price-section">
      <h2>Current Bitcoin Price (USD):</h2>
      <p class="price" :class="{ up: priceChange === 'up', down: priceChange === 'down' }">
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
</template>

<script>
import axios from 'axios';

export default {
  name: 'Home',
  data() {
    return {
      price: null,
      error: null,
      priceChange: null,
      previousPrice: null,
      intervalId: null,
    };
  },
  mounted() {
    this.fetchPrice(); // Initial fetch
    this.intervalId = setInterval(this.fetchPrice, 30000); // Fetch every 30 seconds
  },
  unmounted() {
    clearInterval(this.intervalId); // Clear interval when component unmounts
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
  },
};
</script>

<style scoped>
.home {
  text-align: center;
  margin-top: 50px;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 20px;
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
