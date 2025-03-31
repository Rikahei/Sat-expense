import { mount } from '@vue/test-utils';
import EditExpenseModal from '../EditExpenseModal.vue';
import { createI18n } from 'vue-i18n';
import { DateTime } from 'luxon';
import ja from '../../locales/ja.json';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateSpendingEntry } from '../../utils/db';
import { useSpendingStore } from '../../stores/spendingStore';
import { createPinia, setActivePinia } from 'pinia';

vi.mock('../../utils/db', () => ({
  updateSpendingEntry: vi.fn(),
}));

describe('EditExpenseModal.vue', () => {
  let pinia;
  beforeEach(() => {
    // Create a fresh Pinia instance for each test
    pinia = createPinia();
    setActivePinia(pinia);
  });
  it('updates crypto_amount correctly when crypto_price changes and amount is not zero', async () => {
    const i18n = createI18n({ locale: 'ja', messages: { ja } });
    const item = {
      id: '1',
      spending_category: 'food_drink',
      title: 'Test',
      currency_type: 'USD',
      amount: 100,
      crypto_type: 'BTC',
      crypto_price: 50000,
      crypto_amount: 0.002,
      timestamp: DateTime.now().toMillis(),
    };

    const wrapper = mount(EditExpenseModal, {
      global: {
        plugins: [i18n, pinia],
      },
      props: { item },
    });

    await wrapper.find('#crypto_price').setValue(25000);
    expect(wrapper.vm.formData.crypto_amount).toBe(0.004);

    await wrapper.find('#crypto_price').setValue(100000);
    expect(wrapper.vm.formData.crypto_amount).toBe(0.001);

    await wrapper.find('#amount').setValue(200);
    await wrapper.find('#crypto_price').setValue(50000);
    expect(wrapper.vm.formData.crypto_amount).toBe(0.004);
  });
});
