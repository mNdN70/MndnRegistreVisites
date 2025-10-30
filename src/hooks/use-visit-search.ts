
"use client";

import { useState, useEffect, useContext } from 'react';
import { useFirestore } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { BaseVisit } from '@/lib/types';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { VisitsContext } from '@/contexts/VisitsContext';

const VISITS_COLLECTION = 'visits';

export const useVisitSearch = (dni: string) => {
  const visitsContext = useContext(VisitsContext);
  const [visitData, setVisitData] = useState<BaseVisit | null>(null);
  const [loading, setLoading] = useState(false);
  const [debouncedDni, setDebouncedDni] = useState(dni);
  const db = useFirestore();

  if (!visitsContext) {
    throw new Error("useVisitsContext must be used within a VisitsProvider");
  }
  const { visits } = visitsContext;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedDni(dni);
    }, 500); // 500ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [dni]);

  useEffect(() => {
    if (debouncedDni.trim() === '') {
      setVisitData(null);
      return;
    }

    const findLastVisitInMemory = () => {
      setLoading(true);
      const matchingVisits = visits.filter(
        (visit) => visit.id.toUpperCase() === debouncedDni.toUpperCase()
      );

      if (matchingVisits.length > 0) {
        matchingVisits.sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime());
        setVisitData(matchingVisits[0]);
      } else {
        setVisitData(null);
      }
      setLoading(false);
    };

    findLastVisitInMemory();
  }, [debouncedDni, visits]);

  return { visitData, loading };
};
