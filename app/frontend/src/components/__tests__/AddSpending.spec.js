import { mount } from '@vue/test-utils';
import { beforeEach } from 'vitest';
import AddSpending from '../AddSpending.vue';
import { createI18n } from 'vue-i18n';
import { setActivePinia, createPinia } from 'pinia'
import { DateTime } from 'luxon';
import ja from '../../locales/ja.json';
import en from '../../locales/en.json';
import { describe, it, expect, vi } from 'vitest';
import { getSpendingByMonth } from '../../utils/db'; // Import the function

vi.mock('../../utils/db', () => ({
  getSpendingByMonth: vi.fn(), // Mock the function
}));


describe('AddSpending.vue', () => {
  beforeEach(() => {
    // creates a fresh pinia and makes it active
    // so it's automatically picked up by any useStore() call
    // without having to pass it to it: `useStore(pinia)`
    setActivePinia(createPinia())
  })
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
    const addButton = wrapper.get('button');
    expect(addButton.text()).toContain('追加');
  });
});

describe('AddSpending.vue', () => {
  it('loads spending history successfully', async () => {

    const i18n = createI18n({ locale: 'ja', messages: { ja, } });
    const wrapper = mount(AddSpending, {
      global: {
        plugins: [i18n],
      },
    });

    const mockSpendingHistory = [
      { spending_category: 'food_drink', amount: 100, timestamp: DateTime.now().toMillis() },
      { spending_category: 'transport', amount: 50, timestamp: DateTime.now().toMillis() },
    ];
    getSpendingByMonth.mockResolvedValue(mockSpendingHistory); // Mock the return value

    await wrapper.vm.$nextTick();
    await wrapper.vm.loadSpendingHistory(2024, 1); // Call the method with test data

    expect(getSpendingByMonth).toHaveBeenCalledWith(2024, 1); // Check if the function was called with correct arguments
    expect(wrapper.vm.spendingHistory).toEqual(mockSpendingHistory); // Check if the data was loaded correctly
  });
});