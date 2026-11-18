import { defineConfig, devices } from "@playwright/test";

// Not 5173: a dev server left running from another checkout would be tested instead.
const port = Number(process.env.E2E_PORT ?? 5391);

export default defineConfig({
  testDir: "e2e",
  outputDir: "e2e-artifacts/test-results",
  fullyParallel: true,
  retries: 0,
  workers: process.env.CI ? 2 : 4,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: `http://localhost:${port}`,
    // The journeys find categories and options by their French labels.
    locale: "fr-FR",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 720 } } }],
  webServer: {
    command: `npx vite --port ${port} --strictPort`,
    url: `http://localhost:${port}`,
    reuseExistingServer: process.env.E2E_REUSE === "1",
    // BROWSER=none stops Vite from opening a window (server.open is true).
    env: { BROWSER: "none" },
    timeout: 120_000,
  },
});
