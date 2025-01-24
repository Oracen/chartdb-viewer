import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { TooltipProvider } from './components/tooltip/tooltip';
import { router } from './router';

export const App = () => {
    return (
        <TooltipProvider>
            <RouterProvider router={router} />
        </TooltipProvider>
    );
};
