<template>
  <div>
    <AddSpending />
    <NavBottom />
  </div>
</template>

<script>
import { mount } from '@vue/test-utils';
import AddSpending from './AddSpending.vue';
import MonthlySpend from './MonthlySpend.vue';
import NavBottom from './NavBottom.vue';

export default {
  components: {
    AddSpending,
    MonthlySpend,
    NavBottom,
  },
  mounted () {
    this.applyDarkMode();
  },
  methods: {
    applyDarkMode() {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
  }
};
</script>
