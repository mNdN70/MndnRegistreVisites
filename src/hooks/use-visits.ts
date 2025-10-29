
"use client";

import { useContext } from 'react';
import { VisitsContext } from '@/contexts/VisitsContext';

export const useVisits = () => {
    const context = useContext(VisitsContext);
    if (context === undefined) {
        throw new Error('useVisits must be used within a VisitsProvider');
    }
    return context;
};
