"use client";

import type { AnyVisit, TransporterVisit } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { useTranslation } from './use-translation';
import { db } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  updateDoc,
  doc,
  writeBatch
} from 'firebase/firestore';
import { DateRange } from 'react-day-picker';
import { isWithinInterval } from 'date-fns';

const VISITS_COLLECTION = 'visits';

export const useVisits = () => {
  const [visits, setVisits] = useState<AnyVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation();
  const [date, setDate] = useState<DateRange | undefined>(undefined);

  const fetchVisits = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, VISITS_COLLECTION), orderBy('entryTime', 'desc'));
      const querySnapshot = await getDocs(q);
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
        await batch.commit();
      }

      setVisits(updatedVisitsData);
    } catch (error) {
      console.error('Error reading from Firestore', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los registros de visitas.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  const addVisit = async (visit: Omit<AnyVisit, 'entryTime' | 'exitTime' | 'docId'>) => {
    try {
        const activeVisitQuery = query(
            collection(db, VISITS_COLLECTION),
            where('id', '==', visit.id.toLowerCase()),
            where('exitTime', '==', null)
        );
        const activeVisitSnapshot = await getDocs(activeVisitQuery);

        if (!activeVisitSnapshot.empty) {
            const errorMessage = t('duplicate_entry_detail');
            toast({
                title: t('duplicate_entry'),
                description: errorMessage,
                variant: 'destructive',
            });
            return { success: false, message: errorMessage };
        }
      
      const baseVisitData = {
        id: visit.id.toLowerCase(),
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
          licensePlate: transporterVisit.licensePlate,
          trailerLicensePlate: transporterVisit.trailerLicensePlate,
          type: 'transporter',
        };
      } else {
        newVisit = {
          ...baseVisitData,
          type: 'general',
        };
      }
      
      const docRef = await addDoc(collection(db, VISITS_COLLECTION), newVisit);
      setVisits(prev => [{ docId: docRef.id, ...newVisit }, ...prev]);

      toast({
        title: t('entry_registered'),
        description: t('entry_registered_detail').replace('{name}', visit.name),
      });
      return { success: true };
    } catch (error) {
       console.error("Error adding visit:", error);
       toast({ title: 'Error', description: 'No se pudo registrar la entrada.', variant: 'destructive' });
       return { success: false, message: 'No se pudo registrar la entrada.' };
    }
  };

  const registerExit = async (dni: string) => {
    const q = query(
      collection(db, VISITS_COLLECTION),
      where('id', '==', dni.toLowerCase()),
      where('exitTime', '==', null)
    );
    
    try {
      const querySnapshot = await getDocs(q);
      
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
      await updateDoc(doc(db, VISITS_COLLECTION, latestVisitDoc.docId), {
        exitTime: exitTime,
      });
      
      setVisits(prevVisits => prevVisits.map(v => v.docId === latestVisitDoc.docId ? {...v, exitTime: exitTime} : v))

      toast({
        title: t('exit_registered'),
        description: t('exit_registered_detail').replace('{name}', latestVisitDoc.name),
      });
      return { success: true };
    } catch(error) {
      console.error("Error registering exit:", error);
      toast({ title: 'Error', description: 'No se pudo registrar la salida.', variant: 'destructive' });
      return { success: false, message: 'No se pudo registrar la salida.'};
    }
  };

  const getActiveVisits = useCallback(() => {
    return visits.filter(v => v.exitTime === null).sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime());
  }, [visits]);

  const getAllVisits = useCallback(() => {
    return [...visits].sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime());
  }, [visits]);
  
  const getFilteredVisits = useCallback(() => {
    if (!date?.from) {
      return visits;
    }
    const from = date.from;
    const to = date.to ?? date.from;

    return visits.filter((visit) => {
      const entryDate = new Date(visit.entryTime);
      return isWithinInterval(entryDate, { start: from, end: to });
    });
  }, [visits, date]);
  
  const createCSV = (data: AnyVisit[], filename: string, recipients: string[] = []) => {
    if (data.length === 0) {
      toast({
        title: t('no_data_to_export'),
        variant: 'destructive'
      });
      return;
    }

    const headers = [
      'ID', 'Nombre', 'Empresa', 'Motivo Visita', 'Persona a Visitar', 'Departamento', 'Hora Entrada', 'Hora Salida', 'Tipo', 'Estado', 'Empresa Tpts', 'Matrícula', 'Matrícula Remolque'
    ];
    
    const rows = data.map(v => {
      let status = t('active');
      if (v.autoExit) {
        status = t('auto_exit');
      } else if (v.exitTime) {
        status = t('finished');
      }

      const baseRow = [
        v.id,
        v.name,
        v.company,
        v.reason || '',
        v.personToVisit,
        v.department,
        new Date(v.entryTime).toLocaleString(),
        v.exitTime ? new Date(v.exitTime).toLocaleString() : '',
        v.type,
        status
      ];

      if (v.type === 'transporter') {
        return [...baseRow, v.haulierCompany, v.licensePlate, v.trailerLicensePlate || ''].map(d => `"${String(d).replace(/"/g, '""')}"`).join(',');
      } else {
        return [...baseRow, '', '', ''].map(d => `"${String(d).replace(/"/g, '""')}"`).join(',');
      }
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
  };

  const exportToCSV = useCallback((data: AnyVisit[], filename: string, recipients: string[]) => {
    createCSV(data, filename, recipients);
  }, [t, createCSV]);

  const exportActiveVisitsToCSV = useCallback((recipients: string[]) => {
    const activeVisits = getActiveVisits();
    createCSV(activeVisits, 'registros_visitas_activas.csv', recipients);
  }, [getActiveVisits, t, createCSV]);


  return { loading, addVisit, registerExit, getActiveVisits, getAllVisits, exportToCSV, exportActiveVisitsToCSV, date, setDate, getFilteredVisits };
};
