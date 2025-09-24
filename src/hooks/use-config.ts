"use client";

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { INITIAL_DEPARTMENTS, INITIAL_EMPLOYEES } from '@/lib/constants';
import { useTranslation } from './use-translation';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  writeBatch,
  doc,
  deleteDoc,
  query,
  where,
  orderBy,
  setDoc,
  getDoc
} from 'firebase/firestore';

const DEPARTMENTS_COLLECTION = 'departments';
const EMPLOYEES_COLLECTION = 'employees';

export interface Employee {
  id?: string;
  name: string;
  department: string;
}

export const useConfig = () => {
  const [departments, setDepartments] = useState<string[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const seedInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const departmentsSnapshot = await getDocs(collection(db, DEPARTMENTS_COLLECTION));
      if (departmentsSnapshot.empty) {
        const batch = writeBatch(db);
        INITIAL_DEPARTMENTS.forEach(dept => {
            const docRef = doc(db, DEPARTMENTS_COLLECTION, dept.toLowerCase());
            batch.set(docRef, { name: dept });
        });
        INITIAL_EMPLOYEES.forEach(emp => {
            const docRef = doc(collection(db, EMPLOYEES_COLLECTION));
            batch.set(docRef, emp);
        });
        await batch.commit();
      }
    } catch (error) {
        console.error('Error seeding data', error);
    } finally {
        setLoading(false);
    }
  }, []);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
        const departmentsQuery = query(collection(db, DEPARTMENTS_COLLECTION), orderBy('name'));
        const departmentsSnapshot = await getDocs(departmentsQuery);
        
        const employeesQuery = query(collection(db, EMPLOYEES_COLLECTION), orderBy('name'));
        const employeesSnapshot = await getDocs(employeesQuery);

        if (departmentsSnapshot.empty) {
             await seedInitialData();
             // Refetch after seeding
             const newDepartmentsSnapshot = await getDocs(departmentsQuery);
             const newEmployeesSnapshot = await getDocs(employeesQuery);
             setDepartments(newDepartmentsSnapshot.docs.map(doc => doc.data().name).sort());
             setEmployees(newEmployeesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee)).sort((a,b) => a.name.localeCompare(b.name)));
        } else {
            setDepartments(departmentsSnapshot.docs.map(doc => doc.data().name).sort());
            setEmployees(employeesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee)).sort((a,b) => a.name.localeCompare(b.name)));
        }
    } catch (error) {
      console.error('Error fetching config from Firestore', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar la configuración desde la base de datos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast, seedInitialData]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const addDepartment = useCallback(async (department: string) => {
    const departmentId = department.toLowerCase();
    const docRef = doc(db, DEPARTMENTS_COLLECTION, departmentId);

    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            toast({ title: t('duplicated_department'), variant: 'destructive' });
            return;
        }

        await setDoc(docRef, { name: department });
        setDepartments(prev => [...prev, department].sort());
        toast({ title: t('department_added') });
    } catch (error) {
       toast({ title: 'Error', description: 'No se pudo añadir el departamento.', variant: 'destructive' });
    }
  }, [toast, t]);

  const removeDepartment = useCallback(async (department: string) => {
    const batch = writeBatch(db);
    try {
      const deptDocRef = doc(db, DEPARTMENTS_COLLECTION, department.toLowerCase());
      batch.delete(deptDocRef);

      const empQuery = query(collection(db, EMPLOYEES_COLLECTION), where('department', '==', department));
      const empSnapshot = await getDocs(empQuery);
      empSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();

      setDepartments(prev => prev.filter(d => d !== department));
      setEmployees(prev => prev.filter(e => e.department !== department));
      
      toast({ title: t('department_deleted'), description: t('department_deleted_detail') });
    } catch(error) {
      toast({ title: 'Error', description: 'No se pudo eliminar el departamento.', variant: 'destructive' });
    }
  }, [toast, t]);


  const addEmployee = useCallback(async (employee: Omit<Employee, 'id'>) => {
     if (employees.find(e => e.name.toLowerCase() === employee.name.toLowerCase())) {
      toast({ title: t('duplicated_employee'), variant: 'destructive' });
      return;
    }
    try {
      const newDocRef = doc(collection(db, EMPLOYEES_COLLECTION));
      await setDoc(newDocRef, employee);
      setEmployees(prev => [...prev, {id: newDocRef.id, ...employee}].sort((a,b) => a.name.localeCompare(b.name)));
      toast({ title: t('employee_added') });
    } catch (error) {
       toast({ title: 'Error', description: 'No se pudo añadir el empleado.', variant: 'destructive' });
    }
  }, [employees, toast, t]);

  const removeEmployee = useCallback(async (employeeName: string) => {
    const employeeToRemove = employees.find(e => e.name === employeeName);
    if (!employeeToRemove || !employeeToRemove.id) {
        toast({ title: 'Error', description: 'Empleado no encontrado.', variant: 'destructive' });
        return;
    }
    try {
      await deleteDoc(doc(db, EMPLOYEES_COLLECTION, employeeToRemove.id));
      setEmployees(prev => prev.filter(e => e.name !== employeeName));
      toast({ title: t('employee_deleted') });
    } catch (error) {
       toast({ title: 'Error', description: 'No se pudo eliminar el empleado.', variant: 'destructive' });
    }
  }, [employees, toast, t]);


  return { loading, departments, employees, addDepartment, removeDepartment, addEmployee, removeEmployee };
};
