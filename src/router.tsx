import React from 'react';
import type { RouteObject } from 'react-router-dom';
import { createBrowserRouter } from 'react-router-dom';
import { TestPageHome } from './pages/a-test-page/test-page';

const routes: RouteObject[] = [
    {
        path: 'a-test-page',
        element: <TestPageHome />,
    },
];

export const router = createBrowserRouter(routes);
