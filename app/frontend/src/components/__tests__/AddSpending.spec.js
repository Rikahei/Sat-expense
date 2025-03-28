import { mount } from '@vue/test-utils';
import AddSpending from '../AddSpending.vue';
import { createI18n } from 'vue-i18n';
import ja from '../../locales/ja.json';
import { describe, it, expect } from 'vitest';

describe('AddSpending.vue', () => {
  it('displays Japanese text when locale is set to ja', async () => {
    const i18n = createI18n({
      locale: 'ja',
      messages: {
        ja,
      },
    });

    const wrapper = mount(AddSpending, {
      global: {
        plugins: [i18n],
      },
    });

    await wrapper.vm.$nextTick();

    // More robust assertion:  Find the button specifically
    const addButton = wrapper.get('button');
    expect(addButton.text()).toContain('追加'); 
  });
});
