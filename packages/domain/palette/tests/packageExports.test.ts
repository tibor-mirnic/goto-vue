import { expect, test } from 'vite-plus/test';

test('resolves the mock handler entry and rejects the retired fixture subpath', () => {
  expect(import.meta.resolve('@goto/domain-palette/moq')).toBe(new URL('../dist/index.moq.js', import.meta.url).href);
  expect(() => import.meta.resolve('@goto/domain-palette/moq/fixtures')).toThrow(
    expect.objectContaining({ code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' })
  );
});
