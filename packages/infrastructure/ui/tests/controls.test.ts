import { expect, test } from 'vite-plus/test';
import { h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { UiButton, UiLabel, UiSelect, UiUl } from '../src/index.ts';

test('a label supports explicit association and nested controls', async () => {
  const label = await renderToString(h(UiLabel, { for: 'choice', class: 'field' }, () => 'Choose'));
  expect(label).toMatch(/^<label[^>]*>/);
  expect(label).toContain('for="choice"');
  expect(label).toContain('class="goto-ui-label field"');
  expect(label).toContain('Choose');

  const nested = await renderToString(h(UiLabel, () => ['Choose', h('input', { id: 'choice' })]));
  expect(nested).toMatch(/<label[^>]*>.*Choose.*<input id="choice">.*<\/label>/);
});

test('button defaults to a non-submit action and forwards native overrides and attributes', async () => {
  const button = await renderToString(h(UiButton, () => 'Retry'));
  expect(button).toMatch(/^<button type="button"[^>]*>.*Retry.*<\/button>$/);
  const submit = await renderToString(h(UiButton, { type: 'submit', form: 'form-a', disabled: true, class: 'action' }));
  expect(submit).toContain('type="submit"');
  expect(submit).toContain('form="form-a"');
  expect(submit).toMatch(/\sdisabled[\s>]/);
  expect(submit).toContain('class="goto-ui-button action"');
});

test('a labelled select preserves its slotted placeholder and native form attributes', async () => {
  const html = await renderToString(
    h('div', [
      h(UiLabel, { for: 'size' }, () => 'Size'),
      h(UiSelect, { id: 'size', name: 'size', modelValue: '', class: 'field', required: true }, () => [
        h('option', { value: '', disabled: true }, 'Choose a size'),
        h('option', { value: 'small' }, 'Small')
      ])
    ])
  );
  expect(html).toContain('for="size"');
  expect(html).toMatch(/<select[^>]*id="size"[^>]*>/);
  expect(html).toContain('class="goto-ui-select field"');
  expect(html).toContain('name="size"');
  expect(html).toMatch(/<select[^>]* required[ >]/);
  expect(html).toMatch(/<option value(?:="")? disabled>Choose a size<\/option>.*<option value="small">Small<\/option>/);
});

test('the native unordered list receives its accessible name and renders its items in slot order', async () => {
  const html = await renderToString(
    h(UiUl, { 'aria-label': 'Sizes', class: 'sizes' }, () => [h('li', 'Small'), h('li', 'Large')])
  );
  expect(html).toMatch(/^<ul[^>]*>.*<li>Small<\/li><li>Large<\/li>.*<\/ul>$/);
  expect(html).toContain('aria-label="Sizes"');
  expect(html).toContain('class="goto-ui-ul sizes"');
});
