import React from 'react';
import { Outlet } from '@tanstack/react-router';
import {Combobox} from "@mantine/core";
import {Header} from "../components/ui/Header/Header.tsx";

const Layout: React.FC = () => {
    return (
        <div>
            <Header />
            {/* Common layout elements like header or footer can go here */}
            <Outlet /> {/* This is where the child route components will be rendered */}
        </div>
    );
}

export default Layout;
