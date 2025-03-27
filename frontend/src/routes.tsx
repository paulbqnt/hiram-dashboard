import React from 'react';
import { Route, RootRoute, Router } from '@tanstack/react-router';
import Pricer from './pages/Pricer/Pricer';
import Stock from './pages/Stock/Stock';
import Layout from './layouts/Layout';
import Home from './pages/Home/Home'; // Import the Home component

// Define your routes
const rootRoute = new RootRoute({
    component: Layout,
});

const homeRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Home,
});

const pricerRoute = new Route({
    getParentRoute: () => rootRoute,
    path: 'pricer',
    component: Pricer,
});

const stockRoute = new Route({
    getParentRoute: () => rootRoute,
    path: 'stock',
    component: Stock,
});

// Create a route tree and include the homeRoute
const routeTree = rootRoute.addChildren([homeRoute, pricerRoute, stockRoute]);

// Create a router instance
const router = new Router({ routeTree });

export { router };
