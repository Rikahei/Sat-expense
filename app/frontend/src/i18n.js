import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import ja from './locales/ja.json';
import zh_hk from './locales/zh-HK.json';

const messages = {
  en,
  ja,
  zh_hk
};

// Get the user's browser language
const browserLanguage = navigator.language || navigator.userLanguage; // For older browsers

// Get the language from localStorage, or use the browser language as a fallback
const locale = localStorage.getItem('locale') || (Object.keys(messages).includes(browserLanguage)?browserLanguage : 'ja');

const i18n = createI18n({
  locale, // Default language
  fallbackLocale: 'en', // Fallback if a translation is missing
  messages,
  legacy: false, // to support composition API
  globalInjection: true, // inject $t into all component.
});

export default i18n;
