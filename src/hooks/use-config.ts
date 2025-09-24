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
  addDoc,
  getDoc,
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
    const batch = writeBatch(db);
    INITIAL_DEPARTMENTS.forEach(dept => {
        const docRef = doc(db, DEPARTMENTS_COLLECTION, dept);
        batch.set(docRef, { name: dept });
    });
    INITIAL_EMPLOYEES.forEach(emp => {
        const docRef = doc(collection(db, EMPLOYEES_COLLECTION));
        batch.set(docRef, emp);
    });
    await batch.commit();
  }, []);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const departmentsQuery = query(collection(db, DEPARTMENTS_COLLECTION), orderBy('name'));
      const employeesQuery = query(collection(db, EMPLOYEES_COLLECTION), orderBy('name'));

      const [departmentsSnapshot, employeesSnapshot] = await Promise.all([
        getDocs(departmentsQuery),
        getDocs(employeesQuery)
      ]);

      if (departmentsSnapshot.empty && employeesSnapshot.empty) {
        await seedInitialData();
        // Refetch after seeding
        const [newDepartmentsSnapshot, newEmployeesSnapshot] = await Promise.all([
          getDocs(departmentsQuery),
          getDocs(employeesQuery)
        ]);
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
    if (departments.map(d => d.toLowerCase()).includes(department.toLowerCase())) {
        toast({ title: t('duplicated_department'), variant: 'destructive' });
        return;
    }
    
    try {
        await setDoc(doc(db, DEPARTMENTS_COLLECTION, department), { name: department });
        setDepartments(prev => [...prev, department].sort());
        toast({ title: t('department_added') });
    } catch (error) {
       toast({ title: 'Error', description: 'No se pudo añadir el departamento.', variant: 'destructive' });
    }
  }, [departments, toast, t]);

  const removeDepartment = useCallback(async (departmentName: string) => {
    try {
      const deptDocRef = doc(db, DEPARTMENTS_COLLECTION, departmentName);
      
      const batch = writeBatch(db);
      
      batch.delete(deptDocRef);
  
      const empQuery = query(collection(db, EMPLOYEES_COLLECTION), where('department', '==', departmentName));
      const empSnapshot = await getDocs(empQuery);
      empSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
  
      await batch.commit();
  
      setDepartments(prev => prev.filter(d => d !== departmentName));
      setEmployees(prev => prev.filter(e => e.department !== departmentName));
  
      toast({ title: t('department_deleted'), description: t('department_deleted_detail') });
    } catch (error) {
      console.error("Error removing department:", error);
      toast({ title: 'Error', description: 'No se pudo eliminar el departamento.', variant: 'destructive' });
    }
  }, [toast, t]);


  const addEmployee = useCallback(async (employee: Omit<Employee, 'id'>) => {
     if (employees.find(e => e.name.toLowerCase() === employee.name.toLowerCase())) {
      toast({ title: t('duplicated_employee'), variant: 'destructive' });
      return;
    }
    try {
      const newDocRef = await addDoc(collection(db, EMPLOYEES_COLLECTION), employee);
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


  return { loading, departments, employees, addDepartment, removeDepartment, addEmployee, removeEmployee, fetchConfig };
};
