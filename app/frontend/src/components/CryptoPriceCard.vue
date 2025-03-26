<template>
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
          <p class="price" :class="{ up: priceChange === 'up', down: priceChange === 'down' }">
            <span v-if="priceChange === 'up'" class="arrow">↑</span>
            <span v-else-if="priceChange === 'down'" class="arrow">↓</span>
            ${{ price }}
          </p>
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
