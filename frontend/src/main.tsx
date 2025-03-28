import React from 'react';
import { createRoot } from 'react-dom/client';
import { ColorSchemeScript } from '@mantine/core';
import './index.css';
import App from './App';
import '@mantine/core/styles.css';

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <ColorSchemeScript defaultColorScheme="dark" />
            <App />
        </React.StrictMode>
    );
} else {
    console.error('Root element not found');
}