import { HttpRequest } from '@azure/functions'
import { vi } from 'vitest'

const routeRegistrations: any[] = []

// Mock Azure Functions so that we can hook into the route registration
// process and verify that the expected routes are registered
// in the functions file

export const mockAzureFunctions = {
  app: {
    get: vi.fn().mockImplementation((name, options) => {
      // console.log('Route registered:', name, options)
      routeRegistrations.push({ method: 'get', name, options })
    }),
    post: vi.fn().mockImplementation((name, options) => {
      // console.log('Route registered:', name, options)
      routeRegistrations.push({ method: 'post', name, options })
    }),
    put: vi.fn(),
    delete: vi.fn(),
  },
  context: vi.fn().mockImplementation(() => ({
    log: vi.fn().mockImplementation((...args: any) => {
      console.log(...args);
    }),
  })),
  InvocationContext: vi.fn().mockImplementation(() => ({
    log: vi.fn().mockImplementation((...args: any) => {
      console.log(...args);
    }),
  })),
  HttpRequest: vi.fn(),
  HttpResponse: vi.fn(),
}

class TestHttpRequest implements HttpRequest {
  method: string;
  url: string;
  headers: Headers;
  query: URLSearchParams;
  body: any;

  constructor(config: {
      method?: string;
      url?: string;
      headers?: Record<string, string>;
      body?: any;
      query?: Record<string, string>;
  }) {
      this.method = config.method || 'GET';
      this.url = config.url || 'http://localhost';
      this.headers = new Headers(config.headers || {});
      this.query = new URLSearchParams(config.query);
      this.body = config.body;
  }

  async json() {
      return this.body;
  }

  async text() {
      return JSON.stringify(this.body);
  }

  async formData() {
      // Convert body to FormData if it isn't already
      if (this.body instanceof FormData) return this.body;
      const formData = new FormData();
      Object.entries(this.body).forEach(([key, value]) => {
          formData.append(key, value as string);
      });
      return formData;
  }

  async arrayBuffer() {
      throw new Error('Not implemented');
  }

  async blob() {
      throw new Error('Not implemented');
  }
}

export { routeRegistrations }
