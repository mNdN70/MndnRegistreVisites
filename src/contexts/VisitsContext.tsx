
"use client";

import { AnyVisit, TransporterVisit } from '@/lib/types';
import { useState, useEffect, useCallback, createContext, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/use-translation';
import { DateRange } from 'react-day-picker';
import { isWithinInterval, startOfDay, endOfDay, isToday } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

const VISITS_STORAGE_KEY = 'menadiona-visits';

interface VisitsContextType {
    visits: AnyVisit[];
    loading: boolean;
    date: DateRange | undefined;
    setDate: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
    addVisit: (visit: Omit<AnyVisit, 'entryTime' | 'exitTime' | 'docId'>) => Promise<{ success: boolean; message?: string }>;
    registerExit: (dni: string) => Promise<{ success: boolean; message?: string }>;
    getActiveVisits: () => AnyVisit[];
    getFilteredVisits: () => AnyVisit[];
    exportToCSV: (filename: string, recipients: string[]) => void;
    exportActiveVisitsToCSV: (recipients: string[]) => void;
    fetchVisits: () => Promise<void>;
}

export const VisitsContext = createContext<VisitsContextType | undefined>(undefined);

export const VisitsProvider = ({ children }: { children: ReactNode }) => {
  const [visits, setVisits] = useState<AnyVisit[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date())
  });

  const fetchVisits = useCallback(async () => {
    setLoading(true);
    if (typeof window !== 'undefined') {
      const storedVisits = localStorage.getItem(VISITS_STORAGE_KEY);
      if (storedVisits) {
        setVisits(JSON.parse(storedVisits));
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  const saveVisits = (updatedVisits: AnyVisit[]) => {
    setVisits(updatedVisits);
    if (typeof window !== 'undefined') {
      localStorage.setItem(VISITS_STORAGE_KEY, JSON.stringify(updatedVisits));
    }
  };

  const addVisit = async (visit: Omit<AnyVisit, 'entryTime' | 'exitTime' | 'docId'>): Promise<{ success: boolean; message?: string }> => {
    const upperCaseId = visit.id.toUpperCase();
    const activeVisit = visits.find(
      (v) => v.id.toUpperCase() === upperCaseId && v.exitTime === null
    );

    if (activeVisit) {
      const errorMessage = t('duplicate_entry_detail');
      toast({
        title: t('duplicate_entry'),
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, message: errorMessage };
    }
    
    const baseVisitData = {
      docId: uuidv4(),
      id: upperCaseId,
      name: visit.name,
      company: visit.company,
      reason: visit.reason,
      personToVisit: visit.personToVisit,
      department: visit.department,
      privacyPolicyAccepted: visit.privacyPolicyAccepted,
      entryTime: new Date().toISOString(),
      exitTime: null,
      autoExit: false,
    };

    let newVisit: AnyVisit;

    if (visit.type === 'transporter') {
      const transporterVisit = visit as Omit<TransporterVisit, 'entryTime' | 'exitTime' | 'docId'>;
      newVisit = {
        ...baseVisitData,
        haulierCompany: transporterVisit.haulierCompany,
        licensePlate: transporterVisit.licensePlate.toUpperCase(),
        trailerLicensePlate: transporterVisit.trailerLicensePlate?.toUpperCase(),
        type: 'transporter',
      };
    } else {
      newVisit = {
        ...baseVisitData,
        type: 'general',
      };
    }
    
    const updatedVisits = [newVisit, ...visits];
    saveVisits(updatedVisits);

    toast({
      title: t('entry_registered'),
      description: t('entry_registered_detail').replace('{name}', visit.name),
    });
    return { success: true };
  };

  const registerExit = async (dni: string): Promise<{ success: boolean; message?: string }> => {
    const upperCaseDni = dni.toUpperCase();
    const activeVisits = visits.filter(
      (v) => v.id.toUpperCase() === upperCaseDni && v.exitTime === null && isToday(new Date(v.entryTime))
    );

    if (activeVisits.length === 0) {
      const errorMessage = t('no_active_visit_today');
      toast({
        title: t('exit_registration_error'),
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, message: errorMessage };
    }

    activeVisits.sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime());
    const latestVisitDoc = activeVisits[0];

    const exitTime = new Date().toISOString();
    
    const updatedVisits = visits.map(v => 
      v.docId === latestVisitDoc.docId ? { ...v, exitTime: exitTime } : v
    );
    saveVisits(updatedVisits);

    toast({
      title: t('exit_registered'),
      description: t('exit_registered_detail').replace('{name}', latestVisitDoc.name),
    });
    return { success: true };
  };

  const getActiveVisits = useCallback(() => {
    return visits.filter(v => v.exitTime === null && isToday(new Date(v.entryTime))).sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime());
  }, [visits]);
  
  const getFilteredVisits = useCallback(() => {
    if (!date?.from) {
      return visits.sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime());
    }
  
    const from = startOfDay(date.from);
    const to = date.to ? endOfDay(date.to) : endOfDay(date.from);
  
    return visits.filter((visit) => {
      const entryDate = new Date(visit.entryTime);
      return isWithinInterval(entryDate, { start: from, end: to });
    }).sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime());
  }, [visits, date]);
  
  const createCSV = useCallback((data: AnyVisit[], filename: string, recipients: string[] = []) => {
    if (data.length === 0) {
      toast({
        title: t('no_data_to_export'),
        variant: 'destructive'
      });
      return;
    }

    const headers = [
      'DNI', 'NOMBRE Y APELLIDOS', 'EMPRESA', 'PERSONA A VISITAR', 'MATRICULA', 'REMOLQUE', 'EMPRESA DE TRANSPORTE', 'HORA ENTRADA', 'HORA SALIDA', 'ESTADO'
    ];
    
    const rows = data.map(v => {
      let status = t('active');
      if (v.autoExit) {
        status = t('auto_exit');
      } else if (v.exitTime) {
        status = t('finished');
      }
      
      const isTransporter = v.type === 'transporter';

      const rowData = [
        v.id,
        v.name,
        v.company,
        v.personToVisit,
        isTransporter ? (v as TransporterVisit).licensePlate : '',
        isTransporter ? (v as TransporterVisit).trailerLicensePlate || '' : '',
        isTransporter ? (v as TransporterVisit).haulierCompany : '',
        new Date(v.entryTime).toLocaleString(),
        v.exitTime ? new Date(v.exitTime).toLocaleString() : '',
        status
      ];

      return rowData.map(d => `"${String(d).replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (recipients.length > 0) {
        const to = recipients.join(',');
        const subject = encodeURIComponent(`Exportación de Registros - ${filename}`);
        const body = encodeURIComponent('Adjunte aquí el archivo CSV descargado.');
        window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`, '_blank');
    }

    toast({ title: t('export_completed') });
  }, [toast, t]);

  const exportToCSV = useCallback((filename: string, recipients: string[]) => {
    const data = getFilteredVisits();
    createCSV(data, filename, recipients);
  }, [getFilteredVisits, createCSV]);

  const exportActiveVisitsToCSV = useCallback((recipients: string[]) => {
    createCSV(getActiveVisits(), 'registros_visitas_activas.csv', recipients);
  }, [getActiveVisits, createCSV]);

  return (
    <VisitsContext.Provider value={{ visits, loading, date, setDate, addVisit, registerExit, getActiveVisits, getFilteredVisits, exportToCSV, exportActiveVisitsToCSV, fetchVisits }}>
      {children}
    </VisitsContext.Provider>
  );
};
