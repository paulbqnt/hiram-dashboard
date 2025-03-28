// main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App'; // Import the App component
import '@mantine/core/styles.css';

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
} else {
    console.error('Root element not found');
}
