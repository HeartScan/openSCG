# Testing Strategy for OpenSCG App

This document outlines the testing strategy, infrastructure, and best practices for the `openscg_app` frontend.

## 1. Technology Stack

We use a modern, lightweight, and fast testing stack designed for React applications:

*   **[Vitest](https://vitest.dev/)**: Next-generation test runner powered by Vite. It is compatible with Jest API but significantly faster.
*   **[React Testing Library (RTL)](https://testing-library.com/docs/react-testing-library/intro/)**: For testing React components by interacting with them as a user would (clicking, finding text), rather than testing implementation details.
*   **[JSDOM](https://github.com/jsdom/jsdom)**: A browser environment simulator for Node.js, allowing us to test DOM manipulations without a real browser.
*   **[MSW (Mock Service Worker)](https://mswjs.io/)** (Future/Optional): For intercepting network requests, though currently we use direct mocking of API hooks.

## 2. Running Tests

To run the tests, execute the following commands in the `openscg_app` directory:

```bash
# Run all tests once
npm run test

# Run tests in watch mode (re-runs on file save)
npm run test:watch
```

## 3. Project Structure

*   **Test Files**: Located alongside source files with the extension `.test.tsx` or `.test.ts` (Colocation).
    *   Example: `src/components/MeasurementHistory.tsx` -> `src/components/MeasurementHistory.test.tsx`
*   **Mocks**: Located in `src/__mocks__`.
    *   `src/__mocks__/data/`: Contains real JSON data fixtures extracted from production/cardioai to ensure tests run against realistic data structures.
*   **Configuration**:
    *   `vitest.config.ts`: Main configuration file for Vitest.
    *   `src/setupTests.ts`: Global test setup (e.g., importing jest-dom matchers).
    *   `src/utils/test-utils.tsx`: Custom renderers and providers (e.g., React Query wrapper).

## 4. Testing Philosophy

We follow the "Testing Trophy" approach, prioritizing integration tests that give high confidence:

### A. Unit Tests (Hooks & Logic)
We test complex logic isolated in custom hooks.
*   **Example**: `useChartDataPreparation.test.tsx`
*   **Focus**: Verifying that raw API data is correctly transformed into the structures required by components (e.g., transforming `timestamp`/`az` arrays into `uPlot` compatible format).
*   **Data**: We use **real measurement data** (mocks) to ensure our parsing logic handles edge cases and actual data shapes correctly.

### B. Integration Tests (Components)
We test components to ensure they render correctly and handle user interactions.
*   **Example**: `MeasurementHistory.test.tsx`
*   **Focus**: Verifying that the component renders lists, handles empty states, and responds to clicks/deletions.
*   **Mocking**: We mock external dependencies like `storage` or API hooks to isolate the component's UI logic from the backend/database.

### C. End-to-End (E2E) Tests
We use a custom Node.js script to verify the full communication flow between the client and the server in a live environment.
*   **Example**: `e2e-test.js`
*   **Focus**: Verifying the real-time data streaming pipeline, including:
    *   **Anonymous Authorization**: Ensuring `/api/auth/device` correctly handles session cookies.
    *   **WebSocket Room Logic**: Verifying that data sent from one client is correctly broadcast to other clients in the same session room.
    *   **Connectivity**: Confirming that both HTTP and WebSocket protocols are correctly handled by the server (Next.js + Custom Socket.IO).

## 5. Running E2E Tests

To run the E2E tests against a specific target environment:

```bash
# Navigate to the app directory
cd openscg_app

# Run the test against a target URL (default is production)
node e2e-test.js https://your-deployment-url.a.run.app
```

The script will exit with code `0` on success and `1` on failure, providing detailed logs for each step of the handshake and data exchange.

## 6. Writing New Tests

1.  **Create a test file**: `MyComponent.test.tsx` next to `MyComponent.tsx`.
2.  **Mock dependencies**: Use `vi.mock()` to mock child components or complex hooks if necessary to keep the test focused.
3.  **Use real data fixtures**: Import JSON data from `src/__mocks__/data/` instead of manually creating large dummy objects.
4.  **Test user behavior**: Prefer `fireEvent.click(screen.getByText(...))` over calling handlers directly.

## 6. Continuous Integration

These tests are lightweight and designed to be run in CI/CD pipelines (e.g., GitHub Actions) on every Pull Request to ensure no regressions are introduced.
