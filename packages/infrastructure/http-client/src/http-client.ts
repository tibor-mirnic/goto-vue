import { HttpError } from './http-error.ts';

type Fetch = (path: string, init: RequestInit) => Promise<Response>;

interface GetJsonOptions<T> {
  parse: (value: unknown) => T;
  signal?: AbortSignal;
}

export const createHttpClient = (fetch: Fetch) => ({
  getJson: async <T>(path: string, { parse, signal }: GetJsonOptions<T>): Promise<T> => {
    const response = await fetch(path, { method: 'GET', signal });
    if (!response.ok) {
      throw new HttpError(response.status);
    }

    const value: unknown = await response.json();
    return parse(value);
  }
});
