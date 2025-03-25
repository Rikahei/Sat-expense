<template>
  <div class="min-h-screen p-4 bg-white rounded-lg shadow-md dark:bg-gray-800 dark:text-gray-100">
    <h1 class="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mb-6">{{ $t('settings') }}</h1>
    <div class="grid grid-cols-1 gap-4">
      <!-- Added grid container -->
      <button
        @click="exportData"
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {{ $t('exportData') }}
      </button>
      <button
        @click="$refs.fileInput.click()"
        class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        {{ $t('importData') }}
      </button>
      <input type="file" ref="fileInput" @change="importData" style="display: none" />
    </div>
    <div class="grid grid-cols-1 gap-4 mt-4">
      <label for="languageSelect" class="mr-2 text-gray-700 dark:text-gray-300">{{ $t('language') }}:</label>
      <select
        id="languageSelect"
        v-model="$i18n.locale"
        @change="setLocaleLocalStorage"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      >
        <option value="en">{{ $t('english') }}</option>
        <option value="ja">{{ $t('japanese') }}</option>
      </select>
    </div>
  </div>
</template>

<script>
import { getAllSpendingEntries, addSpendingEntry, clearDatabase } from '../utils/db';

export default {
  name: 'Setting',
  methods: {
    setLocaleLocalStorage() {
      localStorage.setItem('locale', this.$i18n.locale);
    },
    async exportData() {
      try {
        const data = await getAllSpendingEntries();
        const jsonData = JSON.stringify(data, null, 2);

        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'spending_data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error exporting data:', error);
        alert('Error exporting data.  See console for details.');
      }
    },
    async importData(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const jsonData = e.target.result;
          const data = JSON.parse(jsonData);

          await clearDatabase();

          for (const entry of data) {
            await addSpendingEntry(entry);
          }
          alert('Data imported successfully!');
          location.reload();
        } catch (error) {
          console.error('Error importing data:', error);
          alert('Error importing data. Check file format and see console for details.');
        }
      };
      reader.readAsText(file);
    },
  },
};
</script>
