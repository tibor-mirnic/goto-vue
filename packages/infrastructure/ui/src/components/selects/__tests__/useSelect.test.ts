import { expect, test, vi } from 'vite-plus/test';
import { computed } from 'vue';
import { useSelect } from '../useSelect.ts';

test('one native change writes the selected string to the model once', () => {
  const update = vi.fn<(value: string) => void>();
  const model = computed({ get: () => '', set: update });
  const { onChange } = useSelect(model);
  const select = Object.assign(new EventTarget(), { value: '42' });
  select.addEventListener('change', onChange);

  select.dispatchEvent(new Event('change'));

  expect(update.mock.calls).toEqual([['42']]);
});
