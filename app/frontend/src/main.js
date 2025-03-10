import { createApp } from 'vue';
import App from './App.vue';
import { createRouter, createWebHistory } from 'vue-router';
import Home from './components/Home.vue';
import './index.css'
import i18n from './i18n'; 

const routes = [
  { path: '/', component: Home },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);
app.use(router);
app.use(i18n);
app.mount('#app');
