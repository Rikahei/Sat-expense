<template>
  <div
    class="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full"
    >
      <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        {{ $t('editExpense') }}
      </h2>
      <p class="text-gray-700 dark:text-gray-300">
        {{ $t('editing') }}: {{ item?.id }}
      </p>
      <form @submit.prevent="submitForm">
        <DatePicker
          v-model="date"
          :enable-time-picker="false"
          :auto-apply="true"
          :hide-actions="true"
          :clearable="false"
          :locale="locale"
          class="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
        />
        <div class="mb-4">
          <label for="spending_category" class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">{{ $t('spendingCategory') }}</label>
          <input type="text" id="spending_category" v-model="formData.spending_category" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-800 leading-tight focus:outline-none focus:shadow-outline" required>
        </div>
        <div class="mb-4">
          <label for="title" class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">{{ $t('title') }}</label>
          <input type="text" id="title" v-model="formData.title" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-800 leading-tight focus:outline-none focus:shadow-outline" required>
        </div>
        <div class="mb-4">
          <label for="currency_type" class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">{{ $t('currencyType') }}</label>
          <input type="text" id="currency_type" v-model="formData.currency_type" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-800 leading-tight focus:outline-none focus:shadow-outline" required>
        </div>
        <div class="mb-4">
          <label for="amount" class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">{{ $t('amount') }}</label>
          <input type="number" id="amount" v-model="formData.amount" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-800 leading-tight focus:outline-none focus:shadow-outline" required>
        </div>
        <div class="mb-4">
          <label for="crypto_price" class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">{{ $t('cryptoPrice') }}</label>
          <input type="number" id="crypto_price" v-model="formData.crypto_price" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-800 leading-tight focus:outline-none focus:shadow-outline" required>
        </div>
        <div class="flex justify-end">
          <button
            @click="closeModal"
            class="mr-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded dark:bg-gray-600 dark:hover:bg-gray-500"
          >
            {{ $t('close') }}
          </button>
          <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline dark:bg-blue-600 dark:hover:bg-blue-500">
            {{ $t('save') }}
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
import { getSpendingEntryById, updateSpendingEntry } from '../utils/db'; // Import the function

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
        crypot_type: '',
        crypto_amount: 0,
        crypto_price: 0,
        timestamp: 0,
      },
    };
  },
  setup() {
    const { t, locale } = useI18n();
    return { t, locale };
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
  mounted() {
    console.log('mount');
    this.formData = { ...toRaw(this.item) };
  },
  methods: {
    closeModal() {
      this.$emit('close');
    },
    async fetchSpendingById(id) {
        return await getSpendingEntryById(id);
    },
    async submitForm() {
      try {
        // Update the spending entry in the database
        await updateSpendingEntry(this.item.id, toRaw(this.formData));
        console.log('Spending entry updated successfully!');

        // Emit a 'save' event to notify the parent component with a plain object
        this.$emit('saved'); // Use spread syntax to create a plain object

        // Close the modal
        this.closeModal();
      } catch (error) {
        console.error('Error updating spending entry:', error);
        // Optionally, display an error message to the user
      }
    },
  },
};
</script>
