
"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { BaseVisit } from '@/lib/types';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { useVisitsContext } from './use-visits-context';

const VISITS_COLLECTION = 'visits';

export const useVisitSearch = (dni: string) => {
  const { visits } = useVisitsContext();
  const [visitData, setVisitData] = useState<BaseVisit | null>(null);
  const [loading, setLoading] = useState(false);
  const [debouncedDni, setDebouncedDni] = useState(dni);

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
