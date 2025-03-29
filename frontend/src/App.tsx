import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { MantineProvider, createTheme } from '@mantine/core';
import { router } from './routes';

// Create a client
const queryClient = new QueryClient();

// Create a theme with dark color scheme as default
const theme = createTheme({
    // Optional: you can customize other theme properties here
    colorScheme: 'dark',
});

const App: React.FC = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <MantineProvider theme={theme} defaultColorScheme="dark">
                <RouterProvider router={router} />
            </MantineProvider>
        </QueryClientProvider>
    );
};

export default App;
