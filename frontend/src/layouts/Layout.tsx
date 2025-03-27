import React from 'react';
import { Outlet } from '@tanstack/react-router';

const Layout: React.FC = () => {
    return (
        <div>
            {/* Common layout elements like header or footer can go here */}
            <Outlet /> {/* This is where the child route components will be rendered */}
        </div>
    );
}

export default Layout;
