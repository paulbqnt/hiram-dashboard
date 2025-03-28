// App.tsx
import React from 'react';
import { RouterProvider } from '@tanstack/react-router';
import { MantineProvider } from '@mantine/core';
import { router } from './routes';

const App: React.FC = () => {
    return (
        <MantineProvider withGlobalStyles withNormalizeCSS>
            <RouterProvider router={router} />
        </MantineProvider>
    );
};

export default App;
