import '@testing-library/jest-dom';

// Mock fetch for API tests
global.fetch = vi.fn();

// Mock crypto.randomUUID
if (!global.crypto) {
  global.crypto = {
    randomUUID: () => Math.random().toString(36).substring(2, 15),
  } as Crypto;
}

// Reset mocks after each test
afterEach(() => {
  vi.clearAllMocks();
});
