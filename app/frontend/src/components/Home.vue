<template>
  <div :class="{ dark: isDarkMode }">
    <component :is="currentComponent" :isDarkMode="isDarkMode" />
    <NavBottom @update-component="updateComponent" />
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
