
import { useContext } from 'react';
import { VisitsContext } from '@/contexts/VisitsContext';

export const useVisitsContext = () => {
    const context = useContext(VisitsContext);
    if (context === undefined) {
        throw new Error('useVisitsContext must be used within a VisitsProvider');
    }
    return context;
};
