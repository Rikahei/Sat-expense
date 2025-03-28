import { mount } from '@vue/test-utils';
import AddSpending from '../AddSpending.vue';
import { createI18n } from 'vue-i18n';
import { DateTime } from 'luxon';
import ja from '../../locales/ja.json';
import en from '../../locales/en.json';
import { describe, it, expect, vi } from 'vitest';
import { getSpendingByMonth } from '../../utils/db'; // Import the function

vi.mock('../../utils/db', () => ({
  getSpendingByMonth: vi.fn(), // Mock the function
}));


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

  it('handles errors during loadSpendingHistory', async () => {
    const errorMessage = 'Failed to load data';
    getSpendingByMonth.mockRejectedValue(new Error(errorMessage));

    const i18n = createI18n({ locale: 'en', messages: { en, } });
    const wrapper = mount(AddSpending, {
      global: {
        plugins: [i18n],
      },
    });

    const alertSpy = vi.spyOn(window, 'alert'); // Spy on the alert function

    await wrapper.vm.$nextTick();
    await wrapper.vm.loadSpendingHistory(2024, 1);

    expect(getSpendingByMonth).toHaveBeenCalledWith(2024, 1);
    expect(alertSpy).toHaveBeenCalledWith('Error loading history'); // Check if the alert was shown with the translated message
    expect(wrapper.vm.spendingHistory).toEqual([]); //Spending history should be empty on error.
  });
});