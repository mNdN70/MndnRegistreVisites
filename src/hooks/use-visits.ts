
"use client";

import { useContext } from 'react';
import { VisitsContext } from '@/contexts/VisitsContext';

// Este hook se ha renombrado a useVisitsContext, pero lo mantenemos por si alguna parte del código aún lo usa.
// Lo ideal es reemplazar su uso por useVisitsContext
export const useVisits = () => {
    const context = useContext(VisitsContext);
    if (context === undefined) {
        throw new Error('useVisits must be used within a VisitsProvider');
    }
    return context;
};
