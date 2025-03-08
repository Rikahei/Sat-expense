import { createRouter, createWebHistory } from 'vue-router';
import Home from './components/Home.vue';
import MonthlySpend from './components/MonthlySpend.vue'; // Import MonthlySpend

const routes = [
  { path: '/', component: Home },
  { path: '/monthly-spend', component: MonthlySpend, meta: { title: 'Monthly Spend - Sat-Spend' } }, // Add the route
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Sat-Spend';
  next();
});


export default router;
