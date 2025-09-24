"use client";

import type { AnyVisit } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { isToday } from 'date-fns';
import { useTranslation } from './use-translation';

const VISITS_STORAGE_KEY = 'menadiona-visits';

export const useVisits = () => {
  const [visits, setVisits] = useState<AnyVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation();


  useEffect(() => {
    try {
      const storedVisits = window.localStorage.getItem(VISITS_STORAGE_KEY);
      if (storedVisits) {
        setVisits(JSON.parse(storedVisits));
      }
    } catch (error) {
      console.error('Error reading from localStorage', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los registros de visitas.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateVisits = useCallback((updatedVisits: AnyVisit[]) => {
    setVisits(updatedVisits);
    try {
      window.localStorage.setItem(VISITS_STORAGE_KEY, JSON.stringify(updatedVisits));
    } catch (error) {
      console.error('Error writing to localStorage', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el registro.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const findActiveVisitByDni = useCallback((dni: string) => {
    return visits.find(v => v.id.toLowerCase() === dni.toLowerCase() && v.exitTime === null);
  }, [visits]);

  const addVisit = useCallback((visit: Omit<AnyVisit, 'entryTime' | 'exitTime'>) => {
    if (findActiveVisitByDni(visit.id)) {
      const errorMessage = t('duplicate_entry_detail');
      toast({
        title: t('duplicate_entry'),
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, message: errorMessage };
    }
    const newVisit: AnyVisit = {
      ...visit,
      entryTime: new Date().toISOString(),
      exitTime: null,
    };
    updateVisits([newVisit, ...visits]);
    toast({
      title: t('entry_registered'),
      description: t('entry_registered_detail').replace('{name}', visit.name),
    });
    return { success: true };
  }, [visits, findActiveVisitByDni, updateVisits, toast, t]);

  const registerExit = useCallback((dni: string) => {
    const visitIndex = visits.findIndex(v => 
      v.id.toLowerCase() === dni.toLowerCase() && 
      v.exitTime === null &&
      isToday(new Date(v.entryTime))
    );

    if (visitIndex === -1) {
      const errorMessage = t('no_active_visit_today');
      toast({
        title: t('exit_registration_error'),
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, message: errorMessage };
    }

    const updatedVisits = [...visits];
    const visit = updatedVisits[visitIndex];
    updatedVisits[visitIndex] = { ...visit, exitTime: new Date().toISOString() };
    
    updateVisits(updatedVisits);

    toast({
      title: t('exit_registered'),
      description: t('exit_registered_detail').replace('{name}', visit.name),
    });
    return { success: true };
  }, [visits, updateVisits, toast, t]);

  const getActiveVisits = useCallback(() => {
    return visits.filter(v => v.exitTime === null).sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime());
  }, [visits]);

  const getAllVisits = useCallback(() => {
    return [...visits].sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime());
  }, [visits]);
  
  const createCSV = (data: AnyVisit[], filename: string) => {
    if (data.length === 0) {
      toast({
        title: t('no_data_to_export'),
        variant: 'destructive'
      });
      return;
    }

    const headers = [
      'ID', 'Nombre', 'Empresa', 'Motivo Visita', 'Persona a Visitar', 'Departamento', 'Hora Entrada', 'Hora Salida', 'Tipo', 'Empresa Tpts', 'Matrícula', 'Matrícula Remolque'
    ];
    
    const rows = data.map(v => {
      const baseRow = [
        v.id,
        v.name,
        v.company,
        v.reason || '',
        v.personToVisit,
        v.department,
        new Date(v.entryTime).toLocaleString(),
        v.exitTime ? new Date(v.exitTime).toLocaleString() : 'ACTIVO',
        v.type
      ];

      if (v.type === 'transporter') {
        return [...baseRow, v.haulierCompany, v.licensePlate, v.trailerLicensePlate || ''].map(d => `"${String(d).replace(/"/g, '""')}"`).join(',');
      } else {
        return [...baseRow, '', '', ''].map(d => `"${String(d).replace(/"/g, '""')}"`).join(',');
      }
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: t('export_completed') });
  };

  const exportToCSV = useCallback((data: AnyVisit[], filename: string) => {
    createCSV(data, filename);
  }, [toast, t]);

  const exportActiveVisitsToCSV = useCallback(() => {
    createCSV(getActiveVisits(), 'registros_visitas_activas.csv');
  }, [getActiveVisits, toast, t]);


  return { loading, addVisit, registerExit, getActiveVisits, getAllVisits, exportToCSV, exportActiveVisitsToCSV };
};
