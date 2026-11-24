import { expect, test } from 'vite-plus/test';
import { parsePaletteColors } from '../src/index.ts';

test('preserves the names and order of the Aurora palette', () => {
  const names = ['indigo', 'harbor blue', 'indigo'];
  expect(parsePaletteColors(names)).toEqual(names);
});

test('accepts an empty palette', () => {
  expect(parsePaletteColors([])).toEqual([]);
});

test.each([null, 'indigo', { colors: ['indigo'] }])('rejects a non-array payload %j', (value) => {
  expect(() => parsePaletteColors(value)).toThrow(TypeError);
});

test.each([42, null, { name: 'teal' }, '', ' \t '])('rejects a malformed color %j', (color) => {
  expect(() => parsePaletteColors(['indigo', color])).toThrow(TypeError);
});
