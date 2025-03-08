<template>
    <div class="min-h-screen p-4 bg-white rounded-lg shadow-md dark:bg-gray-800 dark:text-gray-100">
      <h1 class="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mb-6">Settings</h1>
      <div class="grid grid-cols-1 gap-4">  <!-- Added grid container -->
        <button @click="exportData" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Export Data
        </button>
        <button @click="$refs.fileInput.click()" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Import Data
        </button>
        <input type="file" ref="fileInput" @change="importData" style="display: none;">
      </div>
    </div>
  </template>

<script>
import { getAllSpendingEntries, addSpendingEntry, clearDatabase } from '../utils/db';

export default {
  name: 'Setting',
  methods: {
    async exportData() {
      try {
        const data = await getAllSpendingEntries();
        const jsonData = JSON.stringify(data, null, 2); //Pretty print JSON

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

          // Clear existing data (Optional: You might want to offer a merge option)
          await clearDatabase();

          // Add each entry
          for (const entry of data) {
            await addSpendingEntry(entry);
          }
          alert('Data imported successfully!');
          location.reload(); // Refresh page to show changes
        } catch (error) {
          console.error('Error importing data:', error);
          alert('Error importing data. Check file format and see console for details.');
        }
      };
      reader.readAsText(file);
    }
  }
};
</script>
