import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

export function renderWithProviders(ui: React.ReactNode) {
    const testQueryClient = createTestQueryClient();
    // No need for RTL's render here if we just want the wrapper, 
    // but usually we use a wrapper for RTL's render.
    // Let's just export the wrapper.
    return (
        <QueryClientProvider client={testQueryClient}>
            {ui}
        </QueryClientProvider>
    );
}

// Mock Zustand store if needed, but for now we might mock the hook directly in tests.
