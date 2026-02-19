
# RemotePass Automation Framework

This project contains a Playwright + TypeScript test automation framework for [RemotePass](https://www.remotepass.com).

## Project Structure

- `src/pages/`: Page Object Models (POM) for encapsulated logic.
  - `access.page.ts`: Base page with common strategies.
  - `home.page.ts`: Homepage interactions.
  - `pricing.page.ts`: Pricing page logic.
  - `demo.page.ts`: Demo request form validation.
- `src/tests/`: Test specifications.
  - `remotepass.spec.ts`: The main test suite covering 7 scenarios.
- `src/utils/`: Helper utilities (currently empty, scalable for future).
- `playwright.config.ts`: Configuration for timeouts, reporting, and browser settings.

## Prerequisites

- Node.js (v16+)
- NPM

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

## Running Tests

Run all tests:
```bash
npx playwright test
```

Run specific test file:
```bash
npx playwright test src/tests/remotepass.spec.ts
```

Run in UI mode (interactive debugging):
```bash
npx playwright test --ui
```

Generate and view report:
```bash
npx playwright show-report
```

## Test Scenarios

1. **TC01**: Homepage Load & Critical Elements - Verifies core branding and navigation availability.
2. **TC02**: Platform Dropdown - Validates submenu interactions (mouse click & navigation).
3. **TC03**: Pricing Page - Checks plan visibility & "Get Started" functional CTA.
4. **TC04**: Pricing Toggle - Interacts with Feature toggles.
5. **TC05**: Demo Form - Submits empty form to verify HubSpot validation messages (handles iframes).
6. **TC06**: Login Redirection - Verifies standard login link behavior (new tab vs same tab).
7. **TC07**: Footer Links - Checks stability of legal links in the footer.
8. **TC08**: Network Resources - Verifies critical assets load with 200 OK status.

## Troubleshooting

- **Headless Mode**: If tests fail due to bot detection (Cloudflare), run with `--headed` or adjust `userAgent` in `playwright.config.ts`.
- **Timeouts**: Default action timeout is set to 30s. If network is slow, increase in config.