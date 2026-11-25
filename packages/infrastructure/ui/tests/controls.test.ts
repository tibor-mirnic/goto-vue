import { expect, test } from 'vite-plus/test';
import { h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { UiButton, UiLabel } from '../src/index.ts';

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
