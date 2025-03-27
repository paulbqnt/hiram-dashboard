import React from 'react';
import { RouterProvider, Router } from '@tanstack/react-router';
import { MantineProvider } from '@mantine/core';
import { router } from './routes';

const router = new Router({ router });

const App: React.FC = () => {
    return (
        <MantineProvider>
            <RouterProvider router={router}>
                {/* Your app components go here */}
            </RouterProvider>
        </MantineProvider>
    );
}

export default App;
