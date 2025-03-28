import React from 'react';
import { RouterProvider } from '@tanstack/react-router';
import { MantineProvider, createTheme } from '@mantine/core';
import { router } from './routes';

// Create a theme with dark color scheme as default
const theme = createTheme({
    // Optional: you can customize other theme properties here
    colorScheme: 'dark',
});

const App: React.FC = () => {
    return (
        <MantineProvider theme={theme} defaultColorScheme="dark">
            <RouterProvider router={router} />
        </MantineProvider>
    );
};

export default App;