"use client";

import type { AnyVisit } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { isToday } from 'date-fns';

const VISITS_STORAGE_KEY = 'visitwise-visits';

export const useVisits = () => {
  const [visits, setVisits] = useState<AnyVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
      const errorMessage = 'Ya existe una visita activa para este DNI/NIE. Debe registrar la salida antes de una nueva entrada.';
      toast({
        title: 'Entrada Duplicada',
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
      title: 'Entrada Registrada',
      description: `${visit.name} ha sido registrado.`,
    });
    return { success: true };
  }, [visits, findActiveVisitByDni, updateVisits, toast]);

  const registerExit = useCallback((dni: string) => {
    const visitIndex = visits.findIndex(v => 
      v.id.toLowerCase() === dni.toLowerCase() && 
      v.exitTime === null &&
      isToday(new Date(v.entryTime))
    );

    if (visitIndex === -1) {
      const errorMessage = 'No se encontró una visita activa para este DNI/NIE registrada hoy.';
      toast({
        title: 'Error al Registrar Salida',
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
      title: 'Salida Registrada',
      description: `Se ha registrado la salida para ${visit.name}.`,
    });
    return { success: true };
  }, [visits, updateVisits, toast]);

  const getActiveVisits = useCallback(() => {
    return visits.filter(v => v.exitTime === null).sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime());
  }, [visits]);

  const getAllVisits = useCallback(() => {
    return [...visits].sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime());
  }, [visits]);
  
  const createCSV = (data: AnyVisit[], filename: string) => {
    if (data.length === 0) {
      toast({
        title: 'No hay datos para exportar',
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

    toast({ title: 'Exportación completada' });
  };

  const exportToCSV = useCallback((data: AnyVisit[], filename: string) => {
    createCSV(data, filename);
  }, [toast]);

  const exportActiveVisitsToCSV = useCallback(() => {
    createCSV(getActiveVisits(), 'registros_visitas_activas.csv');
  }, [getActiveVisits, toast]);


  return { loading, addVisit, registerExit, getActiveVisits, getAllVisits, exportToCSV, exportActiveVisitsToCSV };
};
