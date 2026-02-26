import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    projectId: 'k7kkoz',
    defaultBrowser: 'chrome',
    viewportWidth: 1920,
    viewportHeight: 1080,
    retries: 2,
    baseUrl: 'http://localhost:5173',
    env: {
      databaseUrl: 'mysql://refly:test@localhost:3306/refly',
    },
  },
});
