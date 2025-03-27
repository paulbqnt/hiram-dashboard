import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './routes';

import '@mantine/core/styles.css';

// Use createRoot for React 18
const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <RouterProvider router={router}>
                {/* Your app components will be rendered by the router */}
            </RouterProvider>
        </React.StrictMode>
    );
} else {
    console.error('Root element not found');
}
