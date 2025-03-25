<template>
  <div class="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100 p-4">
    <div class="container mx-auto max-w-3xl">
      <div class="rounded-lg shadow-md p-6">
        <div class="flex items-center justify-center mb-4">
          <label for="month-picker" class="mr-2">{{ t('date_click') }}:</label>
          <DatePicker
            id="month-picker"
            v-model="selectedMonth"
            :month-picker="true"
            :enable-time-picker="false"
            :auto-apply="true"
            :hide-actions="true"
            :locale="locale"
            :format="'MM/yyyy'"
            class="w-40 text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
          />
        </div>
        <v-chart class="chart" :option="chartOption" @legendselectchanged="handleLegendSelectChanged" autoresize />
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
import DatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

use([TitleComponent, TooltipComponent, LegendComponent, PieChart, CanvasRenderer]);

export default {
  name: 'MonthlySpend',
  components: { VChart, DatePicker },
  props: {
    isDarkMode: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const { t, locale } = useI18n();
    return { t, locale };
  },
  data() {
    return {
      spendingData: [],
      selectedMonth: null,
      chartBaseOption: {
        backgroundColor: this.isDarkMode ? 'rgb(17 24 39)' : 'rgb(243 244 246)',
        title: {
          left: 'center',
          textStyle: {
            color: this.isDarkMode ? '#eee' : '#333',
          },
        },
        tooltip: {
          backgroundColor: this.isDarkMode ? 'rgb(17 24 39)' : 'rgb(243 244 246)',
          trigger: 'item',
          formatter: (params) => {
            return `${this.t(`category.${params.name}`)}: ${params.value} (${params.percent}%)`;
          },
          textStyle: {
            color: this.isDarkMode ? '#eee' : '#333',
          },
        },
        legend: {
          itemWidth: 20,
          itemHeight: 20,
          icon: 'circle',
          orient: 'horizontal',
          bottom: 0,
          left: 'center',
          textStyle: {
            color: this.isDarkMode ? '#eee' : '#333',
            fontSize: 14,
            fontWeight: 'normal',
          },
          formatter: (name) => this.t(`category.${name}`),
        },
        series: [{
          name: 'spending',
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
  },
  watch: {
    selectedMonth(newDate) {
      this.fetchSpendingData(newDate);
    },
  },
  async mounted() {
    const jsDate = DateTime.now().toJSDate();
    this.selectedMonth = {
      year: jsDate.getFullYear(),
      month: jsDate.getMonth()
    };
    await this.fetchSpendingData();
  },
  methods: {
    async fetchSpendingData(newDate = this.selectedMonth) {
      try {
        const data = await getSpendingByMonth(newDate.year, newDate.month + 1); // Add one month for JS date
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
    handleLegendSelectChanged(params) {
      console.log('legendselectchanged', params);
    },
  },
};
</script>

<style scoped>
.chart {
  width: 100%;
  height: 25rem;
}
</style>
