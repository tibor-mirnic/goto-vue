import { expect, test } from 'vite-plus/test';
import { HttpError } from '../src/index.ts';

test('HttpError carries the HTTP response status', () => {
  const error = new HttpError(404);

  expect(error).toBeInstanceOf(Error);
  expect(error.status).toBe(404);
});
