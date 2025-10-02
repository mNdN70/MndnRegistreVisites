
"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { BaseVisit } from '@/lib/types';

const VISITS_COLLECTION = 'visits';

export const useVisitSearch = (dni: string) => {
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

    const fetchLastVisit = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, VISITS_COLLECTION),
          where('id', '==', debouncedDni.toUpperCase()),
          orderBy('entryTime', 'desc')
        );
        
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // The query is ordered by entryTime descending, so the first doc is the latest visit.
          const lastVisit = querySnapshot.docs[0].data() as BaseVisit;
          setVisitData(lastVisit);
        } else {
          setVisitData(null);
        }
      } catch (error) {
        console.error('Error fetching last visit:', error);
        setVisitData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLastVisit();
  }, [debouncedDni]);

  return { visitData, loading };
};
