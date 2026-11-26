import { HttpResponse, http } from 'msw/http';
import { type MockPaletteName, readMockPaletteColors } from './paletteColors.moq.ts';

export const createPaletteHandlers = (origin: string) => {
  const appOrigin = new URL(origin).origin;
  const getPalette = (palette: MockPaletteName) =>
    http.get(
      ({ request }) => {
        const { origin, pathname } = new URL(request.url);
        return origin === appOrigin && pathname === `/api/palettes/${palette}`;
      },
      () => HttpResponse.json(readMockPaletteColors(palette))
    );

  return [getPalette('aurora'), getPalette('mist')];
};
