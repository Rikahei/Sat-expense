<template>
  <div class="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
    <div class="mt-8">
      <v-chart class="chart" :option="chartOption" autoresize/>
    </div>
  </div>
</template>

<script>
import { getSpendingByMonth } from '../utils/db';
import { DateTime } from 'luxon';
import VChart from 'vue-echarts';

import { use } from 'echarts/core';
import { PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  PieChart,
  CanvasRenderer,
]);

export default {
  name: 'MonthlySpend',
  components: {
    VChart,
  },
  data() {
    return {
      spendingData: [],
      chartBaseOption: {
        title: {
          text: 'Monthly Spending Breakdown',
          left: 'center',
        },
        tooltip: {
          trigger: 'item',
        },
        legend: {
          orient: 'vertical',
          left: 'left',
        },
        series: [{
            name: 'Spending',
            type: 'pie',
            radius: '70%',
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2,
            },
            label: {
              show: true,
              position: 'outside',
              formatter: '{b}: {c} ({d}%)',
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '16',
                fontWeight: 'bold',
              },
            },
            labelLine: {
              show: true,
            },
          }
        ],
      },
    };
  },
  computed: {
    chartData() {
      return this.spendingData.map((item) => ({
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
        this.spendingData = data;
      } catch (error) {
        console.error('Error fetching spending data:', error);
      }
    },
  },
};
</script>

<style scoped>
.chart {
  height: 100vh;
  position: relative;
}
.container{
  height: 350px;
  width: 400px;
}
</style>
