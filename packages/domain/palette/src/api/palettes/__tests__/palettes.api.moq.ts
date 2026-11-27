import { HttpResponse, http } from 'msw/http';

export const createPaletteHandlers = (origin: string) => {
  const appOrigin = new URL(origin).origin;
  const getPalette = (palette: string, colors: readonly string[]) =>
    http.get(
      ({ request }) => {
        const { origin, pathname } = new URL(request.url);
        return origin === appOrigin && pathname === `/api/palettes/${palette}`;
      },
      () => HttpResponse.json(colors)
    );

  return [getPalette('aurora', ['coral', 'violet']), getPalette('mist', [])];
};
