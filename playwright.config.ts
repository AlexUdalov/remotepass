import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './src/tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 1, // Keep retries
    workers: process.env.CI ? 1 : 2, // Limit workers to avoid hammering
    reporter: [['list'], ['html']], // Output to console and html
    use: {
        baseURL: 'https://remotepass.com',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        actionTimeout: 30000,
        navigationTimeout: 60000,
        // Add real user agent
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        headless: true, // Try headless first, if fails, might need headed
        ignoreHTTPSErrors: true,
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
