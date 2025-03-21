<template>
  <div :class="{ dark: isDarkMode }" class="flex flex-col h-screen">
    <div class="grow bg-gray-100 text-gray-900 dark:bg-gray-600 dark:text-gray-100">  <!-- Takes up available space -->
      <component :is="currentComponent" :isDarkMode="isDarkMode" />
    </div>
    <div class="basis-16 bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <NavBottom @update-component="updateComponent" />
       <!-- bottom -->
    </div>
  </div>  
</template>

<script>
import AddSpending from './AddSpending.vue';
import MonthlySpend from './MonthlySpend.vue';
import Setting from './Setting.vue';
import NavBottom from './NavBottom.vue';
import ExpenseHistory from './ExpenseHistory.vue';

export default {
  components: {
    AddSpending,
    MonthlySpend,
    Setting,
    NavBottom,
    ExpenseHistory,
  },
  data() {
    return {
      isDarkMode: false,
      currentComponent: 'AddSpending',
    };
  },
  mounted() {
    this.applyDarkMode();
  },
  methods: {
    applyDarkMode() {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        this.isDarkMode = true;
      }
    },
    updateComponent(component) {
      this.currentComponent = component;
    }
  }
};
</script>
