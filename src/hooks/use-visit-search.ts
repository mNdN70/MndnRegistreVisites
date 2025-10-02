
"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
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
          where('id', '==', debouncedDni.toUpperCase())
        );
        
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const visits = querySnapshot.docs.map(doc => doc.data() as BaseVisit);
          // Sort client-side to find the latest visit
          visits.sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime());
          setVisitData(visits[0]);
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
