
"use client";

import { AnyVisit, TransporterVisit } from '@/lib/types';
import { useState, useEffect, useCallback, createContext, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/use-translation';
import { db } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  updateDoc,
  doc,
  writeBatch
} from 'firebase/firestore';
import { DateRange } from 'react-day-picker';
import { isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';

const VISITS_COLLECTION = 'visits';

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
    try {
      const q = query(collection(db, VISITS_COLLECTION), orderBy('entryTime', 'desc'));
      const querySnapshot = await getDocs(q).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: VISITS_COLLECTION,
          operation: 'list'
        });
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError;
      });
      const visitsData = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        docId: doc.id,
      })) as AnyVisit[];

      const now = new Date();
      const batch = writeBatch(db);
      let changesMade = false;

      const updatedVisitsData = visitsData.map(visit => {
        if (visit.exitTime === null) {
            const entryTime = new Date(visit.entryTime);
            const hoursDiff = (now.getTime() - entryTime.getTime()) / (1000 * 60 * 60);
            if (hoursDiff > 10) {
                const exitTime = new Date(entryTime.getTime() + 10 * 60 * 60 * 1000);
                const visitDocRef = doc(db, VISITS_COLLECTION, visit.docId!);
                batch.update(visitDocRef, {
                    exitTime: exitTime.toISOString(),
                    autoExit: true,
                });
                changesMade = true;
                return {
                    ...visit,
                    exitTime: exitTime.toISOString(),
                    autoExit: true,
                };
            }
        }
        return visit;
      });

      if (changesMade) {
        await batch.commit().catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: VISITS_COLLECTION,
                operation: 'update'
            });
            errorEmitter.emit('permission-error', permissionError);
        });
      }

      setVisits(updatedVisitsData);
    } catch (error) {
      if (!(error instanceof FirestorePermissionError)) {
        console.error('Error reading from Firestore', error);
        toast({
            title: 'Error',
            description: 'No se pudieron cargar los registros de visitas.',
            variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const addVisit = async (visit: Omit<AnyVisit, 'entryTime' | 'exitTime' | 'docId'>): Promise<{ success: boolean; message?: string }> => {
    try {
      // Check for active visit in memory instead of querying Firestore
      const activeVisit = visits.find(
        (v) => v.id.toUpperCase() === visit.id.toUpperCase() && v.exitTime === null
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
        id: visit.id.toUpperCase(),
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

      let newVisit: Omit<AnyVisit, 'docId'>;

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
      
      const docRef = await addDoc(collection(db, VISITS_COLLECTION), newVisit).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: VISITS_COLLECTION,
            operation: 'create',
            requestResourceData: newVisit,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError;
      });

      setVisits(prev => [{ docId: docRef.id, ...newVisit } as AnyVisit, ...prev]);

      toast({
        title: t('entry_registered'),
        description: t('entry_registered_detail').replace('{name}', visit.name),
      });
      return { success: true };
    } catch (error) {
       if (!(error instanceof FirestorePermissionError)) {
         console.error("Error adding visit:", error);
         toast({ title: 'Error', description: 'No se pudo registrar la entrada.', variant: 'destructive' });
       }
       return { success: false, message: 'No se pudo registrar la entrada.' };
    }
  };

  const registerExit = async (dni: string) => {
    const q = query(
      collection(db, VISITS_COLLECTION),
      where('id', '==', dni.toUpperCase()),
      where('exitTime', '==', null)
    );
    
    try {
      const querySnapshot = await getDocs(q).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: VISITS_COLLECTION,
            operation: 'list'
        });
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError;
      });
      
      if (querySnapshot.empty) {
        const errorMessage = t('no_active_visit_today');
        toast({
          title: t('exit_registration_error'),
          description: errorMessage,
          variant: 'destructive',
        });
        return { success: false, message: errorMessage };
      }

      const visits = querySnapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id }));
      visits.sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime());
      const latestVisitDoc = visits[0];

      const exitTime = new Date().toISOString();
      const visitDocRef = doc(db, VISITS_COLLECTION, latestVisitDoc.docId);

      await updateDoc(visitDocRef, {
        exitTime: exitTime,
      }).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: visitDocRef.path,
            operation: 'update',
            requestResourceData: { exitTime: exitTime },
        });
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError;
      });
      
      setVisits(prevVisits => prevVisits.map(v => v.docId === latestVisitDoc.docId ? {...v, exitTime: exitTime} : v))

      toast({
        title: t('exit_registered'),
        description: t('exit_registered_detail').replace('{name}', latestVisitDoc.name),
      });
      return { success: true };
    } catch(error) {
      if (!(error instanceof FirestorePermissionError)) {
        console.error("Error registering exit:", error);
        toast({ title: 'Error', description: 'No se pudo registrar la salida.', variant: 'destructive' });
      }
      return { success: false, message: 'No se pudo registrar la salida.'};
    }
  };

  const getActiveVisits = useCallback(() => {
    return visits.filter(v => v.exitTime === null).sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime());
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
