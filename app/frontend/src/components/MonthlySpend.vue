<template>
  <div class="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100 p-4">
    <div class="container mx-auto max-w-3xl">
      <div class="rounded-lg shadow-md p-6">
        <v-chart class="chart" :option="chartOption" autoresize />
      </div>
    </div>
  </div>
</template>

<script>
import { getSpendingByMonth } from '../utils/db';
import { DateTime } from 'luxon';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { useI18n } from 'vue-i18n';

use([TitleComponent, TooltipComponent, LegendComponent, PieChart, CanvasRenderer]);

export default {
  name: 'MonthlySpend',
  components: { VChart },
  props: {
    isDarkMode: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const { t } = useI18n();
    return { t };
  },
  data() {
    return {
      spendingData: [],
      chartBaseOption: {
        backgroundColor: this.isDarkMode ? 'rgb(17 24 39)' : 'rgb(243 244 246)',
        title: {
          text: this.t('monthly_spending'), // i18n for title
          left: 'center',
          textStyle: {
            color: this.isDarkMode ? '#eee' : '#333', // Dynamic text color for title
          },
        },
        tooltip: {
          trigger: 'item',
          textStyle: {
            color: this.isDarkMode ? '#eee' : '#333', // Dynamic text color for title
          },
        },
        legend: {
          orient: 'horizontal',
          bottom: 0,
          left: 'center',
          textStyle: {
            color: this.isDarkMode ? '#eee' : '#333', // Dynamic text color for title
          },
          formatter: (name) => this.t(`category.${name}`), // i18n for legend
        },
        series: [{
          name: this.t('spending'), // i18n for series name
          type: 'pie',
          radius: ['30%', '70%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            fontSize: 12,
            fontWeight: 'normal',
            position: 'outer',
            formatter: (params) => this.t(`category.${params.name}`),
            overflow: 'break',
            ellipsis: '...',
            color: this.isDarkMode ? '#eee' : '#333',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'normal',
              color: this.isDarkMode ? '#eee' : '#333',
            },
          },
          labelLine: {
            show: true,
            length: 10,
            length2: 10,
          },
        }],
      },
    };
  },
  computed: {
    chartData() {
      return this.spendingData.map(item => ({
        value: item.crypto_amount,
        name: item.spending_category,
      }));
    },
    chartOption() {
      return {
        ...this.chartBaseOption,
        series: [{
          ...this.chartBaseOption.series[0],
          data: this.chartData,
        }],
      };
    },
    chartContainerStyle() {
      return this.isDarkMode ? { '--bg-color': '#333', '--text-color': '#eee' } : { '--bg-color': '#fff', '--text-color': '#333' };
    },
  },
  async mounted() {
    await this.fetchSpendingData();
  },
  methods: {
    async fetchSpendingData() {
      try {
        const today = DateTime.now();
        const currentYear = today.year;
        const currentMonth = today.month;
        const data = await getSpendingByMonth(currentYear, currentMonth);
        this.spendingData = this.getSpendingByCategory(data);
      } catch (error) {
        console.error('Error fetching spending data:', error);
      }
    },
    getSpendingByCategory(data) {
      const categoryTotals = {};
      data.forEach(item => {
        const category = item.spending_category;
        const amount = parseFloat(item.crypto_amount);
        if (categoryTotals[category]) {
          categoryTotals[category] += amount;
        } else {
          categoryTotals[category] = amount;
        }
      });
      return Object.keys(categoryTotals).map(category => ({
        spending_category: category,
        crypto_amount: categoryTotals[category],
      }));
    },
  },
};
</script>

<style scoped>
.chart {
  width: 100%;
  height: 400px;
}
</style>
