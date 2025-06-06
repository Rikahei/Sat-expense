import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '../components/Home.vue';

const routes = [
  { path: '/', component: Home },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Sat-Spend';
  next();
});


export default router;
