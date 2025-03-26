<template>
  <div class="w-full max-w-md bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
    <div class="flex items-center">
      <div class="w-2/10">
        <Icon
          icon="bitcoin-icons:bitcoin-circle-filled"
          class="w-20 h-20 text-yellow-500"
        />
      </div>
      <div class="w-8/10 text-right">
        <div v-if="price" class="price-section">
          <h2 class="text-l font-semibold mb-2 dark:text-gray-300">
            {{ $t('bitcoinPriceLabel') }} ({{ currency }})
          </h2>
          <div class="price-container">
            <p class="price" :class="{ up: priceChange === 'up', down: priceChange === 'down' }">
              <span v-if="priceChange === 'up'" class="arrow">↑</span>
              <span v-else-if="priceChange === 'down'" class="arrow">↓</span>
              ${{ price }}
            </p>
          </div>
        </div>
        <div v-else-if="error" class="error-section">
          <p>Error!!!</p>
        </div>
        <div v-else class="loading-section">
          <p>loading...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from '@iconify/vue';
export default {
  name: 'BitcoinPriceCard',
  components: {
    Icon,
  },
  props: {
    price: {
      type: String,
      default: null,
    },
    error: {
      type: String,
      default: null,
    },
    currency: { // Added currency prop
      type: String,
      default: 'USDT',
    },
  },
  data () {
    return {
        previousPrice: null,
    }
  },
  watch: {
    price(newValue, oldValue) {
        if(newValue !== oldValue) {
            this.previousPrice = oldValue;
        }
    }
  },
  computed: {
    priceChange() {
      if (this.previousPrice !== null && this.price !== null) {
        const currentPrice = parseFloat(this.price);
        const prevPrice = parseFloat(this.previousPrice);
        if (currentPrice > prevPrice) {
          return 'up';
        } else if (currentPrice < prevPrice) {
          return 'down';
        }
      }
      return null;
    },
  },
};
</script>

<style scoped>
.price-section {
  margin-top: 20px;
}

.price-container {
  display: flex;
  justify-content: flex-end; /* Align to the right */
}

.price {
  font-size: 1.5rem;
  font-weight: bold;
  display: flex;
  align-items: center;
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
