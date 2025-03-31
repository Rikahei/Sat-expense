<template>
  <div
    class="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full"
    >
      <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        {{ $t('editExpenseModal.editExpense') }}
      </h2>
      <p class="text-gray-700 dark:text-gray-300">
        {{ $t('editExpenseModal.editing') }}: {{ item?.id }}
      </p>
      <form @submit.prevent="submitForm">
        <div class="py-2">
          <label class="block">
            <span class="block text-sm font-medium text-slate-700 dark:text-gray-300 text-left">{{ $t('editExpenseModal.spendingDate') }}</span>
            <DatePicker
              v-model="date"
              :enable-time-picker="false"
              :auto-apply="true"
              :hide-actions="true"
              :clearable="false"
              :locale="locale"
              class="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
            />
          </label>
        </div>
        <div class="py-2">
          <label class="block">
            <span class="block text-sm font-medium text-slate-700 dark:text-gray-300 text-left">{{ $t('editExpenseModal.spendingCategory') }}</span>
            <select v-model="formData.spending_category" class="peer shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-800 leading-tight focus:outline-none focus:shadow-outline">
              <option value="food_drink">{{ $t('category.food_drink') }}</option>
              <option value="groceries">{{ $t('category.groceries') }}</option>
              <option value="transport">{{ $t('category.transport') }}</option>
              <option value="shopping">{{ $t('category.shopping') }}</option>
              <option value="entertainment">{{ $t('category.entertainment') }}</option>
              <option value="utilities">{{ $t('category.utilities') }}</option>
              <option value="health_fitness">{{ $t('category.health_fitness') }}</option>
              <option value="home">{{ $t('category.home') }}</option>
            </select>
          </label>
        </div>
        <div class="py-2">
          <label class="block">
            <span class="block text-sm font-medium text-slate-700 dark:text-gray-300 text-left">{{ $t('editExpenseModal.title') }}</span>
            <input
              type="text"
              id="title"
              v-model="formData.title"
              class="peer shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
            />
          </label>
        </div>
        <div class="py-2">
          <label class="block">
            <span class="block text-sm font-medium text-slate-700 dark:text-gray-300 text-left">{{ $t('editExpenseModal.currencyType') }}</span>
            <input
              type="text"
              id="currency_type"
              v-model="formData.currency_type"
              class="peer shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </label>
        </div>
        <div class="py-2">
          <label class="block">
            <span class="block text-sm font-medium text-slate-700 dark:text-gray-300 text-left">{{ $t('editExpenseModal.amount') }}</span>
            <input
              type="number"
              id="amount"
              v-model="formData.amount"
              class="peer shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </label>
        </div>
        <div class="py-2">
          <label class="block">
            <span class="block text-sm font-medium text-slate-700 dark:text-gray-300 text-left">{{ $t('editExpenseModal.cryptoPrice') }}</span>
            <input
              type="number"
              id="crypto_price"
              v-model="formData.crypto_price"
              class="peer shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </label>
        </div>
        <div class="py-2">
          <label class="block">
            <span class="block text-sm font-medium text-slate-700 dark:text-gray-300 text-left">{{ $t('editExpenseModal.cryptoAmount') }}</span>
            <input
              type="number"
              id="crypto_amount"
              v-model="formData.crypto_amount"
              class="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
              disabled readonly
              required
            />
          </label>
        </div>
        <div class="flex justify-end">
          <button
            @click="closeModal"
            class="mr-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded dark:bg-gray-600 dark:hover:bg-gray-500"
          >
            {{ $t('editExpenseModal.close') }}
          </button>
          <button
            type="submit"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            {{ $t('editExpenseModal.save') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { toRaw } from 'vue';
import { useI18n } from 'vue-i18n';
import { DateTime } from 'luxon';
import DatePicker from '@vuepic/vue-datepicker';
import { updateSpendingEntry } from '../utils/db';
import { useSpendingStore } from '../stores/spendingStore';

export default {
  name: 'EditExpenseModal',
  components: {
    DatePicker,
  },
  props: {
    item: {
      type: Object,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      formData: {
        spending_category: '',
        title: '',
        currency_type: '',
        amount: 0,
        crypto_type: '',
        crypto_price: 0,
        crypto_amount: 0,
        timestamp: 0,
      },
    };
  },
  setup() {
    const { t, locale } = useI18n();
    const spendingStore = useSpendingStore();
    return { t, locale, spendingStore };
  },
  computed: {
    date: {
      get() {
        return DateTime.fromMillis(this.formData.timestamp).toJSDate();
      },
      set(newDate) {
        this.formData.timestamp = DateTime.fromJSDate(newDate).toMillis();
      },
    },
    locale() {
      return this.$i18n.locale;
    },
  },
  watch: {
    'formData.crypto_price': {
      handler(newPrice) {
        if (newPrice !== 0) {
          this.formData.crypto_amount = parseFloat((this.formData.amount / newPrice).toFixed(8));
        } else {
          this.formData.crypto_amount = 0;
        }
      },
      immediate: true, // Run the handler immediately on component mount
    },
  },
  mounted() {
    this.formData = { ...toRaw(this.item) };
  },
  methods: {
    closeModal() {
      this.$emit('close');
    },
    async submitForm() {
      try {
        await updateSpendingEntry(this.item.id, toRaw(this.formData));
        this.spendingStore.triggerReload(); // Trigger the reload
        this.$emit('saved');
        this.closeModal();
      } catch (error) {
        console.error('Error updating spending entry:', error);
        alert(this.$t('editExpenseModal.errorUpdatingSpendingEntry'));
      }
    },
  },
};
</script>
