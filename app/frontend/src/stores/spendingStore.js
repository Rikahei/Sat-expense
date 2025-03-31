// src/stores/spendingStore.js
import { defineStore } from 'pinia';

export const useSpendingStore = defineStore('spending', {
  state: () => ({
    spendingHistory: [], // We still need this, but it won't be updated here
    needReload: false,
  }),
  actions: {
    triggerReload() {
      this.needReload = true; // Only set needReload to true
    },
    resetNeedReload() {
      this.needReload = false;
    },
  },
});
